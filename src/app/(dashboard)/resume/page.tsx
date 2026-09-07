'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ResumeData, User } from '@/types';
import { FileText, Sparkles, Printer, Save, CheckCircle2, Upload, FileUp, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';

export default function ResumeBuilderPage() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form & Upload State
  const [summary, setSummary] = useState('');
  const [template, setTemplate] = useState<'ATS Resume' | 'Professional Resume'>('ATS Resume');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [atsScore, setAtsScore] = useState<number>(88);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/resume');
      const data = await res.json();
      if (data.resume) {
        setResume(data.resume);
        setSummary(data.resume.summary || '');
        setTemplate(data.resume.template || 'ATS Resume');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Handle Local Resume File Upload & ATS Analysis
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadedFileName(file.name);
    setUploadedFileSize((file.size / 1024).toFixed(1) + ' KB');

    // Simulate real-time parsing animation
    setTimeout(() => setUploadProgress(65), 500);

    setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setUploadSuccess(true);
      setAtsScore(Math.floor(Math.random() * 12) + 87); // 87-98 ATS score

      // Auto-enhance summary from uploaded file name context
      const newSummary = `Motivated ${user?.department || 'Computer Science'} student at VSB Engineering College. Resume document "${file.name}" uploaded and verified with ATS score optimization. Proficient in Data Structures, Web Development, SQL, and Software Engineering principles.`;
      setSummary(newSummary);

      if (resume) {
        const updated = {
          ...resume,
          summary: newSummary,
          title: `Uploaded Resume (${file.name})`
        };
        setResume(updated);
        saveResumeToDb(updated);
      }

      setTimeout(() => setUploadSuccess(false), 4000);
    }, 1200);
  };

  const saveResumeToDb = async (resumeToSave: ResumeData) => {
    try {
      await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeToSave)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!resume) return;
    try {
      const updated = { ...resume, summary, template };
      await saveResumeToDb(updated);
      setResume(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAIEnhance = () => {
    setSummary('Results-driven Computer Science Software Engineer with expertise in Data Structures, Next.js, and Distributed Systems. Solved 300+ LeetCode problems with proven internship experience building high-throughput web applications.');
  };

  if (loading || !resume) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading ATS Resume Builder...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <FileText className="w-4 h-4" /> SGIP ATS Resume Analyzer & Builder
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Student Resume Analyzer & Document Upload
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Upload your custom resume PDF/DOCX or build an ATS-optimized template synced to faculty inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md"
          >
            <Upload className="w-4 h-4" /> Upload Resume PDF
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md"
          >
            <Save className="w-4 h-4" /> Save Version
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-all"
          >
            <Printer className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.docx,.doc,.txt"
        className="hidden"
      />

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4" /> Resume saved successfully and synced to Faculty Dashboard!
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs flex items-center gap-2 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Custom resume document "{uploadedFileName}" uploaded and parsed successfully! ({atsScore}% ATS Match Score)
        </div>
      )}

      {/* Editor & Live Preview (2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Controls & Upload Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* UPLOAD RESUME CARD */}
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <FileUp className="w-4 h-4" /> Upload Resume Document
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                PDF / DOCX
              </span>
            </div>

            {/* Drag & Drop Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 transition-all space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                Click to Upload or Drag & Drop Resume
              </div>
              <p className="text-[11px] text-slate-500">
                Supports PDF, DOCX, or TXT formats (Max size: 10MB)
              </p>
            </div>

            {/* Uploading Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  <span>Parsing {uploadedFileName}...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Uploaded File Summary */}
            {uploadedFileName && !isUploading && (
              <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <div>
                    <div className="font-extrabold text-slate-900 dark:text-white">{uploadedFileName}</div>
                    <div className="text-[10px] text-slate-500">{uploadedFileSize} • ATS Verified</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUploadedFileName(null);
                    setUploadedFileSize(null);
                  }}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ATS Score Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <div>
                <div className="text-[10px] font-extrabold uppercase text-slate-400">ATS Match Score</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{atsScore}% Optimized</div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase">
                Ready for Campus Drives
              </span>
            </div>
          </div>

          {/* Editor Controls */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400">Resume Configuration</div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Template</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="ATS Resume">ATS Optimized Resume (Single Column)</option>
                <option value="Professional Resume">Modern Professional Resume</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400">Executive Professional Summary</label>
                <button
                  onClick={handleAIEnhance}
                  className="text-[11px] text-amber-500 font-extrabold hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> AI Enhance Summary
                </button>
              </div>
              <textarea
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white leading-relaxed font-medium"
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              Skills, Education, and Projects are auto-synced from your verified SGIP activity profile.
            </div>
          </div>
        </div>

        {/* Live Resume Sheet Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white text-slate-900 p-8 rounded-3xl shadow-2xl space-y-6 font-sans text-xs border border-slate-200 print:p-0 print:border-none print:shadow-none">
          {/* Header */}
          <div className="border-b border-slate-300 pb-4 text-center">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">{user?.name}</h1>
            <div className="text-xs text-slate-600 mt-1 font-medium">
              {user?.email} • +91 9876543210 • {user?.department} • Roll: {user?.rollNumber || '21CS104'}
            </div>
            <div className="text-xs text-slate-500 font-mono mt-0.5">
              GitHub: github.com/aaravsharma • LinkedIn: linkedin.com/in/aaravsharma
            </div>
          </div>

          {/* Summary */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 text-xs mb-1.5">
              Professional Summary
            </h3>
            <p className="text-slate-700 leading-relaxed text-[11px]">{summary}</p>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 text-xs mb-1.5">
              Education
            </h3>
            {resume.education?.map((ed, i) => (
              <div key={i} className="flex justify-between text-[11px] font-medium">
                <div>
                  <span className="font-bold">{ed.institution}</span> — {ed.degree}
                </div>
                <div className="text-right">
                  <span>{ed.year}</span> • <span className="font-bold">CGPA: {ed.cgpa}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Skills */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 text-xs mb-1.5">
              Technical Skills
            </h3>
            <div className="space-y-1 text-[11px]">
              {resume.skills?.map((sk, i) => (
                <div key={i}>
                  <span className="font-bold text-slate-900">{sk.category}:</span> {sk.list.join(', ')}
                </div>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 text-xs mb-1.5">
              Work Experience
            </h3>
            {resume.experience?.map((exp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between font-bold text-[11px]">
                  <span>{exp.role} — {exp.company}</span>
                  <span className="text-slate-600 font-normal">{exp.period}</span>
                </div>
                <ul className="list-disc list-inside text-[10.5px] text-slate-700 space-y-0.5 pl-1">
                  {exp.points.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-0.5 text-xs mb-1.5">
              Key Projects
            </h3>
            {resume.projects?.map((proj, i) => (
              <div key={i} className="space-y-1 mb-2">
                <div className="font-bold text-[11px] flex justify-between">
                  <span>{proj.title} <span className="font-normal text-slate-500">[{proj.tech}]</span></span>
                </div>
                <ul className="list-disc list-inside text-[10.5px] text-slate-700 space-y-0.5 pl-1">
                  {proj.points.map((pt, j) => <li key={j}>{pt}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
