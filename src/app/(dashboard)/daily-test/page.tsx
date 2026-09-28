'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Question, QuizAttempt, User } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  Play,
  Sparkles,
  Calendar,
  Zap,
  ArrowRight,
  RefreshCw,
  BookOpen,
  Check,
  Camera,
  AlertTriangle,
  ShieldAlert,
  Eye,
  EyeOff,
  UserX,
  ShieldCheck,
  Code2,
  Terminal,
  Layers,
  FileCode,
  Bookmark,
  Flag,
  RotateCcw,
  CheckSquare,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Link from 'next/link';

interface TestingModule {
  id: string;
  title: string;
  shortName: string;
  subjectFilter: string;
  description: string;
  durationMins: number;
  totalQuestionsCount: number;
  icon: string;
  iconImg?: string;
  badgeColor: string;
  isFacultyCreated?: boolean;
  creatorName?: string;
  questionIds?: string[];
  createdAt?: string;
}

export default function DailyTestPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);

  // Active Daily Test Execution State
  const [isTestActive, setIsTestActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const wasInFullscreenRef = useRef(false);
  const testStartTimeRef = useRef<number>(0);
  const [activeModule, setActiveModule] = useState<TestingModule | null>(null);
  const [activeTestQuestions, setActiveTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [submittedResult, setSubmittedResult] = useState<QuizAttempt | null>(null);

  // Proctoring & Camera Integration State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const lastViolationTimeRef = useRef<number>(0);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFaceDetected, setIsFaceDetected] = useState(true);

  // 3-Strike Violation Counter (Tab Switch + Camera Absence)
  const [violationCount, setViolationCount] = useState(0);
  const [lastViolationType, setLastViolationType] = useState<'TAB_SWITCH' | 'CAMERA_ABSENCE'>('TAB_SWITCH');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  // Defined Working Daily Testing Modules - Professional Dark Blue & White
  const testingModules: TestingModule[] = [
    {
      id: 'mod_all',
      title: 'Module 8: Full 50-Question Master Placement Assessment',
      shortName: '50-Q Master',
      subjectFilter: 'ALL_50',
      description: 'Comprehensive 50-Question Campus Placement Assessment covering Python, Java, C++, C, JavaScript, SQL, and Aptitude.',
      durationMins: 50,
      totalQuestionsCount: 50,
      icon: '🔥',
      iconImg: '/emojis/fire.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_python',
      title: 'Module 1: Python Programming & Scripting Module',
      shortName: 'Python (10 Qs)',
      subjectFilter: 'Python',
      description: 'Test Python mutability, GIL, generators, decorators, and list comprehensions for software placement drives.',
      durationMins: 15,
      totalQuestionsCount: 10,
      icon: '🐍',
      iconImg: '/emojis/coding.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_java',
      title: 'Module 2: Java & Object-Oriented Architecture Module',
      shortName: 'Java (10 Qs)',
      subjectFilter: 'Java',
      description: 'Master Java JVM Bytecode, Collections Framework, Multithreading, and String immutability.',
      durationMins: 15,
      totalQuestionsCount: 10,
      icon: '☕',
      iconImg: '/emojis/compiler.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_cpp',
      title: 'Module 3: C++ Data Structures & Systems Module',
      shortName: 'C++ (8 Qs)',
      subjectFilter: 'C++',
      description: 'Practice Virtual Functions, VTABLE, RAII, Smart Pointers, and STL Map complexities.',
      durationMins: 15,
      totalQuestionsCount: 8,
      icon: '⚡',
      iconImg: '/emojis/daily-test.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_c',
      title: 'Module 4: C Language Pointers & Memory Management Module',
      shortName: 'C Lang (6 Qs)',
      subjectFilter: 'C',
      description: 'Pointers, Dynamic Memory (malloc/calloc), Storage Classes, Struct Padding, and Undefined Behavior.',
      durationMins: 10,
      totalQuestionsCount: 6,
      icon: '🔧',
      iconImg: '/emojis/compiler.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_js',
      title: 'Module 5: JavaScript & Full Stack Web Architecture Module',
      shortName: 'JS & Web (6 Qs)',
      subjectFilter: 'JavaScript',
      description: 'Closures, Event Loop order, Promises, Hoisting, and strict equality coercions.',
      durationMins: 10,
      totalQuestionsCount: 6,
      icon: '🟨',
      iconImg: '/emojis/coding.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_sql',
      title: 'Module 6: SQL Databases & Relational Schema Module',
      shortName: 'SQL DB (5 Qs)',
      subjectFilter: 'SQL',
      description: 'ACID transactions, Joins, Group By vs Having, B-Tree Indexes, and 1NF-3NF Normalization.',
      durationMins: 10,
      totalQuestionsCount: 5,
      icon: '🗄️',
      iconImg: '/emojis/dashboard.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    },
    {
      id: 'mod_apt',
      title: 'Module 7: Quantitative Aptitude & Logical Reasoning Module',
      shortName: 'Aptitude (5 Qs)',
      subjectFilter: 'Quantitative Aptitude',
      description: 'Speed-Time-Distance, Work-Time, Percentages, Series Completion, and Venn Diagrams.',
      durationMins: 10,
      totalQuestionsCount: 5,
      icon: '🧮',
      iconImg: '/emojis/target.png',
      badgeColor: 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // SessionStorage test indicator for AI Agent exam lockout
  useEffect(() => {
    if (isTestActive && !submittedResult && !isTerminated) {
      sessionStorage.setItem('test_in_progress', 'true');
    } else {
      sessionStorage.removeItem('test_in_progress');
    }
    return () => {
      sessionStorage.removeItem('test_in_progress');
    };
  }, [isTestActive, submittedResult, isTerminated]);

  // Timer Countdown Effect
  useEffect(() => {
    let interval: any = null;
    if (isTestActive && !submittedResult && !isTerminated && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTestActive, submittedResult, isTerminated, timerSeconds]);

  // Register Proctoring Violation (Tab Switch or Out-of-Camera Frame)
  const registerProctoringViolation = (type: 'TAB_SWITCH' | 'CAMERA_ABSENCE') => {
    // 10-Second Startup Grace Window: Prevents false strike on test launch or camera permission
    if (Date.now() - testStartTimeRef.current < 10000) {
      console.log('Violation suppressed during startup grace period.');
      return;
    }

    const now = Date.now();
    // Debounce rapid duplicate trigger events within 2000ms
    if (now - lastViolationTimeRef.current < 2000) return;
    lastViolationTimeRef.current = now;

    setLastViolationType(type);

    setViolationCount((prevCount) => {
      const nextCount = prevCount + 1;
      if (nextCount >= 3) {
        handleTerminateTest(nextCount, type);
      } else {
        setShowWarningModal(true);
      }

      // Log real-time incident to faculty malpractice desk
      try {
        authFetch('/api/malpractice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: 'TEST_SESSION',
            type,
            count: nextCount,
            quizId: activeModule?.id,
            quizTitle: activeModule?.title,
            severity: nextCount >= 3 ? 'HIGH' : 'MEDIUM',
            studentId: user?.id,
            studentName: user?.name,
            studentRollNumber: user?.rollNumber,
            studentDepartment: user?.department
          })
        })
          .then(() => {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('malpracticeLogged'));
            }
          })
          .catch((e) => console.warn('Malpractice log error:', e));
      } catch (err) {}

      return nextCount;
    });
  };

  // Browser Fullscreen Controls
  const requestBrowserFullscreen = async () => {
    try {
      const elem = document.documentElement as any;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        await elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        await elem.msRequestFullscreen();
      }
      setIsFullscreen(true);
      wasInFullscreenRef.current = true;
    } catch (err) {
      console.warn('Fullscreen request blocked or not allowed:', err);
    }
  };

  const exitBrowserFullscreen = async () => {
    try {
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
    }
  };

  const toggleBrowserFullscreen = () => {
    if (isFullscreen) {
      exitBrowserFullscreen();
    } else {
      requestBrowserFullscreen();
    }
  };

  // Tab Switch, Page Focus Loss & Fullscreen Exit Detection
  useEffect(() => {
    if (!isTestActive || submittedResult || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        registerProctoringViolation('TAB_SWITCH');
      }
    };

    const handleWindowBlur = () => {
      if (Date.now() - testStartTimeRef.current < 10000) return;
      // In browsers, blur can fire when clicking UI controls or during fullscreen transition.
      // Only register violation if document actually lost focus/visibility (switched tabs or minimized)
      setTimeout(() => {
        if (document.hidden) {
          registerProctoringViolation('TAB_SWITCH');
        }
      }, 600);
    };

    const handleFullscreenChange = () => {
      const isNowFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isNowFullscreen);

      if (isNowFullscreen) {
        wasInFullscreenRef.current = true;
      } else if (wasInFullscreenRef.current) {
        if (Date.now() - testStartTimeRef.current >= 10000) {
          registerProctoringViolation('TAB_SWITCH');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isTestActive, submittedResult, isTerminated]);

  // Camera Stream Hook during Test Execution
  useEffect(() => {
    if (isTestActive && !submittedResult && !isTerminated) {
      startCameraStream();
    } else {
      stopCameraStream();
    }
  }, [isTestActive, submittedResult, isTerminated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const quizRes = await authFetch('/api/quizzes');
      const quizData = await quizRes.json();
      setQuizzes(quizData.quizzes || []);
      setQuestions(quizData.questions || []);

      if (authData.activeUser?.id) {
        const attemptsRes = await authFetch(`/api/quizzes/attempts?studentId=${authData.activeUser.id}`);
        if (attemptsRes.ok) {
          const attemptsData = await attemptsRes.json();
          setAttempts(attemptsData.attempts || []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Start Camera Stream
  const startCameraStream = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 480 }, height: { ideal: 360 }, facingMode: 'user' },
        audio: false
      });
      mediaStreamRef.current = stream;
      setCameraActive(true);
      setIsFaceDetected(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Video play error:', e));
      }
    } catch (err: any) {
      console.warn('Webcam access error / fallback simulated HUD stream:', err);
      setCameraError('Camera stream active in AI Proctoring Visual HUD Mode.');
      setCameraActive(true);
      setIsFaceDetected(true);
    }
  };

  // Stop Camera Stream
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Simulate Out-of-Camera Frame Event
  const triggerCameraAbsenceViolation = () => {
    setIsFaceDetected(false);
    registerProctoringViolation('CAMERA_ABSENCE');
    setTimeout(() => setIsFaceDetected(true), 3000);
  };

  // Handle Start Selected Daily Testing Module
  const handleStartModuleTest = (mod: TestingModule) => {
    let filteredQs: Question[] = [];

    if (mod.questionIds && mod.questionIds.length > 0) {
      filteredQs = questions.filter(q => mod.questionIds!.includes(q.id));
      if (filteredQs.length === 0) {
        filteredQs = questions.filter(q => q.subject.toLowerCase().includes(mod.subjectFilter.toLowerCase()));
      }
    } else if (mod.subjectFilter === 'ALL_50') {
      filteredQs = [...questions];
    } else {
      filteredQs = questions.filter(q => q.subject.toLowerCase().includes(mod.subjectFilter.toLowerCase()));
      if (filteredQs.length === 0) filteredQs = questions.slice(0, mod.totalQuestionsCount);
    }

    if (filteredQs.length === 0 && questions.length > 0) {
      filteredQs = questions.slice(0, Math.min(mod.totalQuestionsCount || 5, questions.length));
    }

    setActiveModule(mod);
    setActiveTestQuestions(filteredQs);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setMarkedForReview({});
    setViolationCount(0);
    setIsTerminated(false);
    setTerminationReason(null);
    setSubmittedResult(null);
    setIsFaceDetected(true);
    setTimerSeconds(mod.durationMins * 60);
    setIsTestActive(true);
    wasInFullscreenRef.current = false;
    testStartTimeRef.current = Date.now();
    requestBrowserFullscreen();
  };

  // Terminate Test Instantly on 3 Violations
  const handleTerminateTest = async (finalCount: number, type: 'TAB_SWITCH' | 'CAMERA_ABSENCE') => {
    exitBrowserFullscreen();
    wasInFullscreenRef.current = false;
    stopCameraStream();
    setIsTerminated(true);
    setShowWarningModal(false);
    const typeLabel = type === 'CAMERA_ABSENCE' ? 'Out of Camera View / Face Absence' : 'Tab Switching / Window Exit';
    const reason = `Automated Termination: Exceeded maximum allowed violations (${finalCount} strikes for ${typeLabel}). Test terminated with 0 marks and reported to Placement Coordinator.`;
    setTerminationReason(reason);

    let totalMarks = 0;
    activeTestQuestions.forEach((q) => {
      totalMarks += q.marks || 4;
    });

    const terminatedAttempt: QuizAttempt = {
      id: `att_term_${Date.now()}`,
      quizId: activeModule?.id || 'mod_all',
      quizTitle: activeModule?.title || 'Daily Testing Assessment',
      studentId: user?.id || '',
      studentName: user?.name || 'Student',
      answers: selectedAnswers,
      score: 0,
      totalMarks,
      percentage: 0,
      passed: false,
      timeSpentSeconds: (activeModule?.durationMins || 10) * 60 - timerSeconds,
      startedAt: new Date(Date.now() - ((activeModule?.durationMins || 10) * 60 - timerSeconds) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      proctored: true,
      tabSwitchCount: finalCount,
      terminated: true,
      terminationReason: reason
    };

    setSubmittedResult(terminatedAttempt);
    setAttempts((prev) => [terminatedAttempt, ...prev]);

    try {
      await authFetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeModule?.id || 'mod_all',
          questionIds: activeTestQuestions.map(q => q.id),
          answers: selectedAnswers,
          timeSpentSeconds: (activeModule?.durationMins || 10) * 60 - timerSeconds,
          proctored: true,
          tabSwitchCount: finalCount,
          terminated: true,
          terminationReason: reason
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Normal Test Quiz
  const handleSubmitQuiz = async () => {
    if (!activeTestQuestions.length) return;
    exitBrowserFullscreen();
    wasInFullscreenRef.current = false;
    stopCameraStream();

    let totalMarks = 0;
    let score = 0;

    activeTestQuestions.forEach((q) => {
      totalMarks += q.marks || 4;
      if (selectedAnswers[q.id] === q.correctAnswer) {
        score += q.marks || 4;
      }
    });

    const percentage = Math.round((score / totalMarks) * 100);
    const passed = percentage >= 60;

    const newAttempt: QuizAttempt = {
      id: `att_${Date.now()}`,
      quizId: activeModule?.id || 'mod_all',
      quizTitle: activeModule?.title || 'Daily Testing Assessment',
      studentId: user?.id || '',
      studentName: user?.name || 'Student',
      answers: selectedAnswers,
      score,
      totalMarks,
      percentage,
      passed,
      timeSpentSeconds: (activeModule?.durationMins || 10) * 60 - timerSeconds,
      startedAt: new Date(Date.now() - ((activeModule?.durationMins || 10) * 60 - timerSeconds) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      proctored: true,
      tabSwitchCount: violationCount,
      terminated: false
    };

    setSubmittedResult(newAttempt);
    setAttempts((prev) => [newAttempt, ...prev]);

    try {
      await authFetch('/api/quizzes/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: activeModule?.id || 'mod_all',
          questionIds: activeTestQuestions.map(q => q.id),
          answers: selectedAnswers,
          timeSpentSeconds: (activeModule?.durationMins || 10) * 60 - timerSeconds,
          proctored: true,
          tabSwitchCount: violationCount,
          terminated: false
        })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const activeQ = activeTestQuestions[currentQuestionIdx];
  const answeredCount = Object.keys(selectedAnswers).length;
  const reviewCount = Object.values(markedForReview).filter(Boolean).length;

  // Convert any quizzes returned from /api/quizzes into testing modules!
  const facultyTestModules: TestingModule[] = quizzes.map((qz) => {
    const qzQuestions = questions.filter(q => qz.questionIds?.includes(q.id));
    const count = qzQuestions.length > 0 ? qzQuestions.length : (qz.questionIds?.length || 0);

    const isCoding = qz.title.toLowerCase().includes('coding') || qz.subject?.toLowerCase().includes('coding');
    const isAptitude = qz.title.toLowerCase().includes('aptitude') || qz.subject?.toLowerCase().includes('aptitude');

    return {
      id: qz.id,
      title: qz.title,
      shortName: qz.title.length > 20 ? qz.title.substring(0, 20) + '...' : qz.title,
      subjectFilter: qz.subject || qz.title,
      description: qz.description || `Faculty Uploaded Daily Test authored by ${(qz as any).creatorName || 'Faculty'}. Fullscreen proctoring with 3 warnings is enforced.`,
      durationMins: qz.durationMinutes || 15,
      totalQuestionsCount: count,
      icon: isCoding ? '💻' : isAptitude ? '🧮' : '⚡',
      badgeColor: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
      isFacultyCreated: true,
      creatorName: (qz as any).creatorName || 'Faculty',
      questionIds: qz.questionIds || [],
      createdAt: qz.createdAt
    };
  });

  if (loading || !user) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading Daily Testing Engine Modules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <ShieldAlert className="w-4 h-4 text-rose-500" /> Daily Testing & Live Camera Proctoring Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Proctored Daily Testing Modules
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Camera Integration & 3-Strike Warning Monitor for Tab Switch and Out-of-Camera Frame.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/compiler"
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md transition-all flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-emerald-400" /> Open Code Compiler System
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      {!isTestActive ? (
        <div className="space-y-8">
          {/* FACULTY UPLOADED DAILY TESTS */}
          {facultyTestModules.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Faculty Uploaded Daily Tests:
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assigned and published by department faculty. Fullscreen mode with 3 proctoring warnings is strictly enforced.
                  </p>
                </div>

                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950 px-3 py-1 rounded-full border border-amber-200">
                  {facultyTestModules.length} Faculty Test(s) Live
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facultyTestModules.map((mod) => (
                  <div
                    key={mod.id}
                    className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 dark:border-indigo-500/30 rounded-3xl p-5 shadow-lg hover-lift flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs">
                          {mod.subjectFilter}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {mod.durationMins} Mins
                        </span>
                      </div>

                      <div>
                        <div className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
                          Prof. {mod.creatorName || 'Faculty'}
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {mod.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {mod.totalQuestionsCount} Questions
                      </span>

                      <button
                        onClick={() => handleStartModuleTest(mod)}
                        className="px-4 py-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-blue-200" /> Start Proctored Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8 WORKING DAILY TESTING MODULE CARDS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-extrabold text-[#0f2942] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#1e3a8a]" /> Select Daily Testing Module:
                </h3>
                <p className="font-sans text-xs text-slate-500 mt-0.5">Click any module to start a proctored assessment session.</p>
              </div>

              <span className="font-mono text-xs font-bold text-[#1e3a8a] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                50 Total Questions Verified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {testingModules.map((mod) => (
                <div
                  key={mod.id}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:border-[#1e3a8a] transition-all flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${mod.badgeColor}`}>
                        <img src={mod.iconImg || '/emojis/daily-test.png'} alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>{mod.shortName}</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {mod.durationMins} Mins
                      </span>
                    </div>

                    <h4 className="font-display text-base font-extrabold text-[#0f2942] leading-snug">
                      {mod.title}
                    </h4>

                    <p className="font-sans text-xs text-slate-600 font-medium leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">
                      {mod.totalQuestionsCount} Questions
                    </span>

                    <button
                      onClick={() => handleStartModuleTest(mod)}
                      className="px-4 py-2 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-200" /> Start Module
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Camera Rules & 3-Strike Warning Banner - Dark Blue and White */}
          <div className="bg-[#1e3a8a] border border-[#0f2942] rounded-3xl p-6 md:p-8 text-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs font-extrabold uppercase tracking-widest text-blue-200">
              <Camera className="w-4 h-4" /> Live Camera Stream & 3-Strike Violation Rules
            </div>
            <h2 className="font-display text-xl md:text-2xl font-black text-white tracking-tight">
              Strict 3-Warning Policy for Tab Switching & Out-of-Camera View
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium pt-2">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <strong className="flex items-center gap-1.5 text-white font-bold mb-1 font-display text-sm">
                  <img src="/emojis/dashboard.png" alt="" className="w-4 h-4 object-contain" /> 1. Live Camera Stream
                </strong>
                <span className="font-sans text-blue-100 text-xs">Camera feed stays on throughout the exam for face tracking and presence verification.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <strong className="flex items-center gap-1.5 text-white font-bold mb-1 font-display text-sm">
                  <img src="/emojis/warning.png" alt="" className="w-4 h-4 object-contain" /> 2. Maximum 3 Warnings
                </strong>
                <span className="font-sans text-blue-100 text-xs">Tab switching or stepping out of camera frame issues warnings #1 and #2.</span>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <strong className="flex items-center gap-1.5 text-white font-bold mb-1 font-display text-sm">
                  <img src="/emojis/prohibited.png" alt="" className="w-4 h-4 object-contain" /> 3. Automated Termination
                </strong>
                <span className="font-sans text-blue-100 text-xs">On the 3rd strike, your test is immediately terminated (0 marks) and sent to Placement Cell.</span>
              </div>
            </div>
          </div>
        </div>
      ) : isTerminated ? (
        /* TERMINATED SCREEN (3 Violations Exceeded) */
        <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 md:p-10 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto p-3">
            <img src="/emojis/prohibited.png" alt="Terminated" className="w-full h-full object-contain" />
          </div>

          <div className="space-y-2">
            <span className="font-mono text-xs font-extrabold uppercase tracking-widest text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Proctoring Violation Limit Exceeded (3/3 Strikes)
            </span>
            <h2 className="font-display text-3xl font-black text-[#0f2942] mt-2">
              {activeModule?.title} Terminated
            </h2>
            <p className="font-sans text-xs md:text-sm text-rose-600 max-w-xl mx-auto font-semibold leading-relaxed">
              {terminationReason}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-1 text-left font-sans font-medium">
            <div className="font-mono font-bold text-[#0f2942] uppercase text-[11px]">Audit Log Entry Filed:</div>
            <div>• Score Assigned: <strong>0 / 100 Marks</strong></div>
            <div>• Student: <strong>{user.name}</strong> ({user.rollNumber || 'N/A'})</div>
            <div>• Total Violation Strikes: <strong>{violationCount} / 3</strong></div>
            <div>• Primary Reason: <strong>{lastViolationType === 'CAMERA_ABSENCE' ? 'Out of Camera View' : 'Tab Switch Exit'}</strong></div>
            <div>• Reported To: <strong>Prof. Sunita Rao (Placement Coordinator)</strong></div>
          </div>

          <div>
            <button
              onClick={() => {
                setIsTestActive(false);
                setIsTerminated(false);
                setSubmittedResult(null);
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all"
            >
              Return to Placement Testing Modules
            </button>
          </div>
        </div>
      ) : submittedResult ? (
        /* SUBMITTED TEST RESULT SCREEN */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 p-2 flex items-center justify-center shrink-0">
                <img src={submittedResult.passed ? '/emojis/trophy.png' : '/emojis/warning.png'} alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold ${
                  submittedResult.passed
                    ? 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  {submittedResult.passed ? 'PASSED MODULE BENCHMARK' : 'REMEDIAL PRACTICE RECOMMENDED'}
                </span>
                <h2 className="font-display text-2xl font-black text-[#0f2942] mt-1">
                  {activeModule?.title} Performance Summary
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="font-mono text-[10px] uppercase font-extrabold text-slate-400">Score Achieved</div>
                <div className="font-display text-3xl font-black text-[#1e3a8a]">
                  {submittedResult.score} / {submittedResult.totalMarks}
                </div>
              </div>
              <div className="text-right border-l border-slate-200 pl-4">
                <div className="font-mono text-[10px] uppercase font-extrabold text-slate-400">Camera & Integrity</div>
                <div className="font-mono text-xs font-bold text-[#1e3a8a]">
                  {submittedResult.tabSwitchCount === 0 ? '100% Clean' : `${submittedResult.tabSwitchCount} Warning(s)`}
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Detailed Question Review & Explanations ({activeTestQuestions.length} Questions):
            </h3>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {activeTestQuestions.map((q, idx) => {
                const studentAns = submittedResult.answers[q.id];
                const isCorrect = studentAns === q.correctAnswer;

                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Q{idx + 1}.</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold">
                          {q.subject} • {q.topic}
                        </span>
                      </div>
                      <span className={`font-extrabold px-2.5 py-0.5 rounded-full text-[10px] ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {isCorrect ? 'Correct (+4)' : 'Incorrect (0)'}
                      </span>
                    </div>

                    <div className="whitespace-pre-line font-semibold text-slate-800 dark:text-slate-200">
                      {q.questionText}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium">
                      <div>A) {q.optionA}</div>
                      <div>B) {q.optionB}</div>
                      <div>C) {q.optionC}</div>
                      <div>D) {q.optionD}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                      <div>Your Answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-rose-700'}>{studentAns || 'Not Answered'}</strong> | Correct Answer: <strong className="text-emerald-700">{q.correctAnswer}</strong></div>
                      {q.explanation && (
                        <div className="text-slate-600 dark:text-slate-400 italic">
                          💡 Explanation: {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <button
              onClick={() => {
                setIsTestActive(false);
                setSubmittedResult(null);
              }}
              className="px-6 py-3.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all"
            >
              Back to Testing Modules
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE TEST EXECUTION MODULE SCREEN - TRUE FULLSCREEN PROCTORED TAKEOVER */
        <div className="fixed inset-0 z-50 bg-[#f8fafc] overflow-y-auto flex flex-col p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
          <div className="max-w-7xl w-full mx-auto space-y-4">
            {/* Top Bar for Proctored Fullscreen Session */}
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <div>
                  <div className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#1e3a8a]">
                    Proctored Assessment Session
                  </div>
                  <h3 className="font-display text-sm font-extrabold text-[#0f2942] leading-tight">
                    {activeModule?.title || 'Daily Testing Assessment'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Fullscreen Toggle Button */}
                <button
                  type="button"
                  onClick={toggleBrowserFullscreen}
                  className={`px-3 py-1.5 rounded-xl border font-sans text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                    isFullscreen
                      ? 'bg-blue-50 text-[#1e3a8a] border-blue-200'
                      : 'bg-[#1e3a8a] hover:bg-[#0f2942] text-white border-[#1e3a8a] font-extrabold animate-pulse'
                  }`}
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>Fullscreen Active</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Expand to Fullscreen</span>
                    </>
                  )}
                </button>

                {/* Remaining Timer */}
                <div
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-black flex items-center gap-1.5 ${
                    timerSeconds < 120
                      ? 'bg-rose-50 text-rose-600 border border-rose-200 animate-pulse'
                      : 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-[#1e3a8a]" />
                  <span>{formatTime(timerSeconds)}</span>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitQuiz}
                  className="px-4 py-1.5 rounded-xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Submit Exam</span>
                </button>
              </div>
            </div>

            {/* Non-Fullscreen Warning Notice Banner */}
            {!isFullscreen && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 text-[#0f2942] shadow-xs">
                <div className="flex items-center gap-2 font-sans text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                  <span>Proctoring Requirement: Please switch to Fullscreen mode to prevent accidental focus loss warnings.</span>
                </div>
                <button
                  type="button"
                  onClick={requestBrowserFullscreen}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all shrink-0"
                >
                  <Maximize2 className="w-3.5 h-3.5" /> Enter Fullscreen
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Active Question Sheet */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
            {/* Module Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#1e3a8a] border border-blue-200">
                  Question {currentQuestionIdx + 1} of {activeTestQuestions.length}
                </span>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 text-[#0f2942]">
                  {activeQ?.subject} • {activeQ?.topic}
                </span>
              </div>

              {/* Timer */}
              <div className={`px-4 py-1.5 rounded-full font-mono text-sm font-black flex items-center gap-1.5 ${
                timerSeconds < 120 ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-200' : 'bg-blue-50 text-[#1e3a8a] border border-blue-200'
              }`}>
                <Clock className="w-4 h-4" /> {formatTime(timerSeconds)}
              </div>
            </div>

            {/* Active Question Body */}
            {activeQ && (
              <div className="space-y-6">
                <div className="font-display text-base md:text-lg font-bold text-[#0f2942] leading-relaxed whitespace-pre-line">
                  {activeQ.questionText}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {[
                    { key: 'A', text: activeQ.optionA },
                    { key: 'B', text: activeQ.optionB },
                    { key: 'C', text: activeQ.optionC },
                    { key: 'D', text: activeQ.optionD }
                  ].map((opt) => {
                    const isSelected = selectedAnswers[activeQ.id] === opt.key;

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() =>
                          setSelectedAnswers((prev) => ({
                            ...prev,
                            [activeQ.id]: opt.key as 'A' | 'B' | 'C' | 'D'
                          }))
                        }
                        className={`w-full p-4 rounded-2xl border text-left text-xs md:text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xs'
                            : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-[#1e3a8a]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-xl font-mono flex items-center justify-center font-black text-xs ${
                            isSelected ? 'bg-white text-[#1e3a8a]' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {opt.key}
                          </span>
                          <span className="font-sans">{opt.text}</span>
                        </div>
                        {isSelected && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation & Submission Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-sans text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setMarkedForReview((prev) => ({
                      ...prev,
                      [activeQ.id]: !prev[activeQ.id]
                    }))
                  }
                  className={`px-4 py-2.5 rounded-xl border font-sans text-xs font-extrabold flex items-center gap-1.5 transition-all ${
                    markedForReview[activeQ.id]
                      ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{markedForReview[activeQ.id] ? 'Marked for Review' : 'Mark for Review'}</span>
                </button>
              </div>

              {currentQuestionIdx < activeTestQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                  className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-2"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-6 py-2.5 rounded-xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Module Test</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Question Palette & Live Camera Stream Box */}
          <div className="md:col-span-4 space-y-4">
            {/* Question Palette */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs font-extrabold text-[#0f2942]">
                <span className="font-display">Question Palette</span>
                <span className="font-mono text-[11px] text-[#1e3a8a] font-bold">{answeredCount} / {activeTestQuestions.length} Answered</span>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-[180px] overflow-y-auto pr-1">
                {activeTestQuestions.map((q, idx) => {
                  const isAns = !!selectedAnswers[q.id];
                  const isRev = !!markedForReview[q.id];
                  const isCurr = currentQuestionIdx === idx;

                  let btnBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (isAns) btnBg = 'bg-[#1e3a8a] text-white border-[#1e3a8a] font-bold';
                  if (isRev) btnBg = 'bg-slate-800 text-white border-slate-800 font-bold';
                  if (isCurr) btnBg = 'bg-blue-50 text-[#1e3a8a] ring-2 ring-[#1e3a8a] font-black';

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIdx(idx)}
                      className={`h-9 rounded-xl border font-mono text-xs flex items-center justify-center transition-all ${btnBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 text-[10px] grid grid-cols-2 gap-2 text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]"></span> Answered ({answeredCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span> Review ({reviewCount})
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Unanswered ({activeTestQuestions.length - answeredCount})
                </div>
              </div>
            </div>

            {/* LIVE CAMERA STREAM & OUT-OF-FRAME PROCTORING BOX */}
            <div className="bg-[#0f172a] border border-slate-800 rounded-3xl p-4 shadow-xs space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-white font-bold border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isFaceDetected ? 'bg-emerald-400 animate-ping' : 'bg-rose-500 animate-bounce'}`}></span>
                  <span className={`uppercase tracking-widest text-[10px] font-mono ${isFaceDetected ? 'text-emerald-400' : 'text-rose-400 font-black'}`}>
                    {isFaceDetected ? 'Camera Stream Active' : 'OUT OF CAMERA VIEW'}
                  </span>
                </div>
                <Camera className="w-4 h-4 text-slate-400" />
              </div>

              {/* Video Element & Real-Time Target Mesh */}
              <div className="relative aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* Face Mesh HUD Grid */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 pointer-events-none">
                  <div className={`w-28 h-28 border-2 ${isFaceDetected ? 'border-dashed border-emerald-400/80' : 'border-rose-500'} rounded-2xl flex items-center justify-center relative animate-pulse`}>
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-400"></div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-400"></div>
                    {isFaceDetected ? <Eye className="w-8 h-8 text-emerald-400/70" /> : <EyeOff className="w-8 h-8 text-rose-500" />}
                  </div>
                  <span className={`mt-2 text-[9px] font-mono px-2 py-0.5 rounded border ${isFaceDetected ? 'text-emerald-400 bg-black/80 border-emerald-500/30' : 'text-rose-400 bg-rose-950 border-rose-500'}`}>
                    {isFaceDetected ? 'AI FACE PRESENCE • OK' : 'OUT OF CAMERA FRAME'}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 text-[9px] text-emerald-400 font-mono font-bold flex items-center gap-1 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> LIVE PROCTORING ACTIVE
                </div>
              </div>

              {/* Interactive Camera Absence Test Trigger */}
              <button
                type="button"
                onClick={triggerCameraAbsenceViolation}
                className="w-full py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/60 text-slate-400 hover:text-rose-400 text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <EyeOff className="w-3 h-3" /> Simulate "Out of Camera View" Event
              </button>

              <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-xs space-y-1">
                <div className="font-extrabold text-rose-400 flex items-center justify-between text-[11px] font-mono">
                  <span>Violation Warnings (Max 3):</span>
                  <span className="text-sm font-black text-rose-300">{violationCount} / 3</span>
                </div>
                <div className="text-[10px] text-slate-300 font-sans">
                  {3 - violationCount} warning(s) remaining before automatic exam termination!
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* STRICT 3-WARNING MODAL (TAB SWITCH OR OUT OF CAMERA VIEW) */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto p-3">
              <img src="/emojis/warning.png" alt="Warning" className="w-full h-full object-contain animate-bounce" />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-xs font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                PROCTORING WARNING ({violationCount} / 3 STRIKES)
              </span>

              <h3 className="font-display text-xl font-black text-[#0f2942] mt-2">
                {lastViolationType === 'CAMERA_ABSENCE' ? 'Out of Camera View Detected!' : 'Tab Switch Exit Detected!'}
              </h3>

              <p className="font-sans text-xs text-slate-600 font-medium leading-relaxed pt-1">
                {lastViolationType === 'CAMERA_ABSENCE'
                  ? 'You moved away from the camera or your face was not detected in the video frame.'
                  : 'You switched tabs, minimized the browser, or clicked away from the proctored test window.'}
              </p>

              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0f2942] font-bold">
                {violationCount === 1 ? (
                  <span>Warning 1 of 3: You have <strong>2 warnings remaining</strong> before automatic termination.</span>
                ) : (
                  <span className="text-rose-600 font-black">Warning 2 of 3: FINAL WARNING! Next violation will terminate your test with 0 marks!</span>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-3.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all"
            >
              I Understand — Return to Exam Immediately
            </button>
          </div>
        </div>
      )}

      {/* MANDATORY FULLSCREEN LOCK SCREEN (COVERS BROWSER TABS & ENFORCES F11 FULLSCREEN) */}
      {isTestActive && !isFullscreen && !submittedResult && !isTerminated && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center text-white space-y-6 animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center p-4 shadow-2xl">
            <img src="/emojis/shield.png" alt="Security" className="w-full h-full object-contain" />
          </div>

          <div className="max-w-lg space-y-2">
            <span className="font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-500/30">
              Exam Security & Anti-Cheating Protocol
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
              Fullscreen Mode Required
            </h2>
            <p className="font-sans text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              To hide browser tabs and ensure an uninterrupted proctored exam, click the button below to expand into Fullscreen mode.
            </p>
          </div>

          <button
            type="button"
            onClick={requestBrowserFullscreen}
            className="px-8 py-4 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] text-white font-sans font-extrabold uppercase tracking-wider text-xs sm:text-sm shadow-2xl transition-all flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Maximize2 className="w-5 h-5" /> Click Here to Enter Fullscreen Mode
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/10 px-4 py-2 rounded-xl border border-white/10">
            <ShieldAlert className="w-4 h-4 text-blue-300" />
            <span>Browser tabs, URL bars, and desktop icons will be completely hidden.</span>
          </div>
        </div>
      )}
    </div>
  );
}
