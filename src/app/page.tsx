'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Calendar,
  Users,
  Bell,
  CheckCircle,
  Smartphone,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function HomePage() {
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push('/dashboard');
      } else {
        setChecking(false);
      }
    }
    checkAuth();
  }, [supabase, router]);

  const features = [
    {
      icon: Calendar,
      title: 'תכנון שבועי',
      description: 'ארגנו משימות לפי ימים בתצוגת לוח שנה אינטואיטיבית',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: Users,
      title: 'שיתוף פעולה משפחתי',
      description: 'הקצו משימות לבני המשפחה ושתפו באחריות',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Bell,
      title: 'תזכורות חכמות',
      description: 'קבלו התראות על משימות קרובות בכל מכשיר',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: RotateCcw,
      title: 'משימות חוזרות',
      description: 'הגדירו שגרות שבועיות שחוזרות אוטומטית',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Smartphone,
      title: 'מותאם לנייד',
      description: 'גשו ללוח מהטלפון, הטאבלט או המחשב',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: CheckCircle,
      title: 'מעקב התקדמות',
      description: 'צפו בהיסטוריה וחגגו הצלחות',
      color: 'from-fuchsia-500 to-pink-500',
    },
  ];

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjN2MzYWVkIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-40" />
        
        {/* Background decoration */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-32 relative">
          <div className="text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-8 shadow-2xl shadow-violet-500/30">
              <Calendar className="w-12 h-12 text-white" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              תכנון שבועי פשוט למשפחות
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              תכננו יחד,
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                תעשו יותר
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl sm:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              הלוח האינטואיטיבי שלנו עוזר לכם ולבן/בת הזוג לארגן משימות שבועיות,
              לחלק אחריות ולהישאר מעודכנים.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-lg font-bold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
              >
                התחילו בחינם
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 text-white text-lg font-semibold rounded-xl border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-all"
              >
                התחברות
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10" />
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
              {/* Mock Weekly View */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  <span className="font-bold text-white text-lg">משפחת כהן</span>
                </div>
                <div className="text-sm text-slate-400">ינואר 2026</div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'].map((day, i) => (
                  <div
                    key={day}
                    className={`rounded-xl p-3 ${
                      i === 1 ? 'bg-violet-500/20 border border-violet-500/30' : 'bg-slate-900/50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-500 text-center mb-1">{day}</div>
                    <div className="text-xl font-bold text-center text-white mb-2">
                      {18 + i}
                    </div>
                    <div className="space-y-1.5">
                      {i % 2 === 0 && (
                        <div className="h-7 bg-emerald-500/20 rounded-lg text-xs flex items-center px-2 text-emerald-400 truncate">
                          🛒 קניות
                        </div>
                      )}
                      {i % 3 === 0 && (
                        <div className="h-7 bg-pink-500/20 rounded-lg text-xs flex items-center px-2 text-pink-400 truncate">
                          🧹 ניקיון
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
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              כל מה שצריך לתכנון יחד
            </h2>
            <p className="text-slate-400 text-xl max-w-2xl mx-auto">
              תוכנן במיוחד לזוגות ומשפחות שרוצים דרך פשוטה יותר לנהל משימות בית
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-8 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600/50 hover:bg-slate-800/50 transition-all"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-base leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            מוכנים לפשט את התכנון השבועי?
          </h2>
          <p className="text-slate-400 text-xl mb-10">
            הצטרפו למשפחות שעברו מגיליונות מבולגנים ללוח אינטואיטיבי.
            <br />
            ההרשמה חינם.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-lg font-bold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25"
          >
            צרו את הלוח המשפחתי שלכם
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-slate-500">
            © {new Date().getFullYear()} לוח משימות משפחתי. נוצר באהבה ❤️ למשפחות עסוקות.
          </p>
        </div>
      </footer>
    </div>
  );
}
