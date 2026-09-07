'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Course, Module, Lesson, LessonProgress } from '@/types';
import {
  Play,
  CheckCircle2,
  FileText,
  Code2,
  Bot,
  MessageSquare,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Award
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Ask AI Panel State
  const [activeTab, setActiveTab] = useState<'tools' | 'ai' | 'notes'>('tools');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiSources, setAiSources] = useState<any[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [certificateAwarded, setCertificateAwarded] = useState(false);

  useEffect(() => {
    if (courseId) fetchCourseDetail();
  }, [courseId]);

  const fetchCourseDetail = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      const data = await res.json();
      setCourse(data.course);
      setModules(data.modules || []);
      setLessons(data.lessons || []);
      setProgressPercent(data.progressPercent || 0);

      const progMap: Record<string, boolean> = {};
      data.userProgress?.forEach((p: any) => {
        progMap[p.lessonId] = p.completed;
      });
      setUserProgress(progMap);

      if (data.lessons && data.lessons.length > 0) {
        setActiveLesson(data.lessons[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeLesson || !course) return;
    try {
      const res = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, lessonId: activeLesson.id })
      });
      const data = await res.json();
      if (data.success) {
        setUserProgress(prev => ({ ...prev, [activeLesson.id]: true }));
        if (data.isCourseComplete) {
          setCertificateAwarded(true);
          setProgressPercent(100);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiQuery })
      });
      const data = await res.json();
      setAiResponse(data.answer);
      setAiSources(data.sources || []);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !course) {
    return <div className="py-16 text-center text-xs text-slate-400">Loading course player environment...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Course Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest">
            {course.category} • Instructor: {course.instructorName}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{course.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase">Overall Completion</div>
            <div className="text-lg font-extrabold text-brand-400">{progressPercent}%</div>
          </div>
          <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-brand-500 h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      </div>

      {certificateAwarded && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-sm font-bold">Congratulations! Course 100% Completed!</div>
              <div className="text-xs text-slate-300">Verified course certificate has been automatically added to your portfolio.</div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Lesson Player Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules & Lessons Navigation (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-subtle space-y-4 max-h-[750px] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">Course Navigation</div>
          {modules.map((mod) => {
            const modLessons = lessons.filter(l => l.moduleId === mod.id);
            return (
              <div key={mod.id} className="space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg">
                  {mod.title}
                </div>
                <div className="space-y-1">
                  {modLessons.map((l) => {
                    const isCompleted = userProgress[l.id];
                    const isActive = activeLesson?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setActiveLesson(l)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-brand-600 text-white font-semibold shadow-glow'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Play className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{l.title}</span>
                        </div>
                        {isCompleted && <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-emerald-400'}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Column: Lesson Video / Content Player (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {activeLesson && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-subtle">
              {/* Media Embed */}
              {activeLesson.videoUrl ? (
                <div className="relative w-full aspect-video bg-black">
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900 text-slate-400 text-xs">
                  Interactive Reading Lesson
                </div>
              )}

              {/* Lesson Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{activeLesson.title}</h2>
                  <button
                    onClick={handleMarkComplete}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                      userProgress[activeLesson.id]
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-brand-600 text-white shadow-glow hover:bg-brand-500'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{userProgress[activeLesson.id] ? 'Completed' : 'Mark Complete'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeLesson.description}
                </p>

                {/* Lesson Notes & Code Snippet */}
                {activeLesson.notesContent && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-400" /> Lesson Lecture Notes
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                      {activeLesson.notesContent}
                    </div>
                  </div>
                )}

                {activeLesson.codeSnippet && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-accent-400" /> C++ Optimized Code Implementation
                    </div>
                    <pre className="text-xs text-emerald-400 overflow-x-auto p-2">
                      <code>{activeLesson.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Learning Tools & Ask AI Panel (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-subtle space-y-4">
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                activeTab === 'ai' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" /> Ask AI
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                activeTab === 'tools' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" /> Notes
            </button>
          </div>

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="text-[11px] text-slate-400 leading-relaxed">
                Ask the grounded RAG assistant for instant clarifications based on uploaded course notes:
              </div>

              <form onSubmit={handleAskAI} className="space-y-2">
                <textarea
                  rows={3}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. Explain call stack allocation in recursion..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-all flex items-center justify-center gap-2"
                >
                  {aiLoading ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-3.5 h-3.5" />}
                  <span>Ask SGIP AI</span>
                </button>
              </form>

              {aiResponse && (
                <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
                  <div className="font-bold text-brand-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Grounded AI Explanation
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {aiResponse}
                  </div>
                  {aiSources.length > 0 && (
                    <div className="pt-2 border-t border-brand-500/20 text-[10px] text-slate-400 space-y-1">
                      <span className="font-bold uppercase tracking-wider">Citations:</span>
                      {aiSources.map((s, i) => (
                        <div key={i} className="text-brand-300">• {s.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-400 space-y-2">
              <p>Take personal notes for this lesson. Notes will sync automatically to your learning profile.</p>
              <textarea
                rows={6}
                placeholder="Write your notes here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
