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
  Camera,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function StudentProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState<number>(6);
  const [batch, setBatch] = useState('2022-2026');
  const [cgpa, setCgpa] = useState<string>('8.4');
  const [backlogs, setBacklogs] = useState<string>('0');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.activeUser) {
        const u = data.activeUser;
        setUser(u);
        setName(u.name || '');
        setRollNumber(u.rollNumber || '');
        setDepartment(u.department || 'Computer Science & Engineering');
        setSemester(u.semester || 6);
        setBatch(u.batch || '2022-2026');
        setCgpa(u.cgpa !== undefined ? String(u.cgpa) : '8.4');
        setBacklogs(u.backlogs !== undefined ? String(u.backlogs) : '0');
        setBio(u.bio || '');
        setAvatarUrl(u.avatarUrl || '');
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
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          rollNumber,
          department,
          semester,
          batch,
          cgpa: parsedCgpa,
          backlogs: parsedBacklogs,
          bio,
          avatarUrl
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to update student profile.');
      } else {
        setUser(data.user);
        setSuccessMsg('Profile & Academic Record updated successfully! Changes reflected across SGIP dashboard.');
        // Refresh page session
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Student Profile Settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <UserCheck className="w-4 h-4" /> Student Profile Management
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Update Student Profile & Academic Record
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Update your personal information, CGPA score, number of arrears, and department details.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-all flex items-center gap-1.5 self-start md:self-auto"
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

        {/* Profile Avatar Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <img
            src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80'}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/40 shadow-sm shrink-0"
          />
          <div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">{name}</div>
            <div className="text-xs text-slate-500 font-mono">Roll: {rollNumber} • {department}</div>
            <span className="inline-block mt-1 text-[10px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
              {user.role} Persona
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <UserCheck className="w-4 h-4" /> Personal & Student Identification
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Current Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Batch Year</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: CGPA & Arrears (Backlogs) Record */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <GraduationCap className="w-4 h-4" /> Academic Performance — CGPA & Arrears Record
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CGPA Input Box */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-2">
                <label className="block text-xs font-extrabold text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" /> Cumulative CGPA Score (out of 10.0)
                </label>
                <input
                  type="number"
                  step="0.1"
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
                  Set to <strong>0</strong> if all backlogs are cleared. Impact on drive eligibility updates live.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Bio & Avatar */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Student Bio & Profile Image
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Bio / Career Goal</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Aspiring Full Stack Engineer & Competitive Programmer..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Profile...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Updated Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
