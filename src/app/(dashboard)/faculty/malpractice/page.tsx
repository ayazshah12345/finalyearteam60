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
  Award,
  ChevronDown,
  ChevronUp,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';

interface AggregatedMalpracticeGroup {
  groupKey: string;
  studentId: string;
  studentName: string;
  studentRollNumber?: string;
  studentDepartment?: string;
  studentAvatarUrl?: string;
  category: 'TEST_SESSION' | 'VIDEO_TAMPERING';
  type: string;
  title: string;
  count: number;
  incidents: MalpracticeIncident[];
  latestTimestamp: string;
  severity: 'HIGH' | 'MEDIUM' | 'WARNING';
  status: 'REPORTED' | 'WARNING_ISSUED' | 'DISMISSED';
  contextTitles: string[];
}

function getMalpracticePresentation(type: string, count: number) {
  if (type === 'VIDEO_SEEK_TAMPER') {
    return {
      title: `Forwarded Video (${count} time${count > 1 ? 's' : ''})`,
      shortLabel: `Forwarded Video: ${count} times`,
      description: `Student repeatedly attempted to swipe/drag video timeline ahead to skip lecture content ${count} time${count > 1 ? 's' : ''}. Each time scrubber was snapped back to the beginning (0s) by Focus Guard.`,
      icon: FastForward,
      color: 'violet'
    };
  }
  if (type === 'TAB_SWITCH') {
    return {
      title: `Switched Browser Tab (${count} time${count > 1 ? 's' : ''})`,
      shortLabel: `Switched Tab: ${count} times`,
      description: `Student switched away from the proctored exam window or opened background browser tabs ${count} time${count > 1 ? 's' : ''}.`,
      icon: MonitorX,
      color: 'amber'
    };
  }
  if (type === 'VIDEO_SPEEDUP_ATTEMPT') {
    return {
      title: `Video Speedup Tampering (${count} time${count > 1 ? 's' : ''})`,
      shortLabel: `Speed Tampering: ${count} times`,
      description: `Student attempted to fast-forward playback speed ${count} time${count > 1 ? 's' : ''} to bypass controlled learning requirements. Standard 1.0x speed was forcefully enforced.`,
      icon: Zap,
      color: 'violet'
    };
  }
  if (type === 'FULLSCREEN_EXIT') {
    return {
      title: `Exited Fullscreen Proctored View (${count} time${count > 1 ? 's' : ''})`,
      shortLabel: `Fullscreen Exited: ${count} times`,
      description: `Student exited fullscreen proctoring surveillance ${count} time${count > 1 ? 's' : ''}.`,
      icon: AlertTriangle,
      color: 'rose'
    };
  }
  if (type === 'CAMERA_ABSENCE') {
    return {
      title: `Face Absent from Camera (${count} time${count > 1 ? 's' : ''})`,
      shortLabel: `Camera Absence: ${count} times`,
      description: `AI Proctor detected student face missing or occluded from camera frame ${count} time${count > 1 ? 's' : ''}.`,
      icon: Eye,
      color: 'amber'
    };
  }
  return {
    title: `Academic Violation (${count} time${count > 1 ? 's' : ''})`,
    shortLabel: `Violation: ${count} times`,
    description: `Academic integrity violation detected ${count} time${count > 1 ? 's' : ''}.`,
    icon: ShieldAlert,
    color: 'rose'
  };
}

export default function FacultyMalpracticeDeskPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [incidents, setIncidents] = useState<MalpracticeIncident[]>([]);
  const [unnotedCount, setUnnotedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'TEST_SESSION' | 'VIDEO_TAMPERING' | 'HIGH'>('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Once faculty enters the malpractice desk, reset the navigation count immediately & start fresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('vsb_malpractice_viewed_at', new Date().toISOString());
      window.dispatchEvent(new CustomEvent('malpracticeNoted'));
    }
    handleMarkAllNoted(false);
    fetchMalpracticeData();
  }, []);

  const fetchMalpracticeData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      const res = await fetch('/api/malpractice', { cache: 'no-store' });
      const data = await res.json();
      setIncidents(data.incidents || []);
      setUnnotedCount(0); // Faculty is currently on the page inspecting incidents
    } catch (e) {
      console.error('Failed to load malpractice records:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllNoted = async (showToastNotice = true) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('vsb_malpractice_viewed_at', new Date().toISOString());
        window.dispatchEvent(new CustomEvent('malpracticeNoted'));
      }
      await fetch('/api/malpractice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'MARK_NOTED' })
      });
      setUnnotedCount(0);
      if (showToastNotice) {
        showToast('✓ Malpractice desk noted! Notification counter reset to 0 (starts fresh).');
      }
    } catch (e) {
      console.warn('Failed to mark malpractice noted:', e);
    }
  };

  const handleUpdateStatusGroup = async (
    targetIds: string[],
    status: 'WARNING_ISSUED' | 'DISMISSED'
  ) => {
    try {
      const res = await fetch('/api/malpractice', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: targetIds, status })
      });
      if (res.ok) {
        setIncidents((prev) =>
          prev.map((inc) => (targetIds.includes(inc.id) ? { ...inc, status } : inc))
        );
        showToast(
          status === 'WARNING_ISSUED'
            ? `⚠️ Official warning issued for ${targetIds.length} incident strike(s)!`
            : `✅ ${targetIds.length} malpractice incident(s) marked resolved / dismissed.`
        );
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const matchName = inc.studentName?.toLowerCase().includes(q);
      const matchRoll = inc.studentRollNumber?.toLowerCase().includes(q);
      const matchTitle = inc.title?.toLowerCase().includes(q);
      const matchContext = inc.contextTitle?.toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchTitle && !matchContext) return false;
    }

    return true;
  });

  // Aggregation Logic: Group by studentId + type into single boxes
  const groupedMap = new Map<string, AggregatedMalpracticeGroup>();
  for (const inc of filteredIncidents) {
    const groupKey = `${inc.studentId}_${inc.type}`;
    const existing = groupedMap.get(groupKey);

    if (!existing) {
      groupedMap.set(groupKey, {
        groupKey,
        studentId: inc.studentId,
        studentName: inc.studentName,
        studentRollNumber: inc.studentRollNumber,
        studentDepartment: inc.studentDepartment,
        studentAvatarUrl: inc.studentAvatarUrl,
        category: inc.category,
        type: inc.type,
        title: inc.title,
        count: 1,
        incidents: [inc],
        latestTimestamp: inc.timestamp,
        severity: inc.severity,
        status: inc.status,
        contextTitles: inc.contextTitle ? [inc.contextTitle] : []
      });
    } else {
      existing.count += 1;
      existing.incidents.push(inc);
      if (new Date(inc.timestamp).getTime() > new Date(existing.latestTimestamp).getTime()) {
        existing.latestTimestamp = inc.timestamp;
      }
      if (inc.severity === 'HIGH' || existing.count >= 3) {
        existing.severity = 'HIGH';
      }
      if (inc.status === 'REPORTED') {
        existing.status = 'REPORTED';
      }
      if (inc.contextTitle && !existing.contextTitles.includes(inc.contextTitle)) {
        existing.contextTitles.push(inc.contextTitle);
      }
    }
  }

  const groupedList = Array.from(groupedMap.values()).sort(
    (a, b) => new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
  );

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

        <div className="flex flex-wrap items-center gap-2">
          {/* Mark as Noted Button to reset numbering fresh */}
          <button
            onClick={() => handleMarkAllNoted(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Acknowledge and reset navbar malpractice notification counter to 0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark as Noted (Reset Counter)</span>
          </button>

          <button
            onClick={fetchMalpracticeData}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-indigo-500" />
            <span>Refresh</span>
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

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Surveillance Active Status Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-900 border border-indigo-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white">
              Aggregated Malpractice Reporting Active:
            </span>{' '}
            <span className="text-slate-600 dark:text-slate-300">
              Multiple violation attempts (video forwarding, tab switches) are bundled into a single unified card showing total occurrence counts.
            </span>
          </div>
        </div>
        <div className="shrink-0 text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <span>Navbar Unnoted Count:</span>
          <span className="font-black text-rose-600">{unnotedCount}</span>
        </div>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Unique Grouped Violations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Unified Violations
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {groupedList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Across {incidents.length} total event triggers
          </div>
        </div>

        {/* Test Session Violations */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Test Violations
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
              Video Forwarding Tampering
            </span>
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
              <FastForward className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-violet-600 mt-2">
            {videoTamperingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Timeline forwards & speedups
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
            3-strike & critical terminations
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
              All Unified Violations ({groupedList.length})
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
              <span>Test Violations</span>
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
              <span>Video Tampering</span>
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
              <span>High Severity</span>
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

        {/* Aggregated Unified Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading live malpractice surveillance feed...</span>
          </div>
        ) : groupedList.length === 0 ? (
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
            {groupedList.map((group) => {
              const presentation = getMalpracticePresentation(group.type, group.count);
              const isTest = group.category === 'TEST_SESSION';
              const isHigh = group.severity === 'HIGH';
              const isExpanded = !!expandedKeys[group.groupKey];
              const incidentIds = group.incidents.map((i) => i.id);

              return (
                <div
                  key={group.groupKey}
                  className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
                    isHigh
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : isTest
                      ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Student & Aggregated Incident Summary */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <img
                        src={
                          group.studentAvatarUrl ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'
                        }
                        alt={group.studentName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm shrink-0 mt-0.5"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            {group.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {group.studentRollNumber || 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {group.studentDepartment}
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
                                : group.severity === 'MEDIUM'
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isHigh ? 'CRITICAL / HIGH' : group.severity}
                          </span>
                        </div>

                        {/* Title & Prominent Occurrence Badge */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                          <span className="text-xs font-black text-slate-900 dark:text-white">
                            {presentation.title}
                          </span>

                          {/* Number Badge alone highlighted */}
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-rose-600 text-white font-black text-xs shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{group.count} {group.count === 1 ? 'Time' : 'Times'}</span>
                          </div>
                        </div>

                        {/* Targets Context */}
                        {group.contextTitles.length > 0 && (
                          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold flex flex-wrap items-center gap-1">
                            <span>Detected In:</span>
                            <span className="underline decoration-indigo-300">
                              {group.contextTitles.join(' • ')}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                          {presentation.description}
                        </p>

                        {/* Expandable Individual Timestamps Toggle */}
                        <div className="pt-1">
                          <button
                            onClick={() => toggleExpand(group.groupKey)}
                            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span>Hide individual occurrence logs ({group.count})</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5" />
                                <span>View all {group.count} individual timestamp logs</span>
                              </>
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 space-y-1.5 bg-white/80 dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Detailed Event History ({group.count} events)
                              </div>
                              {group.incidents.map((ev, idx) => (
                                <div
                                  key={ev.id}
                                  className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-100 dark:border-slate-800/60 last:border-0"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-mono text-[10px] text-rose-500 font-bold">
                                      #{idx + 1}
                                    </span>
                                    <span className="truncate text-slate-700 dark:text-slate-300">
                                      {ev.contextTitle || ev.title}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                    {new Date(ev.timestamp).toLocaleTimeString()} • {new Date(ev.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Status & Group Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0 pt-2 lg:pt-0">
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Latest: {new Date(group.latestTimestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.status === 'WARNING_ISSUED' ? (
                          <span className="text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning Issued
                          </span>
                        ) : group.status === 'DISMISSED' ? (
                          <span className="text-xs font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dismissed
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatusGroup(incidentIds, 'WARNING_ISSUED')}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              title={`Issue warning for all ${group.count} violation(s)`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Issue Warning ({group.count})</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatusGroup(incidentIds, 'DISMISSED')}
                              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                              title={`Dismiss all ${group.count} violation(s)`}
                            >
                              Dismiss ({group.count})
                            </button>
                          </>
                        )}

                        <Link
                          href={`/faculty/students`}
                          className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-all"
                          title="Inspect Student Profile"
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
