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
  const [facultyEmail, setFacultyEmail] = useState('manivanan.vsb@gmail.com');
  const [facultyPass, setFacultyPass] = useState('manivannan@vsb2027');

  // Student Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regDepartment, setRegDepartment] = useState('Computer Science & Engineering');
  const [regCgpa, setRegCgpa] = useState('8.4');
  const [regBacklogs, setRegBacklogs] = useState('0');
  const [regPassword, setRegPassword] = useState('');

  const [students, setStudents] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.allUsers) {
        setStudents(data.allUsers.filter((u: User) => u.role === 'STUDENT'));
        setFaculties(data.allUsers.filter((u: User) => u.role === 'FACULTY'));
      }
    } catch (e) {
      console.error(e);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-amber-950/40 via-slate-950 to-indigo-950 text-white flex flex-col justify-between p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>

      {/* Header Branding */}
      <header className="relative z-10 max-w-6xl w-full mx-auto flex items-center justify-between py-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-lg shadow-amber-500/20 flex items-center justify-center">
            <img src="/vsb-logo.png" alt="VSB Engineering College Logo" className="w-full h-full object-contain bg-white rounded-xl p-0.5" />
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              VSB ENGINEERING COLLEGE <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase">KARUR</span>
            </div>
            <div className="text-[11px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span>★ HARDWORK IS THE KEY TO SUCCESS ★</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-300 font-medium">
          <span className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-amber-300 font-semibold shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> College ERP Portal
          </span>
        </div>
      </header>

      {/* Main Form Portal */}
      <main className="relative z-10 max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Hero */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 rounded-full">
            <GraduationCap className="w-4 h-4 text-amber-400" /> VSB Student & Faculty Gateway
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-md shrink-0 border-2 border-amber-400">
                <img src="/vsb-logo.png" alt="VSB Emblem" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white leading-tight">
                  VSB Engineering College
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Autonomous Institution • Karur - 639 111
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Welcome to the official Learning Intelligence and Placement Portal for VSB Engineering College. Access student academic tracking, proctored assessments, course modules, and faculty management.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Student Portal</div>
              <div className="text-xs font-extrabold text-white mt-1 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" /> Tests, CGPA & Placement
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Faculty Portal</div>
              <div className="text-xs font-extrabold text-white mt-1 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-amber-400" /> Student Evaluation & Roster
              </div>
            </div>
          </div>
        </div>

        {/* Right Dynamic Login/Register Card */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Main Role Selector Tabs (Only 3 Modes: Student Login, Student Sign Up, Faculty Login) */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs gap-1.5">
            <button
              onClick={() => setMode('student_login')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'student_login'
                  ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Student Login
            </button>

            <button
              onClick={() => setMode('student_register')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'student_register'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-300" /> Student Sign Up
            </button>

            <button
              onClick={() => setMode('faculty_login')}
              className={`flex-1 py-3 px-3 rounded-xl font-extrabold transition-all flex items-center justify-center gap-2 ${
                mode === 'faculty_login'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4 text-indigo-300" /> Faculty Login
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{success}</span>
            </div>
          )}

          {/* MODE 1: STUDENT LOGIN */}
          {mode === 'student_login' && (
            <div className="space-y-4">
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">New students can click <strong className="text-emerald-400">Student Sign Up</strong> above to create an account.</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-amber-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* Quick Persona Picker for Registered Students */}
              {students.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400 font-bold uppercase mb-2">One-Click Student Demo Profiles:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {students.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setIdentifier(st.rollNumber || st.email);
                          if (st.password) setPassword(st.password);
                          handleStudentLogin(undefined, st.id, st.password);
                        }}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left text-xs font-semibold flex items-center gap-2 hover:bg-slate-900 transition-all cursor-pointer group"
                      >
                        <img src={st.avatarUrl} alt={st.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                        <div className="truncate">
                          <div className="text-white truncate group-hover:text-amber-400 transition-colors">{st.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Roll: {st.rollNumber}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: STUDENT SIGN UP / REGISTRATION */}
          {mode === 'student_register' && (
            <form onSubmit={handleStudentRegister} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Syed Ayaz Shah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Roll Number / Student ID *</label>
                  <input
                    type="text"
                    required
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                    placeholder="e.g. 21CS205"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">College Email Address *</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="syed@vsb.edu.in"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Department</label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
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
                  <label className="block text-slate-300 font-bold mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={regCgpa}
                    onChange={(e) => setRegCgpa(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Active Arrears</label>
                  <input
                    type="number"
                    min="0"
                    value={regBacklogs}
                    onChange={(e) => setRegBacklogs(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

              <div className="text-[11px] text-slate-400 text-center">
                Newly registered VSB student profiles will be automatically visible on the VSB Faculty Desk.
              </div>
            </form>
          )}

          {/* MODE 3: FACULTY LOGIN */}
          {mode === 'faculty_login' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/80 space-y-2">
                <div className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> VSB Faculty Member Authentication
                </div>
                <p className="text-xs text-slate-300">
                  VSB Faculty members can inspect student academic details, review daily test scores, track daily reports, and manage department rosters.
                </p>
              </div>

              <form onSubmit={handleFacultyLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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

              {/* Quick Faculty Persona Picker */}
              <div className="pt-3 border-t border-slate-800">
                <div className="text-[11px] text-slate-400 font-bold uppercase mb-2">Or One-Click Demo Faculty Persona:</div>
                {faculties.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => handleFacultyLogin(undefined, fac.id)}
                    className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <img src={fac.avatarUrl} alt={fac.name} className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500/40 shrink-0" />
                      <div>
                        <div className="text-xs font-extrabold text-white group-hover:text-indigo-400 transition-colors">
                          {fac.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {fac.role} • {fac.department}
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold group-hover:bg-indigo-500 text-white transition-all flex items-center gap-1">
                      <span>Login as Faculty</span> <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl w-full mx-auto text-center text-xs text-slate-400 py-4 font-medium border-t border-slate-800/60 mt-4">
        VSB ENGINEERING COLLEGE (KARUR - 639 111) • Official Campus Intelligence Platform © 2026
      </footer>
    </div>
  );
}

