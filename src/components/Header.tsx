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
    { href: '/dashboard', label: 'Planner', icon: Calendar },
    { href: '/history', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white hidden sm:block">
              {family?.name || 'Family Planner'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
            <div className="hidden sm:flex items-center -space-x-2">
              {familyMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: member.avatar_color }}
                  title={member.display_name}
                >
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            {/* Invite Code Button */}
            {family?.invite_code && (
              <button
                onClick={copyInviteCode}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
                title="Copy invite code"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono">{family.invite_code}</span>
                    <Copy className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}

            {/* User Avatar */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white md:hidden"
              style={{ backgroundColor: user.avatar_color }}
            >
              {user.display_name.charAt(0).toUpperCase()}
            </button>

            {/* Desktop Sign Out */}
            <button
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Invite Code: </span>
                <span className="font-mono">{family.invite_code}</span>
                {copied ? (
                  <Check className="w-4 h-4 text-green-400 ml-auto" />
                ) : (
                  <Copy className="w-4 h-4 ml-auto" />
                )}
              </button>
            )}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
