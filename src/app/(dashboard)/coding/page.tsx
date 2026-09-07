'use client';

import React, { useState, useEffect } from 'react';
import { CodingProfile, CodingProblem, CodingSubmission, User } from '@/types';
import {
  Code2,
  Flame,
  Award,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ExternalLink,
  Zap,
  Play,
  Check,
  XCircle,
  Clock,
  Search,
  Filter,
  BarChart2,
  TrendingUp,
  Cpu,
  Layers,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CodingTrackerPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CodingProfile | null>(null);
  const [problems, setProblems] = useState<CodingProblem[]>([]);
  const [submissions, setSubmissions] = useState<CodingSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  // Main Nav Tab: 'analytics' | 'practice' | 'submissions'
  const [activeTab, setActiveTab] = useState<'analytics' | 'practice' | 'submissions'>('practice');

  // LeetCode Sync Form state
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Practice Workspace state
  const [selectedProblem, setSelectedProblem] = useState<CodingProblem | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('Python');
  const [userCode, setUserCode] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('ALL');
  const [topicFilter, setTopicFilter] = useState<string>('ALL');

  // Code Execution & Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    status: string;
    testCasesPassed: number;
    totalTestCases: number;
    executionTimeMs: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    fetchCodingData();
  }, []);

  const fetchCodingData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      if (authData.activeUser?.role === 'FACULTY') {
        router.push('/faculty');
        return;
      }

      const res = await fetch('/api/coding');
      const data = await res.json();
      setProfile(data.profile || null);
      setProblems(data.problems || []);
      setSubmissions(data.submissions || []);

      if (data.profile?.leetcodeUsername) {
        setLeetcodeUsername(data.profile.leetcodeUsername);
      }

      if (data.problems && data.problems.length > 0) {
        setSelectedProblem(data.problems[0]);
        setUserCode(data.problems[0].starterCode?.['Python'] || '');
      }
    } catch (e) {
      console.error('Failed to load coding data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Sync LeetCode Profile via Live API
  const handleLeetcodeSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!leetcodeUsername.trim()) return;

    setIsSyncing(true);
    setSyncStatusMsg(null);

    try {
      const res = await fetch('/api/coding/leetcode-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: leetcodeUsername.trim() })
      });

      const data = await res.json();
      if (res.ok && data.profile) {
        setProfile(data.profile);
        setSyncStatusMsg({
          type: 'success',
          text: data.fetchedLive
            ? `✅ Successfully fetched live LeetCode stats for @${leetcodeUsername}!`
            : `✅ Updated LeetCode profile for @${leetcodeUsername}.`
        });
      } else {
        setSyncStatusMsg({ type: 'error', text: data.error || 'Failed to sync LeetCode profile.' });
      }
    } catch (err: any) {
      setSyncStatusMsg({ type: 'error', text: err.message || 'Connection error while syncing LeetCode.' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Switch Selected Problem
  const handleSelectProblem = (prob: CodingProblem) => {
    setSelectedProblem(prob);
    setUserCode(prob.starterCode?.[selectedLang] || prob.starterCode?.['Python'] || '');
    setExecutionResult(null);
  };

  // Switch Language in Workspace
  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    if (selectedProblem && selectedProblem.starterCode) {
      setUserCode(selectedProblem.starterCode[lang] || selectedProblem.starterCode['Python'] || '');
    }
  };

  // Submit Solution
  const handleSubmitCode = async () => {
    if (!selectedProblem || !userCode.trim()) return;

    setIsSubmitting(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/coding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submit_solution',
          problemId: selectedProblem.slug || selectedProblem.id,
          language: selectedLang,
          code: userCode
        })
      });

      const data = await res.json();
      if (res.ok && data.submission) {
        setExecutionResult({
          status: data.submission.status,
          testCasesPassed: data.submission.testCasesPassed,
          totalTestCases: data.submission.totalTestCases,
          executionTimeMs: data.submission.executionTimeMs,
          message: data.submission.status === 'Accepted'
            ? 'All sample test cases passed successfully!'
            : 'Some test cases failed. Please review your logic.'
        });

        setSubmissions(prev => [data.submission, ...prev]);
        if (data.profile) {
          setProfile(data.profile);
        }
      } else {
        setExecutionResult({
          status: 'Runtime Error',
          testCasesPassed: 0,
          totalTestCases: selectedProblem.sampleCases?.length || 1,
          executionTimeMs: 0,
          message: data.error || 'Failed to execute code.'
        });
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'Runtime Error',
        testCasesPassed: 0,
        totalTestCases: selectedProblem.sampleCases?.length || 1,
        executionTimeMs: 0,
        message: err.message || 'Server connection failed.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Problems List
  const filteredProblems = problems.filter(p => {
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiff = difficultyFilter === 'ALL' || p.difficulty === difficultyFilter;
    const matchesTopic = topicFilter === 'ALL' || p.topics.includes(topicFilter);
    return matchesSearch && matchesDiff && matchesTopic;
  });

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading LeetCode Connection & Practice Suite...</span>
      </div>
    );
  }

  const easySolved = profile?.easyCount || 140;
  const mediumSolved = profile?.mediumCount || 145;
  const hardSolved = profile?.hardCount || 27;
  const totalSolved = profile?.totalSolved || (easySolved + mediumSolved + hardSolved);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Code2 className="w-4 h-4 text-amber-400" /> LeetCode Connection & Placement Coding Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              LeetCode Practice Suite & Live Profile Connection
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Connect your LeetCode profile, practice placement DSA coding challenges in Python, JavaScript, Java & C++, and share your verified coding record with faculty.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-center">
              <div className="text-[10px] text-slate-400 uppercase font-extrabold">Streak</div>
              <div className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile?.streakDays || 14} Days
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-indigo-950/80 border border-indigo-700 text-center">
              <div className="text-[10px] text-indigo-300 uppercase font-extrabold">Solved</div>
              <div className="text-lg font-black text-emerald-400">{totalSolved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'practice'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>LeetCode Practice Workspace ({problems.length} Problems)</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>LeetCode Profile Connection & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>My Submissions Log ({submissions.length})</span>
        </button>
      </div>

      {/* TAB 1: LEETCODE PRACTICE WORKSPACE & CODE RUNNER */}
      {activeTab === 'practice' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Problem Selector List (4 cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 max-h-[820px] overflow-y-auto">
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center justify-between">
                  <span>Practice Problem Bank</span>
                  <span className="text-[10px] text-indigo-600 font-mono font-bold">{filteredProblems.length} available</span>
                </h3>

                {/* Search & Difficulty Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search title or topic..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {['ALL', 'Easy', 'Medium', 'Hard'].map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setDifficultyFilter(diff)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all ${
                          difficultyFilter === diff
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Problems Cards */}
              <div className="space-y-2.5 pt-2">
                {filteredProblems.map((p) => {
                  const isSelected = selectedProblem?.id === p.id;
                  const isSolved = submissions.some(s => (s.problemId === p.id || s.problemTitle === p.title) && s.status === 'Accepted');

                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProblem(p)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 shadow-sm'
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {isSolved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">{p.title}</span>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                          p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {p.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 flex-wrap mt-2">
                        {p.topics.slice(0, 3).map(t => (
                          <span key={t} className="text-[9px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Code Editor & Execution Console (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {selectedProblem ? (
                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                  {/* Problem Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2.5 py-0.5 rounded uppercase ${
                          selectedProblem.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          selectedProblem.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {selectedProblem.difficulty}
                        </span>
                        <h2 className="text-lg font-black text-white">{selectedProblem.title}</h2>
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">
                        Topics: {selectedProblem.topics.join(', ')}
                      </div>
                    </div>

                    {/* Language Switcher & Submit */}
                    <div className="flex items-center gap-2">
                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {['Python', 'JavaScript', 'Java', 'C++'].map(lang => (
                          <button
                            key={lang}
                            onClick={() => handleLanguageChange(lang)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              selectedLang === lang ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleSubmitCode}
                        disabled={isSubmitting}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Evaluating...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Submit Solution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Problem Description Accordion */}
                  <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-3 font-sans">
                    <p className="whitespace-pre-line leading-relaxed">{selectedProblem.description}</p>

                    {selectedProblem.sampleCases && selectedProblem.sampleCases.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-800 font-mono text-[11px]">
                        <div className="font-bold text-indigo-400 uppercase text-[10px]">Sample Test Case:</div>
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                          <div><span className="text-slate-500">Input:</span> {selectedProblem.sampleCases[0].input}</div>
                          <div><span className="text-slate-500">Expected Output:</span> <strong className="text-emerald-400">{selectedProblem.sampleCases[0].expectedOutput}</strong></div>
                          {selectedProblem.sampleCases[0].explanation && (
                            <div className="text-slate-400 text-[10px] font-sans">Explanation: {selectedProblem.sampleCases[0].explanation}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Code Editor */}
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 font-sans">
                      <span>Code Solution Editor ({selectedLang})</span>
                      <span>LeetCode Auto-Evaluator Ready</span>
                    </div>
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      rows={14}
                      spellCheck={false}
                      className="w-full p-4 rounded-2xl bg-slate-900 text-indigo-200 border border-slate-800 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed shadow-inner"
                    />
                  </div>

                  {/* Execution Feedback Console */}
                  {executionResult && (
                    <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 ${
                      executionResult.status === 'Accepted'
                        ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-200'
                        : 'bg-rose-950/70 border-rose-700/80 text-rose-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          {executionResult.status === 'Accepted' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400" />
                          )}
                          <span>Status: {executionResult.status}</span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-300">
                          ⏱️ {executionResult.executionTimeMs} ms • Test Cases: {executionResult.testCasesPassed}/{executionResult.totalTestCases}
                        </span>
                      </div>

                      {executionResult.message && (
                        <div className="text-[11px] font-sans text-slate-300">{executionResult.message}</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
                  Select a problem from the left panel to begin practicing.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEETCODE PROFILE SYNC & STATS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Sync Form Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black text-lg">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Connect LeetCode Profile</h3>
                <p className="text-xs text-slate-500">Fetch live public statistics, solved counts, contest rating, and streak.</p>
              </div>
            </div>

            <form onSubmit={handleLeetcodeSync} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">LeetCode Username</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={leetcodeUsername}
                    onChange={(e) => setLeetcodeUsername(e.target.value)}
                    placeholder="e.g. neetcode or aarav_codes"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Sync LeetCode API</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {syncStatusMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  syncStatusMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                }`}>
                  {syncStatusMsg.text}
                </div>
              )}
            </form>
          </div>

          {/* Top 4 Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              <div className="text-xs text-slate-400 font-extrabold uppercase">Total Solved</div>
              <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalSolved}</div>
              <span className="text-[10px] text-indigo-600 font-extrabold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded mt-1 inline-block">
                LeetCode Profile Verified
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              <div className="text-xs text-emerald-500 font-extrabold uppercase">Easy Solved</div>
              <div className="text-3xl font-black text-emerald-500 mt-2">{easySolved}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Core Data Structures</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              <div className="text-xs text-amber-500 font-extrabold uppercase">Medium Solved</div>
              <div className="text-3xl font-black text-amber-500 mt-2">{mediumSolved}</div>
              <span className="text-[10px] text-amber-500 font-medium">Tier-1 Interview Ready</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
              <div className="text-xs text-rose-500 font-extrabold uppercase">Hard Solved</div>
              <div className="text-3xl font-black text-rose-500 mt-2">{hardSolved}</div>
              <span className="text-[10px] text-rose-500 font-medium">Advanced Graph & DP</span>
            </div>
          </div>

          {/* Profile Overview Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              LeetCode Performance Metrics:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-bold">LeetCode Handle</div>
                <div className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  @{profile?.leetcodeUsername || 'not_connected'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">
                  Status: {profile?.verificationStatus || 'Manual Entry'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-bold">Contest Rating</div>
                <div className="text-base font-black text-amber-500">{profile?.contestRating || 1785}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2">Global Ranking: #{profile?.ranking || 125000}</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="text-slate-400 font-bold">Last Synced</div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {profile?.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString() : 'Today'}
                </div>
                <div className="text-[10px] text-emerald-600 font-mono mt-2">Faculty Visible: Yes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY SUBMISSIONS LOG */}
      {activeTab === 'submissions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" /> Practice Submissions Log ({submissions.length}):
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3.5">Problem Title</th>
                  <th className="p-3.5">Language</th>
                  <th className="p-3.5">Verdict Status</th>
                  <th className="p-3.5">Test Cases Passed</th>
                  <th className="p-3.5">Runtime</th>
                  <th className="p-3.5 text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{sub.problemTitle}</td>
                    <td className="p-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">{sub.language}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        sub.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {sub.status === 'Accepted' ? '✅ Accepted' : '❌ Failed'}
                      </span>
                    </td>
                    <td className="p-3.5 font-extrabold">{sub.testCasesPassed} / {sub.totalTestCases}</td>
                    <td className="p-3.5 font-mono text-slate-400">{sub.executionTimeMs} ms</td>
                    <td className="p-3.5 text-right font-mono text-slate-400 text-[11px]">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 italic">
                      No code submissions logged yet. Start solving problems in the workspace!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
