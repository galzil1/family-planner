import { createClient } from '@supabase/supabase-js';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { getWeekStart, getWeekStartISO } from '@/lib/date-utils';
import type { Task, User, Category, Helper, DAYS_OF_WEEK } from '@/types';

// Supabase client for server-side API routes (no cookies)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Command types
export type CommandType = 
  | 'status' 
  | 'tomorrow' 
  | 'week' 
  | 'add' 
  | 'done' 
  | 'help' 
  | 'register'
  | 'unknown';

export interface ParsedCommand {
  type: CommandType;
  args: string;
  raw: string;
}

// Command patterns (Hebrew + English)
const COMMAND_PATTERNS: { type: CommandType; patterns: RegExp[] }[] = [
  { 
    type: 'status', 
    patterns: [
      /^(status|today|היום|סטטוס)$/i,
    ]
  },
  { 
    type: 'tomorrow', 
    patterns: [
      /^(tomorrow|מחר)$/i,
    ]
  },
  { 
    type: 'week', 
    patterns: [
      /^(week|שבוע)$/i,
    ]
  },
  { 
    type: 'add', 
    patterns: [
      /^(add|הוסף|משימה חדשה|new)\s+(.+)$/i,
    ]
  },
  { 
    type: 'done', 
    patterns: [
      /^(done|complete|סיום|בוצע)\s+(.+)$/i,
    ]
  },
  { 
    type: 'help', 
    patterns: [
      /^(help|עזרה|\?)$/i,
    ]
  },
  {
    type: 'register',
    patterns: [
      /^(register|הרשמה|התחברות)$/i,
    ]
  },
];

// Parse incoming message to command
export function parseCommand(message: string): ParsedCommand {
  const trimmed = message.trim();
  
  for (const { type, patterns } of COMMAND_PATTERNS) {
    for (const pattern of patterns) {
      const match = trimmed.match(pattern);
      if (match) {
        // For commands with arguments (add, done), extract the args
        const args = match[2] || '';
        return { type, args, raw: trimmed };
      }
    }
  }
  
  return { type: 'unknown', args: '', raw: trimmed };
}

// Get user by WhatsApp number
export async function getUserByWhatsApp(phoneNumber: string): Promise<User | null> {
  // Remove whatsapp: prefix if present
  const cleanNumber = phoneNumber.replace('whatsapp:', '');
  
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('whatsapp_number', cleanNumber)
    .single();
  
  return data;
}

// Format task for WhatsApp display
function formatTask(task: Task, category?: Category | null, assignee?: string): string {
  const time = task.task_time ? `⏰ ${task.task_time}` : '';
  const categoryIcon = category?.icon || '📌';
  const status = task.completed ? '✅' : '⬜';
  const assigned = assignee ? `👤 ${assignee}` : '';
  
  return `${status} ${categoryIcon} ${task.title} ${time} ${assigned}`.trim();
}

// Helper function to check if task appears on a specific date
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

// Command handlers
export async function handleStatusCommand(user: User): Promise<string> {
  const today = new Date();
  
  // Fetch all tasks for the family
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id)
    .order('task_time', { ascending: true, nullsFirst: false });
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('family_id', user.family_id);
  
  const { data: familyMembers } = await supabase
    .from('users')
    .select('id, display_name')
    .eq('family_id', user.family_id);
  
  const { data: helpers } = await supabase
    .from('helpers')
    .select('id, name')
    .eq('family_id', user.family_id);
  
  if (!tasks || tasks.length === 0) {
    return `📅 *היום - ${format(today, 'd בMMMM', { locale: he })}*\n\nאין משימות להיום! 🎉`;
  }
  
  // Filter tasks for today
  const todayTasks = tasks.filter(t => taskAppearsOnDate(t, today));
  
  if (todayTasks.length === 0) {
    return `📅 *היום - ${format(today, 'd בMMMM', { locale: he })}*\n\nאין משימות להיום! 🎉`;
  }
  
  // Sort by time
  todayTasks.sort((a, b) => {
    if (a.task_time && b.task_time) return a.task_time.localeCompare(b.task_time);
    if (a.task_time) return -1;
    if (b.task_time) return 1;
    return 0;
  });
  
  const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
  const userMap = new Map(familyMembers?.map(m => [m.id, m.display_name]) || []);
  const helperMap = new Map(helpers?.map(h => [h.id, h.name]) || []);
  
  const completed = todayTasks.filter(t => t.completed).length;
  const total = todayTasks.length;
  
  let response = `📅 *היום - ${format(today, 'd בMMMM', { locale: he })}*\n`;
  response += `✨ ${completed}/${total} הושלמו\n\n`;
  
  for (const task of todayTasks) {
    const category = task.category_id ? categoryMap.get(task.category_id) : null;
    const assignee = task.assigned_to 
      ? userMap.get(task.assigned_to) 
      : task.helper_id 
        ? helperMap.get(task.helper_id)
        : undefined;
    response += formatTask(task, category, assignee) + '\n';
  }
  
  return response.trim();
}

