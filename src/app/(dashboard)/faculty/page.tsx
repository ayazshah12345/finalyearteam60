'use client';

import React, { useState, useEffect } from 'react';
import { User, QuizAttempt, MockInterviewSession, ResumeData } from '@/types';
import {
  Users,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  GraduationCap,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  FileText,
  UserCheck,
  Building2,
  ChevronRight,
  Zap,
  Eye,
  ShieldCheck,
  Plus,
  X,
  Check,
  Mic,
  Bot,
  Layers,
  FileCode,
  Briefcase,
  Code2,
  CheckSquare,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/client-auth';

export default function FacultyPortalPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterviewSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [allCodingProfiles, setAllCodingProfiles] = useState<any[]>([]);
  const [allCodingSubmissions, setAllCodingSubmissions] = useState<any[]>([]);

  // Selected Tab: 'roster' | 'mock_interviews' | 'daily_tests' | 'drives' | 'leetcode'
  const [activeTab, setActiveTab] = useState<'roster' | 'mock_interviews' | 'daily_tests' | 'drives' | 'leetcode'>('roster');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterCgpa, setFilterCgpa] = useState('ALL');

  // Modal 1: Inspect Student Record (with Reports & Resume view)
  const [inspectStudent, setInspectStudent] = useState<any | null>(null);
  const [inspectTab, setInspectTab] = useState<'daily_test' | 'mock_interview' | 'resume' | 'leetcode'>('daily_test');
  const [studentResume, setStudentResume] = useState<ResumeData | null>(null);
  const [studentMockHistory, setStudentMockHistory] = useState<MockInterviewSession[]>([]);
  const [studentTestAttempts, setStudentTestAttempts] = useState<QuizAttempt[]>([]);
  const [studentCodingProfile, setStudentCodingProfile] = useState<any | null>(null);
  const [studentCodingSubmissions, setStudentCodingSubmissions] = useState<any[]>([]);

  // Modal 2: Create Placement Drive Modal
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [packageLPA, setPackageLPA] = useState('14.5');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [driveDate, setDriveDate] = useState('2026-09-25');
  const [requiredSkills, setRequiredSkills] = useState('Data Structures, Python, SQL, Web Development');
  const [jobDescription, setJobDescription] = useState('Software Engineering Campus Recruitment Drive for B.E/B.Tech Batch 2026.');
  const [creatingDrive, setCreatingDrive] = useState(false);
  const [driveSuccessMsg, setDriveSuccessMsg] = useState<string | null>(null);

  // Modal 3: View Mock Interview Transcript
  const [selectedInterviewTranscript, setSelectedInterviewTranscript] = useState<MockInterviewSession | null>(null);

  useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
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

      // 3. Get All Mock Interviews
      const miRes = await authFetch('/api/interview/history');
      if (miRes.ok) {
        const miData = await miRes.json();
        setMockInterviews(miData.interviews || []);
      }

      // 4. Get All Placement Drives
      const driveRes = await authFetch('/api/placement/drives');
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setDrives(driveData.drives || []);
      }

      // 5. Get All Student Daily Test Attempts
      const quizRes = await authFetch('/api/quizzes/attempts?studentId=ALL');
      if (quizRes.ok) {
        const quizData = await quizRes.json();
        setAttempts(quizData.attempts || []);
      }

      // 6. Get All Student LeetCode Coding Profiles & Submissions
      const codingRes = await authFetch('/api/coding?view=all');
      if (codingRes.ok) {
        const codingData = await codingRes.json();
        setAllCodingProfiles(codingData.allProfiles || []);
        setAllCodingSubmissions(codingData.allSubmissions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Inspect Student Details & Fetch Resume / Tests / Interviews / LeetCode
  const handleInspectStudent = async (st: any) => {
    setInspectStudent(st);
    setInspectTab('daily_test');
    setStudentResume(null);

    // Filter student test attempts
    const studentAtts = attempts.filter(att => att.studentId === st.studentId || att.studentName.toLowerCase().includes(st.name.toLowerCase()));
    setStudentTestAttempts(studentAtts);

    // Filter student mock interviews
    const studentMocks = mockInterviews.filter(mi => mi.studentId === st.studentId || mi.studentName.toLowerCase().includes(st.name.toLowerCase()));
    setStudentMockHistory(studentMocks);

    // Filter student coding profile & submissions
    const stProfile = allCodingProfiles.find(cp => cp.studentId === st.studentId || cp.studentId === st.id);
    setStudentCodingProfile(stProfile || null);

    const stSubmissions = allCodingSubmissions.filter(cs => cs.studentId === st.studentId || cs.studentName?.toLowerCase().includes(st.name.toLowerCase()));
    setStudentCodingSubmissions(stSubmissions);

    // Fetch Student Resume
    try {
      const studentIdToFetch = st.studentId || st.id;
      const resRes = await fetch(`/api/resume?studentId=${studentIdToFetch}`);
      if (resRes.ok) {
        const resData = await resRes.json();
        setStudentResume(resData.resume || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create & Post New Placement Drive
  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !roleTitle.trim()) return;

    setCreatingDrive(true);
    setDriveSuccessMsg(null);

    try {
      const res = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          roleTitle,
          packageLPA,
          minCgpa,
          maxBacklogs,
          driveDate,
          requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
          jobDescription
        })
      });

      const data = await res.json();
      if (res.ok && data.drive) {
        setDrives(prev => [data.drive, ...prev]);
        setDriveSuccessMsg(`✅ Placement drive for ${companyName} (${packageLPA} LPA) created & published to Student Dashboard!`);
        setTimeout(() => {
          setShowDriveModal(false);
          setDriveSuccessMsg(null);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingDrive(false);
    }
  };

  // Filter Students by Reg No / Roll No, Name, and Dept
  const filteredStudents = students.filter(st => {
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
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading VSB Faculty Desk & Student Performance Intelligence...</span>
      </div>
    );
  }

  if (faculty?.role === 'STUDENT') {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl mt-8">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            ⛔ Access Denied — Faculty Privileges Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            Your account (<strong className="text-slate-900 dark:text-white">{faculty.name}</strong>) is a <strong>Student Account</strong>. Students are strictly restricted to their own student portal and cannot access faculty desks.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/dashboard"
            className="inline-block px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all"
          >
            Return to My Student Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> VSB Engineering College • Faculty & Placement Desk
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Faculty Command Desk & Student Performance Roster
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Search students by Register Number / Roll No, evaluate Daily Test & Voice Mock Interview reports, inspect candidate resumes, and publish corporate placement drives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/faculty/students"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              <Users className="w-4 h-4" /> Student Profiles
            </Link>
            <Link
              href="/faculty/courses"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 border border-indigo-400/30"
            >
              <BookOpen className="w-4 h-4 text-indigo-200" /> Add Technical Course
            </Link>
            <Link
              href="/faculty/drives"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 font-bold"
            >
              <Plus className="w-4 h-4" /> Create Placement Drive
            </Link>
            <Link
              href="/faculty/test"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 border border-indigo-400/30"
            >
              <CheckSquare className="w-4 h-4 text-indigo-200" /> Test Desk
            </Link>
          </div>
        </div>
      </div>

      {/* Top Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Total Student Roster</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{students.length}</div>
          <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">Active VSB Batch</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">AI Mock Interviews</span>
            <Mic className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{mockInterviews.length}</div>
          <span className="text-[10px] text-emerald-600 font-extrabold bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-200 mt-1 inline-block">Tech & Comm Marks</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Daily Tests Completed</span>
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{attempts.length}</div>
          <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 mt-1 inline-block">Proctored Attempts</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm hover-lift">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-extrabold uppercase">Active Placement Drives</span>
            <Building2 className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-3xl font-black text-violet-600 mt-2">{drives.length}</div>
          <span className="text-[10px] text-amber-600 font-extrabold bg-amber-50 dark:bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-200 mt-1 inline-block">Live Company Drives</span>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto whitespace-nowrap max-w-full">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'roster'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Profiles ({filteredStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mock_interviews')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'mock_interviews'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>AI Mock Interview Reports ({mockInterviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('daily_tests')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'daily_tests'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Daily Test Scores & Proctoring Logs ({attempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'drives'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Placement Drives ({drives.length})</span>
        </button>

        <Link
          href="/faculty/test"
          className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <CheckSquare className="w-4 h-4 text-indigo-500 group-hover:text-white" />
          <span>Manage Tests</span>
        </Link>
      </div>

      {/* TAB 1: STUDENT ROSTER & REGNO SEARCH */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Search Box & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Register Number / Roll No Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search student by Register Number / Roll No (e.g. 21CS104), Name, or Department..."
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
              Found <strong className="text-indigo-600 dark:text-indigo-400 font-extrabold">{filteredStudents.length}</strong> matching student record(s)
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase font-extrabold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Student Info & Reg No</th>
                    <th className="p-4">Department & Batch</th>
                    <th className="p-4">CGPA & Arrears</th>
                    <th className="p-4">Daily Test Score</th>
                    <th className="p-4">Mock Interview Mark</th>
                    <th className="p-4 text-right">Student Record & Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {filteredStudents.map((st: any) => {
                    const studentMocks = mockInterviews.filter(mi => mi.studentId === st.studentId || mi.studentName.toLowerCase().includes(st.name.toLowerCase()));
                    const latestMock = studentMocks[0];

                    return (
                      <tr key={st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Info & RegNo */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                              {st.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-sm">
                                {st.name}
                              </div>
                              <div className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                                Reg No / Roll: {st.rollNumber || '21CS104'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Dept */}
                        <td className="p-4">
                          <div className="font-extrabold text-slate-900 dark:text-white">{st.department}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Semester {st.semester || 6}</div>
                        </td>

                        {/* CGPA */}
                        <td className="p-4">
                          <div className="font-black text-slate-900 dark:text-white text-sm">{st.cgpa ? st.cgpa.toFixed(1) : '8.4'} / 10.0</div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block mt-0.5 ${
                            (st.backlogs || 0) === 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {(st.backlogs || 0) === 0 ? '0 Backlogs' : `${st.backlogs} Arrears`}
                          </span>
                        </td>

                        {/* Daily Test */}
                        <td className="p-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {st.testPerformance?.totalTestsAttended || 0} Tests Attended
                          </div>
                          <div className="text-[11px] font-semibold text-amber-600">
                            Avg: {st.testPerformance?.avgScorePercent || 0}%
                          </div>
                        </td>

                        {/* Mock Interview */}
                        <td className="p-4">
                          {latestMock ? (
                            <div>
                              <div className="font-black text-indigo-600 dark:text-indigo-400">
                                Overall: {latestMock.overallScore}%
                              </div>
                              <div className="text-[10px] font-semibold text-emerald-600">
                                Tech: {latestMock.technicalScore}% • Comm: {latestMock.communicationScore}%
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not attempted yet</span>
                          )}
                        </td>

                        {/* View Student Profile Action */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleInspectStudent(st)}
                            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all inline-flex items-center gap-1.5 active:scale-95"
                          >
                            <Eye className="w-4 h-4" /> View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI VOICE MOCK INTERVIEW REPORTS */}
      {activeTab === 'mock_interviews' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-500" /> Student AI Mock Interview Performance Reports ({mockInterviews.length}):
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Student Name & Reg No</th>
                    <th className="p-3.5">Target Role</th>
                    <th className="p-3.5">Overall Score</th>
                    <th className="p-3.5">Technical Skill Mark</th>
                    <th className="p-3.5">Communication Mark</th>
                    <th className="p-3.5">Recommendation</th>
                    <th className="p-3.5 text-right">Transcript</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {mockInterviews.map((mi) => (
                    <tr key={mi.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                        <div>{mi.studentName}</div>
                        <div className="text-[10px] font-mono text-indigo-600">Roll: {mi.studentRollNumber}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{mi.targetRole}</td>
                      <td className="p-3.5 font-black text-indigo-600 text-sm">{mi.overallScore}%</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black">
                          🛠️ {mi.technicalScore}/100
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black">
                          🗣️ {mi.communicationScore}/100
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          mi.hiringRecommendation === 'Strong Hire' ? 'bg-emerald-100 text-emerald-700' :
                          mi.hiringRecommendation === 'Hire' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          ⭐ {mi.hiringRecommendation}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedInterviewTranscript(mi)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Transcript
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DAILY TEST SCORES & PROCTORING AUDIT */}
      {activeTab === 'daily_tests' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Student Daily Test Attempts & Malpractice Audit Log ({attempts.length}):
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Test Module Title</th>
                    <th className="p-3.5">Score Achieved</th>
                    <th className="p-3.5">Percentage</th>
                    <th className="p-3.5">Pass/Fail Status</th>
                    <th className="p-3.5">Proctoring Integrity</th>
                    <th className="p-3.5 text-right">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  {attempts.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{att.studentName}</td>
                      <td className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">{att.quizTitle}</td>
                      <td className="p-3.5 font-extrabold">{att.score} / {att.totalMarks} Marks</td>
                      <td className="p-3.5 font-black text-sm">{att.percentage}%</td>
                      <td className="p-3.5">
                        {att.terminated ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase">
                            🚫 Terminated (Cheating)
                          </span>
                        ) : att.passed ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                            🎉 Passed
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                            Needs Remedial
                          </span>
                        )}
                      </td>
                      <td className="p-3.5">
                        {att.tabSwitchCount === 0 ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 100% Clean
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> {att.tabSwitchCount} Warnings
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">
                        {new Date(att.completedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PLACEMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Active Campus Placement Drives ({drives.length} Drives):
            </h3>
            <button
              onClick={() => setShowDriveModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Placement Drive
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drives.map((drv) => (
              <div
                key={drv.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{drv.companyName}</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{drv.roleTitle}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                    💰 {drv.packageLPA} LPA
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {drv.jobDescription}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] grid grid-cols-2 gap-2 text-slate-500 font-semibold">
                  <div>Min CGPA: <strong className="text-slate-900 dark:text-white">{drv.eligibility?.minCgpa || 7.5}</strong></div>
                  <div>Max Arrears: <strong className="text-slate-900 dark:text-white">{drv.eligibility?.maxBacklogs || 0}</strong></div>
                  <div>Drive Date: <strong className="text-indigo-600">{drv.driveDate || '2026-09-25'}</strong></div>
                  <div>Location: <strong className="text-slate-900 dark:text-white">{drv.location || 'Pan India'}</strong></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* MODAL 1: INSPECT STUDENT RECORD & REPORTS & RESUME */}
      {inspectStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {inspectStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {inspectStudent.name}
                  </h3>
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-extrabold">
                    Reg No / Roll Number: {inspectStudent.rollNumber || '21CS104'} • {inspectStudent.department}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold hover:bg-slate-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal Internal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <button
                onClick={() => setInspectTab('daily_test')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  inspectTab === 'daily_test' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5" /> Daily Test Reports ({studentTestAttempts.length})
              </button>

              <button
                onClick={() => setInspectTab('mock_interview')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  inspectTab === 'mock_interview' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Mic className="w-3.5 h-3.5" /> Voice Mock Interview Reports ({studentMockHistory.length})
              </button>

              <button
                onClick={() => setInspectTab('resume')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  inspectTab === 'resume' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Candidate ATS Resume
              </button>


            </div>

            {/* MODAL TAB 1: DAILY TEST REPORT */}
            {inspectTab === 'daily_test' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 font-bold">Total Tests Attended</div>
                    <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{studentTestAttempts.length}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 font-bold">Passed Tests</div>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">{studentTestAttempts.filter(a => a.passed).length}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="text-slate-400 font-bold">Malpractice Warnings</div>
                    <div className="text-xl font-black text-rose-600 mt-0.5">
                      {studentTestAttempts.reduce((acc, a) => acc + (a.tabSwitchCount || 0), 0)} Strikes
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {studentTestAttempts.map(att => (
                    <div key={att.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-slate-900 dark:text-white">{att.quizTitle}</div>
                        <div className="text-[10px] text-slate-500 font-mono">Date: {new Date(att.completedAt).toLocaleDateString()} • Time Spent: {att.timeSpentSeconds}s</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-indigo-600">{att.score}/{att.totalMarks} ({att.percentage}%)</div>
                        <span className={`text-[10px] font-bold ${att.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {att.terminated ? '🚫 Terminated' : att.passed ? 'Passed' : 'Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {studentTestAttempts.length === 0 && <div className="text-slate-400 text-center py-4">No daily test attempts recorded yet.</div>}
                </div>
              </div>
            )}

            {/* MODAL TAB 2: MOCK INTERVIEW REPORT */}
            {inspectTab === 'mock_interview' && (
              <div className="space-y-4 text-xs">
                {studentMockHistory.map(mi => (
                  <div key={mi.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-indigo-600 text-sm">{mi.targetRole}</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-black">{mi.overallScore}% Overall</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2.5 rounded-xl bg-indigo-950 text-indigo-300 font-extrabold border border-indigo-800">
                        🛠️ Tech Mark: {mi.technicalScore}/100
                      </div>
                      <div className="p-2.5 rounded-xl bg-emerald-950 text-emerald-300 font-extrabold border border-emerald-800">
                        🗣️ Comm Mark: {mi.communicationScore}/100
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                      Summary: {mi.feedbackSummary}
                    </div>
                  </div>
                ))}
                {studentMockHistory.length === 0 && <div className="text-slate-400 text-center py-4">No AI mock interview sessions completed yet.</div>}
              </div>
            )}

            {/* MODAL TAB 3: CANDIDATE ATS RESUME */}
            {inspectTab === 'resume' && (
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
                              {studentResume.fileSize || 'Verified'} • ATS Match Score: {studentResume.atsScore || 91}%
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
                          <h2 className="text-xl font-bold text-slate-900">{inspectStudent.name}</h2>
                          <p className="text-[11px] text-slate-600">{inspectStudent.email} • {inspectStudent.department} • Reg No: {inspectStudent.rollNumber}</p>
                        </div>

                        <div>
                          <h4 className="font-bold uppercase text-[11px] border-b pb-0.5 text-indigo-900">Executive Summary</h4>
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

                        <div>
                          <h4 className="font-bold uppercase text-[11px] border-b pb-0.5 text-indigo-900">Projects</h4>
                          {studentResume.projects?.map((pj, idx) => (
                            <div key={idx} className="mt-1 text-[11px]">
                              <strong>{pj.title}</strong> [{pj.tech}]
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-center py-4">Loading candidate resume...</div>
                )}
              </div>
            )}


          </div>
        </div>
      )}

      {/* MODAL 2: CREATE PLACEMENT DRIVE MODAL */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-extrabold text-sm">
                <Building2 className="w-5 h-5" /> Create Campus Placement Drive
              </div>
              <button onClick={() => setShowDriveModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            {driveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {driveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google Cloud India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Job Role Title</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="e.g. Software Development Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Package (LPA)</label>
                  <input
                    type="text"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    placeholder="14.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Min CGPA Cutoff</label>
                  <input
                    type="text"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    placeholder="7.5"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Max Backlogs</label>
                  <input
                    type="text"
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Drive Date</label>
                <input
                  type="date"
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Required Skills (Comma-separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="Python, Data Structures, SQL, System Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Job Description & Details</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDriveModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDrive}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black uppercase tracking-wider shadow-md transition-all"
                >
                  {creatingDrive ? 'Publishing...' : 'Publish Placement Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW MOCK INTERVIEW TRANSCRIPT */}
      {selectedInterviewTranscript && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Mock Interview Transcript — {selectedInterviewTranscript.studentName}
                </h3>
                <div className="text-xs text-indigo-600 font-mono font-bold">
                  Role: {selectedInterviewTranscript.targetRole} • Overall Score: {selectedInterviewTranscript.overallScore}%
                </div>
              </div>
              <button onClick={() => setSelectedInterviewTranscript(null)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              {selectedInterviewTranscript.transcript?.map((item) => (
                <div key={item.round} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex justify-between font-bold text-indigo-600">
                    <span>{item.roundTitle}</span>
                    <span>Tech: {item.technicalMark || item.score}% | Comm: {item.communicationMark || item.score}%</span>
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-white">Q: "{item.question}"</div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-slate-700 dark:text-slate-300 font-mono">
                    A: {item.studentAnswer}
                  </div>
                  <div className="text-emerald-600 font-bold text-[11px]">Feedback: {item.feedback}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
