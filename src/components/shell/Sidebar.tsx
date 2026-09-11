'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from '@/types';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  HelpCircle,
  Code2,
  CalendarCheck,
  Briefcase,
  FileText,
  Building2,
  Bot,
  Bell,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Zap,
  Terminal,
  Mic,
  TrendingUp,
  X,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  user: User;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ user, collapsed = false, mobileOpen = false, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const [malpracticeBadgeCount, setMalpracticeBadgeCount] = React.useState<number>(0);

  useEffect(() => {
    if (user.role !== 'FACULTY') return;

    const fetchMalpracticeCount = async () => {
      try {
        const res = await fetch('/api/malpractice');
        const data = await res.json();
        setMalpracticeBadgeCount(data.unnotedCount || 0);
      } catch (e) {}
    };

    fetchMalpracticeCount();
    const interval = setInterval(fetchMalpracticeCount, 5000);

    const handleNotedEvent = () => {
      setMalpracticeBadgeCount(0);
    };

    const handleLoggedEvent = () => {
      fetchMalpracticeCount();
    };

    window.addEventListener('malpracticeNoted', handleNotedEvent);
    window.addEventListener('malpracticeLogged', handleLoggedEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('malpracticeNoted', handleNotedEvent);
      window.removeEventListener('malpracticeLogged', handleLoggedEvent);
    };
  }, [user.role]);

  const isRole = (role: string) => user.role === role;

  const mainNav = user.role === 'FACULTY' ? [
    { label: 'Faculty Command Desk', href: '/faculty', icon: Briefcase },
    { label: 'Student Profiles', href: '/faculty/students', icon: UserCheck },
    { label: 'Add Technical Course', href: '/faculty/courses', icon: BookOpen },
    { label: 'Create Placement Drive', href: '/faculty/drives', icon: Building2 },
    { label: 'Malpractice', href: '/faculty/malpractice', icon: ShieldAlert },
    { label: 'Test', href: '/faculty/test', icon: CheckSquare },
  ] : [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'LeetCode Coding Practice', href: '/coding', icon: Code2 },
    { label: 'Code Compiler Engine', href: '/compiler', icon: Terminal },
    { label: 'Technical Courses', href: '/courses', icon: BookOpen },
    { label: 'Placement Drives', href: '/placement', icon: Building2 },
    { label: 'AI Student Chatbot', href: '/chatbot', icon: Bot },
    { label: 'Daily Test', href: '/daily-test', icon: Zap },
    { label: 'Student Update Profile', href: '/profile', icon: UserCheck },
    { label: 'AI Mock Interview', href: '/mock-interview', icon: Mic },
    { label: 'Gap Analyzer', href: '/gap-analyzer', icon: TrendingUp },
    { label: 'Resume Analyzer', href: '/resume', icon: FileText },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-40 h-screen w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex flex-col justify-between transition-transform duration-300 shadow-xl md:shadow-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Platform Brand */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 border border-amber-400/60 shadow-md flex items-center justify-center shrink-0">
                <img src="/vsb-logo.png" alt="VSB Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-1 font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">
                  VSB COLLEGE <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-extrabold">ERP</span>
                </div>
                <div className="text-[9px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-extrabold truncate">VSB Engineering College</div>
              </div>
            </div>
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Current Active Persona Info Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white dark:from-slate-800/80 dark:to-slate-800/50 border border-indigo-100/90 dark:border-slate-700/80 rounded-2xl p-3 flex items-center gap-3 shadow-xs">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-medium">{user.department}</div>
              <div className="mt-1 flex items-center gap-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider ${
                  user.role === 'STUDENT' ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-300' :
                  user.role === 'FACULTY' ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/40 dark:text-amber-300' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Navigation</div>
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/faculty' || item.href === '/dashboard'
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200/60 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.label === 'Malpractice' && malpracticeBadgeCount > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs ${
                          isActive
                            ? 'bg-white text-rose-600'
                            : 'bg-rose-600 text-white animate-pulse'
                        }`}
                        title={`${malpracticeBadgeCount} unnoted malpractice incident(s)`}
                      >
                        {malpracticeBadgeCount}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Audit Logs Link */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
          <Link
            href="/audit"
            onClick={onCloseMobile}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span>Security & Audit Log</span>
          </Link>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 px-3 text-center font-medium">
            Engineering College Edition
          </div>
        </div>
      </aside>
    </>
  );
}