export async function handleTomorrowCommand(user: User): Promise<string> {
  const tomorrow = addDays(new Date(), 1);
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id)
    .order('task_time', { ascending: true, nullsFirst: false });
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('family_id', user.family_id);
  
  if (!tasks || tasks.length === 0) {
    return `📅 *מחר - ${format(tomorrow, 'd בMMMM', { locale: he })}*\n\nאין משימות למחר! 🎉`;
  }
  
  const tomorrowTasks = tasks.filter(t => taskAppearsOnDate(t, tomorrow));
  
  if (tomorrowTasks.length === 0) {
    return `📅 *מחר - ${format(tomorrow, 'd בMMMM', { locale: he })}*\n\nאין משימות למחר! 🎉`;
  }
  
  // Sort by time
  tomorrowTasks.sort((a, b) => {
    if (a.task_time && b.task_time) return a.task_time.localeCompare(b.task_time);
    if (a.task_time) return -1;
    if (b.task_time) return 1;
    return 0;
  });
  
  const categoryMap = new Map(categories?.map(c => [c.id, c]) || []);
  
  let response = `📅 *מחר - ${format(tomorrow, 'd בMMMM', { locale: he })}*\n\n`;
  
  for (const task of tomorrowTasks) {
    const category = task.category_id ? categoryMap.get(task.category_id) : null;
    response += formatTask(task, category) + '\n';
  }
  
  return response.trim();
}

export async function handleWeekCommand(user: User): Promise<string> {
  const today = new Date();
  const weekStart = getWeekStart(today);
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id);
  
  if (!tasks || tasks.length === 0) {
    return `📆 *סיכום שבועי*\n\nאין משימות השבוע!`;
  }
  
  const DAYS_HEB = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  
  let response = `📆 *סיכום שבועי*\n`;
  response += `${format(weekStart, 'd/M', { locale: he })} - ${format(addDays(weekStart, 6), 'd/M', { locale: he })}\n\n`;
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dayTasks = tasks.filter(t => taskAppearsOnDate(t, date));
    const completed = dayTasks.filter(t => t.completed).length;
    
    if (dayTasks.length > 0) {
      const emoji = completed === dayTasks.length ? '✅' : '📋';
      response += `${emoji} *${DAYS_HEB[i]}* (${format(date, 'd/M')}): ${completed}/${dayTasks.length}\n`;
    }
  }
  
  const totalTasks = tasks.length;
  const totalCompleted = tasks.filter(t => t.completed).length;
  response += `\n📊 סה״כ: ${totalCompleted}/${totalTasks} משימות הושלמו`;
  
  return response.trim();
}

