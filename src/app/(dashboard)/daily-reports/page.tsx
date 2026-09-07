'use client';

import React, { useState, useEffect } from 'react';
import { DailyReport, User } from '@/types';
import { CalendarCheck, Clock, Plus, CheckCircle2, MessageSquare, Send } from 'lucide-react';

export default function DailyReportsPage() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Student New Report Form State
  const [studyHours, setStudyHours] = useState('4.5');
  const [topics, setTopics] = useState('Graph Traversals, Next.js API Routes');
  const [tasks, setTasks] = useState('Solved 3 LeetCode Mediums, Completed Lesson 101');
  const [problemsSolved, setProblemsSolved] = useState('3');
  const [reflection, setReflection] = useState('Understood Dijkstra shortest path algorithms clearly.');
  const [tomorrowPlan, setTomorrowPlan] = useState('Revise Dynamic Programming memoization.');

  // Faculty Review State
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [facultyComment, setFacultyComment] = useState('');

  useEffect(() => {
    fetchDailyReports();
  }, []);

  const fetchDailyReports = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/daily-reports');
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/daily-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyHours,
          topicsLearned: topics.split(',').map(t => t.trim()),
          completedTasks: tasks.split(',').map(t => t.trim()),
          codingProblemsSolved: parseInt(problemsSolved),
          reflection,
          tomorrowPlan
        })
      });
      const data = await res.json();
      if (data.report) {
        setReports([data.report, ...reports]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFacultyReview = async (id: string) => {
    try {
      const res = await fetch('/api/daily-reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, facultyComment })
      });
      const data = await res.json();
      if (data.report) {
        setReports(prev => prev.map(r => r.id === id ? data.report : r));
        setReviewingId(null);
        setFacultyComment('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            <CalendarCheck className="w-4 h-4" /> SGIP Daily Learning Ledger
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Daily Study Reports & Mentorship
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log daily study hours, problem counts, reflections, and receive faculty feedback.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Student Submission Form (5 cols) */}
        {user?.role === 'STUDENT' && (
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-4">
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" /> Log Today's Learning Activity
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Study Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">DSA Solved Count</label>
                  <input
                    type="number"
                    value={problemsSolved}
                    onChange={(e) => setProblemsSolved(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Topics Learned (comma separated)</label>
                <input
                  type="text"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Completed Tasks</label>
                <input
                  type="text"
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Learning Reflection</label>
                <textarea
                  rows={2}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Tomorrow's Plan</label>
                <input
                  type="text"
                  value={tomorrowPlan}
                  onChange={(e) => setTomorrowPlan(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-600 text-white font-bold shadow-glow hover:bg-brand-500 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Daily Report
              </button>
            </form>
          </div>
        )}

        {/* Daily Reports Feed List (7 or 12 cols) */}
        <div className={`${user?.role === 'STUDENT' ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Daily Study Feed</div>

          {reports.map((r) => (
            <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-subtle space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white">{r.studentName} ({r.department})</div>
                  <div className="text-[10px] text-slate-400">{r.date} • {r.studyHours} Study Hours • {r.codingProblemsSolved} DSA Solved</div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                  r.status === 'Reviewed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {r.status}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div><span className="font-semibold text-slate-400">Topics:</span> {r.topicsLearned.join(', ')}</div>
                <div><span className="font-semibold text-slate-400">Reflection:</span> "{r.reflection}"</div>
              </div>

              {/* Faculty Feedback Section */}
              {r.facultyComment ? (
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs flex items-start gap-2 text-brand-300">
                  <MessageSquare className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-brand-400">{r.reviewedBy} (Faculty Feedback):</div>
                    <div>"{r.facultyComment}"</div>
                  </div>
                </div>
              ) : user?.role === 'FACULTY' && (
                <div className="pt-2">
                  {reviewingId === r.id ? (
                    <div className="space-y-2 text-xs">
                      <textarea
                        rows={2}
                        value={facultyComment}
                        onChange={(e) => setFacultyComment(e.target.value)}
                        placeholder="Add faculty feedback or encouragement..."
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFacultyReview(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Save Feedback
                        </button>
                        <button onClick={() => setReviewingId(null)} className="px-3 py-1.5 text-slate-400 text-xs">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReviewingId(r.id)}
                      className="px-3 py-1.5 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30 text-xs font-semibold"
                    >
                      + Add Faculty Comment
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
