'use client';

import React, { useState, useEffect } from 'react';
import { PlacementDrive, User } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  Building2,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  GraduationCap,
  MapPin,
  Clock,
  ArrowLeft,
  Sparkles,
  Users,
  AlertTriangle,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const PRESET_COMPANIES = [
  {
    name: 'Zoho Corporation',
    role: 'Software Development Engineer',
    packageLPA: '9.0',
    minCgpa: '7.0',
    maxBacklogs: '1',
    location: 'Chennai / Tenkasi',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Zoho_Corporation_2023_logo.svg',
    skills: 'C, C++, Java, Data Structures, OOPs'
  },
  {
    name: 'Amazon Web Services (AWS)',
    role: 'Cloud Support Associate',
    packageLPA: '19.5',
    minCgpa: '7.5',
    maxBacklogs: '0',
    location: 'Bengaluru / Hyderabad',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    skills: 'Linux, Networking, Python, AWS, Docker'
  },
  {
    name: 'Google Cloud India',
    role: 'Software Engineer I (SDE-1)',
    packageLPA: '24.5',
    minCgpa: '8.0',
    maxBacklogs: '0',
    location: 'Bengaluru / Hyderabad',
    logo: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    skills: 'DSA, C++, Python, System Design'
  },
  {
    name: 'TCS Digital & Prime',
    role: 'Digital Systems Engineer',
    packageLPA: '9.5',
    minCgpa: '7.0',
    maxBacklogs: '0',
    location: 'Chennai / Bengaluru',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    skills: 'DSA, Python, SQL, Modern Web'
  }
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'AI & Data Science',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering'
];

