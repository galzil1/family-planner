import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
import Header from '@/components/Header';
import { formatDateForHistory, getWeekStartISO } from '@/lib/date-utils';
import { Check, X, ChevronRight, Calendar } from 'lucide-react';
import type { Task } from '@/types';

export default async function HistoryPage() {
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

  if (!user || !user.family_id) {
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

  // Get all past weeks with tasks
  const currentWeekStart = getWeekStartISO();
  const { data: pastTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('family_id', user.family_id)
    .lt('week_start', currentWeekStart)
    .order('week_start', { ascending: false });

  // Group tasks by week
  const tasksByWeek = (pastTasks || []).reduce<Record<string, Task[]>>(
    (acc, task) => {
      const week = task.week_start;
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(task as Task);
      return acc;
    },
    {}
  );

  const weeks = Object.keys(tasksByWeek).sort().reverse();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header
        user={user}
        family={family}
        familyMembers={familyMembers || []}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-slate-400 mt-1">
            Review your past weeks and track your progress
          </p>
        </div>

        {weeks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No history yet</h3>
            <p className="text-slate-400 mb-6">
              Your completed weeks will appear here
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors"
            >
              Go to Planner
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {weeks.map((weekStart) => {
              const weekTasks = tasksByWeek[weekStart] || [];
              const completedCount = weekTasks.filter((t) => t.completed).length;
              const totalCount = weekTasks.length;
              const completionRate =
                totalCount > 0
                  ? Math.round((completedCount / totalCount) * 100)
                  : 0;

              return (
                <div
                  key={weekStart}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 sm:p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Week of {formatDateForHistory(weekStart)}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {completedCount} of {totalCount} tasks completed
                      </p>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          completionRate >= 80
                            ? 'text-green-400'
                            : completionRate >= 50
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {completionRate}%
                      </div>
                      <div className="text-xs text-slate-500">completion</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all ${
                        completionRate >= 80
                          ? 'bg-green-500'
                          : completionRate >= 50
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>

                  {/* Task list */}
                  <div className="space-y-2">
                    {weekTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 py-2 px-3 bg-slate-900/50 rounded-lg"
                      >
                        {task.completed ? (
                          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                            <X className="w-3 h-3 text-red-400" />
                          </div>
                        )}
                        <span
                          className={`text-sm ${
                            task.completed
                              ? 'text-slate-400 line-through'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}

                    {weekTasks.length > 5 && (
                      <p className="text-sm text-slate-500 text-center py-2">
                        +{weekTasks.length - 5} more tasks
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
