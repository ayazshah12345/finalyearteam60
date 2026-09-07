'use client';

import React, { useState, useEffect } from 'react';
import { PlacementDrive, PlacementApplication, User } from '@/types';
import { Building2, Plus, ShieldCheck, CheckCircle2, XCircle, ArrowRight, Clock, Award, Users } from 'lucide-react';

export default function PlacementPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [applications, setApplications] = useState<PlacementApplication[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Apply Result Modal
  const [applyResult, setApplyResult] = useState<any>(null);

  // Coordinator Drive Builder Modal State
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [companyName, setCompanyName] = useState('Amazon Web Services');
  const [roleTitle, setRoleTitle] = useState('Cloud Solutions Engineer - 2026');
  const [packageLPA, setPackageLPA] = useState('22.5');
  const [minCgpa, setMinCgpa] = useState('7.5');
  const [maxBacklogs, setMaxBacklogs] = useState('0');

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const drivesRes = await fetch('/api/placement/drives');
      const drivesData = await drivesRes.json();
      setDrives(drivesData.drives || []);

      const appsRes = await fetch('/api/placement/applications');
      const appsData = await appsRes.json();
      setApplications(appsData.applications || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (driveId: string) => {
    try {
      const res = await fetch('/api/placement/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driveId })
      });
      const data = await res.json();
      setApplyResult(data);
      if (data.application) {
        setApplications([data.application, ...applications.filter(a => a.id !== data.application.id)]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/placement/drives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          roleTitle,
          packageLPA: parseFloat(packageLPA),
          minCgpa: parseFloat(minCgpa),
          maxBacklogs: parseInt(maxBacklogs)
        })
      });
      const data = await res.json();
      if (data.drive) {
        setDrives([data.drive, ...drives]);
        setShowDriveModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdvanceStatus = async (applicationId: string, status: string) => {
    try {
      const res = await fetch('/api/placement/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status })
      });
      const data = await res.json();
      if (data.application) {
        setApplications(prev => prev.map(a => a.id === applicationId ? data.application : a));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            <Building2 className="w-4 h-4" /> SGIP Placement Cell & Eligibility Engine
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Campus Placement Drives & Applications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Automated CGPA and backlog rule evaluation, eligibility audit snapshots, and round management.
          </p>
        </div>

        {user?.role === 'PLACEMENT_COORDINATOR' && (
          <button
            onClick={() => setShowDriveModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-all shadow-glow"
          >
            <Plus className="w-4 h-4" /> Create Placement Drive
          </button>
        )}
      </div>

      {/* Active Drives Section */}
      <div className="space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Campus Placement Drives</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {drives.map((d) => {
            const myApp = applications.find(a => a.driveId === d.id && a.studentId === user?.id);
            return (
              <div
                key={d.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      {d.packageLPA} LPA
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Deadline: {d.deadlineDate}</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3">{d.companyName}</h3>
                  <div className="text-xs font-semibold text-brand-400">{d.roleTitle}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{d.jobDescription}</p>

                  {/* Eligibility Rules Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                    <div className="font-bold text-slate-400 uppercase text-[10px]">Eligibility Rules Criteria:</div>
                    <div className="text-slate-700 dark:text-slate-200 font-medium">
                      Min CGPA: <span className="font-bold text-brand-400">{d.eligibility.minCgpa}</span> • Max Backlogs: <span className="font-bold text-amber-400">{d.eligibility.maxBacklogs}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Depts: {d.eligibility.allowedDepartments.join(', ')}
                    </div>
                  </div>
                </div>

                {/* Role Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  {user?.role === 'STUDENT' && (
                    <div>
                      {myApp ? (
                        <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-bold text-emerald-400">Applied • Status: {myApp.status}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{myApp.eligibilityReasons[0]}</div>
                          </div>
                          <span className="text-xs font-bold text-slate-300">{myApp.cgpaSnapshot} CGPA</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApply(d.id)}
                          className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-glow hover:bg-brand-500 flex items-center justify-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" /> Evaluate Eligibility & Apply
                        </button>
                      )}
                    </div>
                  )}

                  {user?.role === 'PLACEMENT_COORDINATOR' && (
                    <div className="text-xs text-slate-400 flex justify-between items-center">
                      <span>Total Applications: {applications.filter(a => a.driveId === d.id).length}</span>
                      <span className="font-bold text-emerald-400">Published Drive</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Applications Pipeline for Placement Coordinator */}
      {user?.role === 'PLACEMENT_COORDINATOR' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" /> Student Applications Pipeline & Interview Round Manager
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Roll & Dept</th>
                  <th className="p-3">Company & Role</th>
                  <th className="p-3">CGPA Snapshot</th>
                  <th className="p-3">Eligibility Decision</th>
                  <th className="p-3">Current Round</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{app.studentName}</td>
                    <td className="p-3">{app.studentRollNumber} • {app.department}</td>
                    <td className="p-3 font-semibold text-brand-400">{app.companyName} ({app.roleTitle})</td>
                    <td className="p-3 font-mono">{app.cgpaSnapshot}</td>
                    <td className="p-3">
                      {app.isEligible ? (
                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">ELIGIBLE</span>
                      ) : (
                        <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">INELIGIBLE</span>
                      )}
                    </td>
                    <td className="p-3 font-bold text-amber-400">{app.status}</td>
                    <td className="p-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleAdvanceStatus(app.id, e.target.value)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Aptitude Round">Aptitude Round</option>
                        <option value="Technical Interview">Technical Interview</option>
                        <option value="HR Round">HR Round</option>
                        <option value="Offered">Offered</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requirement 21 Eligibility Audit Result Modal */}
      {applyResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              {applyResult.eligibility?.isEligible ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-400" />
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {applyResult.eligibility?.isEligible ? 'Eligibility Confirmed!' : 'Not Eligible for Drive'}
                </h3>
                <div className="text-xs text-slate-400">Auditable Engine Snapshot Saved</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-400 uppercase text-[10px]">Rule Evaluation Log:</div>
              {applyResult.eligibility?.reasons?.map((reason: string, i: number) => (
                <div key={i} className="text-slate-700 dark:text-slate-200 font-mono text-[11px] leading-relaxed">
                  • {reason}
                </div>
              ))}
            </div>

            <button
              onClick={() => setApplyResult(null)}
              className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-glow"
            >
              Close Snapshot
            </button>
          </div>
        </div>
      )}

      {/* Drive Creation Modal */}
      {showDriveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Create Placement Drive</h2>
            <form onSubmit={handleCreateDrive} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={packageLPA}
                    onChange={(e) => setPackageLPA(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Max Backlogs</label>
                  <input
                    type="number"
                    value={maxBacklogs}
                    onChange={(e) => setMaxBacklogs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDriveModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-glow">Publish Drive</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
