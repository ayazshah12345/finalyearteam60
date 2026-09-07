'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export function DemoRoleSwitcher({ onUserChange }: { onUserChange?: (user: User) => void }) {
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setActiveUser(data.activeUser);
      setAllUsers(data.allUsers || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSwitchUser = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.activeUser) {
        setActiveUser(data.activeUser);
        if (onUserChange) onUserChange(data.activeUser);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!activeUser) return null;

  // Filter users based on active user's role:
  // Faculty only sees Faculty/Placement Coordinator personas. Student personas are NEVER exposed to Faculty.
  // Students only see Student personas.
  const roleFilteredUsers = allUsers.filter((u) => {
    if (activeUser.role === 'FACULTY' || activeUser.role === 'PLACEMENT_COORDINATOR') {
      return u.role === 'FACULTY' || u.role === 'PLACEMENT_COORDINATOR';
    }
    return u.role === 'STUDENT';
  });

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-md z-50">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="font-bold text-slate-100 flex items-center gap-1.5 tracking-tight">
          <img src="/vsb-logo.png" alt="VSB Logo" className="w-4 h-4 object-contain bg-white rounded-sm" />
          VSB Engineering College Portal:
        </span>
        <span className="text-slate-300 hidden md:inline font-medium">
          {activeUser.role === 'STUDENT'
            ? 'Verified Student Access Portal'
            : 'VSB Faculty Desk — Authenticated Session'}
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        {roleFilteredUsers.map((u) => {
          const isActive = u.id === activeUser.id;
          let roleBadge = 'bg-blue-500/20 text-blue-300 border-blue-400/40';
          if (u.role === 'FACULTY') roleBadge = 'bg-amber-500/20 text-amber-300 border-amber-400/40';
          if (u.role === 'PLACEMENT_COORDINATOR') roleBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40';

          return (
            <button
              key={u.id}
              onClick={() => handleSwitchUser(u.id)}
              disabled={loading || isActive}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white border-indigo-300 shadow-md shadow-indigo-500/40 font-bold scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white hover:border-slate-600'
              }`}
            >
              {isActive ? <UserCheck className="w-3.5 h-3.5 text-white" /> : <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />}
              <span>{u.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase tracking-wider font-extrabold ${roleBadge}`}>
                {u.role === 'PLACEMENT_COORDINATOR' ? 'PLACEMENT' : u.role}
              </span>
            </button>
          );
        })}
        {loading && <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
      </div>
    </div>
  );
}