export async function handleAddCommand(user: User, taskTitle: string): Promise<string> {
  const today = new Date();
  const weekStart = getWeekStartISO(today);
  const dayOfWeek = today.getDay();
  
  // Get default category
  const { data: categories } = await supabase
    .from('categories')
    .select('id')
    .eq('family_id', user.family_id)
    .limit(1);
  
  const categoryId = categories?.[0]?.id || null;
  
  const { data: newTask, error } = await supabase
    .from('tasks')
    .insert({
      family_id: user.family_id,
      assigned_to: user.id,
      category_id: categoryId,
      title: taskTitle.trim(),
      day_of_week: dayOfWeek,
      week_start: weekStart,
      completed: false,
      is_recurring: false,
      recurrence_type: 'none',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating task:', error);
    return `❌ לא הצלחתי ליצור את המשימה. נסה שוב.`;
  }
  
  return `✅ המשימה נוספה בהצלחה!\n\n📌 *${taskTitle}*\n📅 להיום (${format(today, 'EEEE', { locale: he })})`;
}

export async function handleDoneCommand(user: User, searchText: string): Promise<string> {
  const today = new Date();
  
  // Find tasks matching the search text
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id)
    .eq('completed', false)
    .ilike('title', `%${searchText}%`);
  
  if (!tasks || tasks.length === 0) {
    return `❌ לא נמצאה משימה עם הטקסט: "${searchText}"`;
  }
  
  // If multiple matches, ask user to be more specific
  if (tasks.length > 1) {
    let response = `🔍 נמצאו ${tasks.length} משימות תואמות:\n\n`;
    tasks.slice(0, 5).forEach((t, i) => {
      response += `${i + 1}. ${t.title}\n`;
    });
    response += `\nאנא היה יותר ספציפי.`;
    return response;
  }
  
  // Mark the task as complete
  const task = tasks[0];
  const { error } = await supabase
    .from('tasks')
    .update({ completed: true, updated_at: new Date().toISOString() })
    .eq('id', task.id);
  
  if (error) {
    console.error('Error completing task:', error);
    return `❌ לא הצלחתי לסמן את המשימה כהושלמה. נסה שוב.`;
  }
  
  return `✅ מעולה! המשימה הושלמה:\n\n*${task.title}*`;
}

export function handleHelpCommand(): string {
  return `🤖 *פקודות זמינות:*

📋 *צפייה במשימות:*
• \`היום\` / \`status\` - משימות להיום
• \`מחר\` / \`tomorrow\` - משימות למחר
• \`שבוע\` / \`week\` - סיכום שבועי

✏️ *ניהול משימות:*
• \`הוסף [משימה]\` / \`add [task]\` - הוסף משימה חדשה
• \`סיום [משימה]\` / \`done [task]\` - סמן משימה כהושלמה

❓ *עזרה:*
• \`עזרה\` / \`help\` - הצג פקודות

💡 *דוגמאות:*
• הוסף קניות בסופר
• סיום קניות
• היום`;
}

export function handleUnknownCommand(message: string): string {
  return `🤔 לא הבנתי את הפקודה: "${message}"

שלח \`עזרה\` או \`help\` לרשימת הפקודות הזמינות.`;
}

export function handleUnregisteredUser(): string {
  return `👋 שלום!

לא מצאתי את מספר הטלפון שלך במערכת.

כדי להתחיל להשתמש בבוט:
1. היכנס לאפליקציית לוח המשפחה
2. לך להגדרות ⚙️
3. הוסף את מספר הוואטסאפ שלך

לאחר מכן תוכל לשלוח פקודות כאן! 🎉`;
}

// Main command processor
export async function processCommand(phoneNumber: string, message: string): Promise<string> {
  const user = await getUserByWhatsApp(phoneNumber);
  
  if (!user) {
    return handleUnregisteredUser();
  }
  
  const command = parseCommand(message);
  
  switch (command.type) {
    case 'status':
      return handleStatusCommand(user);
    case 'tomorrow':
      return handleTomorrowCommand(user);
    case 'week':
      return handleWeekCommand(user);
    case 'add':
      if (!command.args) {
        return '❌ נא לציין את שם המשימה.\nדוגמה: `הוסף קניות בסופר`';
      }
      return handleAddCommand(user, command.args);
    case 'done':
      if (!command.args) {
        return '❌ נא לציין איזו משימה לסמן כהושלמה.\nדוגמה: `סיום קניות`';
      }
      return handleDoneCommand(user, command.args);
    case 'help':
      return handleHelpCommand();
    default:
      return handleUnknownCommand(message);
  }
}
