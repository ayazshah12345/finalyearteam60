'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, GrowthScoreBreakdown, PlacementReadinessBreakdown } from '@/types';
import { evaluateStudentEligibility } from '@/lib/eligibility';
import {
  Flame,
  Zap,
  TrendingUp,
  Building2,
  BookOpen,
  Code2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  Users,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  ChevronRight,
  Plus,
  GraduationCap,
  Award,
  AlertCircle,
  Check,
  Bot,
  Send,
  Lock,
  ShieldAlert,
  UserCheck,
  Mic,
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [growth, setGrowth] = useState<GrowthScoreBreakdown | null>(null);
  const [readiness, setReadiness] = useState<PlacementReadinessBreakdown | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [facultyData, setFacultyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // AI Placement Advisor Widget State (ChatGPT-style Conversational Engine)
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<any[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello! I am your SGIP ChatGPT-style AI Placement & Career Advisor. Ask me anything about campus placement drives, CGPA & backlog rules, interview questions, or code implementations!`
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [isTestLocked, setIsTestLocked] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAskPlacementAI = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = presetQuery || aiQuery;
    if (!queryToUse.trim()) return;

    const userMsg = { id: `u_${Date.now()}`, role: 'user', content: queryToUse };
    setAiMessages(prev => [...prev, userMsg]);
    setAiQuery('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse, isTestActive: false })
      });
      const data = await res.json();
      if (!res.ok || data.locked) {
        setIsTestLocked(true);
        const botMsg = { id: `b_${Date.now()}`, role: 'assistant', content: data.error || 'AI Agent is disabled during active tests.' };
        setAiMessages(prev => [...prev, botMsg]);
      } else {
        setIsTestLocked(false);
        const botMsg = { id: `b_${Date.now()}`, role: 'assistant', content: data.answer, sources: data.sources };
        setAiMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      const botMsg = { id: `b_${Date.now()}`, role: 'assistant', content: 'Connection error while communicating with AI Agent.' };
      setAiMessages(prev => [...prev, botMsg]);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();

      if (authData.activeUser.role === 'STUDENT') {
        setGrowth(analyticsData.growth);
        setReadiness(analyticsData.readiness);

        // Fetch placement drives for company details & eligibility check
        const drivesRes = await fetch('/api/placement/drives');
        if (drivesRes.ok) {
          const drivesData = await drivesRes.json();
          setDrives(drivesData.drives || []);
        }
      } else {
        setFacultyData(analyticsData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Growth Intelligence Dashboard...</span>
      </div>
    );
  }

  // ----------------------------------------------------
  // 1. STUDENT DASHBOARD VIEW
  // ----------------------------------------------------
  if (user.role === 'STUDENT') {
    const studentCgpa = user.cgpa ?? 8.4;
    const studentArrears = user.backlogs ?? 0;

    return (
      <div className="space-y-8">
        {/* Welcome Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 border border-indigo-500/30 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 dark:shadow-none">
          <div className="absolute -right-10 -top-10 w-96 h-96 bg-white/10 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-200 uppercase tracking-widest">
                <Sparkles className="w-4 h-4 text-indigo-300" /> SGIP Intelligence Engine • Student Portal
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white">
                Welcome, {user.name} 👋
              </h1>
              <p className="text-xs md:text-sm text-indigo-100 mt-2 max-w-xl font-medium">
                {user.department} • Semester {user.semester || 6} • Roll Number: <span className="font-mono bg-white/20 px-2 py-0.5 rounded text-white font-bold">{user.rollNumber || '21CS104'}</span>
              </p>
              <div className="mt-3">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-white text-xs font-extrabold backdrop-blur-md transition-all shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Update Student Profile & CGPA</span>
                </Link>
              </div>
            </div>

            {/* Streaks & XP Widgets */}
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4 fill-amber-300" /> Daily Streak
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5">14 Days</div>
              </div>

              <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-violet-200 text-xs font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 fill-violet-200" /> SGIP XP
                </div>
                <div className="text-xl font-extrabold text-white mt-0.5">2,450 XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VSB STUDENT DASHBOARD TOOLKIT CARDS (4 STUDENT TOOLS) */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> VSB Student Platform Quick Tools
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tool 1: Student Update Profile */}
            <Link
              href="/profile"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md hover:border-indigo-500/50 transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-sm">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Student Update Profile</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Update CGPA ({studentCgpa}), Arrears ({studentArrears}), and academic details.</p>
              </div>
              <div className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                <span>Update Profile</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 2: AI Voice Mock Interview */}
            <Link
              href="/mock-interview"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md hover:border-indigo-500/50 transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-sm">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">AI Voice Mock Interview</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Practice 5-round interviews & evaluate Technical and Communication Marks.</p>
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <span>Start Practice</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 3: Gap Analyzer */}
            <Link
              href="/gap-analyzer"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md hover:border-indigo-500/50 transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Gap Analyzer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Compare your profile against Google, Microsoft, and Amazon benchmarks.</p>
              </div>
              <div className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                <span>Analyze Gaps</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 4: Resume Analyzer */}
            <Link
              href="/resume"
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-md hover:border-indigo-500/50 transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold group-hover:scale-110 transition-all shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">Resume Analyzer</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Build & score your ATS resume for corporate placement eligibility.</p>
              </div>
              <div className="text-[11px] font-bold text-violet-600 flex items-center gap-1">
                <span>Analyze Resume</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" /> Student Academic Overview — CGPA & Arrears Record
            </div>
            <span className="text-xs text-slate-500 font-medium">Synced with Institution ERP</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. CGPA Detailed Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover-lift flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" /> Cumulative Grade Point Average (CGPA)
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                    First Class with Distinction
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{studentCgpa.toFixed(1)}</span>
                  <span className="text-sm font-bold text-slate-400">/ 10.0</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    Target: 8.8
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                  {studentCgpa >= 8.0
                    ? 'Excellent academic record! You meet the minimum CGPA requirement (8.0+) for 100% of Tier-1 placement companies.'
                    : 'Good standing. Maintain study consistency to boost CGPA above 7.5 for maximum placement opportunities.'}
                </p>

                {/* Semester Breakdown Bars */}
                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Semester CGPA Progression:</div>
                  <div className="grid grid-cols-6 gap-2 text-center">
                    {[
                      { sem: 'S1', gpa: 8.1 },
                      { sem: 'S2', gpa: 8.3 },
                      { sem: 'S3', gpa: 8.2 },
                      { sem: 'S4', gpa: 8.5 },
                      { sem: 'S5', gpa: 8.6 },
                      { sem: 'S6', gpa: studentCgpa }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 font-bold">{s.sem}</div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">{s.gpa.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center">
                <span>Verified by Academic Registrar</span>
                <span className="font-bold text-indigo-600">6 Semesters Evaluated</span>
              </div>
            </div>

            {/* 2. Number of Arrears / Backlogs Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover-lift flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className={`w-4 h-4 ${studentArrears === 0 ? 'text-emerald-600' : 'text-rose-600'}`} /> Active Arrears (Backlogs) Record
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    studentArrears === 0
                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                  }`}>
                    {studentArrears === 0 ? 'Zero Arrears' : `${studentArrears} Active ${studentArrears === 1 ? 'Arrear' : 'Arrears'}`}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className={`text-5xl font-black tracking-tight ${studentArrears === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {studentArrears}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Backlogs</span>
                </div>

                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                  <div className="font-bold text-slate-700 dark:text-slate-200">
                    Placement Eligibility Impact:
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {studentArrears === 0
                      ? 'Congratulations! With 0 active arrears, you are fully eligible to apply for top-tier companies like Google, Microsoft, and Amazon.'
                      : `You currently have ${studentArrears} active arrear(s). Most Tier-1 drives require 0 backlogs. Use the remedial test portal to prepare for upcoming backlog clearance exams.`}
                  </p>
                </div>

                {/* Backlog Clearance History */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Cleared Arrears History: <strong className="text-slate-900 dark:text-white">0 History Cleared</strong></span>
                  <span className="text-indigo-600 font-bold">100% Attendance Record</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between items-center">
                <span className="text-slate-500">Academic Standing Status</span>
                <span className={`font-bold ${studentArrears === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {studentArrears === 0 ? 'Clean Record ✓' : 'Requires Remedial Review'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DAILY TEST ATTENDING PROMPT BANNER                   */}
        {/* ---------------------------------------------------- */}
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-violet-500/10 border border-indigo-200/80 dark:border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Zap className="w-4 h-4 fill-amber-500" /> Daily Test Attending Portal
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Today's Placement Aptitude & Technical Test is Live!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Attend today's 10-minute timed test on DSA & System Fundamentals to earn +150 XP and boost your SGIP Growth Score.
            </p>
          </div>

          <Link
            href="/daily-test"
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Attend Today's Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SGIP AI PLACEMENT AGENT ADVISOR WIDGET                */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SGIP AI Placement Agent
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Ask AI Anything About Campus Placements & Interview Prep
                </h3>
              </div>
            </div>

            {isTestLocked && (
              <span className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Locked During Daily Test
              </span>
            )}
          </div>

          {/* Test Lock Security Alert */}
          {isTestLocked ? (
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <strong className="block text-slate-900 dark:text-white font-black">🚫 AI Agent Locked During Exam</strong>
                <span>The AI Placement Agent is strictly disabled during active proctored daily tests to enforce exam integrity. Complete or submit your daily test to unlock AI guidance.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preset Sample Prompt Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Quick Questions:</span>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'Am I eligible for Google and Microsoft with my CGPA?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
                >
                  🎯 Am I eligible for Google & Microsoft?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'How do active backlogs affect my campus placement drives?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
                >
                  ⚠️ How do arrears/backlogs affect drives?
                </button>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'What DSA topics are asked in Tier-1 coding rounds?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all"
                >
                  💻 Key DSA topics for coding tests
                </button>
              </div>

              {/* ChatGPT Conversational Stream Container */}
              <div className="max-h-[380px] overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white font-medium shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line text-xs">{msg.content}</div>
                      {msg.sources?.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                          <span className="font-bold uppercase tracking-wider">Reference Source:</span>
                          {msg.sources.map((s: any, idx: number) => (
                            <div key={idx} className="text-indigo-500 font-semibold">• {s.title}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-2 items-center text-xs text-slate-400 font-medium py-1">
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>ChatGPT AI Agent is thinking...</span>
                  </div>
                )}
              </div>

              {/* Query Input Box */}
              <form onSubmit={(e) => handleAskPlacementAI(e)} className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask any question (e.g. 'Write Dijkstra algorithm in Python', 'Tell me about yourself', 'Check Google eligibility')..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------- */}
        {/* SGIP DASHBOARD: COMPANY DETAILS & PLACEMENT DRIVES    */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" /> SGIP Placement Cell — Company Details & Eligibility
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Real-time automated evaluation of your CGPA ({studentCgpa}) and Arrears ({studentArrears}) against company rules.</p>
            </div>

            <Link href="/placement" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
              View All Drives <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drives.slice(0, 4).map((drive) => {
              const evalResult = evaluateStudentEligibility(user, drive.eligibility);

              return (
                <div
                  key={drive.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-4 hover-lift"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                        {drive.packageLPA} LPA CTC
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Drive Date: {drive.driveDate}</span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">{drive.companyName}</h3>
                    <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{drive.roleTitle}</div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium line-clamp-2">{drive.jobDescription}</p>

                    {/* Company Requirements */}
                    <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1.5">
                      <div className="font-bold text-slate-500 uppercase text-[10px]">Company Eligibility Criteria:</div>
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        Min Required CGPA: <strong className="text-indigo-600">{drive.eligibility.minCgpa}</strong> • Max Allowed Backlogs: <strong className="text-amber-600">{drive.eligibility.maxBacklogs}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Location: {drive.location}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Rule Evaluation Result */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500">Your Eligibility Status:</span>
                      {evalResult.isEligible ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> ELIGIBLE
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" /> INELIGIBLE
                        </span>
                      )}
                    </div>

                    <Link
                      href="/placement"
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        evalResult.isEligible
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{evalResult.isEligible ? 'Apply for Drive' : 'View Eligibility Details'}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* CORE GROWTH METRICS & AI RECOMMENDATIONS              */}
        {/* ---------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SGIP Growth Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between hover-lift">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" /> SGIP Growth Score
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                  Top 8% Rank
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{growth?.overallScore || 88}</span>
                <span className="text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                Calculated across Learning Hours, LeetCode Solved, Quiz Scores, Assignments & Daily Reports.
              </p>
            </div>

            {/* Component Progress Bars */}
            <div className="mt-6 space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Coding & DSA (LeetCode/GFG)</span>
                  <span className="font-bold text-indigo-600">{growth?.codingScore || 85}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full rounded-full" style={{ width: `${growth?.codingScore || 85}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Assessments & Quizzes</span>
                  <span className="font-bold text-violet-600">{growth?.assessmentScore || 90}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-full rounded-full" style={{ width: `${growth?.assessmentScore || 90}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Placement Readiness Score Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-md flex flex-col justify-between hover-lift">
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" /> Placement Readiness
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800">
                  Tier-1 Ready
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">{readiness?.overallReadiness || 82}%</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Tier-1 Eligible</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                Eligible for Google Cloud (24.5 LPA) & Microsoft (28 LPA) drives.
              </p>
            </div>

            {/* Breakdown Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 uppercase font-extrabold">Technical</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{readiness?.technicalScore || 84}%</div>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 uppercase font-extrabold">Portfolio</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{readiness?.portfolioScore || 80}%</div>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="text-[10px] text-slate-500 uppercase font-extrabold">ATS Resume</div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{readiness?.resumeScore || 88}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/courses"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-500/50 shadow-md transition-all hover-lift group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Courses & Lessons</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Advanced DSA & Full Stack</div>
            </div>
          </Link>

          <Link
            href="/coding"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-violet-500/50 shadow-md transition-all hover-lift group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950 flex items-center justify-center text-violet-600">
                <Code2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Coding Tracker</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">312 Solved • 14 Day Streak</div>
            </div>
          </Link>

          <Link
            href="/daily-reports"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/50 shadow-md transition-all hover-lift group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                <Clock className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Daily Study Report</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Log today's 4.5 study hours</div>
            </div>
          </Link>

          <Link
            href="/placement"
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-amber-500/50 shadow-md transition-all hover-lift group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                <Building2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Placement Cell</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Check drive eligibility</div>
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. FACULTY & PLACEMENT COORDINATOR DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> SGIP {user.role === 'FACULTY' ? 'Faculty Command Desk' : 'Placement Coordinator Console'}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
            {user.department} • Department Student Growth Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'FACULTY' ? (
            <Link
              href="/quizzes"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-200 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Import CSV Question Bank
            </Link>
          ) : (
            <Link
              href="/placement"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-emerald-200 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Placement Drive
            </Link>
          )}
        </div>
      </div>

      {/* Top 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-md shadow-slate-200/40 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{facultyData?.totalStudents || 42}</div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">Active Batch 2026</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-md shadow-slate-200/40 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Avg Growth Score</span>
            <TrendingUp className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{facultyData?.averageGrowthScore || 78}/100</div>
          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 mt-1 inline-block">+4.2% from last month</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-md shadow-slate-200/40 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Avg Placement Readiness</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{facultyData?.averageReadinessScore || 76}%</div>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1 inline-block">32 Eligible Students</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 rounded-2xl shadow-md shadow-slate-200/40 hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">At-Risk Intervention</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{facultyData?.atRiskStudents?.length || 1}</div>
          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 mt-1 inline-block">Requires Review</span>
        </div>
      </div>

      {/* Requirement 22: Attention Required / At-Risk Students Section */}
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 rounded-3xl p-6 shadow-md shadow-slate-200/40 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4" /> Attention Required — At-Risk Students Identified
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-flagged by SGIP Intelligence Rules</span>
        </div>

        <div className="space-y-3">
          {facultyData?.atRiskStudents?.map((st: any) => (
            <div key={st.studentId} className="p-4 rounded-2xl bg-rose-50/60 dark:bg-slate-800/80 border border-rose-100 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-sm">
                  {st.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {st.name} <span className="text-xs text-slate-500 font-mono">({st.rollNumber})</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">
                    CGPA: <span className="font-bold text-amber-600">{st.cgpa}</span> • Active Backlogs: <span className="font-bold text-rose-600">{st.backlogs}</span> • Growth Score: <span className="font-bold text-slate-800">{st.growthScore}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full border border-rose-200 font-semibold">
                  Low learning hours & 2 backlogs
                </span>
                <Link
                  href="/daily-reports"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-1 shadow-xs"
                >
                  Review Student <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

