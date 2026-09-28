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
  CheckCheck,
  Trash2
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

  const handleClearAllMalpractice = async () => {
    if (!window.confirm('Are you sure you want to clear ALL stored malpractice records? This will remove all violations across all students and reset the malpractice desk to 0 fresh.')) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch('/api/malpractice', {
        method: 'DELETE'
      });
      if (res.ok) {
        setIncidents([]);
        setUnnotedCount(0);
        if (typeof window !== 'undefined') {
          localStorage.setItem('vsb_malpractice_viewed_at', new Date().toISOString());
          window.dispatchEvent(new CustomEvent('malpracticeNoted'));
          window.dispatchEvent(new CustomEvent('malpracticeCleared'));
        }
        showToast('✓ All stored student malpractice records have been removed! Starting completely fresh.');
      } else {
        // Fallback with POST action: CLEAR_ALL
        const postRes = await fetch('/api/malpractice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CLEAR_ALL' })
        });
        if (postRes.ok) {
          setIncidents([]);
          setUnnotedCount(0);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vsb_malpractice_viewed_at', new Date().toISOString());
            window.dispatchEvent(new CustomEvent('malpracticeNoted'));
            window.dispatchEvent(new CustomEvent('malpracticeCleared'));
          }
          showToast('✓ All stored student malpractice records have been removed! Starting completely fresh.');
        } else {
          showToast('❌ Failed to clear malpractice records.');
        }
      }
    } catch (e) {
      console.error(e);
      showToast('❌ Error clearing malpractice records.');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Surveillance & Integrity Desk...</span>
      </div>
    );
  }

  if (faculty?.role === 'STUDENT') {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 bg-white border border-slate-200 rounded-3xl shadow-sm mt-8">
        <div className="w-16 h-16 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto border border-blue-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#0f2942]">
          ⛔ Faculty Privileges Required
        </h2>
        <p className="text-xs text-slate-600 font-medium leading-relaxed">
          The Malpractice Surveillance desk is restricted to VSB Faculty and exam proctors. Students cannot access integrity investigation reports.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-all"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/faculty"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#1e3a8a] hover:border-[#1e3a8a] transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a8a] uppercase tracking-widest">
              <span>Faculty Surveillance</span>
              <span>•</span>
              <span>Academic Integrity</span>
            </div>
            <h1 className="text-2xl font-black text-[#0f2942] flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#1e3a8a]" />
              <span>Student Malpractice & Proctoring Desk</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clear All Malpractice Button */}
          <button
            onClick={handleClearAllMalpractice}
            className="px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Remove all stored student malpractice records and start fresh"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>

          {/* Mark as Noted Button to reset numbering fresh */}
          <button
            onClick={() => handleMarkAllNoted(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-[#1e3a8a] text-[#1e3a8a] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Acknowledge and reset navbar malpractice notification counter to 0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark as Noted</span>
          </button>

          <button
            onClick={fetchMalpracticeData}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#1e3a8a] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-[#1e3a8a]" />
            <span>Refresh</span>
          </button>

          <Link
            href="/faculty/students"
            className="px-4 py-2 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Profiles</span>
          </Link>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-[#0f2942] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-[#1e3a8a] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Surveillance Active Status Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div>
            <span className="font-extrabold text-[#0f2942]">
              Aggregated Malpractice Reporting Active:
            </span>{' '}
            <span className="text-slate-600">
              Multiple violation attempts (video forwarding, tab switches) are bundled into a single unified card showing total occurrence counts.
            </span>
          </div>
        </div>
        <div className="shrink-0 text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-2">
          <span>Navbar Unnoted Count:</span>
          <span className="font-black text-[#1e3a8a]">{unnotedCount}</span>
        </div>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Unique Grouped Violations */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Unified Violations
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#0f2942] mt-2">
            {groupedList.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Across {incidents.length} total event triggers
          </div>
        </div>

        {/* Test Session Violations */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Test Violations
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
              <MonitorX className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1e3a8a] mt-2">
            {testViolationsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Tab switches, focus loss & exits
          </div>
        </div>

        {/* Video Playback Tampering */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Video Forwarding Tampering
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
              <FastForward className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1e3a8a] mt-2">
            {videoTamperingCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            Timeline forwards & speedups
          </div>
        </div>

        {/* High Severity Violations */}
        <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
              Disqualifications / High Risk
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-[#1e3a8a] mt-2">
            {highSeverityCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-medium">
            3-strike & critical terminations
          </div>
        </div>
      </div>

      {/* Main Surveillance Feed Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Unified Violations ({groupedList.length})
            </button>
            <button
              onClick={() => setSelectedCategory('TEST_SESSION')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'TEST_SESSION'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MonitorX className="w-3.5 h-3.5" />
              <span>Test Violations</span>
            </button>
            <button
              onClick={() => setSelectedCategory('VIDEO_TAMPERING')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'VIDEO_TAMPERING'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Video Tampering</span>
            </button>
            <button
              onClick={() => setSelectedCategory('HIGH')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedCategory === 'HIGH'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Aggregated Unified Cards List */}
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading live malpractice surveillance feed...</span>
          </div>
        ) : groupedList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto border border-blue-100">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-sm font-black text-[#0f2942]">
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
                  className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-[#1e3a8a] transition-all shadow-xs"
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
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0 mt-0.5"
                      />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-[#0f2942]">
                            {group.studentName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {group.studentRollNumber || 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {group.studentDepartment}
                          </span>

                          {/* Category Badge */}
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border bg-blue-50 text-[#1e3a8a] border-blue-200">
                            {isTest ? '📝 Test Session Violation' : '⏩ Video Playback Tampering'}
                          </span>

                          {/* Severity Badge */}
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                              isHigh
                                ? 'bg-[#1e3a8a] text-white'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {isHigh ? 'CRITICAL / HIGH' : group.severity}
                          </span>
                        </div>

                        {/* Title & Occurrence Badge */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                          <span className="text-xs font-black text-[#0f2942]">
                            {presentation.title}
                          </span>

                          {/* Number Badge */}
                          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#1e3a8a] text-white font-black text-xs shadow-xs">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>{group.count} {group.count === 1 ? 'Time' : 'Times'}</span>
                          </div>
                        </div>

                        {/* Targets Context */}
                        {group.contextTitles.length > 0 && (
                          <div className="text-[11px] text-[#1e3a8a] font-bold flex flex-wrap items-center gap-1">
                            <span>Detected In:</span>
                            <span className="underline decoration-blue-300">
                              {group.contextTitles.join(' • ')}
                            </span>
                          </div>
                        )}

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {presentation.description}
                        </p>

                        {/* Expandable Individual Timestamps Toggle */}
                        <div className="pt-1">
                          <button
                            onClick={() => toggleExpand(group.groupKey)}
                            className="text-[11px] font-bold text-[#1e3a8a] hover:text-[#172554] flex items-center gap-1 cursor-pointer"
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
                            <div className="mt-2 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Detailed Event History ({group.count} events)
                              </div>
                              {group.incidents.map((ev, idx) => (
                                <div
                                  key={ev.id}
                                  className="flex items-center justify-between gap-2 text-xs py-1 border-b border-slate-200 last:border-0"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="font-mono text-[10px] text-[#1e3a8a] font-bold">
                                      #{idx + 1}
                                    </span>
                                    <span className="truncate text-slate-700">
                                      {ev.contextTitle || ev.title}
                                    </span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-500 shrink-0">
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
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Latest: {new Date(group.latestTimestamp).toLocaleTimeString()}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {group.status === 'WARNING_ISSUED' ? (
                          <span className="text-xs font-black text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Warning Issued
                          </span>
                        ) : group.status === 'DISMISSED' ? (
                          <span className="text-xs font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Dismissed
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleUpdateStatusGroup(incidentIds, 'WARNING_ISSUED')}
                              className="px-3 py-1.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                              title={`Issue warning for all ${group.count} violation(s)`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Issue Warning ({group.count})</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatusGroup(incidentIds, 'DISMISSED')}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                              title={`Dismiss all ${group.count} violation(s)`}
                            >
                              Dismiss ({group.count})
                            </button>
                          </>
                        )}

                        <Link
                          href={`/faculty/students`}
                          className="p-1.5 rounded-xl bg-blue-50 text-[#1e3a8a] border border-blue-200 hover:bg-blue-100 transition-all"
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
