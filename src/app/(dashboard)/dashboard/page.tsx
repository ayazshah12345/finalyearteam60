'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, GrowthScoreBreakdown, PlacementReadinessBreakdown } from '@/types';
import { evaluateStudentEligibility } from '@/lib/eligibility';
import { authFetch, setSessionUser } from '@/lib/client-auth';
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
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();

      if (!authData.activeUser) {
        window.location.href = '/login';
        return;
      }

      setUser(authData.activeUser);
      setSessionUser(authData.activeUser);

      // Strict segregation: Faculty accounts belong on the Faculty Command Desk (/faculty)
      if (authData.activeUser.role !== 'STUDENT') {
        window.location.href = '/faculty';
        return;
      }

      const analyticsRes = await authFetch('/api/analytics');
      const analyticsData = await analyticsRes.json();

      setGrowth(analyticsData.growth);
      setReadiness(analyticsData.readiness);

      // Fetch placement drives for company details & eligibility check
      const drivesRes = await authFetch('/api/placement/drives');
      if (drivesRes.ok) {
        const drivesData = await drivesRes.json();
        setDrives(drivesData.drives || []);
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
      <div className="space-y-6">
        {/* ========================================================================= */}
        {/* VSB MOVING MARQUEE TICKER: A PLACE FOR PLACEMENT                          */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center p-1.5">
          {/* Static Live Badge on the Left */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e3a8a] text-white font-cinzel font-black text-[11px] uppercase tracking-wider shrink-0 z-10 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>OFFICIAL MOTTO</span>
            </span>
          </div>

          {/* Marquee Moving Content */}
          <div className="overflow-hidden w-full relative flex items-center select-none py-1">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 text-xs font-semibold tracking-wider">
              {[1, 2, 3, 4].map((idx) => (
                <span key={idx} className="flex items-center gap-8">
                  <span className="flex items-center gap-2 text-[#0f2942] uppercase tracking-wider text-xs">
                    <span className="text-[#1e3a8a]">🏛️</span>
                    <span className="text-[#1e3a8a] font-cinzel font-extrabold tracking-widest text-xs">
                      VSB ENGINEERING COLLEGE
                    </span>
                    <span className="text-slate-300">—</span>
                    <span className="text-[#0f2942] font-serif italic font-bold text-sm tracking-normal">
                      A Place For Placement
                    </span>
                  </span>

                  <span className="text-[#1e3a8a] font-bold text-xs">✦</span>

                  <span className="flex items-center gap-2 text-slate-700 font-sans font-semibold uppercase text-[11px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-[#1e3a8a]" />
                    <span>Top Tier-1 Recruiters • High CTC Opportunities • 100% Placement Record</span>
                  </span>

                  <span className="text-[#1e3a8a] font-bold text-xs">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Welcome Header Banner - Classic Dark Blue & White */}
        <div className="bg-[#1e3a8a] border border-[#172554] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-white/10 border border-white/20 text-blue-100">
                <Sparkles className="w-3.5 h-3.5 text-white" /> VSB CAMPUS INTELLIGENCE • STUDENT PORTAL
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight mt-2 text-white">
                Welcome, {user.name} 👋
              </h1>
              <p className="text-xs md:text-sm text-blue-100 mt-2 max-w-xl font-sans font-normal leading-relaxed">
                {user.department} • Semester {user.semester || 6} • Roll Number: <span className="font-mono bg-white/15 text-white border border-white/30 px-2 py-0.5 rounded font-bold">{user.rollNumber || '21CS104'}</span>
              </p>
              <div className="mt-3.5 flex items-center gap-2 flex-wrap">
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#1e3a8a] text-xs font-sans font-extrabold uppercase tracking-wider transition-all shadow-xs"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Update Academic Profile &amp; CGPA</span>
                </Link>
                <span className="text-[11px] text-white font-mono font-semibold bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  🏛️ VSB Karur Campus
                </span>
              </div>
            </div>

            {/* XP Widget */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-blue-200 text-xs font-mono font-bold uppercase tracking-wider">
                  <Zap className="w-4 h-4 fill-white" /> SGIP XP
                </div>
                <div className="text-3xl font-display font-black text-white mt-0.5 tracking-tight">2,450 XP</div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* VSB STUDENT DASHBOARD TOOLKIT CARDS (5 STUDENT TOOLS) */}
        {/* ---------------------------------------------------- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-[#0f2942] tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1e3a8a]" /> VSB Student Platform Quick Tools
            </h2>
            <span className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">5 Integrated Systems</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Tool 0: LeetCode Practice */}
            <Link
              href="/coding"
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-xs">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#0f2942] group-hover:text-[#1e3a8a] transition-colors">LeetCode Practice</h3>
                <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">Connect profile, solve DSA problems, and track solved counts.</p>
              </div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1">
                <span>Start Practice</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 1: Student Update Profile */}
            <Link
              href="/profile"
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-xs">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#0f2942] group-hover:text-[#1e3a8a] transition-colors">Update Profile</h3>
                <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">Update CGPA ({studentCgpa}), Arrears ({studentArrears}), and academic details.</p>
              </div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1">
                <span>Update Profile</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 2: AI Voice Mock Interview */}
            <Link
              href="/mock-interview"
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-xs">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#0f2942] group-hover:text-[#1e3a8a] transition-colors">AI Mock Interview</h3>
                <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">Practice 5-round interviews &amp; evaluate Technical and Communication Marks.</p>
              </div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1">
                <span>Start Practice</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 3: Gap Analyzer */}
            <Link
              href="/gap-analyzer"
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#0f2942] group-hover:text-[#1e3a8a] transition-colors">Gap Analyzer</h3>
                <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">Compare your profile against Google, Microsoft, and Amazon benchmarks.</p>
              </div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1">
                <span>Analyze Gaps</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            {/* Tool 4: Resume Analyzer */}
            <Link
              href="/resume"
              className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all space-y-3 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold group-hover:bg-[#1e3a8a] group-hover:text-white transition-all shadow-xs">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#0f2942] group-hover:text-[#1e3a8a] transition-colors">Resume Analyzer</h3>
                <p className="text-xs font-sans text-slate-600 mt-1 leading-relaxed">Build &amp; score your ATS resume for corporate placement eligibility.</p>
              </div>
              <div className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-1">
                <span>Analyze Resume</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>

        {/* Academic Overview — CGPA & Arrears Record */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-display font-extrabold text-[#0f2942] tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#1e3a8a]" /> Academic Performance &amp; Record
            </h2>
            <span className="text-[11px] font-mono text-slate-500 font-semibold uppercase tracking-wider">Official ERP Record</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. CGPA Detailed Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#1e3a8a]" /> Cumulative GPA (CGPA)
                  </div>
                  <span className="text-xs font-sans font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    First Class with Distinction
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-5xl sm:text-6xl font-display font-black text-[#0f2942] tracking-tighter">{studentCgpa.toFixed(1)}</span>
                  <span className="text-sm font-mono font-bold text-slate-400">/ 10.0</span>
                  <span className="text-xs font-mono font-bold text-[#1e3a8a] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    Target: 8.8
                  </span>
                </div>

                <p className="text-xs font-sans text-slate-600 mt-2 font-normal leading-relaxed">
                  {studentCgpa >= 8.0
                    ? 'Excellent academic record! You meet the minimum CGPA requirement (8.0+) for 100% of Tier-1 placement companies.'
                    : 'Good standing. Maintain study consistency to boost CGPA above 7.5 for maximum placement opportunities.'}
                </p>

                {/* Semester Breakdown Bars */}
                <div className="mt-5 space-y-2">
                  <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">Semester CGPA Progression:</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
                    {[
                      { sem: 'S1', gpa: 8.1 },
                      { sem: 'S2', gpa: 8.3 },
                      { sem: 'S3', gpa: 8.2 },
                      { sem: 'S4', gpa: 8.5 },
                      { sem: 'S5', gpa: 8.6 },
                      { sem: 'S6', gpa: studentCgpa }
                    ].map((s, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-mono text-slate-500 font-bold">{s.sem}</div>
                        <div className="text-sm font-display font-extrabold text-[#0f2942] mt-0.5">{s.gpa.toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-sans text-slate-500 flex justify-between items-center">
                <span>Verified by Academic Registrar</span>
                <span className="font-mono font-bold text-[#1e3a8a]">6 Semesters Evaluated</span>
              </div>
            </div>

            {/* 2. Number of Arrears / Backlogs Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-[#1e3a8a]" /> Active Arrears (Backlogs) Record
                  </div>
                  <span className="text-xs font-sans font-bold px-3 py-1 rounded-full border text-[#1e3a8a] bg-blue-50 border-blue-200">
                    {studentArrears === 0 ? 'Zero Arrears' : `${studentArrears} Active ${studentArrears === 1 ? 'Arrear' : 'Arrears'}`}
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mt-4">
                  <span className="text-5xl sm:text-6xl font-display font-black tracking-tighter text-[#0f2942]">
                    {studentArrears}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Backlogs</span>
                </div>

                <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-sans font-bold text-slate-700">
                    Placement Eligibility Impact:
                  </div>
                  <p className="font-sans text-slate-600 leading-relaxed font-normal">
                    {studentArrears === 0
                      ? 'Congratulations! With 0 active arrears, you are fully eligible to apply for top-tier companies like Google, Microsoft, and Amazon.'
                      : `You currently have ${studentArrears} active arrear(s). Most Tier-1 drives require 0 backlogs. Use the remedial test portal to prepare for upcoming backlog clearance exams.`}
                  </p>
                </div>

                {/* Backlog Clearance History */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-sans">
                  <span>Cleared Arrears History: <strong className="text-[#0f2942] font-mono font-bold">0 History Cleared</strong></span>
                  <span className="text-[#1e3a8a] font-sans font-bold">100% Attendance Record</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-sans flex justify-between items-center">
                <span className="text-slate-500">Academic Standing Status</span>
                <span className="font-sans font-bold text-[#1e3a8a]">
                  {studentArrears === 0 ? 'Clean Record ✓' : 'Requires Remedial Review'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* DAILY TEST ATTENDING PROMPT BANNER                   */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white border-2 border-[#1e3a8a] rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-wider text-[#1e3a8a]">
              <img src="/emojis/daily-test.png" alt="" className="w-4 h-4 object-contain" /> Daily Test Attending Portal
            </div>
            <h3 className="font-display text-xl font-extrabold text-[#0f2942] tracking-tight">
              Today's Placement Aptitude &amp; Technical Test is Live!
            </h3>
            <p className="font-sans text-xs text-slate-600 font-medium leading-relaxed">
              Attend today's 10-minute timed test on DSA &amp; System Fundamentals to earn +150 XP and boost your SGIP Growth Score.
            </p>
          </div>

          <Link
            href="/daily-test"
            className="px-6 py-3.5 rounded-2xl bg-[#1e3a8a] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-sm hover:bg-[#0f2942] transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Attend Today's Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ---------------------------------------------------- */}
        {/* SGIP AI PLACEMENT AGENT ADVISOR WIDGET                */}
        {/* ---------------------------------------------------- */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center shadow-xs">
                <img src="/emojis/chatbot.png" alt="Bot" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-mono text-xs font-extrabold text-[#1e3a8a] uppercase tracking-widest flex items-center gap-1.5">
                  <img src="/emojis/sparkles.png" alt="" className="w-3.5 h-3.5 object-contain" /> SGIP AI Placement Agent
                </div>
                <h3 className="font-display text-lg font-bold text-[#0f2942]">
                  Ask AI Anything About Campus Placements &amp; Interview Prep
                </h3>
              </div>
            </div>

            {isTestLocked && (
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-mono text-[11px] font-bold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Locked During Daily Test
              </span>
            )}
          </div>

          {/* Test Lock Security Alert */}
          {isTestLocked ? (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0f2942] font-semibold flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-[#1e3a8a] shrink-0" />
              <div>
                <strong className="flex items-center gap-1.5 text-[#0f2942] font-display font-extrabold text-sm">
                  <img src="/emojis/prohibited.png" alt="" className="w-4 h-4 object-contain" /> AI Agent Locked During Exam
                </strong>
                <span className="font-sans text-xs">The AI Placement Agent is strictly disabled during active proctored daily tests to enforce exam integrity. Complete or submit your daily test to unlock AI guidance.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preset Sample Prompt Buttons */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-[11px] text-slate-400 font-bold uppercase tracking-wider">Quick Questions:</span>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'Am I eligible for Google and Microsoft with my CGPA?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#1e3a8a] text-slate-700 font-sans text-xs font-semibold border border-slate-200 hover:border-[#1e3a8a] transition-all flex items-center gap-1.5"
                >
                  <img src="/emojis/target.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Am I eligible for Google &amp; Microsoft?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'How do active backlogs affect my campus placement drives?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#1e3a8a] text-slate-700 font-sans text-xs font-semibold border border-slate-200 hover:border-[#1e3a8a] transition-all flex items-center gap-1.5"
                >
                  <img src="/emojis/warning.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>How do arrears/backlogs affect drives?</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAskPlacementAI(undefined, 'What DSA topics are asked in Tier-1 coding rounds?')}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-[#1e3a8a] text-slate-700 font-sans text-xs font-semibold border border-slate-200 hover:border-[#1e3a8a] transition-all flex items-center gap-1.5"
                >
                  <img src="/emojis/coding.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Key DSA topics for coding tests</span>
                </button>
              </div>

              {/* ChatGPT Conversational Stream Container */}
              <div className="max-h-[380px] overflow-y-auto space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {aiMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl ${
                        msg.role === 'user'
                          ? 'bg-[#1e3a8a] text-white font-sans font-medium shadow-xs'
                          : 'bg-white text-[#0f2942] border border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="whitespace-pre-line font-sans text-xs leading-relaxed">{msg.content}</div>
                      {msg.sources?.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] space-y-0.5">
                          <span className="font-mono font-bold uppercase tracking-wider text-[#1e3a8a]">Reference Source:</span>
                          {msg.sources.map((s: any, idx: number) => (
                            <div key={idx} className="font-mono text-[#1e3a8a] font-semibold">• {s.title}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {aiLoading && (
                  <div className="flex gap-2 items-center font-mono text-xs text-slate-500 font-medium py-1">
                    <div className="w-4 h-4 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
                    <span>SGIP Placement Agent is deliberating...</span>
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
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 font-sans text-xs text-slate-900 focus:outline-none focus:border-[#1e3a8a] font-medium"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="px-6 py-3 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <span className="font-mono">Processing...</span>
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
              <div className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#1e3a8a]" /> SGIP Placement Cell — Company Details &amp; Eligibility
              </div>
              <p className="font-sans text-xs text-slate-500 mt-0.5">Real-time automated evaluation of your CGPA (<span className="font-mono font-bold text-[#1e3a8a]">{studentCgpa}</span>) and Arrears (<span className="font-mono font-bold text-[#0f2942]">{studentArrears}</span>) against company rules.</p>
            </div>

            <Link href="/placement" className="font-mono text-xs font-bold text-[#1e3a8a] hover:underline flex items-center gap-1 uppercase tracking-wider">
              View All Drives <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {drives.slice(0, 4).map((drive) => {
              const evalResult = evaluateStudentEligibility(user, drive.eligibility);

              return (
                <div
                  key={drive.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#1e3a8a] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                        {drive.packageLPA} LPA CTC
                      </span>
                      <span className="font-mono text-xs text-slate-500">Drive Date: {drive.driveDate}</span>
                    </div>

                    <h3 className="font-display text-xl font-extrabold text-[#0f2942] mt-3 tracking-tight">{drive.companyName}</h3>
                    <div className="font-sans text-xs font-bold text-[#1e3a8a] uppercase tracking-wide">{drive.roleTitle}</div>
                    <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed font-medium line-clamp-2">{drive.jobDescription}</p>

                    {/* Company Requirements */}
                    <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                      <div className="font-mono font-bold text-slate-500 uppercase text-[10px] tracking-wider">Company Eligibility Criteria:</div>
                      <div className="font-sans text-slate-700 font-medium">
                        Min Required CGPA: <strong className="font-mono text-[#1e3a8a] font-bold">{drive.eligibility.minCgpa}</strong> • Max Allowed Backlogs: <strong className="font-mono text-[#0f2942] font-bold">{drive.eligibility.maxBacklogs}</strong>
                      </div>
                      <div className="font-sans text-[11px] text-slate-500">
                        Location: {drive.location}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Rule Evaluation Result */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-sans font-bold text-slate-500">Your Eligibility Status:</span>
                      {evalResult.isEligible ? (
                        <span className="font-mono text-xs text-[#1e3a8a] font-extrabold bg-blue-50 px-3 py-1 rounded-md border border-blue-200 flex items-center gap-1 uppercase tracking-wider">
                          <Check className="w-3.5 h-3.5" /> ELIGIBLE
                        </span>
                      ) : (
                        <span className="font-mono text-xs text-slate-600 font-extrabold bg-slate-100 px-3 py-1 rounded-md border border-slate-200 flex items-center gap-1 uppercase tracking-wider">
                          <AlertCircle className="w-3.5 h-3.5" /> INELIGIBLE
                        </span>
                      )}
                    </div>

                    <Link
                      href="/placement"
                      className={`w-full py-2.5 rounded-xl font-sans text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                        evalResult.isEligible
                          ? 'bg-[#1e3a8a] text-white hover:bg-[#0f2942] shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#1e3a8a]" /> SGIP Growth Score
                </div>
                <span className="font-mono text-xs font-extrabold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                  Top 8% Rank
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-display text-5xl sm:text-6xl font-black text-[#0f2942] tracking-tighter">{growth?.overallScore || 88}</span>
                <span className="font-mono text-sm font-bold text-slate-400">/ 100</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Calculated across Learning Hours, LeetCode Solved, Quiz Scores, Assignments &amp; Daily Reports.
              </p>
            </div>

            {/* Component Progress Bars */}
            <div className="mt-6 space-y-3.5">
              <div>
                <div className="flex justify-between font-sans text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Coding &amp; DSA (LeetCode/GFG)</span>
                  <span className="font-mono font-bold text-[#1e3a8a]">{growth?.codingScore || 85}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#1e3a8a] h-full rounded-full" style={{ width: `${growth?.codingScore || 85}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between font-sans text-xs font-semibold text-slate-700 mb-1.5">
                  <span>Assessments &amp; Quizzes</span>
                  <span className="font-mono font-bold text-[#1e3a8a]">{growth?.assessmentScore || 90}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#1e3a8a] h-full rounded-full" style={{ width: `${growth?.assessmentScore || 90}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Placement Readiness Score Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1e3a8a]" /> Placement Readiness
                </div>
                <span className="font-mono text-xs font-extrabold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                  Tier-1 Ready
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-display text-5xl sm:text-6xl font-black text-[#0f2942] tracking-tighter">{readiness?.overallReadiness || 82}%</span>
                <span className="font-mono text-xs font-extrabold text-[#1e3a8a] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 uppercase">Tier-1 Eligible</span>
              </div>
              <p className="font-sans text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Eligible for Google Cloud (24.5 LPA) &amp; Microsoft (28 LPA) drives.
              </p>
            </div>

            {/* Breakdown Metrics */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 text-center">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-mono text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Technical</div>
                <div className="font-display text-lg font-black text-[#0f2942] mt-0.5">{readiness?.technicalScore || 84}%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-mono text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">Portfolio</div>
                <div className="font-display text-lg font-black text-[#0f2942] mt-0.5">{readiness?.portfolioScore || 80}%</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="font-mono text-[10px] text-slate-500 uppercase font-extrabold tracking-wider">ATS Resume</div>
                <div className="font-display text-lg font-black text-[#0f2942] mt-0.5">{readiness?.resumeScore || 88}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/courses"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1e3a8a] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a]">
                <BookOpen className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="font-display text-base font-bold text-[#0f2942]">Courses &amp; Lessons</div>
              <div className="font-sans text-xs text-slate-500 font-medium mt-0.5">Advanced DSA &amp; Full Stack</div>
            </div>
          </Link>

          <Link
            href="/coding"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1e3a8a] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a]">
                <Code2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="font-display text-base font-bold text-[#0f2942]">Coding Tracker</div>
              <div className="font-sans text-xs text-slate-500 font-medium mt-0.5">312 Solved • 14 Day Streak</div>
            </div>
          </Link>

          <Link
            href="/daily-reports"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1e3a8a] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a]">
                <Clock className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="font-display text-base font-bold text-[#0f2942]">Daily Study Report</div>
              <div className="font-sans text-xs text-slate-500 font-medium mt-0.5">Log today's 4.5 study hours</div>
            </div>
          </Link>

          <Link
            href="/placement"
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-[#1e3a8a] shadow-xs transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1e3a8a]">
                <Building2 className="w-5 h-5" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#1e3a8a] group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4">
              <div className="font-display text-base font-bold text-[#0f2942]">Placement Cell</div>
              <div className="font-sans text-xs text-slate-500 font-medium mt-0.5">Check drive eligibility</div>
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
          <div className="flex items-center gap-2 text-xs font-bold text-[#1e3a8a] uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> SGIP {user.role === 'FACULTY' ? 'Faculty Command Desk' : 'Placement Coordinator Console'}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#0f2942] mt-1">
            Welcome back, {user.name}
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {user.department} • Department Student Growth Overview
          </p>
        </div>

        <div className="flex items-center gap-3">
          {user.role === 'FACULTY' ? (
            <Link
              href="/quizzes"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> Import CSV Question Bank
            </Link>
          ) : (
            <Link
              href="/placement"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" /> Create Placement Drive
            </Link>
          )}
        </div>
      </div>

      {/* Top 4 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Total Students</span>
            <Users className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div className="text-3xl font-black text-[#0f2942] mt-2">{facultyData?.totalStudents || 42}</div>
          <span className="text-[10px] text-[#1e3a8a] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">Active Batch 2026</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Avg Growth Score</span>
            <TrendingUp className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div className="text-3xl font-black text-[#0f2942] mt-2">{facultyData?.averageGrowthScore || 78}/100</div>
          <span className="text-[10px] text-[#1e3a8a] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">+4.2% from last month</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Avg Placement Readiness</span>
            <Building2 className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div className="text-3xl font-black text-[#0f2942] mt-2">{facultyData?.averageReadinessScore || 76}%</div>
          <span className="text-[10px] text-[#1e3a8a] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">32 Eligible Students</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">At-Risk Intervention</span>
            <AlertTriangle className="w-4 h-4 text-[#1e3a8a]" />
          </div>
          <div className="text-3xl font-black text-[#0f2942] mt-2">{facultyData?.atRiskStudents?.length || 1}</div>
          <span className="text-[10px] text-[#1e3a8a] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1 inline-block">Requires Review</span>
        </div>
      </div>

      {/* Attention Required / At-Risk Students Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#1e3a8a]">
            <AlertTriangle className="w-4 h-4" /> Attention Required — At-Risk Students Identified
          </div>
          <span className="text-xs text-slate-500 font-medium">Auto-flagged by SGIP Intelligence Rules</span>
        </div>

        <div className="space-y-3">
          {facultyData?.atRiskStudents?.map((st: any) => (
            <div key={st.studentId} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center font-bold text-sm border border-blue-200">
                  {st.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0f2942] flex items-center gap-2">
                    {st.name} <span className="text-xs text-slate-500 font-mono">({st.rollNumber})</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 font-medium">
                    CGPA: <span className="font-bold text-[#1e3a8a]">{st.cgpa}</span> • Active Backlogs: <span className="font-bold text-[#0f2942]">{st.backlogs}</span> • Growth Score: <span className="font-bold text-[#0f2942]">{st.growthScore}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs bg-blue-50 text-[#1e3a8a] px-3 py-1 rounded-full border border-blue-200 font-semibold">
                  Low learning hours &amp; 2 backlogs
                </span>
                <Link
                  href="/daily-reports"
                  className="px-3.5 py-1.5 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
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

