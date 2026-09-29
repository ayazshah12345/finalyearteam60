'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, ResumeData, MockInterviewSession, MockInterviewRoundQuestion } from '@/types';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Bot,
  UserCheck,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  Brain,
  RotateCcw,
  Check,
  Send,
  Loader2,
  ChevronRight,
  Flame,
  Star,
  Zap,
  HelpCircle,
  Lightbulb,
  Upload,
  RefreshCw,
  Sliders,
  Radio,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface QuestionBankItem {
  id: string;
  roundTitle: string;
  question: string;
  difficulty: 'Easy' | 'Hard' | 'Tough';
  topic: string;
  expectedKeywords: string[];
}

interface ResumeAnalysisData {
  detectedSector?: string;
  detectedTargetRole?: string;
  candidateSummary: string;
  detectedTechStack: string[];
  keyProjects: string[];
  strengths: string[];
  recommendedFocus: string;
  questions: {
    easy: QuestionBankItem[];
    hard: QuestionBankItem[];
    tough: QuestionBankItem[];
  };
}

export default function AIMockInterviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Resume Analysis & Question Bank State
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisData | null>(null);
  const [activeTierPreview, setActiveTierPreview] = useState<'easy' | 'hard' | 'tough'>('easy');

  // Interview Workspace State: 'intro' | 'interviewing' | 'evaluating' | 'result'
  const [step, setStep] = useState<'intro' | 'interviewing' | 'evaluating' | 'result'>('intro');
  const [targetRole, setTargetRole] = useState('Software Development Engineer');
  const [interviewMode, setInterviewMode] = useState<'progressive' | 'easy' | 'hard' | 'tough'>('progressive');

  // 15-Minute Mock Interview Session State (900 seconds)
  const TOTAL_SESSION_SECONDS = 15 * 60;
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_SESSION_SECONDS);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Active Live Question State
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentRoundTitle, setCurrentRoundTitle] = useState('');
  const [currentDifficulty, setCurrentDifficulty] = useState<'Easy' | 'Hard' | 'Tough'>('Easy');
  const [currentInterviewerReaction, setCurrentInterviewerReaction] = useState('');
  const [currentTips, setCurrentTips] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Voice Assistance State
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [autoListenMode, setAutoListenMode] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);

  // Student Answers transcript for all completed rounds
  const [transcriptHistory, setTranscriptHistory] = useState<MockInterviewRoundQuestion[]>([]);

  // Generated Result Card & History
  const [resultSession, setResultSession] = useState<MockInterviewSession | null>(null);
  const [pastSessions, setPastSessions] = useState<MockInterviewSession[]>([]);

  // Direct Resume Upload State in Mock Interview
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeUploadSuccess, setResumeUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Web Speech API Refs
  const recognitionRef = useRef<any>(null);
  const isComponentMounted = useRef(true);

  // Format MM:SS for 15-Minute Countdown
  const formatTime = (seconds: number) => {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 15-Minute Live Interview Timer Countdown
  useEffect(() => {
    if (step === 'interviewing' && !isTimerPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Auto conclude session when 15 minutes expire
            handleAutoTimeExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, isTimerPaused, timeRemaining]);

  const handleAutoTimeExpire = () => {
    stopSpeech();
    stopSpeechRecognition();
    submitForFinalEvaluation(transcriptHistory);
  };

  useEffect(() => {
    isComponentMounted.current = true;
    fetchInitialData();
    checkSpeechSupport();

    return () => {
      isComponentMounted.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      // Fetch student resume
      const resRes = await fetch('/api/resume');
      let loadedResume: ResumeData | null = null;
      let effectiveRole = 'Software Development Engineer';

      if (resRes.ok) {
        const resData = await resRes.json();
        loadedResume = resData.resume;

        // Check localStorage backup for persistent custom upload on Vercel serverless
        try {
          const cachedKey = `sgip_custom_resume_${authData.activeUser?.id}`;
          const cached = typeof window !== 'undefined' ? localStorage.getItem(cachedKey) : null;
          if (cached) {
            const parsedCached = JSON.parse(cached);
            if (parsedCached && parsedCached.isCustomUpload && (!loadedResume || !loadedResume.isCustomUpload)) {
              loadedResume = parsedCached;
            }
          }
        } catch (storageErr) {
          console.warn('LocalStorage resume retrieval:', storageErr);
        }

        setResume(loadedResume);

        if (loadedResume) {
          const detected = loadedResume.targetRole || loadedResume.title;
          if (detected) {
            effectiveRole = detected;
            setTargetRole(detected);
          }
        } else if (authData.activeUser?.department) {
          const dept = authData.activeUser.department.toLowerCase();
          if (dept.includes('mech')) effectiveRole = 'Mechanical Engineer';
          else if (dept.includes('civil')) effectiveRole = 'Civil Engineer';
          else if (dept.includes('ece') || dept.includes('eee')) effectiveRole = 'Electronics & Embedded Engineer';
          else effectiveRole = 'Software Development Engineer';
          setTargetRole(effectiveRole);
        }
      }

      // Fetch past interview history
      const histRes = await fetch('/api/interview/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setPastSessions(histData.interviews || []);
      }

      // Analyze resume with Gemini AI automatically
      if (loadedResume || authData.activeUser) {
        triggerResumeAnalysis(loadedResume, effectiveRole);
      }
    } catch (e) {
      console.error('Error loading initial mock interview data:', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerResumeAnalysis = async (resumeToAnalyze: any, role: string) => {
    setAnalysisLoading(true);
    try {
      const res = await fetch('/api/interview/analyze-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeToAnalyze,
          targetRole: role
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.resume && (!resumeToAnalyze || !resumeToAnalyze.skills || resumeToAnalyze.skills.length === 0)) {
          setResume(data.resume);
        }
        if (data.analysis) {
          setAnalysisData(data.analysis);
          if (data.analysis.detectedTargetRole) {
            setTargetRole(data.analysis.detectedTargetRole);
          }
        }
      }
    } catch (err) {
      console.error('Error triggering resume analysis:', err);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const checkSpeechSupport = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setVoiceSupported(false);
      }
    }
  };

  // Upload a new resume directly from Mock Interview page
  const handleDirectResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setResumeUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/resume', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
        try {
          const cachedKey = `sgip_custom_resume_${user?.id}`;
          if (typeof window !== 'undefined' && data.resume) {
            localStorage.setItem(cachedKey, JSON.stringify(data.resume));
          }
        } catch (e) {}
        setResumeUploadSuccess(true);
        // Re-analyze new resume with Gemini
        await triggerResumeAnalysis(data.resume, data.resume?.targetRole || targetRole);
      } else {
        alert('Could not upload resume file. Please ensure it is a valid PDF or document.');
      }
    } catch (err) {
      console.error(err);
      alert('Error uploading resume file.');
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // AI Text-to-Speech (TTS) synthesizer in Voice Mode
  const speakAIQuestion = (text: string, onFinish?: () => void) => {
    if (audioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onFinish) onFinish();
      return;
    }

    window.speechSynthesis.cancel(); // stop any active audio
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.0;

    // Pick best natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') ||
          v.name.includes('Natural') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Jenny'))
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsSpeakingAI(true);
    utterance.onend = () => {
      setIsSpeakingAI(false);
      if (onFinish) onFinish();
      // If Auto-Listen Mode is enabled, automatically activate microphone
      if (autoListenMode && voiceSupported && !isListening) {
        setTimeout(() => {
          startSpeechRecognition();
        }, 300);
      }
    };
    utterance.onerror = () => {
      setIsSpeakingAI(false);
      if (onFinish) onFinish();
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop any active speech synthesis
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingAI(false);
    }
  };

  // Start Voice Microphone Listening (STT)
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    if (isListening && recognitionRef.current) {
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setSpokenTranscript((prev) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${currentTranscript.trim()}` : currentTranscript.trim();
        });
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopSpeechRecognition();
    } else {
      stopSpeech();
      startSpeechRecognition();
    }
  };

  // Determine difficulty based on session progression and time remaining
  const getRoundDifficulty = (index: number, secondsLeft: number = 900): 'Easy' | 'Hard' | 'Tough' => {
    if (interviewMode === 'easy') return 'Easy';
    if (interviewMode === 'hard') return 'Hard';
    if (interviewMode === 'tough') return 'Tough';

    // Progressive mode across 15 minutes:
    // First 2 questions or >10 mins left: Easy (Intro, core strategy, domain basics)
    if (index <= 1 || secondsLeft > 10 * 60) return 'Easy';
    // Middle questions or >4 mins left: Hard (Technical execution, risk rules, false breakouts)
    if (index <= 3 || secondsLeft > 4 * 60) return 'Hard';
    // Final phase: Tough (High pressure, crisis recovery, flash crash, psychology)
    return 'Tough';
  };

  // START THE 15-MINUTE INTERVIEW
  const handleStartInterview = async () => {
    stopSpeech();
    stopSpeechRecognition();

    setStep('interviewing');
    setTimeRemaining(TOTAL_SESSION_SECONDS);
    setIsTimerPaused(false);
    setCurrentRoundIndex(0);
    setTranscriptHistory([]);
    setSpokenTranscript('');
    setIsAiThinking(true);

    const initialDifficulty = getRoundDifficulty(0, TOTAL_SESSION_SECONDS);
    setCurrentDifficulty(initialDifficulty);

    const effectiveResume = (resume && resume.skills && resume.skills.length > 0)
      ? resume
      : {
          ...(resume || {}),
          skills: analysisData?.detectedTechStack
            ? [{ category: 'Highlighted Skills', list: analysisData.detectedTechStack }]
            : (resume?.skills || (user?.skills ? [{ category: 'Profile Skills', list: user.skills }] : undefined)),
          targetRole
        };

    try {
      const res = await fetch('/api/interview/interactive-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: effectiveResume,
          targetRole,
          difficulty: initialDifficulty,
          roundIndex: 0,
          candidateName: user?.name,
          timeRemainingSeconds: TOTAL_SESSION_SECONDS,
          candidateAnswer: '',
          previousQuestion: '',
          transcriptHistory: []
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentQuestion(data.nextQuestion);
        setCurrentRoundTitle(data.roundTitle || `Question 1: [${initialDifficulty}] Introduction & Background`);
        setCurrentInterviewerReaction(data.interviewerReaction || '');
        setCurrentTips(data.tips || '');

        // Speak Question Aloud in Voice Mode
        const speechText = `${data.interviewerReaction ? data.interviewerReaction + ' ' : ''}${data.nextQuestion}`;
        setTimeout(() => {
          speakAIQuestion(speechText);
        }, 400);
      } else {
        // Fallback initial question
        const fallbackQ = `Hi ${user?.name || 'there'}! Welcome to your technical interview for the position of ${targetRole}. To start off, please introduce yourself, tell me about your background, and walk me through the key projects and models highlighted in your resume.`;
        setCurrentQuestion(fallbackQ);
        setCurrentRoundTitle(`Question 1: [${initialDifficulty}] Introduction & Background Overview`);
        setTimeout(() => {
          speakAIQuestion(fallbackQ);
        }, 400);
      }
    } catch (err) {
      console.error('Error starting interactive interview:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // SUBMIT ANSWER & DYNAMICALLY ASK NEXT QUESTION BASED ON CANDIDATE'S ACTUAL REPLY
  const handleNextRound = async () => {
    stopSpeechRecognition();
    stopSpeech();

    const answerToEvaluate = spokenTranscript.trim() || 'No response provided.';
    setIsAiThinking(true);

    const nextIdx = currentRoundIndex + 1;
    const nextDifficulty = getRoundDifficulty(nextIdx, timeRemaining);

    const effectiveResume = (resume && resume.skills && resume.skills.length > 0)
      ? resume
      : {
          ...(resume || {}),
          skills: analysisData?.detectedTechStack
            ? [{ category: 'Highlighted Skills', list: analysisData.detectedTechStack }]
            : (resume?.skills || (user?.skills ? [{ category: 'Profile Skills', list: user.skills }] : undefined)),
          targetRole
        };

    try {
      const res = await fetch('/api/interview/interactive-round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: effectiveResume,
          targetRole,
          difficulty: nextDifficulty,
          roundIndex: nextIdx,
          candidateName: user?.name,
          timeRemainingSeconds: timeRemaining,
          candidateAnswer: answerToEvaluate,
          previousQuestion: currentQuestion,
          previousRoundTitle: currentRoundTitle,
          transcriptHistory
        })
      });

      const data = await res.json();
      const techMark = data.technicalMark || 75;
      const commMark = data.communicationMark || 75;
      const score = Math.round((techMark * 0.6) + (commMark * 0.4));
      const feedback = data.feedback || 'Good articulation of concepts.';

      const roundRecord: MockInterviewRoundQuestion = {
        round: currentRoundIndex + 1,
        roundTitle: currentRoundTitle,
        difficulty: currentDifficulty,
        interviewerReaction: data.interviewerReaction || '',
        question: currentQuestion,
        studentAnswer: answerToEvaluate,
        technicalMark: techMark,
        communicationMark: commMark,
        feedback,
        score
      };

      const updatedHistory = [...transcriptHistory, roundRecord];
      setTranscriptHistory(updatedHistory);
      setSpokenTranscript('');

      // Continue to Next Question within the 15-Minute Session
      setCurrentRoundIndex(nextIdx);
      setCurrentDifficulty(nextDifficulty);
      setCurrentQuestion(data.nextQuestion);
      setCurrentRoundTitle(data.roundTitle || `Question ${nextIdx + 1}: [${nextDifficulty}] Technical Evaluation`);
      setCurrentInterviewerReaction(data.interviewerReaction || '');
      setCurrentTips(data.tips || '');

      // Speak the interviewer's dynamic reaction + next question
      const speechText = `${data.interviewerReaction ? data.interviewerReaction + '. ' : ''}${data.nextQuestion}`;
      setTimeout(() => {
        speakAIQuestion(speechText);
      }, 500);
    } catch (err) {
      console.error('Error processing next round:', err);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Conclude Interview Early & View Scorecard
  const handleConcludeInterview = async () => {
    stopSpeech();
    stopSpeechRecognition();
    if (timerRef.current) clearInterval(timerRef.current);

    // If candidate has typed an answer to the current question, include it
    if (spokenTranscript.trim()) {
      const techMark = 80;
      const commMark = 82;
      const roundRecord: MockInterviewRoundQuestion = {
        round: currentRoundIndex + 1,
        roundTitle: currentRoundTitle,
        difficulty: currentDifficulty,
        interviewerReaction: 'Final response recorded.',
        question: currentQuestion,
        studentAnswer: spokenTranscript.trim(),
        technicalMark: techMark,
        communicationMark: commMark,
        feedback: 'Final response recorded prior to interview conclusion.',
        score: Math.round((techMark * 0.6) + (commMark * 0.4))
      };
      const finalHistory = [...transcriptHistory, roundRecord];
      setTranscriptHistory(finalHistory);
      await submitForFinalEvaluation(finalHistory);
    } else {
      await submitForFinalEvaluation(transcriptHistory);
    }
  };

  // Submit complete interview transcript for AI evaluation backend & dbStore persistence
  const submitForFinalEvaluation = async (answersToSubmit: MockInterviewRoundQuestion[]) => {
    setStep('evaluating');
    try {
      const skillsEvaluated = analysisData?.detectedTechStack || [
        'Data Structures & Algorithms',
        'System Architecture',
        'Database Management',
        'Technical Communication'
      ];

      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          resumeSummary: analysisData?.candidateSummary || `Candidate with CGPA ${user?.cgpa || 8.4} in ${user?.department || 'CSE'}`,
          skillsEvaluated,
          answers: answersToSubmit
        })
      });

      const data = await res.json();
      if (res.ok && data.session) {
        setResultSession(data.session);
        setStep('result');
        fetchInitialData();
      }
    } catch (e) {
      console.error('Error submitting final evaluation:', e);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
          <img src="/emojis/interview.png" alt="" className="w-5 h-5 object-contain" />
          <span>Loading Gemini AI Voice Mock Interview Studio...</span>
        </div>
      </div>
    );
  }

  const userSkillsText =
    (analysisData?.detectedTechStack && analysisData.detectedTechStack.length > 0)
      ? analysisData.detectedTechStack.join(', ')
      : (resume?.skills && resume.skills.length > 0)
      ? resume.skills.flatMap((s) => s.list).join(', ')
      : (user?.skills && user.skills.length > 0)
      ? user.skills.join(', ')
      : 'Java, C++, Data Structures & Algorithms, OOPs, Web Development';

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <img src="/emojis/interview.png" alt="" className="w-5 h-5 object-contain animate-bounce" />
            <span>Gemini AI Voice Mock Interview Assistant</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Resume-Trained Corporate Technical Interview
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Meticulously analyzes your uploaded resume • Separated in 3 Tiers (Easy, Hard, Tough) • Interactive Voice
            Mode
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all flex items-center gap-2"
          >
            <img src="/emojis/resume.png" alt="" className="w-4 h-4 object-contain" />
            <span>Resume Builder & ATS</span>
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: INTRO, RESUME ANALYSIS & CONFIGURATION */}
      {/* ========================================================================= */}
      {step === 'intro' && (
        <div className="space-y-8">
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Configuration Card */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md">
                    <img src="/emojis/chatbot.png" alt="Bot" className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      Gemini AI Interviewer Persona
                      <img src="/emojis/sparkles.png" alt="" className="w-4 h-4 object-contain" />
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Adaptive, conversational technical evaluations tailored to your resume
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold flex items-center gap-1">
                  <img src="/emojis/check.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Gemini 3.5 Active</span>
                </span>
              </div>

              {/* Target Role & Mode */}
              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <img src="/emojis/target.png" alt="" className="w-4 h-4 object-contain" />
                    <span>Target Placement Role</span>
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Full Stack Developer, SDE 1, Data Engineer, Cloud Architect"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
                  />
                </div>

                {/* Interview Difficulty Progression Selector */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Interview Difficulty Structure:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setInterviewMode('progressive')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        interviewMode === 'progressive'
                          ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-black text-indigo-700 dark:text-indigo-300">
                        <img src="/emojis/trophy.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Adaptive (All 3)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Easy ➔ Hard ➔ Tough (15-Min Live)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInterviewMode('easy')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        interviewMode === 'easy'
                          ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/60 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-300">
                        <img src="/emojis/lightbulb.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Easy Only</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Resume & Strategy (15-Min Live)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInterviewMode('hard')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        interviewMode === 'hard'
                          ? 'border-amber-600 bg-amber-50/80 dark:bg-amber-950/60 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-black text-amber-700 dark:text-amber-300">
                        <img src="/emojis/fire.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Hard Only</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Execution & Risk (15-Min Live)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInterviewMode('tough')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        interviewMode === 'tough'
                          ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/60 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-black text-rose-700 dark:text-rose-300">
                        <img src="/emojis/shield.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Tough Only</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1">Crisis & Stress (15-Min Live)</div>
                    </button>
                  </div>
                </div>

                {/* Candidate Resume Context & Upload Widget */}
                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <img src="/emojis/resume.png" alt="" className="w-4 h-4 object-contain" />
                      <span>Candidate Resume Connected:</span>
                    </div>

                    {/* Direct Upload Resume Button */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleDirectResumeUpload}
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingResume}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        {isUploadingResume ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingResume ? 'Analyzing...' : 'Upload Different Resume'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-slate-700 dark:text-slate-300 text-xs space-y-1.5 font-medium">
                    <div className="flex flex-wrap items-center gap-2 pb-1">
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-black text-[11px] inline-flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                        <img src="/emojis/target.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Sector: {analysisData?.detectedSector || resume?.sector || 'Software Engineering & Technology'}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[11px] inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                        <img src="/emojis/check.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Role: {targetRole}</span>
                      </span>
                    </div>
                    <div>
                      • Candidate: <strong>{user?.name || 'Candidate'}</strong> {user?.rollNumber ? `(${user.rollNumber})` : ''}
                    </div>
                    <div>
                      • Department & Academic Background: <strong>{user?.department || 'Engineering & Technology'}{user?.cgpa ? ` • ${user.cgpa} CGPA` : ''}</strong>
                    </div>
                    <div>
                      • Highlighted Skills & Competencies: <strong className="text-indigo-600 dark:text-indigo-400">{userSkillsText}</strong>
                    </div>
                    {resume?.fileName && (
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                        <img src="/emojis/check.png" alt="" className="w-3.5 h-3.5 object-contain" />
                        <span>Uploaded Custom Resume: <strong>{resume.fileName}</strong> {resume.fileSize ? `(${resume.fileSize})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Voice Mode Controls */}
                <div className="p-4 rounded-3xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <img src="/emojis/speech.png" alt="" className="w-4 h-4 object-contain" />
                      <span>Gemini Live Voice Mode Enabled:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAutoListenMode(!autoListenMode)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                          autoListenMode
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {autoListenMode ? '🎙️ Auto-Mic On' : 'Manual Mic'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setAudioMuted(!audioMuted)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-indigo-600"
                        title={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
                      >
                        {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-slate-400 text-xs">
                    Gemini AI will read each question aloud. When Gemini stops speaking, your microphone automatically
                    listens (or you can type). Your answer dynamically shapes the next question!
                  </p>
                </div>

                {/* Begin Interview Button */}
                <button
                  onClick={handleStartInterview}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <img src="/emojis/interview.png" alt="" className="w-5 h-5 object-contain" />
                  <span>Start 15-Minute Gemini Live Voice Mock Interview</span>
                </button>
              </div>
            </div>

            {/* Right Past Interview Scorecards */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <img src="/emojis/trophy.png" alt="" className="w-4 h-4 object-contain" />
                  <span>Past Scorecards</span>
                </h3>
                <span className="text-xs font-bold text-slate-400">{pastSessions.length} Completed</span>
              </div>

              {pastSessions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
                  <img src="/emojis/lightbulb.png" alt="" className="w-8 h-8 object-contain mx-auto mb-2 opacity-80" />
                  No past mock interview attempts yet. Begin your first session to build your placement scorecard!
                </div>
              ) : (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {pastSessions.map((session) => (
                    <div
                      key={session.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs hover:border-indigo-400 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 dark:text-white">{session.targetRole}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black">
                          {session.overallScore}% Overall
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-black text-[10px] flex items-center gap-1 border border-indigo-200 dark:border-indigo-800">
                          <img src="/emojis/compiler.png" alt="" className="w-3 h-3 object-contain" />
                          <span>Tech: {session.technicalScore}/100</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[10px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                          <img src="/emojis/speech.png" alt="" className="w-3 h-3 object-contain" />
                          <span>Comm: {session.communicationScore}/100</span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                        <span>
                          Status: <strong className="text-emerald-600 dark:text-emerald-400">{session.hiringRecommendation}</strong>
                        </span>
                        <span className="font-mono">{new Date(session.completedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RESUME ANALYSIS & 3-TIER QUESTION BANK (EASY, HARD, TOUGH) */}
          {/* ========================================================================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                  <img src="/emojis/sparkles.png" alt="" className="w-4 h-4 object-contain" />
                  <span>Gemini AI Resume Breakdown</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  Interview Questions Separated into 3 Difficulty Tiers
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Analyzed from candidate's full resume text, academic projects, and technology competencies
                </p>
              </div>

              {/* 3 Tier Navigation Tabs */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setActiveTierPreview('easy')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeTierPreview === 'easy'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <img src="/emojis/lightbulb.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>1. Easy Tier</span>
                </button>

                <button
                  onClick={() => setActiveTierPreview('hard')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeTierPreview === 'hard'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <img src="/emojis/fire.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>2. Hard Tier</span>
                </button>

                <button
                  onClick={() => setActiveTierPreview('tough')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    activeTierPreview === 'tough'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <img src="/emojis/trophy.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>3. Tough Tier</span>
                </button>
              </div>
            </div>

            {analysisLoading ? (
              <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Gemini AI is analyzing your uploaded resume and generating tailored questions...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Executive Summary from Resume */}
                {analysisData && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
                    <span className="font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block mb-1">
                      Gemini Candidate Profile Assessment:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                      {analysisData.candidateSummary}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {analysisData.detectedTechStack?.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 text-[10px]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Question Cards for Selected Tier */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(analysisData?.questions?.[activeTierPreview] || []).map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className={`p-5 rounded-3xl border transition-all space-y-3 text-xs flex flex-col justify-between ${
                        activeTierPreview === 'easy'
                          ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                          : activeTierPreview === 'hard'
                          ? 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 ${
                              activeTierPreview === 'easy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : activeTierPreview === 'hard'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <img
                              src={
                                activeTierPreview === 'easy'
                                  ? '/emojis/lightbulb.png'
                                  : activeTierPreview === 'hard'
                                  ? '/emojis/fire.png'
                                  : '/emojis/trophy.png'
                              }
                              alt=""
                              className="w-3 h-3 object-contain"
                            />
                            <span>{q.difficulty} Level</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                        </div>

                        <div className="font-extrabold text-slate-900 dark:text-white text-xs">{q.roundTitle}</div>
                        <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                          "{q.question}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                        <span>Topic: <strong>{q.topic}</strong></span>
                        <button
                          type="button"
                          onClick={() => speakAIQuestion(q.question)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                        >
                          <Volume2 className="w-3 h-3" /> Listen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ACTIVE LIVE MOCK INTERVIEW WORKSPACE (VOICE MODE & INTERACTIVE) */}
      {/* ========================================================================= */}
      {step === 'interviewing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* 15-Minute Live Interview Session Header & Timer */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-[11px] font-black uppercase flex items-center gap-1.5 shadow-xs ${
                    currentDifficulty === 'Easy'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                      : currentDifficulty === 'Hard'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                  }`}
                >
                  <img
                    src={
                      currentDifficulty === 'Easy'
                        ? '/emojis/lightbulb.png'
                        : currentDifficulty === 'Hard'
                        ? '/emojis/fire.png'
                        : '/emojis/trophy.png'
                    }
                    alt=""
                    className="w-3.5 h-3.5 object-contain"
                  />
                  <span>{currentDifficulty} Tier</span>
                </span>

                <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-black border border-slate-200 dark:border-slate-700">
                  Question #{currentRoundIndex + 1}
                </span>

                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Sector: <strong>{analysisData?.detectedSector || resume?.sector || 'Domain Specialist'}</strong> • Role: <strong>{targetRole}</strong>
                </span>
              </div>

              <div className="text-xl font-black text-slate-900 dark:text-white">
                {currentRoundTitle}
              </div>
            </div>

            {/* 15-Minute Countdown Timer & Live Action Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Running Score Badges if at least 1 question is evaluated */}
              {transcriptHistory.length > 0 && (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-[11px] font-black text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <img src="/emojis/compiler.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>Tech: {Math.round(transcriptHistory.reduce((acc, q) => acc + (q.technicalMark || 0), 0) / transcriptHistory.length)}%</span>
                  </span>
                  <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-[11px] font-black text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                    <img src="/emojis/speech.png" alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>Comm: {Math.round(transcriptHistory.reduce((acc, q) => acc + (q.communicationMark || 0), 0) / transcriptHistory.length)}%</span>
                  </span>
                </div>
              )}

              {/* 15-Minute Live Clock Pill */}
              <div
                className={`px-4 py-2 rounded-2xl flex items-center gap-2.5 border font-mono font-black shadow-sm transition-all ${
                  timeRemaining > 300
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : timeRemaining > 120
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                    : 'bg-rose-50 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 animate-pulse'
                }`}
              >
                <Clock className="w-4 h-4 animate-spin-slow" />
                <span className="text-base tracking-wider">{formatTime(timeRemaining)}</span>
                <span className="text-[10px] font-sans font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white/70 dark:bg-black/40">
                  {timeRemaining > 300 ? '15m Live' : timeRemaining > 120 ? 'Wrap-Up' : 'Final Mins'}
                </span>
              </div>

              {/* Timer Pause/Play toggle */}
              <button
                type="button"
                onClick={() => setIsTimerPaused(!isTimerPaused)}
                className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
                title={isTimerPaused ? 'Resume 15-Minute Timer' : 'Pause Timer'}
              >
                {isTimerPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Conclude Early Button */}
              {transcriptHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleConcludeInterview}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-md border border-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Conclude & Score</span>
                </button>
              )}
            </div>
          </div>

          {/* 15-Minute Time Progress Bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeRemaining > 300
                  ? 'bg-gradient-to-r from-emerald-500 to-indigo-500'
                  : timeRemaining > 120
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-rose-600'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, ((TOTAL_SESSION_SECONDS - timeRemaining) / TOTAL_SESSION_SECONDS) * 100))}%`
              }}
            ></div>
          </div>

          {/* AI INTERVIEWER LIVE SPEECH BOX WITH VOICE VISUALIZER */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-950 text-white space-y-4 relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg ${
                    isSpeakingAI
                      ? 'bg-gradient-to-tr from-indigo-500 to-violet-500 ring-4 ring-indigo-500/40 animate-pulse'
                      : 'bg-slate-800'
                  }`}
                >
                  <img src="/emojis/chatbot.png" alt="Bot" className="w-8 h-8 object-contain" />
                </div>
                <div>
                  <div className="text-xs font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                    <span>Gemini AI Corporate Interviewer</span>
                    <img src="/emojis/sparkles.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <span>Voice Mode Active</span>
                    {isSpeakingAI && (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Speaking...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls: Replay Audio & Soundwave */}
              <div className="flex items-center gap-2">
                {/* Animated Audio Equalizer Bars when AI is speaking */}
                {isSpeakingAI && (
                  <div className="flex items-end gap-1 h-6 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-3"></span>
                    <span className="w-1 bg-indigo-300 rounded-full animate-pulse h-5"></span>
                    <span className="w-1 bg-violet-400 rounded-full animate-pulse h-4"></span>
                    <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-6"></span>
                    <span className="w-1 bg-indigo-400 rounded-full animate-pulse h-3"></span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => speakAIQuestion(`${currentInterviewerReaction ? currentInterviewerReaction + ' ' : ''}${currentQuestion}`)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 shadow-sm"
                >
                  <img src="/emojis/speech.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Re-play Audio</span>
                </button>
              </div>
            </div>

            {/* Conversational Reaction to Previous Answer */}
            {currentInterviewerReaction && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/70 border border-indigo-800/80 text-xs text-indigo-200 font-medium">
                <span className="font-black uppercase tracking-wider text-indigo-300 block mb-0.5">
                  Interviewer Reaction to Your Answer:
                </span>
                "{currentInterviewerReaction}"
              </div>
            )}

            {/* Active Question Text */}
            <div className="space-y-2 pt-1">
              <p className="text-base md:text-lg font-bold leading-relaxed text-slate-100 font-sans">
                "{currentQuestion}"
              </p>
              {currentTips && (
                <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 pt-1">
                  <img src="/emojis/lightbulb.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>Interviewer Tip: {currentTips}</span>
                </div>
              )}
            </div>
          </div>

          {/* CANDIDATE CANDIDATE RESPONSE SECTION (MICROPHONE VOICE + TEXT) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <img src="/emojis/interview.png" alt="" className="w-4 h-4 object-contain" />
                <span>Your Spoken Answer (Mic Voice Mode or Type):</span>
              </label>

              {/* Microphone Action Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-md ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-500/30'
                      : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white'
                  }`}
                >
                  <img src="/emojis/interview.png" alt="" className="w-4 h-4 object-contain" />
                  <span>{isListening ? 'Stop Recording Voice' : '🎙️ Speak with Microphone'}</span>
                </button>
              </div>
            </div>

            {/* Live Audio Listening Notification Banner */}
            {isListening && (
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs font-bold flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                  <span>Live Microphone Active: Speak your technical explanation clearly...</span>
                </div>
                <span className="text-[11px] font-mono">Real-Time Speech-to-Text</span>
              </div>
            )}

            {/* Answer Textarea */}
            <textarea
              rows={6}
              value={spokenTranscript}
              onChange={(e) => setSpokenTranscript(e.target.value)}
              placeholder="Speak into your microphone or type your response here. Gemini will analyze your answer in real time and ask the next question..."
              className="w-full p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 shadow-inner leading-relaxed"
            />

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSpokenTranscript('')}
                  className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-xs font-bold flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Answer
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  {spokenTranscript.trim() ? `${spokenTranscript.trim().split(/\s+/).length} words` : '0 words'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {transcriptHistory.length >= 1 && (
                  <button
                    type="button"
                    onClick={handleConcludeInterview}
                    className="px-5 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Conclude Interview & View Scorecard</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNextRound}
                  disabled={isAiThinking}
                  className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAiThinking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Gemini is evaluating your answer...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer & Ask Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* LIVE ALLOCATED MARKS LEDGER (TRANSPARENT MARK ALLOCATION PER TURN) */}
          {transcriptHistory.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <img src="/emojis/trophy.png" alt="" className="w-4 h-4 object-contain" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Live Allocated Marks Ledger ({transcriptHistory.length} Question{transcriptHistory.length > 1 ? 's' : ''} Scored)
                  </h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  15-Min Live Session Running Ledger
                </span>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {transcriptHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px]">
                          Q#{item.round}
                        </span>
                        <span>{item.roundTitle}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-black text-[11px] flex items-center gap-1">
                          <img src="/emojis/compiler.png" alt="" className="w-3.5 h-3.5 object-contain" />
                          <span>Tech: {item.technicalMark}/100</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-black text-[11px] flex items-center gap-1">
                          <img src="/emojis/speech.png" alt="" className="w-3.5 h-3.5 object-contain" />
                          <span>Comm: {item.communicationMark}/100</span>
                        </span>
                        <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[11px]">
                          {item.score}% Score
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-600 dark:text-slate-400 text-[11px] line-clamp-2 italic">
                      "Your answer: {item.studentAnswer}"
                    </div>

                    {item.feedback && (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5 font-medium">
                        <img src="/emojis/lightbulb.png" alt="" className="w-3.5 h-3.5 object-contain mt-0.5 shrink-0" />
                        <span><strong>Evaluator Feedback:</strong> {item.feedback}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: EVALUATION ANIMATION */}
      {/* ========================================================================= */}
      {step === 'evaluating' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center shadow-2xl space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto shadow-inner">
            <img src="/emojis/trophy.png" alt="" className="w-12 h-12 object-contain animate-bounce" />
          </div>
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              Generating Final Evaluation Scorecard...
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Gemini AI is compiling your Technical Skill Marks, Spoken Communication Fluency, and Algorithmic Logic
              against your uploaded resume.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: COMPREHENSIVE RESULT REPORT CARD */}
      {/* ========================================================================= */}
      {step === 'result' && resultSession && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
          {/* Header Scorecard */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase flex items-center gap-1.5">
                  <img src="/emojis/trophy.png" alt="" className="w-3.5 h-3.5 object-contain" />
                  <span>{resultSession.hiringRecommendation}</span>
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {resultSession.id}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                Corporate Mock Interview Evaluation Scorecard
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Candidate: <strong>{resultSession.studentName}</strong> ({resultSession.studentRollNumber}) • Target
                Role: <strong>{resultSession.targetRole}</strong> • <strong>15-Minute Live Session ({resultSession.transcript.length} Question{resultSession.transcript.length > 1 ? 's' : ''} Scored)</strong>
              </p>
            </div>

            {/* Overall Score Dial */}
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-5 rounded-3xl text-center shadow-lg min-w-44 flex flex-col items-center justify-center">
              <div className="text-4xl font-black">{resultSession.overallScore}%</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-indigo-200 mt-1 flex items-center gap-1">
                <img src="/emojis/trophy.png" alt="" className="w-3 h-3 object-contain" />
                <span>Overall Placement Score</span>
              </div>
            </div>
          </div>

          {/* Primary Marks Section: Technical Skill Mark & Communication Skill Mark */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skill Mark Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
                    <img src="/emojis/compiler.png" alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-indigo-300">
                      Technical Skill Mark
                    </h3>
                    <div className="text-xs text-slate-300 font-medium">
                      Domain Depth, Code Logic & System Design
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-300">
                    {resultSession.technicalScore}
                    <span className="text-sm text-indigo-400">/100</span>
                  </div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {resultSession.technicalScore >= 85
                      ? '🌟 Excellent'
                      : resultSession.technicalScore >= 70
                      ? '👍 Good'
                      : '💡 Practice Recommended'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-indigo-900">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${resultSession.technicalScore}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-medium text-slate-300">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-indigo-900/50 text-center">
                  <div className="text-[9px] text-indigo-400 uppercase font-bold">Algorithms</div>
                  <div className="font-extrabold text-white">{resultSession.logicScore}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-indigo-900/50 text-center">
                  <div className="text-[9px] text-indigo-400 uppercase font-bold">Architecture</div>
                  <div className="font-extrabold text-white">{Math.min(100, resultSession.technicalScore + 2)}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-indigo-900/50 text-center">
                  <div className="text-[9px] text-indigo-400 uppercase font-bold">Accuracy</div>
                  <div className="font-extrabold text-white">{Math.min(100, resultSession.technicalScore - 1)}%</div>
                </div>
              </div>
            </div>

            {/* Communication Skill Mark Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/90 via-slate-950 to-slate-900 border-2 border-emerald-500/50 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <img src="/emojis/speech.png" alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-300">
                      Communication Skill Mark
                    </h3>
                    <div className="text-xs text-slate-300 font-medium">
                      Speech Fluency, Vocabulary & Articulation
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-300">
                    {resultSession.communicationScore}
                    <span className="text-sm text-emerald-400">/100</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {resultSession.communicationScore >= 85
                      ? '🗣️ High Fluency'
                      : resultSession.communicationScore >= 70
                      ? '💬 Clear Voice'
                      : '📢 Articulation Practice'}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-emerald-900">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                  style={{ width: `${resultSession.communicationScore}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-medium text-slate-300">
                <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/50 text-center">
                  <div className="text-[9px] text-emerald-400 uppercase font-bold">Fluency</div>
                  <div className="font-extrabold text-white">{resultSession.communicationScore}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/50 text-center">
                  <div className="text-[9px] text-emerald-400 uppercase font-bold">Confidence</div>
                  <div className="font-extrabold text-white">{resultSession.confidenceScore}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/50 text-center">
                  <div className="text-[9px] text-emerald-400 uppercase font-bold">HR Readiness</div>
                  <div className="font-extrabold text-white">
                    {Math.min(100, resultSession.communicationScore + 1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <h4 className="font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <img src="/emojis/check.png" alt="" className="w-4 h-4 object-contain" />
                <span>Identified Core Strengths:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                {resultSession.strengthAreas.map((str, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
              <h4 className="font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <img src="/emojis/warning.png" alt="" className="w-4 h-4 object-contain" />
                <span>Recommended Growth Areas:</span>
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 font-medium">
                {resultSession.weaknessAreas.map((weak, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Question-by-Question Interactive Breakdown */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <img src="/emojis/interview.png" alt="" className="w-4 h-4 object-contain" />
              <span>Full Interactive Interview Transcript & Feedback:</span>
            </h3>

            <div className="space-y-4">
              {resultSession.transcript.map((item) => (
                <div
                  key={item.round}
                  className="p-5 md:p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          item.difficulty === 'Easy'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.difficulty === 'Hard'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.difficulty || 'Easy'}
                      </span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-sm">{item.roundTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-black text-[11px] flex items-center gap-1">
                        <img src="/emojis/compiler.png" alt="" className="w-3 h-3 object-contain" />
                        <span>Tech: {item.technicalMark || item.score}/100</span>
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-black text-[11px] flex items-center gap-1">
                        <img src="/emojis/speech.png" alt="" className="w-3 h-3 object-contain" />
                        <span>Comm: {item.communicationMark || item.score}/100</span>
                      </span>
                    </div>
                  </div>

                  <div className="font-bold text-slate-900 dark:text-white">Q: "{item.question}"</div>
                  <div className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed">
                    A: {item.studentAnswer}
                  </div>

                  <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50/80 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 flex items-start gap-2">
                    <img src="/emojis/sparkles.png" alt="" className="w-3.5 h-3.5 object-contain shrink-0 mt-0.5" />
                    <div>AI Feedback: {item.feedback}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => {
                setStep('intro');
                setTranscriptHistory([]);
                setSpokenTranscript('');
              }}
              className="px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider shadow-md flex items-center gap-2"
            >
              <img src="/emojis/interview.png" alt="" className="w-4 h-4 object-contain" />
              <span>Attempt Another Mock Interview</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
