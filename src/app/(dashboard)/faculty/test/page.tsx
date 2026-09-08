'use client';

import React, { useState, useEffect } from 'react';
import { User, Quiz, Question } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Upload,
  Check,
  Zap,
  Sparkles,
  ArrowLeft,
  FileQuestion,
  Layers,
  Award,
  Terminal,
  Code2,
  BookOpen,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';
import Link from 'next/link';

interface DraftQuestion {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  explanation: string;
}

const SAMPLE_APTITUDE_QUESTIONS: DraftQuestion[] = [
  {
    questionText: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    optionA: '65 seconds',
    optionB: '89 seconds',
    optionC: '100 seconds',
    optionD: '150 seconds',
    correctAnswer: 'B',
    marks: 4,
    explanation: 'Speed = 240/24 = 10 m/s. Total distance = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.'
  },
  {
    questionText: 'If 12 men or 18 women can do a work in 14 days, in how many days can 8 men and 16 women do the same work?',
    optionA: '8 days',
    optionB: '9 days',
    optionC: '10 days',
    optionD: '12 days',
    correctAnswer: 'B',
    marks: 4,
    explanation: '12 men = 18 women => 1 man = 1.5 women. 8 men + 16 women = 12 + 16 = 28 women. Time = (18 * 14) / 28 = 9 days.'
  },
  {
    questionText: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
    optionA: '95',
    optionB: '111',
    optionC: '127',
    optionD: '128',
    correctAnswer: 'C',
    marks: 4,
    explanation: 'Each term is 2x + 1: (3*2)+1=7, (7*2)+1=15, (15*2)+1=31, (31*2)+1=63, (63*2)+1=127.'
  }
];

const SAMPLE_CODING_QUESTIONS: DraftQuestion[] = [
  {
    questionText: 'What is the time complexity of searching an element in a balanced Binary Search Tree (AVL Tree)?',
    optionA: 'O(1)',
    optionB: 'O(log N)',
    optionC: 'O(N)',
    optionD: 'O(N log N)',
    correctAnswer: 'B',
    marks: 4,
    explanation: 'A balanced BST guarantees height of O(log N), so search, insertion, and deletion take O(log N) time.'
  },
  {
    questionText: 'In Python, which of the following data structures is immutable?',
    optionA: 'List',
    optionB: 'Dictionary',
    optionC: 'Set',
    optionD: 'Tuple',
    correctAnswer: 'D',
    marks: 4,
    explanation: 'Tuples, strings, and frozensets are immutable built-in data structures in Python.'
  },
  {
    questionText: 'Which SQL clause is used to filter group results after an aggregate function has been applied?',
    optionA: 'WHERE',
    optionB: 'GROUP BY',
    optionC: 'HAVING',
    optionD: 'ORDER BY',
    correctAnswer: 'C',
    marks: 4,
    explanation: 'The HAVING clause filters aggregated groups, whereas WHERE filters individual rows prior to grouping.'
  }
];

