'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Calendar, Users, UserPlus, Home, Loader2, ArrowRight } from 'lucide-react';
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
      setError('Not authenticated');
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
      setError('Not authenticated');
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
      setError('Invalid invite code. Please check and try again.');
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
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 mb-4 shadow-lg shadow-violet-500/25">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'choice' && 'Set up your family'}
            {step === 'create' && 'Create your family'}
            {step === 'join' && 'Join a family'}
          </h1>
          <p className="text-slate-400">
            {step === 'choice' && 'Create a new family or join an existing one.'}
            {step === 'create' && 'Give your family a name to get started.'}
            {step === 'join' && 'Enter the invite code shared with you.'}
          </p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-xl">
          {step === 'choice' && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('create')}
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:bg-slate-900/70 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                    <Home className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Create a new family</h3>
                    <p className="text-sm text-slate-400">Start fresh and invite your partner</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>
              </button>

              <button
                onClick={() => setStep('join')}
                className="w-full p-4 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-violet-500/50 hover:bg-slate-900/70 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center group-hover:bg-fuchsia-500/30 transition-colors">
                    <UserPlus className="w-6 h-6 text-fuchsia-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">Join existing family</h3>
                    <p className="text-sm text-slate-400">Use an invite code to join</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
                </div>
              </button>
            </div>
          )}

          {step === 'create' && (
            <form onSubmit={handleCreateFamily} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="familyName" className="block text-sm font-medium text-slate-300 mb-2">
                  Family Name
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    id="familyName"
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                    placeholder="The Smiths"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3 px-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Family'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'join' && (
            <form onSubmit={handleJoinFamily} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-300 mb-2">
                  Invite Code
                </label>
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all text-center text-lg tracking-widest uppercase"
                  placeholder="ABC123XY"
                  maxLength={8}
                  required
                />
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Ask your family member for the 8-character code
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('choice')}
                  className="flex-1 py-3 px-4 bg-slate-700/50 text-white font-semibold rounded-xl hover:bg-slate-700 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Family'
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
