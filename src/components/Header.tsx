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
  Home,
  CalendarDays,
} from 'lucide-react';
import type { User, Family } from '@/types';

interface HeaderProps {
  user: User;
  family: Family | null;
  familyMembers: User[];
}

export default function Header({ user, family, familyMembers }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'סיכום', icon: Home },
    { href: '/calendar', label: 'לוח שבועי', icon: CalendarDays },
    { href: '/history', label: 'היסטוריה', icon: History },
    { href: '/settings', label: 'הגדרות', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-base hidden sm:block">
              {family?.name || 'לוח משפחתי'}
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2">
            {/* Family Members - Simplified */}
            <div className="hidden sm:flex items-center gap-0.5">
              {familyMembers.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white -mr-1.5 first:mr-0"
                  style={{ backgroundColor: member.avatar_color }}
                  title={member.display_name}
                >
                  {member.display_name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            {/* User Avatar & Sign Out - Desktop */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
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
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white"
                style={{ backgroundColor: user.avatar_color }}
              >
                {user.display_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white">{user.display_name}</p>
                <p className="text-sm text-slate-400">{family?.name}</p>
              </div>
            </div>
          </div>

          <nav className="px-4 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="border-t border-slate-800 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
