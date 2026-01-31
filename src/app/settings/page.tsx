'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import CategoryManager from '@/components/CategoryManager';
import HelperManager from '@/components/HelperManager';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/notifications';
import { Bell, BellOff, User, Palette, Save, Loader2, Users, Copy, Check, MessageCircle } from 'lucide-react';
import { AVATAR_COLORS } from '@/types';
import type { User as UserType, Family, Category, Helper } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingWhatsApp, setSavingWhatsApp] = useState(false);
  const [whatsappSaved, setWhatsappSaved] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<
    NotificationPermission | 'unsupported'
  >('default');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
    setNotificationStatus(getNotificationPermissionStatus());
  }, []);

  const loadData = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      router.push('/login');
      return;
    }

    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (!userData || !userData.family_id) {
      router.push('/onboarding');
      return;
    }

    setUser(userData);
    setDisplayName(userData.display_name);
    setAvatarColor(userData.avatar_color);
    setWhatsappNumber(userData.whatsapp_number || '');

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

    const { data: helpersData } = await supabase
      .from('helpers')
      .select('*')
      .eq('family_id', userData.family_id)
      .order('name');

    setHelpers(helpersData || []);

    setLoading(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    await supabase
      .from('users')
      .update({
        display_name: displayName,
        avatar_color: avatarColor,
      })
      .eq('id', user.id);

    setUser({ ...user, display_name: displayName, avatar_color: avatarColor });
    setSaving(false);
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationsEnabled(true);
      setNotificationStatus('granted');
    }
  };

  const handleCopyInviteCode = async () => {
    if (family?.invite_code) {
      await navigator.clipboard.writeText(family.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveWhatsApp = async () => {
    if (!user) return;

    setSavingWhatsApp(true);

    // Format phone number - ensure it starts with + for international format
    let formattedNumber = whatsappNumber.trim();
    if (formattedNumber && !formattedNumber.startsWith('+')) {
      // Assume Israeli number if no country code
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '+972' + formattedNumber.substring(1);
      } else {
        formattedNumber = '+' + formattedNumber;
      }
    }

    const { error } = await supabase
      .from('users')
      .update({
        whatsapp_number: formattedNumber || null,
      })
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, whatsapp_number: formattedNumber || null });
      setWhatsappNumber(formattedNumber);
      setWhatsappSaved(true);
      setTimeout(() => setWhatsappSaved(false), 2000);
    }

    setSavingWhatsApp(false);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <Header user={user} family={family} familyMembers={familyMembers} />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        {/* Profile Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-violet-400" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Avatar Color
              </label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={`w-10 h-10 rounded-full transition-all ${
                      avatarColor === color
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Profile
            </button>
          </div>
        </section>

        {/* WhatsApp Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            וואטסאפ
          </h2>

          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              חבר את מספר הוואטסאפ שלך כדי לקבל תזכורות ולנהל משימות דרך הודעות.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                מספר טלפון
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+972501234567 או 0501234567"
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                dir="ltr"
              />
              <p className="text-xs text-slate-500 mt-1">
                הזן את המספר בפורמט בינלאומי או מקומי
              </p>
            </div>

            <button
              onClick={handleSaveWhatsApp}
              disabled={savingWhatsApp}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                whatsappSaved
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-green-600 text-white hover:bg-green-500'
              }`}
            >
              {savingWhatsApp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : whatsappSaved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {whatsappSaved ? 'נשמר!' : 'שמור מספר'}
            </button>

            {user?.whatsapp_number && (
              <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="text-sm text-green-400 font-medium mb-2">
                  ✅ וואטסאפ מחובר
                </p>
                <p className="text-xs text-slate-400">
                  שלח הודעה לבוט כדי לראות את המשימות שלך. פקודות זמינות:
                </p>
                <ul className="text-xs text-slate-400 mt-2 space-y-1">
                  <li>• <code className="bg-slate-800 px-1 rounded">היום</code> - משימות להיום</li>
                  <li>• <code className="bg-slate-800 px-1 rounded">מחר</code> - משימות למחר</li>
                  <li>• <code className="bg-slate-800 px-1 rounded">הוסף [משימה]</code> - הוסף משימה חדשה</li>
                  <li>• <code className="bg-slate-800 px-1 rounded">עזרה</code> - כל הפקודות</li>
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* Family Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            משפחה
          </h2>

          <div className="space-y-4">
            {/* Family Name */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                שם המשפחה
              </label>
              <p className="text-white font-medium">{family?.name}</p>
            </div>

            {/* Invite Code */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                קוד הזמנה
              </label>
              <p className="text-xs text-slate-500 mb-2">
                שתף את הקוד הזה עם בני משפחה כדי שיוכלו להצטרף
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl font-mono text-lg text-violet-300 tracking-wider">
                  {family?.invite_code}
                </div>
                <button
                  onClick={handleCopyInviteCode}
                  className={`p-3 rounded-xl transition-all ${
                    copied
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                  }`}
                  title="העתק קוד"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Family Members */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                בני משפחה ({familyMembers.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: member.avatar_color }}
                    >
                      {member.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{member.display_name}</span>
                    {member.id === user?.id && (
                      <span className="text-xs text-slate-500">(את/ה)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-violet-400" />
            Notifications
          </h2>

          {notificationStatus === 'unsupported' ? (
            <div className="flex items-center gap-3 text-slate-400">
              <BellOff className="w-5 h-5" />
              <span>Push notifications are not supported in this browser</span>
            </div>
          ) : notificationStatus === 'granted' ? (
            <div className="flex items-center gap-3 text-green-400">
              <Bell className="w-5 h-5" />
              <span>Push notifications are enabled</span>
            </div>
          ) : notificationStatus === 'denied' ? (
            <div className="flex items-center gap-3 text-red-400">
              <BellOff className="w-5 h-5" />
              <span>
                Notifications are blocked. Please enable them in your browser
                settings.
              </span>
            </div>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-500/20 text-violet-300 rounded-xl hover:bg-violet-500/30 transition-colors"
            >
              <Bell className="w-4 h-4" />
              Enable Push Notifications
            </button>
          )}
        </section>

        {/* Categories Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <CategoryManager
            familyId={user.family_id!}
            categories={categories}
            onCategoriesChange={setCategories}
          />
        </section>

        {/* Helpers Section */}
        <section className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-24 md:mb-6">
          <HelperManager
            familyId={user.family_id!}
            helpers={helpers}
            onHelpersChange={setHelpers}
          />
        </section>
      </main>
    </div>
  );
}