export default function FacultyCreatePlacementDrivePage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('Zoho Corporation');
  const [roleTitle, setRoleTitle] = useState('Software Development Engineer');
  const [packageLPA, setPackageLPA] = useState('9.0');
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [maxBacklogs, setMaxBacklogs] = useState('0');
  const [location, setLocation] = useState('Chennai / Bengaluru');
  const [driveDate, setDriveDate] = useState('2026-09-30');
  const [deadlineDate, setDeadlineDate] = useState('2026-09-22');
  const [selectedDepts, setSelectedDepts] = useState<string[]>([
    'Computer Science & Engineering',
    'AI & Data Science',
    'Information Technology'
  ]);
  const [requiredSkills, setRequiredSkills] = useState('Data Structures, Algorithms, C++, Python, SQL');
  const [jobDescription, setJobDescription] = useState(
    'Campus recruitment drive for 2026 Batch graduates. Shortlisted candidates will undergo Online Coding Assessment, Technical Interview, and HR evaluation.'
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      const drivesRes = await fetch('/api/placement/drives');
      const drivesData = await drivesRes.json();
      setDrives(drivesData.drives || []);
    } catch (e) {
      console.error('Failed to load placement drives:', e);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: typeof PRESET_COMPANIES[0]) => {
    setCompanyName(preset.name);
    setRoleTitle(preset.role);
    setPackageLPA(preset.packageLPA);
    setMinCgpa(preset.minCgpa);
    setMaxBacklogs(preset.maxBacklogs);
    setLocation(preset.location);
    setRequiredSkills(preset.skills);
  };

  const toggleDept = (dept: string) => {
    if (selectedDepts.includes(dept)) {
      if (selectedDepts.length > 1) {
        setSelectedDepts(selectedDepts.filter((d) => d !== dept));
      }
    } else {
      setSelectedDepts([...selectedDepts, dept]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!companyName.trim() || !roleTitle.trim()) {
      setErrorMsg('Please enter company name and job role title.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(faculty?.id ? { 'x-user-id': faculty.id } : {})
        },
        body: JSON.stringify({
          companyName: companyName.trim(),
          roleTitle: roleTitle.trim(),
          packageLPA: parseFloat(packageLPA) || 10,
          location: location.trim(),
          minCgpa: parseFloat(minCgpa) || 7.0,
          maxBacklogs: parseInt(maxBacklogs) || 0,
          driveDate,
          deadlineDate,
          allowedDepartments: selectedDepts,
          requiredSkills: requiredSkills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          jobDescription: jobDescription.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create placement drive');
      }

      setSuccessMsg(
        `🎉 Placement drive for ${data.drive.companyName} (${data.drive.packageLPA} LPA) successfully created! It is now live on the Student Placement Portal.`
      );
      setDrives([data.drive, ...drives]);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating placement drive.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/faculty"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              <span>Faculty Portal</span>
              <span>•</span>
              <span>Placement Management</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Create Campus Placement Drive
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/placement"
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <ExternalLink className="w-4 h-4 text-indigo-500" />
            <span>View Student Placement View</span>
          </Link>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <Link
            href="/placement"
            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold shrink-0 ml-4 hover:bg-emerald-700"
          >
            Check Live View
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Main Column: Drive Form (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-subtle space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Drive Specification Desk</span>
              </h2>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Batch 2026 Campus Drive
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure company eligibility criteria, salary compensation, and recruitment schedule. Published drives instantly reflect on the student portal.
            </p>
          </div>

          {/* Quick Preset Company Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Autofill Preset
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_COMPANIES.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    companyName === preset.name
                      ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="font-bold truncate">{preset.name}</div>
                  <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-extrabold">{preset.packageLPA} LPA</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row 1: Company Name & Role Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Company / Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Zoho Corporation"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Role Title *
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Software Development Engineer"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 2: CTC Package & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Salary Package (CTC in LPA) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    required
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    placeholder="e.g. 12.5"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Location / Work Mode
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai / Bengaluru / Pan India"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            {/* Row 3: Eligibility (Min CGPA, Max Backlogs) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Minimum Cutoff CGPA</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{minCgpa} CGPA</span>
                </label>
                <select
                  value={minCgpa}
                  onChange={(e) => setMinCgpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="6.0">6.0 CGPA and above</option>
                  <option value="6.5">6.5 CGPA and above</option>
                  <option value="7.0">7.0 CGPA and above</option>
                  <option value="7.5">7.5 CGPA and above</option>
                  <option value="8.0">8.0 CGPA and above</option>
                  <option value="8.5">8.5 CGPA and above</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Max Standing Arrears / Backlogs</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-black">{maxBacklogs} Allowed</span>
                </label>
                <select
                  value={maxBacklogs}
                  onChange={(e) => setMaxBacklogs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="0">0 Backlogs (Strict Zero History)</option>
                  <option value="1">Up to 1 Standing Backlog</option>
                  <option value="2">Up to 2 Standing Backlogs</option>
                  <option value="3">No Backlog Limit</option>
                </select>
              </div>
            </div>

            {/* Row 4: Important Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Drive / Assessment Date *
                </label>
                <input
                  type="date"
                  required
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Application Deadline Date *
                </label>
                <input
                  type="date"
                  required
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Row 5: Allowed Departments */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligible Engineering Departments (Click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((dept) => {
                  const isSelected = selectedDepts.includes(dept);
                  return (
                    <button
                      type="button"
                      key={dept}
                      onClick={() => toggleDept(dept)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 6: Required Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Required Technical Skills (comma separated)
              </label>
              <input
                type="text"
                value={requiredSkills}
                onChange={(e) => setRequiredSkills(e.target.value)}
                placeholder="e.g. C++, Java, Data Structures, Algorithms, SQL"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Row 7: Description & Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Job Description & Round Details
              </label>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Describe roles, online assessment format, interview rounds, and preparation instructions..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing Campus Drive...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Placement Drive</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Published Drives List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Placement Drives ({drives.length})
              </div>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                Live on Portal
              </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {drives.map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 hover-lift transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {d.companyName}
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        {d.roleTitle}
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md shrink-0">
                      ₹{d.packageLPA} LPA
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      Min {d.eligibility?.minCgpa || 7.0} CGPA
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      Max {d.eligibility?.maxBacklogs ?? 0} Backlogs
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      Drive: {d.driveDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
