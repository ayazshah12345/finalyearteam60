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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-purple-50/20 text-slate-900 flex flex-col justify-between p-3 sm:p-6 md:p-8 relative font-sans overflow-x-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-indigo-300/30 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-purple-300/25 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] bg-amber-200/30 rounded-full blur-[120px]" />
      </div>

      {/* Top Header Branding Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto flex flex-wrap items-center justify-between gap-4 py-3 border-b border-indigo-100 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white p-1.5 border border-indigo-100 shadow-md flex items-center justify-center hover:scale-105 transition-transform">
            <img src="/vsb-logo.png" alt="VSB Engineering College Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
              <span className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 bg-clip-text text-transparent">VSB ENGINEERING COLLEGE</span>
              <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2.5 py-0.5 rounded-full font-mono font-black tracking-wider uppercase shadow-xs">KARUR</span>
            </div>
            <div className="text-[11px] md:text-xs text-amber-600 font-black uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span>★ HARDWORK IS THE KEY TO SUCCESS ★</span>
            </div>
          </div>
        </div>

        {/* Quick Accreditation Badges on Top */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-xs border border-indigo-100 px-3 py-1.5 rounded-full text-indigo-900 font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> Autonomous Institution
          </span>
          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-extrabold shadow-xs">
            TNEA CODE: 2622
          </span>
        </div>
      </header>

      {/* Moving Marquee Ticker: VSB ENGINEERING COLLEGE A PLACE FOR PLACEMENT */}
      <div className="relative z-10 max-w-7xl w-full mx-auto my-4 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-amber-300 py-3 px-4 shadow-lg border border-indigo-400/30">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 font-black text-xs md:text-sm tracking-widest uppercase">
            <span className="flex items-center gap-2">⭐ VSB ENGINEERING COLLEGE A PLACE FOR PLACEMENT ⭐</span>
            <span className="flex items-center gap-2 text-white">🏆 100% DEDICATED PLACEMENT TRAINING &amp; EXCELLENCE 🏆</span>
            <span className="flex items-center gap-2">⭐ VSB ENGINEERING COLLEGE A PLACE FOR PLACEMENT ⭐</span>
            <span className="flex items-center gap-2 text-white">🚀 INNOVATION IN ARTIFICIAL INTELLIGENCE &amp; DATA SCIENCE 🚀</span>
            <span className="flex items-center gap-2">⭐ VSB ENGINEERING COLLEGE A PLACE FOR PLACEMENT ⭐</span>
            <span className="flex items-center gap-2 text-white">🎖️ NBA • NAAC • NIRF • TCS AFFILIATED • ISO 9001:2015 🎖️</span>
          </div>
        </div>
      </div>

      {/* Main Freestyle Section */}
      <main className="relative z-10 max-w-7xl w-full mx-auto my-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Freestyle Showcase (7 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* SECTION 1: FREESTYLE CHAIRMAN & COLLEGE PROUDNESS */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/90 via-indigo-50/50 to-white/90 backdrop-blur-md border border-indigo-100/80 p-6 md:p-8 shadow-md hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-200/30 via-indigo-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Chairman Photo Cutout with Concentric Halo Aura */}
              <div className="relative shrink-0 w-48 sm:w-56 md:w-60 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400/20 via-indigo-400/20 to-purple-400/20 blur-xl scale-95" />
                <img
                  src="/chairman-balsamy-cutout.png"
                  alt="Mr. V.S. Balsamy - Founder & Chairman"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Chairman Story & Heritage */}
              <div className="space-y-3 text-left flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                  ★ Founder &amp; Chairman ★
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  Mr. V.S. Balsamy
                </h2>
                
                <div className="text-xs font-extrabold text-indigo-700 uppercase tracking-wide">
                  Founder &amp; Chairman • V.S.B. Educational Trust
                </div>

                <div className="relative pl-3 border-l-2 border-amber-400/80 my-2">
                  <p className="text-xs md:text-[13px] text-slate-700 leading-relaxed font-medium text-justify">
                    V.S.B Educational Trust was founded in the year 2000 by Mr. V.S. Balsamy, the founder and Chairman of the V.S.B Engineering College, with an interest in promoting, managing and administrating educational institutions with high academic standards, discipline and to take up and help other allied activities in the field of education. Under the Trust, V.S.B Engineering College, Karur was established in the year 2002 and V.S.B College of Engineering Technical Campus, Coimbatore in the year 2012.
                  </p>
                </div>

                {/* Milestone Highlights */}
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-bold">
                  <span className="bg-white/80 border border-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg shadow-2xs">
                    🏛️ Est. 2000
                  </span>
                  <span className="bg-white/80 border border-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg shadow-2xs">
                    📍 Karur Campus (2002)
                  </span>
                  <span className="bg-white/80 border border-indigo-100 text-indigo-900 px-2.5 py-1 rounded-lg shadow-2xs">
                    📍 Coimbatore Campus (2012)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: FREESTYLE HOD AI & DATA SCIENCE LEADERSHIP */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-purple-50/40 to-indigo-50/40 backdrop-blur-md border border-purple-100/80 p-5 md:p-6 shadow-md hover:shadow-xl transition-all">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* HOD Suit Photo in Glowing Frame */}
              <div className="relative shrink-0 w-36 h-36 sm:w-40 sm:h-40 rounded-2xl overflow-hidden shadow-lg border-2 border-purple-200/80 group">
                <img
                  src="/hod-manivannan-suit.jpg"
                  alt="Mr. Manivannan K - Head of Department AI & DS"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* HOD Description & Patent Pill */}
              <div className="space-y-2.5 text-center sm:text-left flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" /> Head of the Department (HOD)
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-900 leading-tight">
                  Mr. Manivannan K
                </h3>

                <p className="text-xs font-extrabold text-purple-800">
                  Head of the Department (HOD) — Artificial Intelligence &amp; Data Science (AI &amp; DS)
                </p>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Mr. Manivannan K leads the Department of Artificial Intelligence and Data Science (AI-DS) at V.S.B. Engineering College. He spearheads academic rigor, machine learning research, and placement-driven industry training.
                </p>

                {/* Patent Published Highlight */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 rounded-2xl p-3 text-[11px] text-slate-700 space-y-1 text-left shadow-2xs">
                  <div className="font-black text-purple-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>PUBLISHED PATENT (14.02.2025)</span>
                  </div>
                  <div className="text-slate-800 font-semibold italic text-[11px]">
                    &ldquo;Towards Adaptive and Scalable DDoS Attack Detection in Distributed Systems Using Tuned Hierarchical Machine Learning Model&rdquo;
                  </div>
                  <div className="text-[10px] font-mono text-purple-700 font-bold">
                    Patent Application No: 202541009580
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: OUR RANKINGS & ACCREDITATIONS BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-white border border-indigo-100 p-5 shadow-md hover:shadow-lg transition-all space-y-4">
            <div className="text-center space-y-1">
              <div className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center justify-center gap-1.5">
                <Award className="w-4 h-4" /> Academic Accreditations &amp; Institutional Standing
              </div>
              <h4 className="text-xl font-black text-slate-900">Our Rankings &amp; Accreditations</h4>
              <p className="text-xs text-slate-500 font-medium">We&apos;ve achieved an enviable reputation for research, discipline, and teaching excellence.</p>
            </div>

            {/* Official Rankings Image Display */}
            <div className="w-full rounded-2xl overflow-hidden bg-slate-50/50 p-2 border border-slate-100 flex items-center justify-center">
              <img
                src="/vsb-rankings.png"
                alt="Our Rankings - NBA, NAAC, NIRF, TCS, ISO 9001:2015, TNEA Code 2622"
                className="w-full max-w-2xl h-auto object-contain hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Pill Features */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl py-2 px-1 text-[10px] font-extrabold text-indigo-900">NBA Accredited</div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl py-2 px-1 text-[10px] font-extrabold text-indigo-900">NAAC A-Grade</div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl py-2 px-1 text-[10px] font-extrabold text-indigo-900">NIRF Ranked</div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl py-2 px-1 text-[10px] font-extrabold text-indigo-900">TCS Partner</div>
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl py-2 px-1 text-[10px] font-extrabold text-indigo-900">ISO 9001:2015</div>
              <div className="bg-amber-500 border border-amber-600 text-white rounded-xl py-2 px-1 text-[10px] font-black">TNEA 2622</div>
            </div>
          </div>

        </div>

        {/* Right Dynamic Login/Register Portal (5 Columns) */}
        <div className="lg:col-span-5 relative">
          <div className="p-[1px] rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 shadow-2xl">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Portal Header */}
              <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <GraduationCap className="w-3.5 h-3.5" /> Campus Intelligence Portal
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Welcome to VSB
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select your role to sign in or register
                </p>
              </div>

              {/* Main Role Selector Tabs (Student Login | Student Sign Up | Faculty Login) */}
              <div className="flex bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 text-xs gap-1.5 shadow-inner">
                <button
                  onClick={() => setMode('student_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_login'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Login
                </button>

                <button
                  onClick={() => setMode('student_register')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_register'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </button>

                <button
                  onClick={() => setMode('faculty_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'faculty_login'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
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
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              {/* MODE 1: STUDENT LOGIN */}
              {mode === 'student_login' && (
                <div className="space-y-4">
                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-2xs"
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
                        New students can click <button type="button" onClick={() => setMode('student_register')} className="text-indigo-600 font-bold underline hover:text-indigo-800">Student Sign Up</button> above to register.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 space-y-2">
                    <div className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" /> VSB Faculty Member Authentication
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      VSB Faculty members can inspect student academic details, review test scores, track daily reports, and manage department rosters.
                    </p>
                  </div>

                  <form onSubmit={handleFacultyLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
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
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
      <footer className="relative z-10 max-w-7xl w-full mx-auto text-center text-xs text-slate-500 py-4 font-medium border-t border-indigo-100 mt-6">
        VSB ENGINEERING COLLEGE (KARUR - 639 111) • Official Campus Intelligence Platform © 2026
      </footer>
    </div>
  );
}

