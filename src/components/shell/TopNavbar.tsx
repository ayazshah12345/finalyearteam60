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
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadNotifications();
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vsb_theme', 'light');
    }
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

  return (
    <>
      <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          {/* Mobile Hamburger Menu Toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#1e3a8a]" />
            </button>
          )}

          {/* Global Search Bar Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 sm:gap-3 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-800 text-xs transition-all w-44 sm:w-64 md:w-80 justify-between shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="w-4 h-4 text-[#1e3a8a] shrink-0" />
              <span className="font-medium truncate">Search...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-3">
          {/* Notifications Button */}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] transition-all"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-extrabold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1"></div>

          {/* User Profile Summary & Login Link */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white p-0.5 border-2 border-[#1e3a8a]/40 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={user.role === 'STUDENT' ? '/vsb-logo.png' : (user.avatarUrl || '/vsb-logo.png')}
                alt={user.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden md:block text-left">
              <div className="font-display text-xs font-bold text-[#0f2942] leading-tight">{user.name}</div>
              <div className="font-mono text-[10px] text-slate-500 font-semibold">
                {user.role === 'STUDENT' ? `Roll: ${user.rollNumber}` : user.department}
              </div>
            </div>
            
            {user.role !== 'STUDENT' && (
              <>
                <a
                  href="/faculty"
                  className="ml-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] border border-blue-200 text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Faculty Command Desk"
                >
                  <span>Faculty Desk</span>
                </a>
                <a
                  href="/coordinator"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition-all flex items-center gap-1.5"
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
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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

