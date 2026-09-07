'use client';

import React, { useState, useEffect } from 'react';
import { Notification } from '@/types';
import { X, Bell, Check, Building2, FileSpreadsheet, CalendarCheck, HelpCircle, AlertCircle } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: DrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
            <Bell className="w-4 h-4 text-brand-400" />
            <span>Notifications & Announcements</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No new notifications.</div>
          ) : (
            notifications.map((n) => {
              let categoryIcon = <AlertCircle className="w-4 h-4 text-slate-400" />;
              if (n.category === 'Placement') categoryIcon = <Building2 className="w-4 h-4 text-emerald-400" />;
              if (n.category === 'Assignment') categoryIcon = <FileSpreadsheet className="w-4 h-4 text-accent-400" />;
              if (n.category === 'Daily Report') categoryIcon = <CalendarCheck className="w-4 h-4 text-brand-400" />;

              return (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.read
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-70'
                      : 'bg-white dark:bg-slate-800 border-brand-500/30 shadow-subtle'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {categoryIcon}
                      <span className="text-xs font-bold text-slate-800 dark:text-white">{n.title}</span>
                    </div>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-brand-400 hover:text-brand-300 flex items-center gap-1 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{n.message}</p>
                  <div className="text-[10px] text-slate-400 mt-2 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
