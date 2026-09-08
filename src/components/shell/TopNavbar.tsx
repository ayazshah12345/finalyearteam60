'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Search, Bell, Sun, Moon, Sparkles, ShieldCheck, Menu, LogOut } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDrawer } from './NotificationDrawer';
import { clearSession } from '@/lib/client-auth';

interface TopNavbarProps {
  user: User;
  onToggleMobileMenu?: () => void;
}

export function TopNavbar({ user, onToggleMobileMenu }: TopNavbarProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
    // Ensure light mode is default on initial load
    document.documentElement.classList.remove('dark');
  }, []);

  const fetchUnreadNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <>
      <header className="h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Menu Toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-indigo-600" />
            </button>
          )}

          {/* Global Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/70 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-xs transition-all w-44 sm:w-64 md:w-80 justify-between shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-medium truncate">Search...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-600 shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-extrabold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-800 hover:text-amber-600 transition-all"
            title="Toggle Light / Dark Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

          {/* User Profile Summary & Login Link */}
          <div className="flex items-center gap-2.5">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs"
            />
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {user.role === 'STUDENT' ? `Roll: ${user.rollNumber}` : user.department}
              </div>
            </div>
            
            {user.role !== 'STUDENT' && (
              <>
                <a
                  href="/faculty"
                  className="ml-1 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Faculty Command Desk"
                >
                  <span>Faculty Desk</span>
                </a>
                <a
                  href="/coordinator"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Placement Coordinator Desk"
                >
                  <span>Coordinator Desk</span>
                </a>
              </>
            )}

            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/me', { method: 'DELETE' });
                } catch (e) {}
                clearSession();
                window.location.href = '/login';
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </>
  );
}

