'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/Header';
import CategoryManager from '@/components/CategoryManager';
import {
  requestNotificationPermission,
  getNotificationPermissionStatus,
} from '@/lib/notifications';
import { Bell, BellOff, User, Palette, Save, Loader2 } from 'lucide-react';
import { AVATAR_COLORS } from '@/types';
import type { User as UserType, Family, Category } from '@/types';

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<UserType | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyMembers, setFamilyMembers] = useState<UserType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState('');
  const [avatarColor, setAvatarColor] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<
    NotificationPermission | 'unsupported'
  >('default');

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
      </main>
    </div>
  );
}
