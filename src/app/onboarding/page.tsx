'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Calendar, Users, UserPlus, Home, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '@/types';

type Step = 'choice' | 'create' | 'join';

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>('choice');
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('משתמש לא מחובר');
      setLoading(false);
      return;
    }

    // Create family
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert({ name: familyName })
      .select()
      .single();

    if (familyError) {
      setError(familyError.message);
      setLoading(false);
      return;
    }

    // Update user with family_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ family_id: family.id })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Create default categories
    const categories = DEFAULT_CATEGORIES.map((cat) => ({
      family_id: family.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
    }));

    await supabase.from('categories').insert(categories);

    router.push('/dashboard');
    router.refresh();
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('משתמש לא מחובר');
      setLoading(false);
      return;
    }

    // Find family by invite code
    const { data: family, error: findError } = await supabase
      .from('families')
      .select()
      .eq('invite_code', inviteCode.toLowerCase().trim())
      .single();

    if (findError || !family) {
      setError('קוד הזמנה לא תקין. בדקו ונסו שוב.');
      setLoading(false);
      return;
    }

    // Update user with family_id
    const { error: updateError } = await supabase
      .from('users')
      .update({ family_id: family.id })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-6 shadow-2xl shadow-violet-500/30">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            {step === 'choice' && 'ברוכים הבאים! 🎉'}
            {step === 'create' && 'יצירת משפחה'}
            {step === 'join' && 'הצטרפות למשפחה'}
          </h1>
          <p className="text-slate-400 text-lg">
            {step === 'choice' && 'בואו נתחיל - צרו משפחה חדשה או הצטרפו לקיימת'}
            {step === 'create' && 'תנו שם למשפחה שלכם'}
            {step === 'join' && 'הזינו את קוד ההזמנה שקיבלתם'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('create')}
                className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-2xl hover:border-violet-500/50 hover:bg-slate-900/70 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                    <Home className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-white font-bold text-lg">יצירת משפחה חדשה</h3>
                    <p className="text-sm text-slate-400">התחילו מאפס והזמינו את בני המשפחה</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full p-5 bg-slate-900/50 border border-slate-700 rounded-2xl hover:border-fuchsia-500/50 hover:bg-slate-900/70 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-fuchsia-500/20 flex items-center justify-center group-hover:bg-fuchsia-500/30 transition-colors">
                    <UserPlus className="w-7 h-7 text-fuchsia-400" />
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="text-white font-bold text-lg">הצטרפות למשפחה קיימת</h3>
                    <p className="text-sm text-slate-400">השתמשו בקוד הזמנה להצטרפות</p>
                  </div>
                  <ArrowLeft className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {step === 'create' && (
            <form onSubmit={handleCreateFamily} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="familyName" className="block text-sm font-semibold text-slate-300 mb-2">
                  שם המשפחה
                </label>
                <div className="relative">
                  <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full pr-12 pl-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="משפחת כהן"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3.5 px-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  חזרה
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      יוצר...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      צור משפחה
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'join' && (
            <form onSubmit={handleJoinFamily} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0" />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="inviteCode" className="block text-sm font-semibold text-slate-300 mb-2">
                  קוד הזמנה
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-center text-xl tracking-[0.3em] uppercase font-mono"
                  placeholder="ABC123XY"
                  maxLength={8}
                  required
                  dir="ltr"
                />
                <p className="mt-3 text-xs text-slate-500 text-center">
                  בקשו מבן משפחה את קוד ההזמנה בן 8 התווים
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3.5 px-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  חזרה
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      מצטרף...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      הצטרף
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
