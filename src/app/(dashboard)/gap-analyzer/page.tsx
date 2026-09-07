'use client';

import React, { useState, useEffect } from 'react';
import { User, MockInterviewSession, ResumeData } from '@/types';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Mic,
  Award,
  Building2,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  Sliders,
  Layers,
  Check,
  XCircle,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function GapAnalyzerPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [lastInterview, setLastInterview] = useState<MockInterviewSession | null>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCompany, setSelectedCompany] = useState('Google');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const resRes = await fetch('/api/resume');
      if (resRes.ok) {
        const resData = await resRes.json();
        setResume(resData.resume);
      }

      const histRes = await fetch('/api/interview/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        if (histData.interviews && histData.interviews.length > 0) {
          setLastInterview(histData.interviews[0]);
        }
      }

      const drivesRes = await fetch('/api/placement/drives');
      if (drivesRes.ok) {
        const drivesData = await drivesRes.json();
        setDrives(drivesData.drives || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading VSB Inch-by-Inch Skill & Placement Gap Analyzer...</span>
      </div>
    );
  }

  const studentCgpa = user.cgpa ?? 8.4;
  const studentBacklogs = user.backlogs ?? 0;
  const techMark = lastInterview?.technicalScore || 82;
  const commMark = lastInterview?.communicationScore || 85;
  const atsScore = (resume as any)?.atsScore || 88;

  // Target Corporate Benchmarks
  const companyBenchmarks: Record<string, { minCgpa: number; maxArrears: number; reqTech: number; reqComm: number; reqAts: number; package: string; color: string; requiredSkills: string[] }> = {
    Google: { minCgpa: 8.5, maxArrears: 0, reqTech: 88, reqComm: 85, reqAts: 85, package: '28 LPA', color: 'from-blue-600 to-indigo-600', requiredSkills: ['Advanced DSA', 'System Architecture', 'Python/C++', 'Dynamic Programming'] },
    Microsoft: { minCgpa: 8.0, maxArrears: 0, reqTech: 85, reqComm: 82, reqAts: 80, package: '24 LPA', color: 'from-cyan-600 to-blue-600', requiredSkills: ['Data Structures', 'OOPs Principles', 'SQL Databases', 'System Design'] },
    Amazon: { minCgpa: 7.5, maxArrears: 1, reqTech: 82, reqComm: 80, reqAts: 78, package: '18.5 LPA', color: 'from-amber-600 to-orange-600', requiredSkills: ['Problem Solving', 'Data Structures', 'Web Development', 'Behavioral STAR'] },
    Zoho: { minCgpa: 7.5, maxArrears: 0, reqTech: 80, reqComm: 78, reqAts: 75, package: '12 LPA', color: 'from-emerald-600 to-teal-600', requiredSkills: ['C/C++ Programming', 'Data Structures', 'Logic Rounds', 'DBMS'] },
    'TCS Digital': { minCgpa: 7.0, maxArrears: 1, reqTech: 75, reqComm: 75, reqAts: 70, package: '7.5 LPA', color: 'from-violet-600 to-purple-600', requiredSkills: ['Aptitude', 'Basic Python/Java', 'SQL Queries', 'Communication'] }
  };

  const target = companyBenchmarks[selectedCompany] || companyBenchmarks['Google'];

  // Calculate Gaps Inch-by-Inch
  const cgpaGap = Math.max(0, parseFloat((target.minCgpa - studentCgpa).toFixed(2)));
  const arrearsGap = studentBacklogs > target.maxArrears ? studentBacklogs - target.maxArrears : 0;
  const techGap = Math.max(0, target.reqTech - techMark);
  const commGap = Math.max(0, target.reqComm - commMark);
  const atsGap = Math.max(0, target.reqAts - atsScore);

  // Overall Readiness Percentage
  const computeReadiness = (bench: typeof target) => {
    let score = 0;
    if (studentCgpa >= bench.minCgpa) score += 25; else score += Math.max(0, (studentCgpa / bench.minCgpa) * 25);
    if (studentBacklogs <= bench.maxArrears) score += 25; else score += 10;
    if (techMark >= bench.reqTech) score += 20; else score += (techMark / bench.reqTech) * 20;
    if (commMark >= bench.reqComm) score += 15; else score += (commMark / bench.reqComm) * 15;
    if (atsScore >= bench.reqAts) score += 15; else score += (atsScore / bench.reqAts) * 15;
    return Math.min(100, Math.round(score));
  };

  const currentReadiness = computeReadiness(target);
  const totalGapsCount = (cgpaGap > 0 ? 1 : 0) + (arrearsGap > 0 ? 1 : 0) + (techGap > 0 ? 1 : 0) + (commGap > 0 ? 1 : 0) + (atsGap > 0 ? 1 : 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <TrendingUp className="w-4 h-4 text-amber-400" /> VSB Intelligence • Inch-by-Inch Placement Gap Analyzer
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Granular Inch-by-Inch Skill Deficit & Visual Analytics
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Analyze your CGPA, arrears, technical marks, communication speech fluency, and ATS resume metrics inch by inch against corporate standards using multi-vector charts.
            </p>
          </div>

          {/* Company Target Selector */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 p-2.5 rounded-2xl shadow-md shrink-0">
            <Target className="w-4 h-4 text-amber-400 ml-1" />
            <span className="text-xs font-bold text-slate-300 uppercase">Target Corporate Drive:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 font-extrabold text-xs text-white border border-slate-700 focus:outline-none focus:border-indigo-500"
            >
              {Object.keys(companyBenchmarks).map((comp) => (
                <option key={comp} value={comp}>
                  {comp} ({companyBenchmarks[comp].package})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Top 3 Metric Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-2">
          <div className="text-xs font-extrabold text-slate-400 uppercase">Target Corporate Cutoff</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
            <span>{selectedCompany}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 font-mono font-extrabold">{target.package}</span>
          </div>
          <div className="text-xs text-slate-500 font-semibold">Min CGPA: <strong className="text-indigo-600">{target.minCgpa}</strong> • Max Arrears: <strong className="text-amber-600">{target.maxArrears}</strong></div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-2">
          <div className="text-xs font-extrabold text-slate-400 uppercase">Your Candidate Record</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-between">
            <span>{user.name}</span>
            <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-mono font-extrabold">{studentCgpa} CGPA</span>
          </div>
          <div className="text-xs text-slate-500 font-semibold">Active Arrears: <strong className={studentBacklogs > 0 ? 'text-rose-500' : 'text-emerald-500'}>{studentBacklogs}</strong></div>
        </div>

        <div className={`border rounded-3xl p-6 shadow-md space-y-2 ${currentReadiness >= 85 ? 'bg-emerald-950/40 border-emerald-800/80' : 'bg-amber-950/40 border-amber-800/80'}`}>
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Overall Readiness Index</div>
          <div className="text-3xl font-black text-white flex items-center justify-between">
            <span>{currentReadiness}% Match</span>
            <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-white/10">{totalGapsCount} Deficit(s)</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            {currentReadiness >= 85 ? '🎉 Excellent! You are fully qualified for this placement drive.' : `⚠️ Bridge ${totalGapsCount} identified deficit vector(s) to guarantee selection.`}
          </p>
        </div>
      </div>

      {/* GRAPH REPRESENTATION 1: CORPORATE READINESS COMPARISON BAR GRAPH */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" /> GRAPH 1: Corporate Placement Readiness Comparison Chart
          </h3>
          <span className="text-xs text-slate-400 font-medium">Evaluated across all Tier-1 & Tier-2 corporate benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.keys(companyBenchmarks).map((compKey) => {
            const bench = companyBenchmarks[compKey];
            const matchPercent = computeReadiness(bench);
            const isSelected = compKey === selectedCompany;

            return (
              <div
                key={compKey}
                onClick={() => setSelectedCompany(compKey)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 shadow-md scale-105'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{compKey}</span>
                  <span className="text-[10px] font-mono font-extrabold text-indigo-600 dark:text-indigo-400">{bench.package}</span>
                </div>

                <div className="h-32 flex items-end justify-center py-2 bg-white dark:bg-slate-900 rounded-xl p-2 border border-slate-200 dark:border-slate-800 relative">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t ${bench.color}`}
                    style={{ height: `${matchPercent}%` }}
                  ></div>
                  <span className="absolute bottom-2 font-black text-xs text-white drop-shadow-md">{matchPercent}%</span>
                </div>

                <div className="text-[10px] text-center font-extrabold text-slate-500">
                  {matchPercent >= 85 ? '✅ High Match' : matchPercent >= 70 ? '⚡ Moderate' : '⚠️ Action Needed'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* GRAPH REPRESENTATION 2: MULTI-VECTOR RADAR & GAUGE PROGRESS BARS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-500" /> GRAPH 2: Multi-Vector Skill & Academic Threshold Meters ({selectedCompany})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vector 1: Technical Skill Mark */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-500" /> 1. Technical Skill Mark
              </span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{techMark} / {target.reqTech} Req</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (techMark / target.reqTech) * 100)}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex justify-between">
              <span>{techGap === 0 ? '✅ Benchmark Achieved' : `⚠️ Deficit: -${techGap} Marks`}</span>
              <span>Cutoff: {target.reqTech}%</span>
            </div>
          </div>

          {/* Vector 2: Communication Speech Mark */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-500" /> 2. Communication Skill Mark
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{commMark} / {target.reqComm} Req</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (commMark / target.reqComm) * 100)}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex justify-between">
              <span>{commGap === 0 ? '✅ Benchmark Achieved' : `⚠️ Deficit: -${commGap} Marks`}</span>
              <span>Cutoff: {target.reqComm}%</span>
            </div>
          </div>

          {/* Vector 3: ATS Resume Score */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" /> 3. ATS Resume Match Score
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{atsScore}% / {target.reqAts}% Req</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (atsScore / target.reqAts) * 100)}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex justify-between">
              <span>{atsGap === 0 ? '✅ Benchmark Achieved' : `⚠️ Deficit: -${atsGap}% ATS Points`}</span>
              <span>Cutoff: {target.reqAts}%</span>
            </div>
          </div>

          {/* Vector 4: Academic CGPA */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-violet-500" /> 4. Academic CGPA Threshold
              </span>
              <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{studentCgpa} / {target.minCgpa} Min</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div className="bg-violet-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (studentCgpa / target.minCgpa) * 100)}%` }}></div>
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex justify-between">
              <span>{cgpaGap === 0 ? '✅ CGPA Threshold Satisfied' : `⚠️ Deficit: -${cgpaGap} CGPA`}</span>
              <span>Cutoff: {target.minCgpa}</span>
            </div>
          </div>
        </div>
      </div>

      {/* INCH-BY-INCH DETAILED VECTOR BREAKDOWN TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Inch-by-Inch Metric Deficit & Remedial Action Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
              <tr>
                <th className="p-3.5">Vector Metric</th>
                <th className="p-3.5">Your Metric</th>
                <th className="p-3.5">{selectedCompany} Cutoff</th>
                <th className="p-3.5">Inch-by-Inch Gap</th>
                <th className="p-3.5">Readiness Status</th>
                <th className="p-3.5">Remedial Action Task</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-300">
              <tr>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">Academic CGPA</td>
                <td className="p-3.5 font-bold font-mono">{studentCgpa} / 10.0</td>
                <td className="p-3.5 font-bold font-mono text-indigo-600">{target.minCgpa} Min</td>
                <td className="p-3.5 font-black">{cgpaGap === 0 ? '0.00' : `-${cgpaGap}`}</td>
                <td className="p-3.5">
                  {cgpaGap === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Satisfied</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">Minor Deficit</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">Maintain study consistency in S6/S7 end-sem exam.</td>
              </tr>

              <tr>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">Active Arrears</td>
                <td className="p-3.5 font-bold font-mono">{studentBacklogs} Backlogs</td>
                <td className="p-3.5 font-bold font-mono text-indigo-600">{target.maxArrears} Max</td>
                <td className="p-3.5 font-black">{arrearsGap === 0 ? '0' : `+${arrearsGap}`}</td>
                <td className="p-3.5">
                  {arrearsGap === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Clean Record</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">Critical Arrear</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">Clear active backlogs in upcoming remedial exam.</td>
              </tr>

              <tr>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">Technical Skill Mark</td>
                <td className="p-3.5 font-bold font-mono">{techMark} / 100</td>
                <td className="p-3.5 font-bold font-mono text-indigo-600">{target.reqTech} / 100</td>
                <td className="p-3.5 font-black">{techGap === 0 ? '0' : `-${techGap} Marks`}</td>
                <td className="p-3.5">
                  {techGap === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Benchmark Met</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">Needs Practice</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">Attempt Daily Technical Tests & AI Mock Interviews.</td>
              </tr>

              <tr>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">Communication Speech Mark</td>
                <td className="p-3.5 font-bold font-mono">{commMark} / 100</td>
                <td className="p-3.5 font-bold font-mono text-indigo-600">{target.reqComm} / 100</td>
                <td className="p-3.5 font-black">{commGap === 0 ? '0' : `-${commGap} Marks`}</td>
                <td className="p-3.5">
                  {commGap === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">Fluent</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">Needs Fluency</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">Practice 5-round voice interviews with mic recorder.</td>
              </tr>

              <tr>
                <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">ATS Resume Score</td>
                <td className="p-3.5 font-bold font-mono">{atsScore}%</td>
                <td className="p-3.5 font-bold font-mono text-indigo-600">{target.reqAts}%</td>
                <td className="p-3.5 font-black">{atsGap === 0 ? '0%' : `-${atsGap}%`}</td>
                <td className="p-3.5">
                  {atsGap === 0 ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">ATS Optimized</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">Add Keywords</span>
                  )}
                </td>
                <td className="p-3.5 text-slate-500">Upload custom resume PDF & add ({target.requiredSkills.slice(0, 2).join(', ')}) skills.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
