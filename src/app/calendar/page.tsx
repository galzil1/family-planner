'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import WeekView from '@/components/WeekView';
import FloatingAddButton from '@/components/FloatingAddButton';
import { getWeekStartISO } from '@/lib/date-utils';
import { Loader2 } from 'lucide-react';

import type { User, Family, Category, Task } from '@/types';

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
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
      console.error('Error loading calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTaskCreated = () => {
    loadData();
    setShowTaskForm(false);
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

  return (
    <div className="min-h-screen bg-slate-900">
      <Header user={user} family={family} familyMembers={familyMembers} />
      <main className="container mx-auto px-4 py-6">
        <WeekView
          user={user}
          family={family}
          familyMembers={familyMembers}
          categories={categories}
          initialTasks={tasks}
        />
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
