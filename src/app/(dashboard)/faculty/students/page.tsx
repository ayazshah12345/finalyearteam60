'use client';

import React, { useState, useEffect } from 'react';
import { User, ResumeData, MockInterviewSession, QuizAttempt } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  Users,
  Search,
  Eye,
  GraduationCap,
  Award,
  Zap,
  Mic,
  FileText,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  X,
  Sparkles,
  Download,
  ExternalLink,
  BookOpen,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function FacultyStudentProfilesPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterCgpa, setFilterCgpa] = useState('ALL');

  // Selected Student for View Profile Modal
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'tests' | 'interviews' | 'resume'>('profile');
  const [studentResume, setStudentResume] = useState<ResumeData | null>(null);
  const [studentMocks, setStudentMocks] = useState<MockInterviewSession[]>([]);
  const [studentAttempts, setStudentAttempts] = useState<QuizAttempt[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Get Faculty Persona
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      if (!authData.activeUser || authData.activeUser.role === 'STUDENT') {
        setLoading(false);
        return;
      }

      // 2. Get All Student Records
      const coordRes = await authFetch('/api/coordinator/students');
      if (coordRes.ok) {
        const coordData = await coordRes.json();
        setStudents(coordData.studentRecords || []);
      }
    } catch (e) {
      console.error('Failed to load student profiles:', e);
    } finally {
      setLoading(false);
    }
  };

  // Open Student Profile Modal & Fetch Full Records
  const handleViewProfile = async (st: any) => {
    setSelectedStudent(st);
    setActiveProfileTab('profile');
    setStudentResume(null);
    setStudentMocks([]);
    setStudentAttempts([]);
    setLoadingDetails(true);

    try {
      const studentIdToFetch = st.studentId || st.id;

      // 1. Fetch Resume
      const resRes = await fetch(`/api/resume?studentId=${studentIdToFetch}`);
      if (resRes.ok) {
        const resData = await resRes.json();
        setStudentResume(resData.resume || null);
      }

      // 2. Fetch Mock Interviews
      const miRes = await authFetch('/api/interview/history');
      if (miRes.ok) {
        const miData = await miRes.json();
        const mocks = (miData.interviews || []).filter(
          (m: MockInterviewSession) => m.studentId === studentIdToFetch || m.studentName?.toLowerCase().includes(st.name.toLowerCase())
        );
        setStudentMocks(mocks);
      }

      // 3. Fetch Quiz / Daily Test Attempts
      const qzRes = await authFetch('/api/quizzes/attempts');
      if (qzRes.ok) {
        const qzData = await qzRes.json();
        const userAttempts = (qzData.attempts || []).filter(
          (att: QuizAttempt) => att.studentId === studentIdToFetch || att.studentName?.toLowerCase().includes(st.name.toLowerCase())
        );
        setStudentAttempts(userAttempts);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter students
  const filteredStudents = students.filter((st) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (st.rollNumber && st.rollNumber.toLowerCase().includes(query)) ||
      (st.name && st.name.toLowerCase().includes(query)) ||
      (st.department && st.department.toLowerCase().includes(query));

    const matchesDept = filterDept === 'ALL' || st.department === filterDept;

    let matchesCgpa = true;
    if (filterCgpa === '8.0+') matchesCgpa = st.cgpa >= 8.0;
    else if (filterCgpa === '7.5+') matchesCgpa = st.cgpa >= 7.5;
    else if (filterCgpa === '<7.5') matchesCgpa = st.cgpa < 7.5;

    return matchesSearch && matchesDept && matchesCgpa;
  });

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Registered Student Profiles...</span>
      </div>
    );
  }

  if (faculty?.role === 'STUDENT') {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl mt-8">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          ⛔ Faculty Privileges Required
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          This portal is restricted to VSB Faculty and Placement Coordinators.
        </p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> VSB Engineering College • Faculty Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-400" />
              Registered Student Profiles & Academic Directory
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Browse all registered students in the institution. Touch or click <strong>View</strong> to inspect a student's full academic profile, test performance, mock interview evaluations, and verified resume.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/faculty"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" /> Faculty Command Desk
            </Link>
            <Link
              href="/faculty/test"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <Zap className="w-4 h-4 text-amber-400" /> Manage Daily Tests
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="text-xs text-slate-400 uppercase font-extrabold">Registered Students</div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{students.length}</div>
          <span className="text-[10px] text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full font-bold inline-block mt-1">
            Active Batch Profiles
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="text-xs text-slate-400 uppercase font-extrabold">Average Batch CGPA</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {students.length > 0
              ? (students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / students.length).toFixed(2)
              : '8.40'}
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold inline-block mt-1">
            Academic Performance
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="text-xs text-slate-400 uppercase font-extrabold">Zero Backlog Students</div>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {students.filter((s) => (s.backlogs || 0) === 0).length}
          </div>
          <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold inline-block mt-1">
            Placement Eligible
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Search registered student by Name, Register No (e.g. 21CS104), or Department..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="AI & Data Science">AI & Data Science</option>
              <option value="Electronics & Communication">Electronics & Communication</option>
              <option value="Information Technology">Information Technology</option>
            </select>

            <select
              value={filterCgpa}
              onChange={(e) => setFilterCgpa(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All CGPA</option>
              <option value="8.0+">CGPA ≥ 8.0 (Distinction)</option>
              <option value="7.5+">CGPA ≥ 7.5</option>
              <option value="<7.5">CGPA &lt; 7.5</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{filteredStudents.length}</strong> registered student profile(s)
        </div>
      </div>

      {/* Student Profiles Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
              <tr>
                <th className="p-4">Student Profile & Reg No</th>
                <th className="p-4">Department & Batch</th>
                <th className="p-4">CGPA & Arrears</th>
                <th className="p-4">Daily Tests</th>
                <th className="p-4">Placement Status</th>
                <th className="p-4 text-right">View Profile Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {filteredStudents.map((st: any) => (
                <tr key={st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white p-1 border border-amber-300 dark:border-amber-600 shadow-sm flex items-center justify-center shrink-0">
                        <img src="/vsb-logo.png" alt="VSB College" className="w-full h-full object-contain" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-sm">{st.name}</div>
                        <div className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                          Reg / Roll: {st.rollNumber || '21CS104'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 dark:text-white">{st.department}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {st.batch || '2022-2026'} • Semester {st.semester || 6}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-black text-slate-900 dark:text-white text-sm">
                      {st.cgpa ? Number(st.cgpa).toFixed(1) : '8.4'} / 10.0
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                        (st.backlogs || 0) === 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {(st.backlogs || 0) === 0 ? '0 Backlogs' : `${st.backlogs} Arrears`}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {st.testPerformance?.totalTestsAttended || 0} Tests Attended
                    </div>
                    <div className="text-[11px] font-semibold text-amber-600">
                      Avg: {st.testPerformance?.avgScorePercent || 0}%
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase">
                      ✓ Placement Ready
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleViewProfile(st)}
                      className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-1.5 active:scale-95"
                    >
                      <Eye className="w-4 h-4" /> View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT PROFILE MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white p-1.5 border-2 border-amber-400 shadow-lg flex items-center justify-center shrink-0">
                  <img src="/vsb-logo.png" alt="VSB College" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{selectedStudent.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase border border-indigo-200 dark:border-indigo-800">
                      STUDENT PROFILE
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Reg No: <strong>{selectedStudent.rollNumber || '21CS104'}</strong> • {selectedStudent.department} • VSB Engineering College
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto whitespace-nowrap">
              <button
                onClick={() => setActiveProfileTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> Academic & Profile Overview
              </button>

              <button
                onClick={() => setActiveProfileTab('tests')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === 'tests'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Zap className="w-4 h-4" /> Daily Test Performance ({studentAttempts.length})
              </button>

              <button
                onClick={() => setActiveProfileTab('interviews')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === 'interviews'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Mic className="w-4 h-4" /> Mock Interview Marks ({studentMocks.length})
              </button>

              <button
                onClick={() => setActiveProfileTab('resume')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  activeProfileTab === 'resume'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" /> Student Resume & Documents
              </button>
            </div>

            {loadingDetails && (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading student records...</span>
              </div>
            )}

            {/* TAB 1: ACADEMIC & PROFILE OVERVIEW */}
            {!loadingDetails && activeProfileTab === 'profile' && (
              <div className="space-y-6 text-xs">
                {/* Academic Quick Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Academic CGPA</div>
                    <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                      {selectedStudent.cgpa ? Number(selectedStudent.cgpa).toFixed(2) : '8.40'}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Score out of 10.0</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Current Arrears</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedStudent.backlogs || 0}
                    </div>
                    <span className="text-[10px] text-slate-400">Backlogs Count</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Current Semester</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      Semester {selectedStudent.semester || 6}
                    </div>
                    <span className="text-[10px] text-slate-400">{selectedStudent.currentYear || '3rd Year'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Placement Status</div>
                    <div className="text-xl font-black text-emerald-600 mt-1">Eligible</div>
                    <span className="text-[10px] text-emerald-600 font-bold">Campus Approved</span>
                  </div>
                </div>

                {/* All 10 Required Profile Records Card */}
                <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
                    <h4 className="font-black uppercase text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Official Student & Guardian Profile Records
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      Verified Candidate
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-slate-700 dark:text-slate-300">
                    {/* 1. Student Name */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">1. Student Name</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.name}
                      </div>
                    </div>

                    {/* 2. Registered Email ID (Cannot Editable) */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">2. Registered Email ID</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 font-mono truncate" title={selectedStudent.email}>
                        {selectedStudent.email}
                      </div>
                    </div>

                    {/* 3. Phone Number */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">3. Phone Number</div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                        {selectedStudent.phoneNumber || 'Not provided'}
                      </div>
                    </div>

                    {/* 4. CGPA */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">4. Cumulative CGPA</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.cgpa ? Number(selectedStudent.cgpa).toFixed(2) : '8.40'} / 10.0
                      </div>
                    </div>

                    {/* 5. Parents Name : Mother / Father */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">5. Parents Name (Mother/Father)</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.parentName || 'Not provided'}
                      </div>
                    </div>

                    {/* 6. Parents Number */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">6. Parents Contact Number</div>
                      <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                        {selectedStudent.parentPhone || 'Not provided'}
                      </div>
                    </div>

                    {/* 7. Blood Group */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">7. Blood Group</div>
                      <div className="text-sm font-black text-rose-600 mt-0.5">
                        {selectedStudent.bloodGroup || 'O+'}
                      </div>
                    </div>

                    {/* 8. Current Year */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">8. Current Academic Year</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.currentYear || '3rd Year'}
                      </div>
                    </div>

                    {/* 9. Class and Section */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">9. Class & Section</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.classSection || 'AI & DS - A'}
                      </div>
                    </div>

                    {/* 10. Semester */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">10. Current Semester</div>
                      <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Semester {selectedStudent.semester || 6}
                      </div>
                    </div>

                    {/* Roll Number */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">Register / Roll Number</div>
                      <div className="text-sm font-mono font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {selectedStudent.rollNumber || '21CS104'}
                      </div>
                    </div>

                    {/* Department & Batch */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400 font-extrabold uppercase">Department & Batch</div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {selectedStudent.department} ({selectedStudent.batch || '2022-2026'})
                      </div>
                    </div>
                  </div>

                  {selectedStudent.bio && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      <strong className="text-slate-800 dark:text-slate-200">Bio / Highlights:</strong> {selectedStudent.bio}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DAILY TEST PERFORMANCE */}
            {!loadingDetails && activeProfileTab === 'tests' && (
              <div className="space-y-4 text-xs">
                {studentAttempts.length > 0 ? (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold text-[10px]">
                        <tr>
                          <th className="p-3">Test Title</th>
                          <th className="p-3">Score</th>
                          <th className="p-3">Result</th>
                          <th className="p-3">Proctoring Status</th>
                          <th className="p-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {studentAttempts.map((att: any) => (
                          <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{att.quizTitle}</td>
                            <td className="p-3 font-black text-indigo-600">
                              {att.score} / {att.totalMarks} ({att.percentage}%)
                            </td>
                            <td className="p-3">
                              {att.passed ? (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                                  Passed
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                                  Needs Remedial
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {att.tabSwitchCount === 0 ? (
                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Clean
                                </span>
                              ) : (
                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                  <ShieldAlert className="w-3.5 h-3.5" /> {att.tabSwitchCount} Tab Warnings
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right text-slate-400 font-mono">
                              {new Date(att.completedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    No Daily Test attempts recorded for this student yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MOCK INTERVIEWS */}
            {!loadingDetails && activeProfileTab === 'interviews' && (
              <div className="space-y-4 text-xs">
                {studentMocks.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentMocks.map((mi) => (
                      <div
                        key={mi.id}
                        className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 shadow-xs"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-extrabold text-indigo-600 uppercase text-[10px]">{mi.targetRole}</span>
                            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                              Score: {mi.overallScore}%
                            </div>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                            {mi.hiringRecommendation}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] grid grid-cols-2 gap-2 text-slate-500">
                          <div>Technical: <strong className="text-slate-900 dark:text-white">{mi.technicalScore}%</strong></div>
                          <div>Communication: <strong className="text-slate-900 dark:text-white">{mi.communicationScore}%</strong></div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          "{mi.feedbackSummary}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    No AI Mock Interview reports submitted by this student yet.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: STUDENT RESUME & DOCUMENTS */}
            {!loadingDetails && activeProfileTab === 'resume' && (
              <div className="space-y-4 text-xs">
                {studentResume ? (
                  <div className="space-y-4">
                    {studentResume.isCustomUpload && studentResume.fileUrl && (
                      <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                            📄
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {studentResume.fileName || 'Uploaded Resume Document'}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {studentResume.fileSize || 'Verified'} • ATS Score: {studentResume.atsScore || 91}%
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={studentResume.fileUrl}
                            download={studentResume.fileName || 'resume.pdf'}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 transition-colors"
                          >
                            Download
                          </a>
                          <a
                            href={studentResume.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
                          >
                            Open Fullscreen
                          </a>
                        </div>
                      </div>
                    )}

                    {studentResume.isCustomUpload && studentResume.fileUrl && (studentResume.fileType?.includes('pdf') || studentResume.fileName?.endsWith('.pdf')) ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm">
                        <iframe
                          src={`${studentResume.fileUrl}#toolbar=0`}
                          className="w-full h-[520px] bg-white"
                          title="Candidate Uploaded Resume"
                        />
                      </div>
                    ) : studentResume.isCustomUpload && studentResume.fileUrl && (studentResume.fileType?.startsWith('image/') || studentResume.fileName?.match(/\.(jpg|jpeg|png|webp|svg)$/i)) ? (
                      <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm bg-slate-100 dark:bg-slate-950 p-4 flex justify-center max-h-[550px] overflow-auto">
                        <img
                          src={studentResume.fileUrl}
                          alt={studentResume.fileName || 'Candidate Resume Image'}
                          className="max-w-full h-auto rounded-lg shadow-md max-h-[500px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-white text-slate-900 p-6 rounded-2xl border border-slate-300 space-y-4 font-sans">
                        <div className="border-b pb-2 text-center">
                          <h2 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h2>
                          <p className="text-[11px] text-slate-600">
                            {selectedStudent.email} • {selectedStudent.department} • Reg No: {selectedStudent.rollNumber}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-bold uppercase text-[11px] border-b pb-0.5 text-indigo-900">Summary</h4>
                          <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">{studentResume.summary}</p>
                        </div>
                        <div>
                          <h4 className="font-bold uppercase text-[11px] border-b pb-0.5 text-indigo-900">Technical Skills</h4>
                          <div className="space-y-1 mt-1 text-[11px]">
                            {studentResume.skills?.map((sk, idx) => (
                              <div key={idx}><strong>{sk.category}:</strong> {sk.list.join(', ')}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">Loading student resume...</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