export default function FacultyTestPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Form State
  const [testTitle, setTestTitle] = useState('');
  const [subject, setSubject] = useState('Aptitude');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [description, setDescription] = useState('');
  const [draftQuestions, setDraftQuestions] = useState<DraftQuestion[]>([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      marks: 4,
      explanation: ''
    }
  ]);

  // Submission Status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      const qzRes = await authFetch('/api/quizzes');
      if (qzRes.ok) {
        const qzData = await qzRes.json();
        setQuizzes(qzData.quizzes || []);
        setQuestions(qzData.questions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setDraftQuestions((prev) => [
      ...prev,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 4,
        explanation: ''
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (draftQuestions.length <= 1) return;
    setDraftQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof DraftQuestion, val: any) => {
    setDraftQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleLoadSample = (type: 'aptitude' | 'coding') => {
    if (type === 'aptitude') {
      setTestTitle('Campus Placement Aptitude Assessment');
      setSubject('Aptitude');
      setDurationMinutes(15);
      setDescription('Daily quantitative aptitude and reasoning test for placement eligibility.');
      setDraftQuestions(SAMPLE_APTITUDE_QUESTIONS);
    } else {
      setTestTitle('Core Coding & Technical Assessment');
      setSubject('Coding');
      setDurationMinutes(20);
      setDescription('Technical programming, data structures, and computer science concepts.');
      setDraftQuestions(SAMPLE_CODING_QUESTIONS);
    }
    setSuccessMsg(`Loaded sample ${type} questions! You can edit or click Upload.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleUploadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!testTitle.trim()) {
      setErrorMsg('Please enter a valid Test Title (e.g. Aptitude, Coding, or your custom title).');
      return;
    }

    // Validate questions
    for (let i = 0; i < draftQuestions.length; i++) {
      const q = draftQuestions[i];
      if (!q.questionText.trim()) {
        setErrorMsg(`Question #${i + 1} has an empty question statement.`);
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim() || !q.optionC.trim() || !q.optionD.trim()) {
        setErrorMsg(`Question #${i + 1} must have all 4 options (A, B, C, D) filled in.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const res = await authFetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': faculty?.role || 'FACULTY'
        },
        body: JSON.stringify({
          title: testTitle.trim(),
          subject: subject.trim() || testTitle.trim(),
          durationMinutes: Number(durationMinutes) || 15,
          description: description.trim() || `Daily test authored by ${faculty?.name || 'Faculty'}`,
          questions: draftQuestions
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to upload test');
      }

      const data = await res.json();
      setSuccessMsg(`🎉 Success! Test "${testTitle}" uploaded with ${draftQuestions.length} questions. It is now live on the Student Daily Test Dashboard!`);

      // Reset form
      setTestTitle('');
      setDescription('');
      setDraftQuestions([
        {
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          correctAnswer: 'A',
          marks: 4,
          explanation: ''
        }
      ]);

      // Refresh quiz list
      await fetchData();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload test. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this test? Students will no longer see it.')) return;
    try {
      const res = await authFetch(`/api/quizzes?id=${quizId}`, {
        method: 'DELETE',
        headers: { 'x-user-role': faculty?.role || 'FACULTY' }
      });
      if (res.ok) {
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
        setSuccessMsg('Test deleted successfully.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !faculty) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Faculty Test Management System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> Faculty Test Creator Desk
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-indigo-400" />
              Daily Test & MCQ Assessment Manager
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Create tests with custom titles (such as <strong>Aptitude</strong>, <strong>Coding</strong>, or any custom subject), add multiple-choice questions, and click Upload. Tests will immediately reflect on the <strong>Student Daily Test</strong> dashboard under strict 3-warning fullscreen proctoring rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/faculty"
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" /> Faculty Command Desk
            </Link>
            <Link
              href="/daily-test"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <ExternalLink className="w-4 h-4" /> Preview Student Daily Test
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center gap-3 shadow-md">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Creation Form */}
      <form onSubmit={handleUploadTest} className="space-y-6">
        {/* Step 1: Test Details Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 1</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <FileQuestion className="w-5 h-5 text-indigo-600" /> Mention Test Title & Settings
              </h2>
            </div>

            {/* Quick Templates Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase hidden sm:inline">Quick Templates:</span>
              <button
                type="button"
                onClick={() => handleLoadSample('aptitude')}
                className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-1.5"
              >
                <span>🧮 Sample Aptitude</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('coding')}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 hover:bg-indigo-100 transition-all flex items-center gap-1.5"
              >
                <span>💻 Sample Coding</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Test Title <span className="text-rose-500">*</span> (e.g. Aptitude, Coding, or your custom title)
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Enter Test Title (e.g., Aptitude, Coding, Core Java, Python, SQL...)"
                required
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 shadow-inner"
              />

              {/* Title Suggestions / Chips */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Quick Select Title:</span>
                {[
                  'Aptitude',
                  'Coding',
                  'Quantitative Aptitude',
                  'Python Programming',
                  'Core Java',
                  'Data Structures & Algorithms',
                  'SQL & Databases',
                  'Logical Reasoning'
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      setTestTitle(chip);
                      setSubject(chip.includes('Aptitude') || chip.includes('Logical') ? 'Aptitude' : 'Coding');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      testTitle === chip
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject, Duration & Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Subject / Category
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Aptitude">Aptitude & Reasoning</option>
                  <option value="Coding">Coding & DSA</option>
                  <option value="Python">Python Programming</option>
                  <option value="Java">Java & Architecture</option>
                  <option value="C++">C++ Systems</option>
                  <option value="SQL">SQL & Databases</option>
                  <option value="Web Development">Full Stack & Web</option>
                  <option value="General">General Campus Drive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Time Limit (Minutes)
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <input
                    type="number"
                    min={5}
                    max={120}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Proctoring Rules
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Fullscreen + 3 Warnings Auto-Enforced</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Description / Guidelines for Students (Optional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly state instructions or guidelines for this daily test..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Step 2: MCQ Questions Builder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Step 2</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Add Multiple Choice Questions (MCQs) ({draftQuestions.length} Total)
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {draftQuestions.map((q, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 relative"
              >
                {/* Question Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Multiple Choice Question #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                      <span>Marks:</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={q.marks}
                        onChange={(e) => handleQuestionChange(idx, 'marks', Number(e.target.value))}
                        className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-center font-bold bg-slate-50 dark:bg-slate-800"
                      />
                    </div>

                    {draftQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Question Statement */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Question Statement <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={q.questionText}
                    onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                    placeholder={`Enter Question ${idx + 1} statement or problem description...`}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Options A, B, C, D */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    <span>Options & Correct Answer:</span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold lowercase">
                      (Select the circle corresponding to the correct answer)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                      const fieldName = `option${optKey}` as keyof DraftQuestion;
                      const isCorrect = q.correctAnswer === optKey;

                      return (
                        <div
                          key={optKey}
                          onClick={() => handleQuestionChange(idx, 'correctAnswer', optKey)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                            isCorrect
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-500 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuestionChange(idx, 'correctAnswer', optKey);
                            }}
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                              isCorrect
                                ? 'bg-emerald-600 text-white ring-2 ring-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {isCorrect ? <Check className="w-4 h-4" /> : optKey}
                          </button>

                          <input
                            type="text"
                            value={q[fieldName] as string}
                            onChange={(e) => handleQuestionChange(idx, fieldName, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder={`Option ${optKey} text...`}
                            required
                            className="flex-1 bg-transparent border-none text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
                          />

                          {isCorrect && (
                            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md shrink-0">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Explanation */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Explanation / Solution Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                    placeholder="Provide detailed explanation displayed to students during post-test review..."
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-200 dark:border-slate-700"
            >
              <Plus className="w-4 h-4" /> Add Another Question
            </button>
          </div>
        </div>

        {/* Step 3: Upload Action Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border-2 border-indigo-500/50 rounded-3xl p-6 md:p-8 text-white shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Zap className="w-4 h-4 text-amber-400" /> Ready to Publish
            </div>
            <h3 className="text-xl font-black text-white">
              Upload Test to Student Daily Test Dashboard
            </h3>
            <p className="text-xs text-indigo-200 font-medium max-w-xl">
              Upon clicking Upload, your test with {draftQuestions.length} MCQ questions will be instantly broadcasted to all students. Students can attend this test with 3 warnings and full screen proctoring.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-3 shrink-0 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Uploading Questions...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Test Now</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Published Tests Table / Management */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Published Daily Tests ({quizzes.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These tests are currently active and available for students to attend on their Daily Test page.
            </p>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
            title="Refresh Tests"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">
            No tests created yet. Fill in the form above and click "Upload Test Now" to publish your first daily test!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Test Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Author / Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {quizzes.map((qz) => (
                  <tr key={qz.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>{qz.title}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">
                        {qz.subject}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {qz.questionIds?.length || 0} Qs
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {qz.durationMinutes} Mins
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                      {qz.totalMarks} Marks
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {(qz as any).creatorName || 'Faculty'} • {new Date(qz.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteQuiz(qz.id)}
                        className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-extrabold transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
