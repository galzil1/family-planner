import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
import {
  Calendar,
  Users,
  Bell,
  CheckCircle,
  Smartphone,
  RotateCcw,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default async function HomePage() {
  // Check if user is already logged in
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  const features = [
    {
      icon: Calendar,
      title: 'Weekly Planning',
      description: 'Organize tasks by day with an intuitive calendar view',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'Family Collaboration',
      description: 'Assign tasks to family members and share responsibilities',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified about upcoming tasks on any device',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: RotateCcw,
      title: 'Recurring Tasks',
      description: 'Set up weekly routines that repeat automatically',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Access your planner from phone, tablet, or computer',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CheckCircle,
      title: 'Track Progress',
      description: 'See your completion history and celebrate wins',
      color: 'from-fuchsia-500 to-pink-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-40" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32 relative">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-8 shadow-2xl shadow-violet-500/30 animate-fade-in">
              <Calendar className="w-10 h-10 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4" />
              Simple weekly planning for families
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 animate-slide-up">
              Plan Together,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                Get Things Done
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up">
              Stop fumbling with spreadsheets. Our intuitive planner helps you and your
              partner organize weekly tasks, assign responsibilities, and stay on track.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 text-white font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Preview Image Placeholder */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 sm:p-6 max-w-4xl mx-auto shadow-2xl">
              {/* Mock Weekly View */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  <span className="font-semibold text-white">The Smiths</span>
                </div>
                <div className="text-sm text-slate-400">Week of Jan 18, 2026</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                  <div
                    key={day}
                    className={`rounded-lg p-2 ${
                      i === 1 ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-slate-900/50'
                    }`}
                  >
                    <div className="text-xs text-slate-500 text-center mb-1">{day}</div>
                    <div className="text-lg font-bold text-center text-white mb-2">
                      {18 + i}
                    </div>
                    <div className="space-y-1">
                      {i % 2 === 0 && (
                        <div className="h-6 bg-emerald-500/20 rounded text-xs flex items-center px-2 text-emerald-400 truncate">
                          🛒 Groceries
                        </div>
                      )}
                      {i % 3 === 0 && (
                        <div className="h-6 bg-pink-500/20 rounded text-xs flex items-center px-2 text-pink-400 truncate">
                          🧹 Clean
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to plan together
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Designed for couples and families who want a simpler way to manage household tasks
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600/50 hover:bg-slate-800/50 transition-all"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to simplify your weekly planning?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join families who have switched from messy spreadsheets to our intuitive planner.
            It&apos;s free to get started.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            Create Your Family Planner
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Family Planner. Made with ❤️ for busy families.
          </p>
        </div>
      </footer>
    </div>
  );
}
