import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { format, addMinutes, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { getWeekStart, getWeekStartISO } from '@/lib/date-utils';
import type { Task, User, Category } from '@/types';

// Use service role for background jobs
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  // If no CRON_SECRET is set, allow in development
  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }
  
  return authHeader === `Bearer ${cronSecret}`;
}

// Check if task appears on a specific date (same logic as in whatsapp-commands.ts)
function taskAppearsOnDate(task: Task, date: Date): boolean {
  const dayOfWeek = date.getDay();
  const taskWeekStart = new Date(task.week_start);
  
  if (!task.recurrence_type || task.recurrence_type === 'none') {
    const weekStartStr = getWeekStartISO(date);
    return task.week_start === weekStartStr && task.day_of_week === dayOfWeek;
  }
  
  if (date < taskWeekStart) {
    return false;
  }
  
  switch (task.recurrence_type) {
    case 'daily':
      return true;
    case 'weekly':
      return task.day_of_week === dayOfWeek;
    case 'biweekly':
      if (task.day_of_week !== dayOfWeek) return false;
      const weeksDiff = Math.floor((date.getTime() - getWeekStart(date).getTime()) / (7 * 24 * 60 * 60 * 1000));
      return weeksDiff % 2 === 0;
    case 'monthly':
      return task.day_of_week === dayOfWeek;
    default:
      return false;
  }
}

// Send reminder for a task
async function sendTaskReminder(
  user: User,
  task: Task,
  category: Category | null
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  if (!user.whatsapp_number) {
    return { success: false, error: 'No WhatsApp number' };
  }
  
  const categoryIcon = category?.icon || '📌';
  const time = task.task_time || '';
  
  const message = `⏰ *תזכורת למשימה*

${categoryIcon} ${task.title}
${time ? `🕐 ${time}` : ''}

שלח \`סיום ${task.title.substring(0, 20)}\` כדי לסמן כהושלם.`;

  try {
    const messageSid = await sendWhatsAppMessage(user.whatsapp_number, message);
    return { success: true, messageSid };
  } catch (error) {
    console.error('Error sending reminder:', error);
    return { success: false, error: String(error) };
  }
}

// Log notification to prevent duplicates
async function logNotification(
  userId: string,
  taskId: string,
  notificationType: string,
  messageSid?: string,
  status: 'sent' | 'delivered' | 'failed' = 'sent'
): Promise<void> {
  await supabaseAdmin
    .from('notification_log')
    .insert({
      user_id: userId,
      task_id: taskId,
      notification_type: notificationType,
      whatsapp_message_sid: messageSid,
      status,
    });
}

// Check if notification was already sent
async function wasNotificationSent(
  userId: string,
  taskId: string,
  notificationType: string,
  withinMinutes: number = 60
): Promise<boolean> {
  const cutoffTime = addMinutes(new Date(), -withinMinutes);
  
  const { data } = await supabaseAdmin
    .from('notification_log')
    .select('id')
    .eq('user_id', userId)
    .eq('task_id', taskId)
    .eq('notification_type', notificationType)
    .gte('sent_at', cutoffTime.toISOString())
    .limit(1);
  
  return (data?.length || 0) > 0;
}

export async function GET(request: NextRequest) {
  // Verify the request is from our cron job
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const currentTime = format(now, 'HH:mm');
  const today = now;

  // Reminders only fire for tasks whose task_time falls in the next 15 minutes. With daily
  // cron (Vercel Hobby: 0 9 * * *), only tasks between 09:00 and 09:15 get reminders.
  const reminderWindow = 15;
  const reminderTimeEnd = format(addMinutes(now, reminderWindow), 'HH:mm');

  console.log(`Running notification job at ${currentTime}, checking until ${reminderTimeEnd}`);
  
  try {
    // Get all users with WhatsApp numbers
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('*')
      .not('whatsapp_number', 'is', null);
    
    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'No users with WhatsApp', sent: 0 });
    }
    
    let sentCount = 0;
    const errors: string[] = [];
    
    for (const user of users) {
      // Get tasks for this user's family
      const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('family_id', user.family_id)
        .eq('completed', false)
        .not('task_time', 'is', null);
      
      if (!tasks || tasks.length === 0) continue;
      
      // Get categories for icons
      const { data: categories } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('family_id', user.family_id);
      
      const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
      
      // Filter tasks for today that are starting soon
      const todayTasks = tasks.filter(task => {
        if (!taskAppearsOnDate(task, today)) return false;
        if (!task.task_time) return false;
        
        // Check if task is assigned to this user or unassigned
        const isAssignedToUser = task.assigned_to === user.id || !task.assigned_to;
        if (!isAssignedToUser) return false;
        
        // Check if task time is within the reminder window
        return task.task_time >= currentTime && task.task_time <= reminderTimeEnd;
      });
      
      for (const task of todayTasks) {
        // Check if we already sent this notification
        const alreadySent = await wasNotificationSent(user.id, task.id, 'reminder');
        if (alreadySent) {
          console.log(`Skipping duplicate notification for task ${task.id}`);
          continue;
        }
        
        const category = task.category_id ? categoryMap.get(task.category_id) : null;
        const result = await sendTaskReminder(user as User, task, category);
        
        if (result.success) {
          await logNotification(user.id, task.id, 'reminder', result.messageSid);
          sentCount++;
        } else {
          errors.push(`Task ${task.id}: ${result.error}`);
          await logNotification(user.id, task.id, 'reminder', undefined, 'failed');
        }
      }
    }
    
    return NextResponse.json({
      message: `Notification job completed`,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('Notification job error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}
