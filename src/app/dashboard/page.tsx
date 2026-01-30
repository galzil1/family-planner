'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import WeekView from '@/components/WeekView';
import { getWeekStartISO } from '@/lib/date-utils';
import { Loader2 } from 'lucide-react';

import type { User, Family, Category, Task } from '@/types';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Get current user
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          router.push('/login');
          return;
        }

        // Get user profile
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (!userData) {
          router.push('/login');
          return;
        }

        // If user doesn't have a family, redirect to onboarding
        if (!userData.family_id) {
          router.push('/onboarding');
          return;
        }

        setUser(userData);

        // Get family
        const { data: familyData } = await supabase
          .from('families')
          .select('*')
          .eq('id', userData.family_id)
          .single();

        setFamily(familyData);

        // Get family members
        const { data: membersData } = await supabase
          .from('users')
          .select('*')
          .eq('family_id', userData.family_id);

        setFamilyMembers(membersData || []);

        // Get categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('family_id', userData.family_id)
          .order('name');

        setCategories(categoriesData || []);

        // Get current week's tasks
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
    }

    loadDashboard();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (!user || !family) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
    </div>
  );
}
