'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Award,
  Trophy,
  UserPlus,
  Users,
  Briefcase
} from 'lucide-react';
import { User } from '@/types';
import { setSessionUser } from '@/lib/client-auth';

export default function LoginPage() {
  const router = useRouter();
  
  // Mode selection: ONLY 'student_login' | 'student_register' | 'faculty_login'
  const [mode, setMode] = useState<'student_login' | 'student_register' | 'faculty_login'>('student_login');

  // Student Login State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Faculty Login State
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyPass, setFacultyPass] = useState('');

  // Student Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regCgpa, setRegCgpa] = useState('8.4');
  const [regBacklogs, setRegBacklogs] = useState('0');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStudentLogin = async (e?: React.FormEvent, customId?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const loginId = customId || identifier;
    const loginPass = customPass !== undefined ? customPass : password;

    try {
      const payload = customId && customPass !== undefined
        ? { userId: customId, expectedRole: 'STUDENT' }
        : { identifier: loginId, password: loginPass, expectedRole: 'STUDENT' };

      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials or student record not found.');
        setLoading(false);
        return;
      }

      if (!data.activeUser || data.activeUser.role !== 'STUDENT') {
        setError('Faculty credentials detected. Faculty members must log in through the Faculty Login portal only.');
        setLoading(false);
        return;
      }

      setSessionUser(data.activeUser);
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('Connection failed. Please try again.');
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e?: React.FormEvent, customUserId?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = customUserId
        ? { userId: customUserId, expectedRole: 'FACULTY' }
        : { email: facultyEmail, password: facultyPass, expectedRole: 'FACULTY' };

      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to authenticate Faculty.');
        setLoading(false);
        return;
      }

      if (!data.activeUser || data.activeUser.role === 'STUDENT') {
        setError('Student credentials detected. Students must log in through the Student Login portal only.');
        setLoading(false);
        return;
      }

      setSessionUser(data.activeUser);
      router.push('/faculty');
      router.refresh();
    } catch (err) {
      setError('Network error while logging into Faculty Portal.');
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!regName || !regEmail || !regRollNumber) {
      setError('Name, Email, and Roll Number are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          rollNumber: regRollNumber,
          department: regDepartment,
          cgpa: regCgpa,
          backlogs: regBacklogs,
          password: regPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to register student.');
        setLoading(false);
        return;
      }

      if (data.activeUser) {
        setSessionUser(data.activeUser);
      }

      setSuccess('Account created successfully! Redirecting to Student Dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('Registration error. Please check network connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfbfe] via-[#f6f7fd] to-[#f8f9ff] text-slate-900 flex flex-col justify-between p-3 sm:p-6 md:p-8 relative font-sans overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Royal Light Theme Ambient Shimmer & Auroras */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-gradient-to-br from-amber-200/30 via-indigo-100/40 to-transparent rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-purple-100/35 via-blue-100/30 to-transparent rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-[550px] h-[550px] bg-amber-100/35 rounded-full blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e3a8a_0.4px,transparent_0.8px)] [background-size:24px_24px] opacity-[0.035]" />
      </div>

      {/* Top Header Branding Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 py-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white p-1.5 border-2 border-amber-300 shadow-md flex items-center justify-center hover:scale-105 transition-transform">
            <img src="/vsb-logo.png" alt="VSB Engineering College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 bg-clip-text text-transparent font-serif">
                VSB ENGINEERING COLLEGE
              </span>
              <span className="text-[10px] bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 px-2.5 py-0.5 rounded-full font-mono font-black tracking-widest uppercase shadow-xs">
                KARUR
              </span>
            </div>
            <div className="text-[11px] md:text-xs text-amber-700 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span>★ HARDWORK IS THE KEY TO SUCCESS ★</span>
            </div>
          </div>
        </div>

        {/* Quick Accreditation Badges on Top */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-950 font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Autonomous Institution
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 px-3.5 py-1.5 rounded-full font-black tracking-wider shadow-xs">
            TNEA CODE: 2622
          </span>
        </div>
      </header>

      {/* UPSIDE MOVING TICKERS (Royal Motto & Rankings in Continuous Moving Format) */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-3 space-y-2">
        {/* Ticker 1: Motto Ribbon */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 text-amber-300 py-2.5 px-4 shadow-md border border-amber-400/40">
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-10 font-black text-xs md:text-sm tracking-widest uppercase">
              <span className="flex items-center gap-2 text-amber-300">⭐ VSB ENGINEERING COLLEGE — A PLACE FOR PLACEMENT ⭐</span>
              <span className="flex items-center gap-2 text-white">🏆 100% DEDICATED PLACEMENT TRAINING &amp; EXCELLENCE 🏆</span>
              <span className="flex items-center gap-2 text-amber-300">⭐ VSB ENGINEERING COLLEGE — A PLACE FOR PLACEMENT ⭐</span>
              <span className="flex items-center gap-2 text-cyan-300">🚀 INNOVATION IN ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE 🚀</span>
              <span className="flex items-center gap-2 text-amber-300">⭐ VSB ENGINEERING COLLEGE — A PLACE FOR PLACEMENT ⭐</span>
              <span className="flex items-center gap-2 text-white">🏆 100% DEDICATED PLACEMENT TRAINING &amp; EXCELLENCE 🏆</span>
            </div>
          </div>
        </div>

        {/* Ticker 2: Our Rankings & Accreditations in Moving Format (Upside) */}
        <div className="overflow-hidden rounded-xl bg-white/95 text-slate-800 py-2 px-4 shadow-xs border border-indigo-100">
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-10 font-extrabold text-xs tracking-wider uppercase">
              <span className="inline-flex items-center gap-2 text-indigo-900 font-black">
                <Award className="w-4 h-4 text-amber-600" />
                <span>OUR RANKINGS &amp; ACCREDITATIONS:</span>
              </span>
              <img src="/vsb-rankings.png" alt="Rankings" className="h-7 w-auto object-contain inline-block drop-shadow-xs" />
              <span className="text-slate-900 font-bold">🎖️ NBA ACCREDITED</span>
              <span className="text-indigo-700 font-black">★ NAAC &apos;A&apos; GRADE ACCREDITED</span>
              <span className="text-slate-900 font-bold">🎖️ NIRF RANKED INSTITUTION</span>
              <span className="text-indigo-700 font-black">★ TCS AFFILIATED PARTNER</span>
              <span className="text-slate-900 font-bold">🎖️ ISO 9001:2015 CERTIFIED</span>
              <span className="text-amber-600 font-black">★ TNEA CODE: 2622</span>

              <span className="inline-flex items-center gap-2 text-indigo-900 font-black">
                <Award className="w-4 h-4 text-amber-600" />
                <span>OUR RANKINGS &amp; ACCREDITATIONS:</span>
              </span>
              <img src="/vsb-rankings.png" alt="Rankings" className="h-7 w-auto object-contain inline-block drop-shadow-xs" />
              <span className="text-slate-900 font-bold">🎖️ NBA ACCREDITED</span>
              <span className="text-indigo-700 font-black">★ NAAC &apos;A&apos; GRADE ACCREDITED</span>
              <span className="text-slate-900 font-bold">🎖️ NIRF RANKED INSTITUTION</span>
              <span className="text-indigo-700 font-black">★ TCS AFFILIATED PARTNER</span>
              <span className="text-slate-900 font-bold">🎖️ ISO 9001:2015 CERTIFIED</span>
              <span className="text-amber-600 font-black">★ TNEA CODE: 2622</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left is Freestyle with ZERO boxes, Right is the Credentials Card */}
      <main className="relative z-10 max-w-7xl w-full mx-auto my-5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Completely Freestyle, Editorial, Zero Boxes */}
        <div className="lg:col-span-7 space-y-7">
          
          {/* 1. Chairman Balsamy Free-Floating Showcase (No Box Format) */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
            {/* Ambient gold aura behind cutout */}
            <div className="absolute -left-10 -top-10 w-72 h-72 bg-gradient-to-r from-amber-200/40 to-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
            
            {/* Free-standing Cutout Photo */}
            <div className="relative shrink-0 w-48 sm:w-56 md:w-64 flex items-center justify-center">
              <img
                src="/chairman-balsamy-cutout.png"
                alt="Mr. V.S. Balsamy - Founder & Chairman"
                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Free-flowing Typography & College Proudness Story */}
            <div className="space-y-2.5 text-center sm:text-left flex-1 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gradient-to-r from-amber-500/15 via-yellow-400/25 to-amber-500/15 border border-amber-400 text-amber-900 shadow-2xs">
                ★ FOUNDER &amp; CHAIRMAN ★
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none font-serif">
                Mr. V.S. Balsamy
              </h2>

              <div className="text-xs md:text-sm font-extrabold text-indigo-900 tracking-wider uppercase">
                Founder &amp; Chairman • V.S.B. Educational Trust
              </div>

              <div className="relative pl-4 border-l-2 border-amber-400 my-2">
                <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-medium text-justify">
                  &ldquo;V.S.B Educational Trust was founded in the year 2000 by Mr. V.S. Balsamy, the founder and Chairman of the V.S.B Engineering College, with an interest in promoting, managing and administrating educational institutions with high academic standards, discipline and to take up and help other allied activities in the field of education. Under the Trust, V.S.B Engineering College, Karur was established in the year 2002 and V.S.B College of Engineering Technical Campus, Coimbatore in the year 2012.&rdquo;
                </p>
              </div>

              {/* Free-Floating Milestone Badges */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-bold justify-center sm:justify-start">
                <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
                  🏛️ Founded 2000
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs">
                  📍 Karur Campus (2002)
                </span>
                <span className="px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-900 shadow-2xs">
                  📍 Coimbatore Campus (2012)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Innovative College Stats & Highlights Strip (Zero Boxes, Freestyle Emblems) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 border-y border-slate-200/80">
            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-indigo-900 flex items-center justify-center sm:justify-start gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> 100%
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Placement Training</div>
              <div className="text-[10px] text-slate-500">Tier-1 Multi-Offers</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-emerald-800 flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-4 h-4 text-emerald-600" /> ₹40+ LPA
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Highest Package</div>
              <div className="text-[10px] text-slate-500">Top Tech Recruiters</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-blue-900 flex items-center justify-center sm:justify-start gap-1">
                <Building2 className="w-4 h-4 text-blue-600" /> 500+
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Recruiting Partners</div>
              <div className="text-[10px] text-slate-500">TCS, Zoho, Amazon</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-purple-900 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-4 h-4 text-purple-600" /> 20+ Yrs
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Academic Discipline</div>
              <div className="text-[10px] text-slate-500">Excellence in Research</div>
            </div>
          </div>

          {/* 3. HOD AI-DS Free-Floating Showcase (No Box Format) */}
          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-1">
            {/* Free-floating Portrait with Royal Golden Ring */}
            <div className="relative shrink-0 w-36 h-36 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-indigo-600 to-amber-300 shadow-md">
              <img
                src="/hod-manivannan-suit.jpg"
                alt="Mr. Manivannan K - HOD Artificial Intelligence & Data Science"
                className="w-full h-full object-cover object-top rounded-full"
              />
            </div>

            {/* Free-flowing Typography */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> HEAD OF THE DEPARTMENT (AI &amp; DS)
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-none">
                Mr. Manivannan K
              </h3>

              <div className="text-xs md:text-sm font-bold text-indigo-800 uppercase tracking-wide">
                Head of the Department — Artificial Intelligence &amp; Data Science (AI-DS)
              </div>

              <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-medium">
                Mr. Manivannan K leads the Department of Artificial Intelligence and Data Science (AI-DS) at V.S.B. Engineering College. He spearheads academic rigor, machine learning research, and placement-driven industry training.
              </p>

              {/* Free-Floating Patent Announcement */}
              <div className="pt-1 flex flex-col gap-1 text-left">
                <div className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-950">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>PUBLISHED PATENT (14.02.2025):</span>
                </div>
                <div className="text-xs text-slate-700 italic font-semibold">
                  &ldquo;Towards Adaptive and Scalable DDoS Attack Detection in Distributed Systems Using Tuned Hierarchical Machine Learning Model&rdquo;
                </div>
                <div className="text-[11px] font-mono text-indigo-700 font-extrabold">
                  Patent Application No: 202541009580
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: THE ONLY BOX ON THE PAGE - Royal Credentials Vault */}
        <div className="lg:col-span-5 relative">
          <div className="relative p-[2px] rounded-3xl bg-gradient-to-b from-amber-400 via-indigo-500 to-amber-400 shadow-[0_20px_50px_rgba(30,58,138,0.12)]">
            <div className="bg-white/98 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 space-y-5 text-slate-900 shadow-inner">
              
              {/* Portal Header */}
              <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" /> VSB CAMPUS INTELLIGENCE PORTAL
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
                  Welcome to VSB
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select your role to access your portal
                </p>
              </div>

              {/* Main Role Selector Tabs */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs gap-1.5 shadow-inner">
                <button
                  onClick={() => setMode('student_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_login'
                      ? 'bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Login
                </button>

                <button
                  onClick={() => setMode('student_register')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_register'
                      ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </button>

                <button
                  onClick={() => setMode('faculty_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'faculty_login'
                      ? 'bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" /> Faculty
                </button>
              </div>

              {/* Feedback Messages */}
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* MODE 1: STUDENT LOGIN */}
              {mode === 'student_login' && (
                <div className="space-y-4">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Student Roll Number or College Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Enter Student Roll Number or Email"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-2xs transition-all"
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
                        New student? Click <button type="button" onClick={() => setMode('student_register')} className="text-indigo-600 font-bold underline hover:text-indigo-800">Sign Up</button> above to create an account.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-2xs transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 hover:from-blue-800 hover:to-indigo-800 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating VSB Student...</span>
                      ) : (
                        <>
                          <span>Login to VSB Student Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* MODE 2: STUDENT SIGN UP / REGISTRATION */}
              {mode === 'student_register' && (
                <form onSubmit={handleStudentRegister} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-extrabold mb-1">Full Student Name *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Syed Ayaz Shah"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-extrabold mb-1">Roll Number / Student ID *</label>
                      <input
                        type="text"
                        required
                        value={regRollNumber}
                        onChange={(e) => setRegRollNumber(e.target.value)}
                        placeholder="e.g. 21CS205"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1">College Email Address *</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="syed@vsb.edu.in"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-extrabold mb-1">Department</label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      >
                        <option value="Computer Science & Engineering">CSE</option>
                        <option value="AI & Data Science">AI &amp; DS</option>
                        <option value="Electronics & Communication">ECE</option>
                        <option value="Information Technology">IT</option>
                        <option value="Mechanical Engineering">MECH</option>
                        <option value="Electrical & Electronics">EEE</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-extrabold mb-1">Current CGPA</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        value={regCgpa}
                        onChange={(e) => setRegCgpa(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-extrabold mb-1">Active Arrears</label>
                      <input
                        type="number"
                        min="0"
                        value={regBacklogs}
                        onChange={(e) => setRegBacklogs(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-extrabold mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-700 via-pink-700 to-purple-800 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Registering VSB Student Account...</span>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register Student &amp; Sign In</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 3: FACULTY LOGIN */}
              {mode === 'faculty_login' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <div className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" /> VSB Faculty Member Authentication
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      VSB Faculty members can inspect student academic details, review test scores, track daily reports, and manage department rosters.
                    </p>
                  </div>

                  <form onSubmit={handleFacultyLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Faculty Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={facultyEmail}
                          onChange={(e) => setFacultyEmail(e.target.value)}
                          placeholder="dr.ramesh@vsb.edu.in"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={facultyPass}
                          onChange={(e) => setFacultyPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating VSB Faculty...</span>
                      ) : (
                        <>
                          <span>Login to VSB Faculty Portal</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto text-center text-xs text-slate-500 py-4 font-medium border-t border-slate-200 mt-6">
        VSB ENGINEERING COLLEGE (KARUR - 639 111) • Official Campus Intelligence Platform © 2026
      </footer>
    </div>
  );
}

