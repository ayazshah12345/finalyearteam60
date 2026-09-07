'use client';

import React, { useState, useEffect } from 'react';
import { Assignment, Submission, User } from '@/types';
import { FileSpreadsheet, Plus, CheckCircle2, Clock, Upload, Send, Award, MessageSquare } from 'lucide-react';

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Student Submission State
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [codeText, setCodeText] = useState('');

  // Faculty Grading Modal State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [marks, setMarks] = useState<number>(90);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchAssignmentsData();
  }, []);

  const fetchAssignmentsData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const asgRes = await fetch('/api/assignments');
      const asgData = await asgRes.json();
      setAssignments(asgData.assignments || []);

      const subRes = await fetch('/api/submissions');
      const subData = await subRes.json();
      setSubmissions(subData.submissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          submissionType: selectedAssignment.submissionType,
          codeText
        })
      });
      const data = await res.json();
      if (data.submission) {
        setSubmissions([data.submission, ...submissions.filter(s => s.id !== data.submission.id)]);
        setSelectedAssignment(null);
        setCodeText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFacultyGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSub.id,
          marksObtained: marks,
          feedback,
          status: 'Graded'
        })
      });
      const data = await res.json();
      if (data.submission) {
        setSubmissions(prev => prev.map(s => s.id === data.submission.id ? data.submission : s));
        setSelectedSub(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent-400 uppercase tracking-widest">
            <FileSpreadsheet className="w-4 h-4" /> Academic Submissions
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Assignments & Faculty Evaluation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit coursework, track submission status, and receive structured faculty feedback.
          </p>
        </div>
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading assignments repository...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignments.map((asg) => {
            const mySub = submissions.find(s => s.assignmentId === asg.id && s.studentId === user?.id);
            return (
              <div
                key={asg.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                      {asg.courseTitle}
                    </span>
                    <span className="text-xs font-bold text-slate-400">Total: {asg.totalMarks} Marks</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 leading-snug">{asg.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{asg.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2 italic">Instructions: {asg.instructions}</p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Due: {new Date(asg.dueDate).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-[11px]">Type: {asg.submissionType}</span>
                  </div>
                </div>

                {/* Role Specific Actions */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  {user?.role === 'STUDENT' && (
                    <div>
                      {mySub ? (
                        <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <div>
                              <div className="font-bold text-emerald-400">Status: {mySub.status}</div>
                              {mySub.marksObtained !== undefined && (
                                <div className="text-[11px] text-slate-300">Marks: {mySub.marksObtained}/{asg.totalMarks} • "{mySub.feedback}"</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedAssignment(asg)}
                          className="w-full py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-glow hover:bg-brand-500 flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" /> Submit Assignment Solution
                        </button>
                      )}
                    </div>
                  )}

                  {user?.role === 'FACULTY' && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400">Student Submissions ({submissions.filter(s => s.assignmentId === asg.id).length}):</div>
                      {submissions.filter(s => s.assignmentId === asg.id).map(sub => (
                        <div key={sub.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 dark:text-white">{sub.studentName} ({sub.studentRollNumber})</span>
                            <div className="text-[10px] text-slate-400">{sub.status} • {sub.marksObtained ? `${sub.marksObtained} Marks` : 'Pending Grade'}</div>
                          </div>
                          <button
                            onClick={() => { setSelectedSub(sub); setMarks(sub.marksObtained || 95); setFeedback(sub.feedback || ''); }}
                            className="px-3 py-1 rounded-lg bg-brand-600 text-white font-semibold text-[11px]"
                          >
                            Evaluate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Student Submission Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Submit Assignment</h2>
            <div className="text-xs text-slate-400">{selectedAssignment.title}</div>
            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Code / Solution Text</label>
                <textarea
                  rows={6}
                  required
                  value={codeText}
                  onChange={(e) => setCodeText(e.target.value)}
                  placeholder="Paste your source code or solution notes..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setSelectedAssignment(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold shadow-glow">Confirm Submission</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Faculty Grading Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Evaluate Submission — {selectedSub.studentName}</h2>
            <form onSubmit={handleFacultyGrade} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Marks Obtained (out of 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Faculty Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for student improvement..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setSelectedSub(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-glow">Return Graded Result</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
