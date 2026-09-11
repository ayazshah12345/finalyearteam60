'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Award,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Lock,
  Phone,
  Users,
  Heart,
  Calendar,
  Building,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { authFetch, setSessionUser } from '@/lib/client-auth';

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State - 10 Required Fields + Context
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // Read-only / cannot editable
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cgpa, setCgpa] = useState<string>('8.4');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [classSection, setClassSection] = useState('');
  const [semester, setSemester] = useState<number>(6);

  // Additional Academic Fields
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [batch, setBatch] = useState('2022-2026');
  const [backlogs, setBacklogs] = useState<string>('0');
  const [bio, setBio] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/auth/me');
      const data = await res.json();
      if (data.activeUser) {
        const u = data.activeUser;
        setUser(u);
        setName(u.name || '');
        setEmail(u.email || '');
        setRollNumber(u.rollNumber || '');
        setDepartment(u.department || 'AI & Data Science');
        setSemester(u.semester || 6);
        setBatch(u.batch || '2022-2026');
        setCgpa(u.cgpa !== undefined ? String(u.cgpa) : '8.4');
        setBacklogs(u.backlogs !== undefined ? String(u.backlogs) : '0');
        setBio(u.bio || '');

        // Detailed student profile fields
        setPhoneNumber(u.phoneNumber || '');
        setParentName(u.parentName || '');
        setParentPhone(u.parentPhone || '');
        setBloodGroup(u.bloodGroup || 'O+');
        setCurrentYear(u.currentYear || '3rd Year');
        setClassSection(u.classSection || 'AI & DS - A');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const parsedCgpa = parseFloat(cgpa);
    const parsedBacklogs = parseInt(backlogs);

    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setErrorMsg('CGPA must be a valid number between 0.0 and 10.0');
      setSaving(false);
      return;
    }

    if (isNaN(parsedBacklogs) || parsedBacklogs < 0) {
      setErrorMsg('Number of arrears/backlogs cannot be negative');
      setSaving(false);
      return;
    }

    try {
      const res = await authFetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user?.id,
          email: user?.email || email,
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          cgpa: parsedCgpa,
          parentName: parentName.trim(),
          parentPhone: parentPhone.trim(),
          bloodGroup: bloodGroup.trim(),
          currentYear: currentYear.trim(),
          classSection: classSection.trim(),
          semester: semester,
          rollNumber: rollNumber.trim(),
          department: department.trim(),
          batch: batch.trim(),
          backlogs: parsedBacklogs,
          bio: bio.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to update student profile in database.');
      } else {
        if (data.user) {
          setUser(data.user);
          setSessionUser({
            id: data.user.id,
            role: data.user.role,
            name: data.user.name,
            email: data.user.email
          });
        }
        setSuccessMsg('✓ Student profile & guardian details saved directly to college database! All records are synchronized.');
        setTimeout(() => {
          setSuccessMsg(null);
        }, 4000);
      }
    } catch (err: any) {
      setErrorMsg(`Network or server error while saving to database: ${err?.message || ''}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Student Profile Portal...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <UserCheck className="w-4 h-4" /> Student Profile Management
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Student Profile Updation Portal
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Update personal information, guardian details, CGPA, semester, and academic records.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 self-start md:self-auto"
        >
          <span>View Dashboard</span> <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Profile Edit Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        
        {/* Toast Alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile College Logo Header Card (Replacing User Avatar) */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="w-16 h-16 rounded-2xl bg-white p-1.5 border-2 border-amber-400/60 shadow-md flex items-center justify-center shrink-0">
            <img
              src="/vsb-logo.png"
              alt="VSB Engineering College Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">{name || user.name}</div>
            <div className="text-xs text-slate-500 font-mono">
              Roll: <strong>{rollNumber || 'N/A'}</strong> • {department}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-800">
                VSB ENGINEERING COLLEGE
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                STUDENT PERSONA
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-500">
                {classSection ? `${classSection} • ` : ''}{currentYear} • Sem {semester}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          
          {/* SECTION 1: PERSONAL & STUDENT IDENTIFICATION */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <UserCheck className="w-4 h-4" /> 1. Student Identification & Registered Account
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full student name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Email ID (Cannot Editable) */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center justify-between">
                  <span>Registered Email ID</span>
                  <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Cannot editable
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={email}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono cursor-not-allowed select-none"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Registered under your student identity. Managed by college administration.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Phone Number */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" /> Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Roll Number / Student ID */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Roll Number / Student ID</label>
                <input
                  type="text"
                  required
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PARENT / GUARDIAN & MEDICAL DETAILS */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Users className="w-4 h-4" /> 2. Parents Details & Emergency Records
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Parents Name : Mother / Father */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Parents Name : Mother / Father <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. M. Shah (Father) / A. Shah (Mother)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Parents Number */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-indigo-500" /> Parents Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  placeholder="e.g. +91 94433 11223"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> Blood Group <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="A+">A+ (A Positive)</option>
                  <option value="A-">A- (A Negative)</option>
                  <option value="B+">B+ (B Positive)</option>
                  <option value="B-">B- (B Negative)</option>
                  <option value="O+">O+ (O Positive)</option>
                  <option value="O-">O- (O Negative)</option>
                  <option value="AB+">AB+ (AB Positive)</option>
                  <option value="AB-">AB- (AB Negative)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: ACADEMIC BATCH, CLASS, YEAR & SEMESTER */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <GraduationCap className="w-4 h-4" /> 3. Class, Year & Semester Enrollment
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Current Year */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Current Year <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={currentYear}
                  onChange={(e) => setCurrentYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior / Final Year)</option>
                </select>
              </div>

              {/* Class and Section */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Class and Section <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  placeholder="e.g. AI & DS - Section A"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Batch Year */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Batch Year</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  placeholder="2022-2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: CGPA & ARREARS RECORD */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Award className="w-4 h-4" /> 4. Academic Performance — CGPA & Arrears Record
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CGPA Input Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" /> Cumulative CGPA Score (out of 10.0) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.0"
                  max="10.0"
                  required
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-600 text-slate-900 dark:text-white text-lg font-black tracking-tight focus:outline-none focus:border-indigo-600"
                />
                <div className="text-[11px] text-slate-500 font-medium">
                  Used by SGIP Automated Placement Rules to check Tier-1 drive eligibility.
                </div>
              </div>

              {/* Arrears Input Box */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-800/80 border border-amber-100 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> Number of Active Arrears (Backlogs)
                </label>
                <input
                  type="number"
                  min="0"
                  max="15"
                  required
                  value={backlogs}
                  onChange={(e) => setBacklogs(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-600 text-slate-900 dark:text-white text-lg font-black tracking-tight focus:outline-none focus:border-amber-600"
                />
                <div className="text-[11px] text-slate-500 font-medium">
                  Set to <strong>0</strong> if all backlogs are cleared. Visible to faculty & recruiters.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: BIO / HIGHLIGHTS */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> 5. Bio & Career Goal
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Student Bio / Highlights</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Aspiring AI Engineer with experience in Python, Full Stack Development, and Data Structures..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update Student Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
