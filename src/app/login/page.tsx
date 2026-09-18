'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Briefcase,
  Search,
  ChevronDown,
  ExternalLink,
  Filter,
  Flame,
  TrendingUp
} from 'lucide-react';
import { User } from '@/types';
import { setSessionUser } from '@/lib/client-auth';
import { PLACEMENT_RECORDS, PLACEMENT_SUMMARY, PlacementRecord } from '@/lib/placement-records';

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

  // Placement Records Search & Filter State
  const [placementSearch, setPlacementSearch] = useState('');
  const [placementFilter, setPlacementFilter] = useState<'ALL' | 'SUPER_DREAM' | 'DREAM' | 'CORE_IT' | 'MASS'>('ALL');

  // Force pure light theme on login page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#fbfbfe';
      document.body.style.color = '#0f172a';
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.style.backgroundColor = '';
        document.body.style.color = '';
      }
    };
  }, []);

  // Filtered placement records
  const filteredPlacementRecords = useMemo(() => {
    return PLACEMENT_RECORDS.filter((rec) => {
      const matchesSearch = rec.name.toLowerCase().includes(placementSearch.toLowerCase()) ||
                            rec.packageLPA.toLowerCase().includes(placementSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (placementFilter === 'SUPER_DREAM') return rec.category === 'Super Dream' || rec.maxLPA >= 10;
      if (placementFilter === 'DREAM') return rec.category === 'Dream' || (rec.maxLPA >= 5 && rec.maxLPA < 10);
      if (placementFilter === 'CORE_IT') return rec.category === 'Core & IT' || rec.maxLPA < 5;
      if (placementFilter === 'MASS') return rec.offers >= 15;
      return true;
    });
  }, [placementSearch, placementFilter]);

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
      if (!res.ok) throw new Error(data.error || 'Invalid student credentials');

      const user = data.user || data.activeUser;
      if (!user) throw new Error('Student user profile could not be loaded.');

      setSessionUser(user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          rollNumber: regRollNumber,
          department: regDepartment,
          cgpa: parseFloat(regCgpa) || 8.0,
          currentBacklogs: parseInt(regBacklogs) || 0,
          password: regPassword,
          role: 'STUDENT'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      const user = data.user || data.activeUser;
      if (!user?.id) throw new Error('Registered user profile could not be retrieved.');

      setSuccess('Account created successfully! Logging you in...');
      setTimeout(() => {
        handleStudentLogin(undefined, user.id, regPassword);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Could not complete registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = customEmail || facultyEmail;
    const loginPass = customPass !== undefined ? customPass : facultyPass;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginEmail,
          password: loginPass,
          expectedRole: 'FACULTY'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid faculty credentials');

      const user = data.user || data.activeUser;
      if (!user) throw new Error('Faculty user profile could not be loaded.');

      setSessionUser(user);
      router.push('/faculty');
    } catch (err: any) {
      setError(err.message || 'Faculty login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbfbfe] via-[#f6f7fd] to-[#f8f9ff] text-slate-900 flex flex-col justify-between p-3 sm:p-6 md:p-8 relative font-sans overflow-x-hidden selection:bg-amber-400 selection:text-slate-950">
      {/* Royal Light Theme Ambient Shimmer & Auroras */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] bg-gradient-to-br from-amber-200/35 via-indigo-100/40 to-transparent rounded-full blur-[140px]" />
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

      {/* UPSIDE MOVING TICKERS (Royal Motto, Rankings & Corporate Placement Packages) */}
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

        {/* Ticker 3: Placement Records Highlight Ribbon */}
        <div className="overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-300/80 text-slate-900 py-1.5 px-4 shadow-2xs">
          <div className="relative flex overflow-x-hidden">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-8 font-black text-[11px] tracking-wider uppercase">
              <span className="text-amber-800 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-600" /> TOP CAMPUS OFFERS:</span>
              <span className="text-indigo-950 font-bold">AMAZON: ₹47 LPA (2 Offers)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">PRODUCT BASED CO: ₹44 LPA (2 Offers)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">AUTODESK: ₹40 LPA (1 Offer)</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-800 font-black">CAPGEMINI: 414 OFFERS (Up to 7.5 LPA)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">TCS: 35 OFFERS (Up to 9 LPA)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">COGNIZANT: 60 OFFERS</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">LTI MINDTREE: 47 OFFERS</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">UST GLOBAL: 45 OFFERS</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-700 font-black">AVERAGE CTC: ₹7.5 LPA</span>

              <span className="text-amber-800 flex items-center gap-1.5"><Flame className="w-3.5 h-3.5 text-amber-600" /> TOP CAMPUS OFFERS:</span>
              <span className="text-indigo-950 font-bold">AMAZON: ₹47 LPA (2 Offers)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">PRODUCT BASED CO: ₹44 LPA (2 Offers)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">AUTODESK: ₹40 LPA (1 Offer)</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-800 font-black">CAPGEMINI: 414 OFFERS (Up to 7.5 LPA)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">TCS: 35 OFFERS (Up to 9 LPA)</span>
              <span className="text-slate-400">•</span>
              <span className="text-indigo-950 font-bold">COGNIZANT: 60 OFFERS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Left is Freestyle with ZERO boxes, Right is the Redesigned Royal Login Box */}
      <main className="relative z-10 max-w-7xl w-full mx-auto my-5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-slate-200/80">
            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-indigo-900 flex items-center justify-center sm:justify-start gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> 760+
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Placement Offers</div>
              <div className="text-[10px] text-slate-500">Tier-1 Multi-Offers</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-emerald-800 flex items-center justify-center sm:justify-start gap-1">
                <Award className="w-4 h-4 text-emerald-600" /> ₹47 LPA
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Highest Package</div>
              <div className="text-[10px] text-slate-500">Amazon &amp; Tech Giants</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-blue-900 flex items-center justify-center sm:justify-start gap-1">
                <TrendingUp className="w-4 h-4 text-blue-600" /> ₹7.5 LPA
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Average CTC</div>
              <div className="text-[10px] text-slate-500">Institution Record</div>
            </div>

            <div className="text-center sm:text-left space-y-0.5">
              <div className="text-lg md:text-xl font-black text-purple-900 flex items-center justify-center sm:justify-start gap-1">
                <Building2 className="w-4 h-4 text-purple-600" /> 53 Partners
              </div>
              <div className="text-[11px] font-extrabold text-slate-800">Corporate Recruiters</div>
              <div className="text-[10px] text-slate-500">MNCs &amp; Global Leaders</div>
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

        {/* Right Column: REDESIGNED ROYAL LIGHT THEME LOGIN CREDENTIALS PORTAL */}
        <div className="lg:col-span-5 relative">
          <div className="relative rounded-3xl overflow-hidden bg-white border-2 border-amber-400 shadow-[0_22px_55px_rgba(20,40,90,0.12)]">
            
            {/* Royal Top Insignia Bar */}
            <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 px-6 py-4 text-white flex items-center justify-between border-b border-amber-400/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/60 flex items-center justify-center text-amber-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold tracking-wider uppercase text-amber-300">VSB Official Portal</div>
                  <div className="text-xs font-black text-white">Campus Intelligence</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-widest font-mono">
                AUTONOMOUS
              </span>
            </div>

            {/* Portal Body */}
            <div className="p-6 sm:p-7 space-y-5 text-slate-900 bg-gradient-to-b from-white via-[#fcfdff] to-[#f8faff]">
              
              {/* Header Title */}
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight font-serif">
                  Access Portal
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select your institutional role to continue
                </p>
              </div>

              {/* Main Role Selector Tabs with Royal Colors */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs gap-1.5 shadow-inner">
                <button
                  onClick={() => setMode('student_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_login'
                      ? 'bg-gradient-to-r from-blue-950 to-indigo-900 text-amber-300 shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Student
                </button>

                <button
                  onClick={() => setMode('student_register')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'student_register'
                      ? 'bg-gradient-to-r from-purple-800 to-indigo-800 text-amber-200 shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </button>

                <button
                  onClick={() => setMode('faculty_login')}
                  className={`flex-1 py-2.5 px-2 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 ${
                    mode === 'faculty_login'
                      ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-100 shadow-md scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 font-bold'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 text-amber-300" /> Faculty
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
                          placeholder="e.g., 21CS104 or student@vsb.ac.in"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 shadow-2xs transition-all"
                        />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
                        New student? Click <button type="button" onClick={() => setMode('student_register')} className="text-amber-700 font-bold underline hover:text-amber-800">Sign Up</button> above to create an account.
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
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200/60 shadow-2xs transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Authenticating VSB Student...</span>
                      ) : (
                        <>
                          <span>Sign In to Student Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* 1-Click Quick Demo Access */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 text-center">
                      Quick Instant Access (Demo)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStudentLogin(undefined, 'std_1', 'password123')}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>👤 Demo Student: Syed Ayaz (21CS104)</span>
                      <span className="text-[10px] text-indigo-700 font-extrabold uppercase">Instant Access →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* MODE 2: STUDENT SIGN UP */}
              {mode === 'student_register' && (
                <div className="space-y-4">
                  <form onSubmit={handleStudentRegister} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                          Roll Number
                        </label>
                        <input
                          type="text"
                          required
                          value={regRollNumber}
                          onChange={(e) => setRegRollNumber(e.target.value)}
                          placeholder="e.g. 21AD102"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="student@vsb.ac.in"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Department
                      </label>
                      <select
                        value={regDepartment}
                        onChange={(e) => setRegDepartment(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-semibold focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-2xs"
                      >
                        <option value="Artificial Intelligence & Data Science">Artificial Intelligence &amp; Data Science (AI-DS)</option>
                        <option value="Computer Science & Engineering">Computer Science &amp; Engineering (CSE)</option>
                        <option value="Information Technology">Information Technology (IT)</option>
                        <option value="Electronics & Communication Engineering">Electronics &amp; Communication (ECE)</option>
                        <option value="Electrical & Electronics Engineering">Electrical &amp; Electronics (EEE)</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                          Current CGPA
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          required
                          value={regCgpa}
                          onChange={(e) => setRegCgpa(e.target.value)}
                          placeholder="8.4"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-purple-600 shadow-2xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                          Standing Arrears
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={regBacklogs}
                          onChange={(e) => setRegBacklogs(e.target.value)}
                          placeholder="0"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-purple-600 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                        Create Password
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-medium focus:outline-none focus:border-purple-600 shadow-2xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-purple-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <span>Creating Account...</span> : <span>Register Student Profile</span>}
                    </button>
                  </form>
                </div>
              )}

              {/* MODE 3: FACULTY LOGIN */}
              {mode === 'faculty_login' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-900 text-xs font-medium">
                    🏛️ <strong>Faculty Access Portal</strong>: For HODs, Class Advisors, and Placement Officers.
                  </div>

                  <form onSubmit={handleFacultyLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Faculty Institutional Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={facultyEmail}
                          onChange={(e) => setFacultyEmail(e.target.value)}
                          placeholder="faculty@vsb.ac.in"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
                        Faculty Security Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="password"
                          required
                          value={facultyPass}
                          onChange={(e) => setFacultyPass(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 shadow-2xs"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 hover:from-blue-900 hover:to-indigo-900 text-amber-300 text-xs font-black uppercase tracking-wider shadow-lg shadow-blue-950/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-amber-400/40"
                    >
                      {loading ? (
                        <span>Authenticating VSB Faculty...</span>
                      ) : (
                        <>
                          <span>Login to VSB Faculty Portal</span>
                          <ArrowRight className="w-4 h-4 text-amber-400" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* 1-Click Quick Demo Access for Faculty */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 text-center">
                      Quick Instant Access (Demo Faculty)
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFacultyLogin(undefined, 'manivanan.vsb@gmail.com', 'manivannan@vsb2027')}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 text-xs font-bold transition-all flex items-center justify-between"
                    >
                      <span>👨‍🏫 Demo Faculty: Prof. Manivannan (HOD AI &amp; DS)</span>
                      <span className="text-[10px] text-amber-700 font-extrabold uppercase">Instant Access →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. INNOVATIVE 53 CORPORATE PLACEMENT RECORDS SHOWCASE (ROYAL) */}
      {/* ------------------------------------------------------------- */}
      <section className="relative z-10 max-w-7xl w-full mx-auto my-10 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" /> VSB CAMPUS PLACEMENT LEDGER
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1 font-serif">
              Official Corporate Placement Records
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium mt-1">
              Verified campus placement records across Tier-1 Product Companies, Core Engineering, and Global IT Leaders.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white border border-amber-300 px-3.5 py-2 rounded-2xl shadow-xs text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Total Offers</div>
              <div className="text-base font-black text-indigo-950">{PLACEMENT_SUMMARY.totalOffers}</div>
            </div>
            <div className="bg-white border border-emerald-300 px-3.5 py-2 rounded-2xl shadow-xs text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Highest Package</div>
              <div className="text-base font-black text-emerald-700">{PLACEMENT_SUMMARY.highestPackage}</div>
            </div>
            <div className="bg-white border border-blue-300 px-3.5 py-2 rounded-2xl shadow-xs text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Average CTC</div>
              <div className="text-base font-black text-blue-900">{PLACEMENT_SUMMARY.averagePackage}</div>
            </div>
            <div className="bg-white border border-purple-300 px-3.5 py-2 rounded-2xl shadow-xs text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Recruiters</div>
              <div className="text-base font-black text-purple-900">{PLACEMENT_SUMMARY.totalCompanies} Companies</div>
            </div>
          </div>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={placementSearch}
              onChange={(e) => setPlacementSearch(e.target.value)}
              placeholder="Search company (e.g. Amazon, Capgemini, TCS)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            <button
              onClick={() => setPlacementFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                placementFilter === 'ALL'
                  ? 'bg-blue-950 text-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All 53 Companies ({PLACEMENT_RECORDS.length})
            </button>
            <button
              onClick={() => setPlacementFilter('SUPER_DREAM')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                placementFilter === 'SUPER_DREAM'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⭐ ₹10+ LPA High Package
            </button>
            <button
              onClick={() => setPlacementFilter('DREAM')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                placementFilter === 'DREAM'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              💼 ₹5 - 10 LPA Packages
            </button>
            <button
              onClick={() => setPlacementFilter('MASS')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                placementFilter === 'MASS'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🔥 Mass Hiring (15+ Offers)
            </button>
          </div>
        </div>

        {/* Placement Records Table / Grid Showcase */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-amber-300 sticky top-0 z-20 font-black tracking-wider uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">S.No</th>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4 text-center">Total Offers</th>
                  <th className="py-3 px-4 text-right">Annual Salary Package (LPA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPlacementRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">
                      No placement records found matching &ldquo;{placementSearch}&rdquo;.
                    </td>
                  </tr>
                ) : (
                  filteredPlacementRecords.map((rec, idx) => {
                    const isMassRecruiter = rec.offers >= 30;
                    return (
                      <tr
                        key={rec.sNo}
                        className={`hover:bg-amber-50/40 transition-colors ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">
                          {rec.sNo}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 text-xs md:text-sm">
                              {rec.name}
                            </span>
                            {isMassRecruiter && (
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase flex items-center gap-0.5">
                                <Flame className="w-2.5 h-2.5 text-emerald-600" /> Mass Hiring
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center font-black px-3 py-1 rounded-full text-xs ${
                              rec.offers >= 100
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : rec.offers >= 20
                                ? 'bg-indigo-100 text-indigo-900 font-extrabold'
                                : 'bg-slate-100 text-slate-800 font-bold'
                            }`}
                          >
                            {rec.offers} {rec.offers === 1 ? 'Offer' : 'Offers'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 font-mono font-black text-xs md:text-sm text-slate-950 bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-lg">
                            ₹{rec.packageLPA} <span className="text-[10px] text-amber-800 font-bold">LPA</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary Note */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <strong>{filteredPlacementRecords.length}</strong> of <strong>{PLACEMENT_RECORDS.length}</strong> Verified Recruiting Companies
            </div>
            <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Institution Average CTC: <span className="underline">₹7.5 LPA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto text-center text-xs text-slate-500 py-4 font-medium border-t border-slate-200 mt-6">
        VSB ENGINEERING COLLEGE (KARUR - 639 111) • Official Campus Intelligence Platform © 2026
      </footer>
    </div>
  );
}
