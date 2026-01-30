'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import FloatingAddButton from '@/components/FloatingAddButton';
import { getWeekStartISO, getDayDate } from '@/lib/date-utils';
import { 
  Loader2, 
  Calendar, 
  CheckCircle2, 
  Circle,
  ArrowLeft,
  TrendingUp,
  Users,
  Clock
} from 'lucide-react';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { he } from 'date-fns/locale';

import type { User, Family, Category, Task } from '@/types';
import { DAYS_OF_WEEK } from '@/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const supabase = createClient();

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!userData) {
        router.push('/login');
        return;
      }

      if (!userData.family_id) {
        router.push('/onboarding');
        return;
      }

      setUser(userData);

      const { data: familyData } = await supabase
        .from('families')
        .select('*')
        .eq('id', userData.family_id)
        .single();

      setFamily(familyData);

      const { data: membersData } = await supabase
        .from('users')
        .select('*')
        .eq('family_id', userData.family_id);

      setFamilyMembers(membersData || []);

      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('family_id', userData.family_id)
        .order('name');

      setCategories(categoriesData || []);

      const weekStart = getWeekStartISO();
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('family_id', userData.family_id)
        .eq('week_start', weekStart)
        .order('day_of_week')
        .order('created_at');

      setTasks(tasksData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskCreated = () => {
    loadData();
  };

  const toggleTaskComplete = async (taskId: string, completed: boolean) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed } : t));
    await supabase.from('tasks').update({ completed }).eq('id', taskId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!user || !family) {
    return null;
  }

  // Calculate stats
  const weekStart = getWeekStartISO();
  const today = new Date();
  const todayDayOfWeek = today.getDay();
  
  const todayTasks = tasks.filter(t => t.day_of_week === todayDayOfWeek);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get upcoming tasks (next 3 days)
  const getUpcomingTasks = () => {
    const upcoming: { day: string; dayLabel: string; tasks: Task[] }[] = [];
    
    for (let i = 1; i <= 3; i++) {
      const futureDate = addDays(today, i);
      const futureDayOfWeek = futureDate.getDay();
      
      const dayTasks = tasks.filter(t => 
        t.day_of_week === futureDayOfWeek && !t.completed
      );

      if (dayTasks.length > 0) {
        let dayLabel: string = DAYS_OF_WEEK[futureDayOfWeek];
        if (isTomorrow(futureDate)) {
          dayLabel = 'מחר';
        }
        
        upcoming.push({
          day: format(futureDate, 'd/M'),
          dayLabel,
          tasks: dayTasks
        });
      }
    }
    
    return upcoming;
  };

  const upcomingTasks = getUpcomingTasks();

  // Tasks by category
  const tasksByCategory = categories.map(cat => ({
    category: cat,
    count: tasks.filter(t => t.category_id === cat.id).length,
    completed: tasks.filter(t => t.category_id === cat.id && t.completed).length
  })).filter(c => c.count > 0);

  // Tasks by member
  const tasksByMember = familyMembers.map(member => ({
    member,
    count: tasks.filter(t => t.assigned_to === member.id).length,
    completed: tasks.filter(t => t.assigned_to === member.id && t.completed).length
  })).filter(m => m.count > 0);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} family={family} familyMembers={familyMembers} />
      
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            שלום, {user.display_name} 👋
          </h1>
          <p className="text-slate-400">
            {format(today, 'EEEE, d בMMMM', { locale: he })}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/calendar"
            className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
              <Calendar className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-white">לוח שבועי</p>
              <p className="text-sm text-slate-400">צפה בכל המשימות</p>
            </div>
            <ArrowLeft className="w-5 h-5 text-slate-500 mr-auto" />
          </Link>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-semibold text-white">{progressPercent}%</p>
              <p className="text-sm text-slate-400">השבוע הושלם</p>
            </div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">התקדמות שבועית</h2>
            <span className="text-sm text-slate-400">{completedTasks} מתוך {totalTasks}</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-violet-400" />
            <h2 className="font-semibold text-white">משימות להיום</h2>
            <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full">
              {todayTasks.filter(t => !t.completed).length} נותרו
            </span>
          </div>

          {todayTasks.length === 0 ? (
            <p className="text-slate-500 text-center py-4">אין משימות להיום 🎉</p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map(task => {
                const category = categories.find(c => c.id === task.category_id);
                const assignee = familyMembers.find(m => m.id === task.assigned_to);
                
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      task.completed ? 'bg-slate-700/30 opacity-60' : 'bg-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleTaskComplete(task.id, !task.completed)}
                      className="flex-shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500 hover:text-violet-400 transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {category?.icon} {task.title}
                      </p>
                      {assignee && (
                        <p className="text-xs text-slate-400">{assignee.display_name}</p>
                      )}
                    </div>

                    {category && (
                      <div
                        className="w-2 h-8 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        {upcomingTasks.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 mb-6">
            <h2 className="font-semibold text-white mb-4">קרוב</h2>
            <div className="space-y-4">
              {upcomingTasks.map(({ day, dayLabel, tasks: dayTasks }) => (
                <div key={day}>
                  <p className="text-sm text-slate-400 mb-2">{dayLabel} ({day})</p>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map(task => {
                      const category = categories.find(c => c.id === task.category_id);
                      return (
                        <div key={task.id} className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-300">{category?.icon} {task.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <p className="text-xs text-slate-500">+{dayTasks.length - 3} נוספות</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* By Category */}
          {tasksByCategory.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">לפי קטגוריה</h3>
              <div className="space-y-2">
                {tasksByCategory.map(({ category, count, completed }) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span className="text-sm text-white flex-1">{category.name}</span>
                    <span className="text-xs text-slate-400">{completed}/{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* By Member */}
          {tasksByMember.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-medium text-slate-400 mb-3">לפי אחראי</h3>
              <div className="space-y-2">
                {tasksByMember.map(({ member, count, completed }) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-white flex-1">{member.display_name}</span>
                    <span className="text-xs text-slate-400">{completed}/{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <FloatingAddButton
        familyId={family.id}
        familyMembers={familyMembers}
        categories={categories}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
