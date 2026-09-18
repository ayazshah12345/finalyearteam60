'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { DemoRoleSwitcher } from '@/components/shell/DemoRoleSwitcher';
import { Sidebar } from '@/components/shell/Sidebar';
import { TopNavbar } from '@/components/shell/TopNavbar';
import { authFetch, setSessionUser } from '@/lib/client-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.activeUser) {
        setUser(data.activeUser);
        setSessionUser(data.activeUser);
      } else {
        window.location.href = '/login';
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] flex flex-col items-center justify-center text-slate-800 dark:text-slate-200">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Loading SGIP Growth Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fe] via-[#f2f5fd] to-[#edf2fb] dark:from-[#090d16] dark:via-[#0c1220] dark:to-[#070a12] text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      <div className="flex flex-1 relative">
        {/* 2. Left Role-Aware Sidebar */}
        <Sidebar
          user={user}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* 3. Main Body Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          {/* Top Navbar */}
          <TopNavbar
            user={user}
            onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          />

          {/* Page Content */}
          <main className="p-3 sm:p-5 md:p-8 flex-1 max-w-7xl w-full mx-auto space-y-5 sm:space-y-8 animate-in fade-in duration-300 min-w-0 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

