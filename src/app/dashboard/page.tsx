import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
import Header from '@/components/Header';
import WeekView from '@/components/WeekView';
import { getWeekStartISO } from '@/lib/date-utils';

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect('/login');
  }

  // Get user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (!user) {
    redirect('/login');
  }

  // If user doesn't have a family, redirect to onboarding
  if (!user.family_id) {
    redirect('/onboarding');
  }

  // Get family
  const { data: family } = await supabase
    .from('families')
    .select('*')
    .eq('id', user.family_id)
    .single();

  // Get family members
  const { data: familyMembers } = await supabase
    .from('users')
    .select('*')
    .eq('family_id', user.family_id);

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('family_id', user.family_id)
    .order('name');

  // Get current week's tasks
  const weekStart = getWeekStartISO();
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id)
    .gte('week_start', weekStart);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header
        user={user}
        family={family}
        familyMembers={familyMembers || []}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <WeekView
          initialTasks={tasks || []}
          familyMembers={familyMembers || []}
          categories={categories || []}
          familyId={user.family_id}
        />
      </main>
    </div>
  );
}
