'use client';

import React, { useState, useEffect } from 'react';
import { MalpracticeIncident, User } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  ArrowLeft,
  FastForward,
  MonitorX,
  Eye,
  CheckCircle2,
  XCircle,
  Bell,
  Clock,
  ExternalLink,
  Layers,
  Sparkles,
  Zap,
  Play,
  RotateCcw,
  UserCheck,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function FacultyMalpracticeDeskPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<MalpracticeIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'TEST_SESSION' | 'VIDEO_TAMPERING' | 'HIGH'>('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMalpracticeData();
  }, []);

  const fetchMalpracticeData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      const res = await fetch('/api/malpractice');
      const data = await res.json();
      setIncidents(data.incidents || []);
    } catch (e) {
      console.error('Failed to load malpractice records:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'WARNING_ISSUED' | 'DISMISSED') => {
    try {
      const res = await fetch('/api/malpractice', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) => (inc.id === id ? { ...inc, status } : inc))
        );
        showToast(
          status === 'WARNING_ISSUED'
            ? '⚠️ Official warning issued & delivered to student portal!'
            : '✅ Malpractice incident marked resolved / dismissed.'
        );
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const testViolationsCount = incidents.filter((i) => i.category === 'TEST_SESSION').length;
  const videoTamperingCount = incidents.filter((i) => i.category === 'VIDEO_TAMPERING').length;
  const highSeverityCount = incidents.filter((i) => i.severity === 'HIGH').length;

  // Filtering
  const filteredIncidents = incidents.filter((inc) => {
    if (selectedCategory === 'TEST_SESSION' && inc.category !== 'TEST_SESSION') return false;
    if (selectedCategory === 'VIDEO_TAMPERING' && inc.category !== 'VIDEO_TAMPERING') return false;
    if (selectedCategory === 'HIGH' && inc.severity !== 'HIGH') return false;

    if (selectedDept !== 'ALL' && inc.studentDepartment !== selectedDept) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = inc.studentName.toLowerCase().includes(q);
      const matchRoll = inc.studentRollNumber?.toLowerCase().includes(q);
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchContext = inc.contextTitle?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchTitle && !matchContext) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/faculty"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest">
              <span>Faculty Surveillance</span>
              <span>•</span>
              <span>Academic Integrity</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
              <span>Student Malpractice & Proctoring Desk</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMalpracticeData}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span>Refresh Incidents</span>
          </button>
          <Link
            href="/faculty/students"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Profiles</span>
          </Link>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Malpractice */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Total Incidents
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {incidents.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Recorded across ERP ecosystem
          </div>
        </div>

        {/* Test Session Violations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Test Session Violations
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <MonitorX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {testViolationsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Tab switches, focus loss & exits
          </div>
        </div>

        {/* Video Playback Tampering */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Video Fast-Forward Tampering
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <FastForward className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-violet-600 mt-2">
            {videoTamperingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            1.5x/2.0x speedups & scrub skips
          </div>
        </div>

        {/* High Severity Violations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Disqualifications / High Risk
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">
            {highSeverityCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            3-strike test terminations
          </div>
        </div>
      </div>

      {/* Main Surveillance Feed Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-6">
        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Incidents ({incidents.length})
            </button>
            <button
              onClick={() => setSelectedCategory('TEST_SESSION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'TEST_SESSION'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <MonitorX className="w-3.5 h-3.5" />
              <span>Test Violations ({testViolationsCount})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('VIDEO_TAMPERING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'VIDEO_TAMPERING'
                  ? 'bg-violet-600 text-white font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Video Tampering ({videoTamperingCount})</span>
            </button>
            <button
              onClick={() => setSelectedCategory('HIGH')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'HIGH'
                  ? 'bg-rose-600 text-white font-black shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>High Severity ({highSeverityCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, roll no, or title..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Incidents List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading live malpractice surveillance feed...</span>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              No Malpractice Incidents Found
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No academic integrity violations match the selected filters. All student test sessions and video lecture playbacks are operating cleanly under controlled learning guidelines.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((inc) => {
              const isTest = inc.category === 'TEST_SESSION';
              const isHigh = inc.severity === 'HIGH';

              return (
                <div
                  key={inc.id}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                    isHigh
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : isTest
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Student & Incident Summary */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={
                          inc.studentAvatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                        }
                        alt={inc.studentName}
                        className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0 mt-0.5"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {inc.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {inc.studentRollNumber || 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {inc.studentDepartment}
                          </span>

                          {/* Category Badge */}
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              isTest
                                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                : 'bg-violet-100 dark:bg-violet-950/80 text-violet-800 dark:text-violet-300 border-violet-300 dark:border-violet-800'
                            }`}
                          >
                            {isTest ? '📝 Test Session Violation' : '⏩ Video Playback Tampering'}
                          </span>

                          {/* Severity Badge */}
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              isHigh
                                ? 'bg-rose-600 text-white'
                                : inc.severity === 'MEDIUM'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {inc.severity}
                          </span>
                        </div>

                        {/* Title & Context */}
                        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          {inc.title}
                        </div>

                        {inc.contextTitle && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                            <span>Target:</span>
                            <span className="underline decoration-indigo-300">{inc.contextTitle}</span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {inc.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp, Status & Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(inc.timestamp).toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {inc.status === 'WARNING_ISSUED' ? (
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning Issued
                          </span>
                        ) : inc.status === 'DISMISSED' ? (
                          <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dismissed
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(inc.id, 'WARNING_ISSUED')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Issue Warning</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(inc.id, 'DISMISSED')}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                            >
                              Dismiss
                            </button>
                          </>
                        )}

                        <Link
                          href={`/faculty/students`}
                          className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
                          title="Inspect Student Record"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
