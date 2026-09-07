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
        ? { userId: customId }
        : { identifier: loginId, password: loginPass };

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
        ? { userId: customUserId }
        : { email: facultyEmail, password: facultyPass };

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/40 to-indigo-50/40 text-slate-900 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e130_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e130_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Header Branding */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-md shadow-amber-500/10 flex items-center justify-center">
            <img src="/vsb-logo.png" alt="VSB Engineering College Logo" className="w-full h-full object-contain bg-white rounded-xl p-0.5" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              VSB ENGINEERING COLLEGE <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase">KARUR</span>
            </div>
            <div className="text-[11px] text-amber-600 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span>★ HARDWORK IS THE KEY TO SUCCESS ★</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-600 font-medium">
          <span className="flex items-center gap-1.5 bg-white border border-amber-300 px-3.5 py-1.5 rounded-full text-amber-800 font-semibold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-amber-500" /> College ERP Portal
          </span>
        </div>
      </header>

      {/* Main Form Portal */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100/90 border border-amber-300 px-3.5 py-1.5 rounded-full shadow-xs">
            <GraduationCap className="w-4 h-4 text-amber-600" /> VSB Student & Faculty Gateway
          </div>

          <div className="bg-white/90 border border-slate-200/90 rounded-3xl p-6 backdrop-blur-md space-y-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md shrink-0 border-2 border-amber-400">
                <img src="/vsb-logo.png" alt="VSB Emblem" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 leading-tight">
                  VSB Engineering College
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Autonomous Institution • Karur - 639 111
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Welcome to the official Learning Intelligence and Placement Portal for VSB Engineering College. Access student academic tracking, proctored assessments, course modules, and faculty management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Student Portal</div>
              <div className="text-xs font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" /> Tests, CGPA & Placement
              </div>
            </div>

            <div className="bg-white/80 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Faculty Portal</div>
              <div className="text-xs font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" /> Student Evaluation & Roster
              </div>
            </div>
          </div>
        </div>

        {/* Right Dynamic Login/Register Card */}
        <div className="lg:col-span-7 bg-white/95 border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xl space-y-6">
          
          {/* Main Role Selector Tabs (Only 3 Modes: Student Login, Student Sign Up, Faculty Login) */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs gap-1.5">
            <button
              onClick={() => setMode('student_login')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'student_login'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Student Login
            </button>

            <button
              onClick={() => setMode('student_register')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'student_register'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-100" /> Student Sign Up
            </button>

            <button
              onClick={() => setMode('faculty_login')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'faculty_login'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-100" /> Faculty Login
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">New students can click <strong className="text-emerald-600 font-bold">Student Sign Up</strong> above to create an account.</div>
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-amber-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
            <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Syed Ayaz Shah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-mono focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="AI & Data Science">AI & DS</option>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Active Arrears</label>
                  <input
                    type="number"
                    min="0"
                    value={regBacklogs}
                    onChange={(e) => setRegBacklogs(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering VSB Student Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register Student & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-[11px] text-slate-500 text-center font-medium">
                Newly registered VSB student profiles will be automatically visible on the VSB Faculty Desk.
              </div>
            </form>
          )}

          {/* MODE 3: FACULTY LOGIN */}
          {mode === 'faculty_login' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
                <div className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" /> VSB Faculty Member Authentication
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  VSB Faculty members can inspect student academic details, review daily test scores, track daily reports, and manage department rosters.
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto text-center text-xs text-slate-500 py-4 font-medium border-t border-slate-200 mt-4">
        VSB ENGINEERING COLLEGE (KARUR - 639 111) • Official Campus Intelligence Platform © 2026
      </footer>
    </div>
  );
}

