'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import {
  Calendar,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Users,
  Copy,
  Check,
  Home,
} from 'lucide-react';
import type { User, Family } from '@/types';

interface HeaderProps {
  user: User;
  family: Family | null;
  familyMembers: User[];
}

export default function Header({ user, family, familyMembers }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const copyInviteCode = async () => {
    if (family?.invite_code) {
      await navigator.clipboard.writeText(family.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navItems = [
    { href: '/dashboard', label: 'לוח משימות', icon: Home },
    { href: '/history', label: 'היסטוריה', icon: History },
    { href: '/settings', label: 'הגדרות', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-white text-lg leading-tight">
                {family?.name || 'לוח משפחתי'}
              </h1>
              <p className="text-xs text-slate-400">תכנון שבועי</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 rounded-xl p-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Family Members & User Menu */}
          <div className="flex items-center gap-3">
            {/* Family Members Avatars */}
            <div className="hidden sm:flex items-center gap-1">
              {familyMembers.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-md hover:scale-110 transition-transform cursor-default"
                  style={{ backgroundColor: member.avatar_color }}
                  title={member.display_name}
                >
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
              ))}
              {familyMembers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                  +{familyMembers.length - 4}
                </div>
              )}
            </div>

            {/* Invite Code Button */}
            {family?.invite_code && (
              <button
                onClick={copyInviteCode}
                className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition-all border border-slate-700/50 hover:border-slate-600"
                title="העתק קוד הזמנה"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">הועתק!</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span className="font-mono tracking-wider">{family.invite_code}</span>
                    <Copy className="w-3.5 h-3.5 opacity-50" />
                  </>
                )}
              </button>
            )}

            {/* Desktop User & Sign Out */}
            <div className="hidden md:flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-md"
                style={{ backgroundColor: user.avatar_color }}
                title={user.display_name}
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="התנתק"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-700/50 bg-slate-900/98 backdrop-blur-xl">
          {/* User Info */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-lg"
                style={{ backgroundColor: user.avatar_color }}
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{user.display_name}</p>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border border-violet-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Invite Code in Mobile */}
            {family?.invite_code && (
              <button
                onClick={() => {
                  copyInviteCode();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>קוד הזמנה: </span>
                <span className="font-mono tracking-wider">{family.invite_code}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400 mr-auto" />
                ) : (
                  <Copy className="w-4 h-4 mr-auto opacity-50" />
                )}
              </button>
            )}

            <div className="pt-2 border-t border-slate-800 mt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                התנתק
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
