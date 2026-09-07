'use client';

import React, { useState, useEffect } from 'react';
import { Quiz, Question, QuizAttempt, User } from '@/types';
import {
  HelpCircle,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  Play,
  Award,
  Sparkles,
  Terminal,
  Zap,
  Code2
} from 'lucide-react';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected Language Filter
  const [selectedLang, setSelectedLang] = useState<string>('ALL');

  // CSV Import Wizard State (Faculty)
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState<any>(null);

  // Student Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [quizAttemptResult, setQuizAttemptResult] = useState<QuizAttempt | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(1800);

  useEffect(() => {
    fetchQuizzesData();
  }, []);

  const fetchQuizzesData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/quizzes');
      const data = await res.json();
      setQuizzes(data.quizzes || []);
      setQuestions(data.questions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvContent.trim()) return;
    try {
      const res = await fetch('/api/quizzes/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent })
      });
      const data = await res.json();
      setImportSummary(data);
      if (data.summary?.importedCount > 0) {
        fetchQuizzesData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadSampleCSV = () => {
    const sample = `Question,Option A,Option B,Option C,Option D,Correct Answer,Difficulty,Subject,Topic,Explanation,Marks,Negative Marks
What is the time complexity of building a Heap?,O(N log N),O(N),O(log N),O(N^2),B,Medium,Data Structures,Heaps,Building a heap takes linear time O(N).,4,1
Which algorithm resolves negative edge weights?,Dijkstra,Prim,Bellman-Ford,Kruskal,C,Medium,Algorithms,Graphs,Bellman-Ford handles negative edges.,4,1
Sample Invalid Row with missing option C,Opt A,Opt B,,,A,Easy,General,General,Option C is empty,2,0`;
    setCsvContent(sample);
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setAnswers({});
    setQuizAttemptResult(null);
    setTimerSeconds(q.durationMinutes * 60);
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      const res = await fetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeQuiz.id,
          answers,
          timeSpentSeconds: activeQuiz.durationMinutes * 60 - timerSeconds
        })
      });
      const data = await res.json();
      setQuizAttemptResult(data.attempt);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter quizzes by selected language
  const filteredQuizzes = quizzes.filter(q => {
    if (selectedLang === 'ALL') return true;
    return (
      q.subject.toLowerCase().includes(selectedLang.toLowerCase()) ||
      q.title.toLowerCase().includes(selectedLang.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4" /> Placement Quizzes & Assessment Hub
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Placement & Programming Tests
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            50 Placement Questions Dataset • Python, Java, C++, C, JavaScript, SQL & Quantitative Aptitude.
          </p>
        </div>

        {user?.role === 'FACULTY' && (
          <button
            onClick={() => setShowImportWizard(!showImportWizard)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-500 transition-all shadow-glow"
          >
            <Upload className="w-4 h-4" /> Import Question Bank CSV
          </button>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* PROGRAMMING LANGUAGES SELECTOR FILTER BAR            */}
      {/* ---------------------------------------------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-600" /> Filter Tests by Placement Language / Topic:
          </h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            50 Questions Loaded
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
          {[
            { id: 'ALL', name: '🌐 All Tests' },
            { id: 'Python', name: '🐍 Python' },
            { id: 'Java', name: '☕ Java' },
            { id: 'C++', name: '⚡ C++' },
            { id: 'C', name: '🔧 C Lang' },
            { id: 'JavaScript', name: '🟨 JS & Web' },
            { id: 'SQL', name: '🗄️ SQL DB' },
            { id: 'Quantitative Aptitude', name: '🧮 Aptitude' }
          ].map((lang) => {
            const isSel = selectedLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold ${
                  isSel
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                {lang.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quizzes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md hover-lift flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {quiz.subject}
                </span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {quiz.durationMinutes} Mins
                </span>
              </div>

              <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {quiz.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-500">
                {quiz.questionIds?.length || 10} Questions • {quiz.totalMarks} Marks
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Start Test
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Active Quiz Taking Modal / Overlay */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600">
                  {activeQuiz.subject}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {quizAttemptResult ? (
              <div className="space-y-4 text-center py-4">
                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {quizAttemptResult.score} / {quizAttemptResult.totalMarks}
                </div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Percentage: {quizAttemptResult.percentage}% • Status: {quizAttemptResult.passed ? '✅ PASSED' : '❌ REMEDIAL RECOMMENDED'}
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold uppercase tracking-wider"
                >
                  Complete Assessment
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
                {questions
                  .filter(q => activeQuiz.questionIds.includes(q.id))
                  .slice(0, 10)
                  .map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        Q{idx + 1}. {q.questionText}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-medium">
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt as any }))}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between ${
                              answers[q.id] === opt
                                ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <span>{opt}) {(q as any)[`option${opt}`]}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md"
                >
                  Submit Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
