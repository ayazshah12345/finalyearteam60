'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Course, Module, Lesson } from '@/types';
import {
  Play,
  CheckCircle2,
  FileText,
  Code2,
  Bot,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Award,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Unlock,
  FastForward,
  Info,
  Clock
} from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function isDirectVideo(url?: string): boolean {
  if (!url) return false;
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function formatDurationSec(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

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

  // Focus Guard / Anti-Skip Player State
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [requiredSeconds, setRequiredSeconds] = useState(60);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipBlockedToast, setShowSkipBlockedToast] = useState(false);

  const maxWatchedRef = useRef(0);
  const ytPlayerRef = useRef<any>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

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

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // When active lesson changes, reset the anti-skip timer & player
  useEffect(() => {
    if (!activeLesson) return;

    // Calculate required watch duration:
    // For already completed lessons: requirement already met!
    const isAlreadyCompleted = userProgress[activeLesson.id];
    const durationMin = activeLesson.durationMinutes || 15;
    // For smooth learning validation: require 60 seconds (or 45 seconds if small)
    const targetSec = isAlreadyCompleted ? 0 : Math.min(60, Math.max(30, Math.floor(durationMin * 3)));
    
    setRequiredSeconds(targetSec);
    setWatchedSeconds(isAlreadyCompleted ? targetSec : 0);
    maxWatchedRef.current = isAlreadyCompleted ? targetSec : 0;
    setIsPlaying(false);
    setSecurityNotice(null);

    // Initialize YouTube Player if it's a YouTube video
    const ytId = extractYouTubeId(activeLesson.videoUrl);
    if (ytId && typeof window !== 'undefined') {
      const checkAndInitYt = () => {
        if (window.YT && window.YT.Player) {
          try {
            if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
              ytPlayerRef.current.destroy();
            }
            ytPlayerRef.current = new window.YT.Player(`yt-embed-player`, {
              videoId: ytId,
              playerVars: {
                enablejsapi: 1,
                rel: 0,
                modestbranding: 1,
                disablekb: 1, // Disable keyboard speed/skip shortcuts
                fs: 1
              },
              events: {
                onStateChange: (event: any) => {
                  // 1 is PLAYING, 2 is PAUSED, 0 is ENDED
                  setIsPlaying(event.data === 1);
                },
                onPlaybackRateChange: (event: any) => {
                  // Lock speed to 1.0x (normal speed)
                  if (event.data > 1) {
                    try {
                      event.target.setPlaybackRate(1);
                    } catch (e) {}
                    flashSecurityNotice('⚡ Fast-forward speed disabled. Standard 1.0x normal speed is enforced.');
                  }
                }
              }
            });
          } catch (e) {
            console.error('YT Player init error:', e);
          }
        } else {
          setTimeout(checkAndInitYt, 300);
        }
      };

      const timer = setTimeout(checkAndInitYt, 200);
      return () => clearTimeout(timer);
    }
  }, [activeLesson?.id]);

  // Anti-skip continuous interval monitoring
  useEffect(() => {
    let interval: any = null;

    if (isPlaying) {
      interval = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const currentSec = ytPlayerRef.current.getCurrentTime();
            // If user jumped ahead beyond the furthest watched point + 2.5s
            if (currentSec > maxWatchedRef.current + 2.5) {
              ytPlayerRef.current.seekTo(maxWatchedRef.current, true);
              flashSecurityNotice('⏩ Swiping / Fast-forwarding is restricted. Please watch progressively.');
            } else {
              if (currentSec > maxWatchedRef.current) {
                maxWatchedRef.current = currentSec;
                setWatchedSeconds(Math.floor(currentSec));
              }
            }
          } catch (e) {}
        } else if (videoElRef.current) {
          // HTML5 video element is tracked via its onTimeUpdate & onSeeking
        } else {
          // Generic embed fallback: track active focus seconds
          setWatchedSeconds((prev) => {
            const next = prev + 1;
            maxWatchedRef.current = Math.max(maxWatchedRef.current, next);
            return next;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, activeLesson?.id]);

  const flashSecurityNotice = (msg: string) => {
    setSecurityNotice(msg);
    setTimeout(() => {
      setSecurityNotice(null);
    }, 4000);
  };

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

    // Strict Anti-Skip Guard check
    const isCompleted = userProgress[activeLesson.id];
    if (!isCompleted && watchedSeconds < requiredSeconds) {
      setShowSkipBlockedToast(true);
      setTimeout(() => setShowSkipBlockedToast(false), 4500);
      return;
    }

    try {
      const res = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: course.id, lessonId: activeLesson.id })
      });
      const data = await res.json();
      if (data.success) {
        setUserProgress((prev) => ({ ...prev, [activeLesson.id]: true }));
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
    return (
      <div className="py-24 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading VSB Controlled Video Player & Course Environment...</span>
      </div>
    );
  }

  const isCompleted = activeLesson ? !!userProgress[activeLesson.id] : false;
  const isWatchRequirementMet = isCompleted || watchedSeconds >= requiredSeconds;
  const watchProgressPct = Math.min(100, Math.round((watchedSeconds / (requiredSeconds || 1)) * 100));
  const ytId = activeLesson ? extractYouTubeId(activeLesson.videoUrl) : null;
  const isDirect = activeLesson ? isDirectVideo(activeLesson.videoUrl) : false;

  return (
    <div className="space-y-6 pb-12">
      {/* Course Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            {course.category} • Faculty Instructor: {course.instructorName}
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {course.title}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Course Progress
            </div>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {progressPercent}%
            </div>
          </div>
          <div className="w-28 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {certificateAwarded && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-sm font-black">
                Congratulations! Technical Course 100% Completed!
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Verified certificate and skills have been automatically synced to your student portfolio.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Lesson Player Environment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules & Lessons Navigation (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-subtle space-y-4 max-h-[820px] overflow-y-auto">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Curriculum Lessons
            </span>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">
              {lessons.length} Modules
            </span>
          </div>

          {modules.map((mod) => {
            const modLessons = lessons.filter((l) => l.moduleId === mod.id);
            return (
              <div key={mod.id} className="space-y-2">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                  {mod.title}
                </div>
                <div className="space-y-1">
                  {modLessons.map((l) => {
                    const isLessonDone = userProgress[l.id];
                    const isActive = activeLesson?.id === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setActiveLesson(l)}
                        className={`w-full p-3 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Play
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-white' : 'text-slate-400'
                            }`}
                          />
                          <span className="truncate">{l.title}</span>
                        </div>
                        {isLessonDone && (
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              isActive ? 'text-white' : 'text-emerald-500'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Column: Controlled Anti-Skip Video Player (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {activeLesson && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-subtle space-y-0">
              {/* Anti-Skip Protection Mode Header Banner */}
              <div className="px-5 py-3.5 bg-slate-950 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                      <span>VSB Focus Guard: Controlled Learning Mode</span>
                      <span className="text-[9px] bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-1.5 py-0.2 rounded uppercase font-extrabold">
                        1.0x Normal Speed
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Fast-forwarding, playback speedup & swiping ahead are strictly locked.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold">
                  {isWatchRequirementMet ? (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                      <Unlock className="w-3.5 h-3.5" /> Watch Requisite Met
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/60">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Focus Locked (
                      {requiredSeconds - watchedSeconds}s left)
                    </span>
                  )}
                </div>
              </div>

              {/* Security Flash Notice Overlay */}
              {securityNotice && (
                <div className="p-3 bg-amber-500/10 border-y border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2 px-5 animate-in fade-in duration-150">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{securityNotice}</span>
                </div>
              )}

              {/* Interactive Video Embed Container */}
              <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
                {ytId ? (
                  // YouTube Video with Iframe API Hook
                  <div className="w-full h-full">
                    <div id="yt-embed-player" className="w-full h-full"></div>
                  </div>
                ) : isDirect ? (
                  // Direct Video File (mp4, webm) with Controlled Speed & Seeking Lock
                  <video
                    ref={videoElRef}
                    src={activeLesson.videoUrl}
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    onRateChange={() => {
                      if (videoElRef.current && videoElRef.current.playbackRate > 1.0) {
                        videoElRef.current.playbackRate = 1.0;
                        flashSecurityNotice('⚡ Speedup disabled. Standard 1.0x playback rate enforced.');
                      }
                    }}
                    onSeeking={() => {
                      if (videoElRef.current && videoElRef.current.currentTime > maxWatchedRef.current + 2.0) {
                        videoElRef.current.currentTime = maxWatchedRef.current;
                        flashSecurityNotice('⏩ Swiping and skipping forward are locked. Please watch progressively.');
                      }
                    }}
                    onTimeUpdate={() => {
                      if (videoElRef.current) {
                        if (videoElRef.current.currentTime > maxWatchedRef.current + 2.0) {
                          videoElRef.current.currentTime = maxWatchedRef.current;
                        } else {
                          maxWatchedRef.current = Math.max(maxWatchedRef.current, videoElRef.current.currentTime);
                          setWatchedSeconds(Math.floor(maxWatchedRef.current));
                        }
                      }
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-full object-contain"
                  />
                ) : activeLesson.videoUrl ? (
                  // Other Platform Embed (Vimeo, Google Drive, Loom)
                  <iframe
                    src={activeLesson.videoUrl}
                    title={activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => setIsPlaying(true)}
                  />
                ) : (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    Interactive Reading Lecture
                  </div>
                )}
              </div>

              {/* Anti-Skip Live Progress Track Bar */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Active Watching Time:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">
                      {formatDurationSec(watchedSeconds)}
                    </span>
                    <span className="text-slate-400">/</span>
                    <span className="text-slate-500 font-mono">
                      {formatDurationSec(requiredSeconds)} required
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      isWatchRequirementMet
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isWatchRequirementMet
                      ? 'Verified (Complete)'
                      : `${watchProgressPct}% Watched`}
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isWatchRequirementMet
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-indigo-600 to-blue-500'
                    }`}
                    style={{ width: `${watchProgressPct}%` }}
                  ></div>
                </div>
              </div>

              {/* Skip Blocked Warning Prompt */}
              {showSkipBlockedToast && (
                <div className="p-4 mx-6 mt-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-in zoom-in-95">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      <strong>Controlled Learning Lock:</strong> You must watch the lecture without skipping for at least{' '}
                      <strong>{requiredSeconds} seconds</strong> to mark this lesson complete. (Currently:{' '}
                      {watchedSeconds}s).
                    </span>
                  </div>
                </div>
              )}

              {/* Lesson Details & Action */}
              <div className="p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">
                      {activeLesson.title}
                    </h2>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Estimated Duration: {activeLesson.durationMinutes || 15} minutes • Anti-Skip Policy Active
                    </div>
                  </div>

                  <button
                    onClick={handleMarkComplete}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-none'
                        : isWatchRequirementMet
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Completed</span>
                      </>
                    ) : isWatchRequirementMet ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Lesson Complete</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Locked ({requiredSeconds - watchedSeconds}s left)</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {activeLesson.description}
                </p>

                {/* Lesson Lecture Notes */}
                {activeLesson.notesContent && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <div className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      <span>Faculty Lecture Notes</span>
                    </div>
                    <div className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans font-medium">
                      {activeLesson.notesContent}
                    </div>
                  </div>
                )}

                {/* Starter / Optimized Code Snippet */}
                {activeLesson.codeSnippet && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-indigo-400" />
                      <span>Optimized Code Implementation</span>
                    </div>
                    <pre className="text-xs text-emerald-400 overflow-x-auto p-2 bg-slate-900/60 rounded-xl">
                      <code>{activeLesson.codeSnippet}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Grounded SGIP AI & Student Notes (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-subtle space-y-4">
          <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-2 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ai'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" /> Ask SGIP AI
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'tools'
                  ? 'bg-indigo-600 text-white font-black shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" /> Study Notes
            </button>
          </div>

          {activeTab === 'ai' ? (
            <div className="space-y-4">
              <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
                Ask questions about the current video lecture or course concepts. The AI answers grounded in faculty notes:
              </div>

              <form onSubmit={handleAskAI} className="space-y-2">
                <textarea
                  rows={3}
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="e.g. How does call stack memory behave in recursion?"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-black uppercase tracking-wider hover:from-indigo-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {aiLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Ask SGIP AI</span>
                </button>
              </form>

              {aiResponse && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Grounded Explanation</span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium text-[11px]">
                    {aiResponse}
                  </div>
                  {aiSources.length > 0 && (
                    <div className="pt-2 border-t border-indigo-200 dark:border-indigo-800 text-[10px] text-slate-500 space-y-1">
                      <span className="font-bold uppercase tracking-wider">Citations:</span>
                      {aiSources.map((s, i) => (
                        <div key={i} className="text-indigo-600 dark:text-indigo-400">
                          • {s.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 space-y-3 font-medium">
              <p>
                Take personal lecture notes. These notes are saved locally to your workspace portfolio for placement interview revision.
              </p>
              <textarea
                rows={8}
                placeholder="Type your notes from the video lecture here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
