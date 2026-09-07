'use client';

import React, { useState, useEffect } from 'react';
import { CodingProfile, User } from '@/types';
import { Code2, Flame, Award, ShieldCheck, CheckCircle2, RefreshCw, Terminal, BookOpen, ExternalLink, Zap } from 'lucide-react';
import Link from 'next/link';

export default function CodingTrackerPage() {
  const [profile, setProfile] = useState<CodingProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Language for Coding Practice
  const [selectedLang, setSelectedLang] = useState<string>('Python');

  // Edit form state
  const [leetcode, setLeetcode] = useState('');
  const [easy, setEasy] = useState('140');
  const [medium, setMedium] = useState('145');
  const [hard, setHard] = useState('27');
  const [streak, setStreak] = useState('14');

  useEffect(() => {
    fetchCodingData();
  }, []);

  const fetchCodingData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/coding');
      const data = await res.json();
      setProfile(data.profile);
      if (data.profile) {
        setLeetcode(data.profile.leetcodeUsername || '');
        setEasy(String(data.profile.easyCount || 0));
        setMedium(String(data.profile.mediumCount || 0));
        setHard(String(data.profile.hardCount || 0));
        setStreak(String(data.profile.streakDays || 0));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leetcodeUsername: leetcode,
          easyCount: easy,
          mediumCount: medium,
          hardCount: hard,
          streakDays: streak,
          isVerified: true
        })
      });
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const codingChallenges = [
    { id: 'c1', lang: 'Python', title: 'List Mutability & Slice Reversal', difficulty: 'Easy', time: '10 mins', topics: 'Lists, References, Memory' },
    { id: 'c2', lang: 'Python', title: 'Dijkstra Shortest Path with Priority Queue', difficulty: 'Medium', time: '25 mins', topics: 'Heaps, Graphs, O((V+E)logV)' },
    { id: 'c3', lang: 'Java', title: 'Custom Thread-Safe Queue Implementation', difficulty: 'Medium', time: '20 mins', topics: 'Multithreading, Synchronized' },
    { id: 'c4', lang: 'Java', title: 'LRU Cache Design (HashMap + DoublyLinkedList)', difficulty: 'Hard', time: '30 mins', topics: 'Data Structures, O(1) Ops' },
    { id: 'c5', lang: 'C++', title: 'Custom Smart Pointer & Destructor Cleanup', difficulty: 'Hard', time: '25 mins', topics: 'Pointers, RAII, VTABLE' },
    { id: 'c6', lang: 'C++', title: 'N-Queens Backtracking with Bitmasking', difficulty: 'Hard', time: '30 mins', topics: 'Backtracking, Bitwise Ops' },
    { id: 'c7', lang: 'C', title: 'Dynamic Array Resizing with realloc & Pointers', difficulty: 'Medium', time: '15 mins', topics: 'Pointers, Memory Padding' },
    { id: 'c8', lang: 'JavaScript', title: 'Event Loop Execution Order & Promises', difficulty: 'Medium', time: '15 mins', topics: 'Closures, Microtasks, Async' },
    { id: 'c9', lang: 'SQL', title: 'Multi-Table Joins & Group By Aggregation', difficulty: 'Easy', time: '10 mins', topics: 'Left Join, Having, Indexing' }
  ];

  const filteredChallenges = codingChallenges.filter(c => c.lang === selectedLang || selectedLang === 'ALL');

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <Code2 className="w-4 h-4" /> Competitive & Placement Coding Tracker
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Placement Programming Languages & Coding Practice
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Practice Placement Coding Problems in Python, Java, C++, C, JavaScript & SQL.
          </p>
        </div>

        {profile?.verificationStatus && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{profile.verificationStatus}</span>
          </div>
        )}
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-subtle">
          <div className="text-xs text-slate-400 font-semibold uppercase">Total Solved</div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{profile?.totalSolved || 312}</div>
          <span className="text-[10px] text-indigo-500 font-medium">LeetCode & CodeChef</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-subtle">
          <div className="text-xs text-emerald-500 font-semibold uppercase">Easy Solved</div>
          <div className="text-3xl font-extrabold text-emerald-500 mt-2">{profile?.easyCount || 140}</div>
          <span className="text-[10px] text-slate-400 font-medium">Core Data Structures</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-subtle">
          <div className="text-xs text-amber-500 font-semibold uppercase">Medium Solved</div>
          <div className="text-3xl font-extrabold text-amber-500 mt-2">{profile?.mediumCount || 145}</div>
          <span className="text-[10px] text-amber-500 font-medium">Tier-1 Interview Ready</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-subtle">
          <div className="text-xs text-rose-500 font-semibold uppercase">Hard Solved</div>
          <div className="text-3xl font-extrabold text-rose-500 mt-2">{profile?.hardCount || 27}</div>
          <span className="text-[10px] text-rose-500 font-medium">Advanced Graph & DP</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PROGRAMMING LANGUAGES PRACTICE HUB                   */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] uppercase font-extrabold text-indigo-600 tracking-wider">Placement Coding Suite</span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Placement Programming Language Practice Problems
            </h3>
          </div>

          <Link
            href="/daily-test"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-white" /> Take 50 Questions Placement Test
          </Link>
        </div>

        {/* Language Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Python', 'Java', 'C++', 'C', 'JavaScript', 'SQL'].map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${
                selectedLang === lang
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
              }`}
            >
              {lang === 'ALL' ? '🌐 All Languages' : lang}
            </button>
          ))}
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChallenges.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase">
                    {item.lang}
                  </span>
                  <span className={`text-[10px] font-bold ${item.difficulty === 'Easy' ? 'text-emerald-600' : item.difficulty === 'Medium' ? 'text-amber-600' : 'text-rose-600'}`}>
                    {item.difficulty}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Topics: {item.topics}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                <Link
                  href="/daily-test"
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Solve Problem <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sync Profile Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-4 max-w-xl">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Sync Coding Profiles & Solved Count</h3>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">LeetCode Username</label>
            <input
              type="text"
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Easy</label>
              <input
                type="number"
                value={easy}
                onChange={(e) => setEasy(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Medium</label>
              <input
                type="number"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Hard</label>
              <input
                type="number"
                value={hard}
                onChange={(e) => setHard(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Re-sync Verified Coding Stats
          </button>
        </form>
      </div>
    </div>
  );
}
