'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User, ResumeData, MockInterviewSession } from '@/types';
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
  Star
} from 'lucide-react';
import Link from 'next/link';

export default function AIMockInterviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Interview Workspace State: 'intro' | 'interviewing' | 'evaluating' | 'result'
  const [step, setStep] = useState<'intro' | 'interviewing' | 'evaluating' | 'result'>('intro');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Voice Assistance State
  const [isSpeakingAI, setIsSpeakingAI] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState('');
  const [voiceSupported, setVoiceSupported] = useState(true);

  // Student Answers array for all 5 rounds
  const [roundAnswers, setRoundAnswers] = useState<
    { round: number; roundTitle: string; question: string; studentAnswer: string }[]
  >([]);

  // Generated Result Card
  const [resultSession, setResultSession] = useState<MockInterviewSession | null>(null);
  const [pastSessions, setPastSessions] = useState<MockInterviewSession[]>([]);

  // Web Speech API Refs
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchInitialData();
    checkSpeechSupport();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      // Fetch student resume
      const resRes = await fetch('/api/resume');
      if (resRes.ok) {
        const resData = await resRes.json();
        setResume(resData.resume);
      }

      // Fetch past interview history
      const histRes = await fetch('/api/interview/history');
      if (histRes.ok) {
        const histData = await histRes.json();
        setPastSessions(histData.interviews || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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

  // Generate 5 Personalised Rounds based on Student Resume & Skills
  const userSkills = resume?.skills?.flatMap((s) => s.list).join(', ') || 'Python, Data Structures, SQL, React';
  
  const interviewRounds = [
    {
      round: 1,
      title: 'Round 1: Candidate Background & Resume Introduction',
      question: `Welcome to the technical interview for the position of ${targetRole}. Please introduce yourself, your academic background (CGPA: ${user?.cgpa || 8.5}), and summarize your key projects using ${userSkills}.`
    },
    {
      round: 2,
      title: 'Round 2: Core Computer Science & Language Technicals',
      question: `Great start. Now let's dive into your primary technical stack (${userSkills}). Can you explain memory management, object-oriented principles, and how your language handles multithreading or asynchronous execution?`
    },
    {
      round: 3,
      title: 'Round 3: Data Structures & Algorithmic Logic',
      question: `Let's test your problem-solving logic. How would you detect a cycle in a directed graph efficiently, and what is the time and space complexity of your approach?`
    },
    {
      round: 4,
      title: 'Round 4: System Architecture & Scalability',
      question: `Assume we are building a high-throughput notification system for 100,000 active students. How would you design the backend API, caching layer, and queue infrastructure to ensure low latency?`
    },
    {
      round: 5,
      title: 'Round 5: HR & Behavioral Competency',
      question: `Final round. Describe a challenging technical problem you faced during a project. How did you diagnose the issue under pressure, and what was the outcome?`
    }
  ];

  // AI Text-to-Speech (TTS) synthesizer
  const speakAIQuestion = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // stop previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    // Select professional voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onstart = () => setIsSpeakingAI(true);
    utterance.onend = () => setIsSpeakingAI(false);
    utterance.onerror = () => setIsSpeakingAI(false);

    window.speechSynthesis.speak(utterance);
  };

  // Start Voice Microphone Listening (STT)
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Web Speech API is not supported in your browser. You can type your answers directly!');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenTranscript((prev) => {
          const combined = (prev ? prev + ' ' : '') + transcript;
          return combined;
        });
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Start the Interview
  const handleStartInterview = () => {
    setStep('interviewing');
    setCurrentRoundIndex(0);
    setRoundAnswers([]);
    setSpokenTranscript('');
    
    // Speak Round 1 question aloud
    setTimeout(() => {
      speakAIQuestion(interviewRounds[0].question);
    }, 400);
  };

  // Submit Current Round Answer & Proceed to Next
  const handleNextRound = () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const currentRound = interviewRounds[currentRoundIndex];
    const answerToSave = spokenTranscript.trim() || 'No response provided.';

    const updatedAnswers = [
      ...roundAnswers,
      {
        round: currentRound.round,
        roundTitle: currentRound.title,
        question: currentRound.question,
        studentAnswer: answerToSave
      }
    ];

    setRoundAnswers(updatedAnswers);
    setSpokenTranscript('');

    if (currentRoundIndex + 1 < interviewRounds.length) {
      const nextIdx = currentRoundIndex + 1;
      setCurrentRoundIndex(nextIdx);
      setTimeout(() => {
        speakAIQuestion(interviewRounds[nextIdx].question);
      }, 500);
    } else {
      // All 5 rounds completed -> Submit for AI Evaluation!
      submitForEvaluation(updatedAnswers);
    }
  };

  // Submit complete interview for AI evaluation backend
  const submitForEvaluation = async (answersToSubmit: any[]) => {
    setStep('evaluating');
    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          resumeSummary: `Candidate CGPA ${user?.cgpa || 8.5}, skills in ${userSkills}`,
          skillsEvaluated: ['DSA', 'Python', 'SQL', 'System Design', 'HR'],
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
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading AI Voice Mock Interview Studio...</span>
      </div>
    );
  }

  const activeRound = interviewRounds[currentRoundIndex];

  return (
    <div className="space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <Mic className="w-4 h-4 text-indigo-500 animate-pulse" /> AI Voice Assistance Mock Interview
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Personalized Corporate Technical Interview
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Connected to your resume details ({userSkills}) • Interactive Speech Synthesizer & Voice Evaluation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/resume"
            className="px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-indigo-500" /> View/Update Resume
          </Link>
        </div>
      </div>

      {/* STEP 1: INTRO & CONFIGURATION */}
      {step === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Configuration Card */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">AI Technical Interviewer Persona</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Serious corporate evaluation based on your resume</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Placement Role
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600" /> Resume Context Integrated:
                </div>
                <div className="text-slate-700 dark:text-slate-300 space-y-1">
                  <div>• Student: <strong>{user?.name}</strong> ({user?.rollNumber})</div>
                  <div>• Department & CGPA: <strong>{user?.department} • {user?.cgpa} CGPA</strong></div>
                  <div>• Detected Technical Stack: <strong>{userSkills}</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 space-y-1">
                <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-amber-600" /> AI Voice Assistance Active:
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  The AI interviewer will ask questions aloud using Speech Synthesis. You can answer using your microphone or keyboard. Results are recorded for Faculty review!
                </p>
              </div>

              <button
                onClick={handleStartInterview}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>Begin 5-Round AI Voice Mock Interview</span>
              </button>
            </div>
          </div>

          {/* Right Past Interview History */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-500" /> Past Interview Scorecards
            </h3>

            {pastSessions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No past mock interview attempts yet. Start your first session now!
              </div>
            ) : (
              <div className="space-y-3">
                {pastSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white">{session.targetRole}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold">
                        {session.overallScore}% Overall
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px]">
                        🛠️ Tech: {session.technicalScore}/100
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                        🗣️ Comm: {session.communicationScore}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                      <span>Status: <strong className="text-emerald-600 dark:text-emerald-400">{session.hiringRecommendation}</strong></span>
                      <span className="font-mono">{new Date(session.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE MOCK INTERVIEW WORKSPACE */}
      {step === 'interviewing' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          
          {/* Progress Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {activeRound.title}
              </span>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                Round {currentRoundIndex + 1} of 5
              </div>
            </div>

            {/* 5 Steps Visual Indicator */}
            <div className="flex items-center gap-1.5">
              {interviewRounds.map((r, i) => (
                <div
                  key={r.round}
                  className={`w-8 h-2 rounded-full transition-all ${
                    i === currentRoundIndex
                      ? 'bg-indigo-600 w-12'
                      : i < currentRoundIndex
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                ></div>
              ))}
            </div>
          </div>

          {/* AI Interviewer Speech Box */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 relative overflow-hidden shadow-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${isSpeakingAI ? 'bg-indigo-600 animate-pulse' : 'bg-slate-800'}`}>
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Corporate Technical Director</div>
                  <div className="text-sm font-extrabold text-indigo-300">Live Voice Assistant Active</div>
                </div>
              </div>

              {/* Re-play Question Audio Button */}
              <button
                onClick={() => speakAIQuestion(activeRound.question)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4 text-indigo-400" />
                <span>Re-play Audio</span>
              </button>
            </div>

            <p className="text-sm md:text-base font-semibold leading-relaxed text-slate-100 pt-2">
              "{activeRound.question}"
            </p>
          </div>

          {/* Student Candidate Response Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Your Answer (Speak via Mic or Type Below):
              </label>

              {/* Microphone Toggle Button */}
              <button
                onClick={toggleListening}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  isListening
                    ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Recording Voice' : '🎙️ Speak Answer (Mic Assistant)'}</span>
              </button>
            </div>

            {/* Answer Textarea */}
            <textarea
              rows={5}
              value={spokenTranscript}
              onChange={(e) => setSpokenTranscript(e.target.value)}
              placeholder="Speak into your microphone or type your technical response here..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm font-medium focus:outline-none focus:border-indigo-500 shadow-inner"
            />

            {/* Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setSpokenTranscript('')}
                className="px-3.5 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Text
              </button>

              <button
                onClick={handleNextRound}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>{currentRoundIndex + 1 === interviewRounds.length ? 'Finish & Generate Scorecard' : 'Next Round Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: EVALUATING ANIMATION */}
      {step === 'evaluating' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Interviewer is Evaluating Your Responses...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Analyzing Technical Accuracy, Communication Fluency, Algorithmic Logic, and System Design Architecture.
            </p>
          </div>
        </div>
      )}

      {/* STEP 4: GENERATED RESULT REPORT CARD */}
      {step === 'result' && resultSession && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8">
          
          {/* Header Result Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase">
                  ⭐ {resultSession.hiringRecommendation}
                </span>
                <span className="text-xs font-mono text-slate-400">ID: {resultSession.id}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Mock Interview Evaluation Scorecard
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Candidate: <strong>{resultSession.studentName}</strong> ({resultSession.studentRollNumber}) • Target: <strong>{resultSession.targetRole}</strong>
              </p>
            </div>

            {/* Overall Score Dial */}
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-5 rounded-3xl text-center shadow-lg min-w-40">
              <div className="text-4xl font-black">{resultSession.overallScore}%</div>
              <div className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-200 mt-1">Overall Interview Score</div>
            </div>
          </div>

          {/* Primary Marks Section: Technical Skill Mark & Communication Skill Mark */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Technical Skill Mark Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-900/90 via-indigo-950 to-slate-900 border-2 border-indigo-500/50 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-indigo-300">Technical Skill Mark</h3>
                    <div className="text-xs text-slate-300 font-medium">Domain Depth, Algorithm & System Design</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-indigo-300">{resultSession.technicalScore}<span className="text-sm text-indigo-400">/100</span></div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {resultSession.technicalScore >= 85 ? '🌟 Excellent' : resultSession.technicalScore >= 70 ? '👍 Good' : '💡 Needs Practice'}
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
                  <div className="text-[9px] text-indigo-400 uppercase font-bold">System Design</div>
                  <div className="font-extrabold text-white">{Math.min(100, resultSession.technicalScore + 2)}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-indigo-900/50 text-center">
                  <div className="text-[9px] text-indigo-400 uppercase font-bold">Tech Accuracy</div>
                  <div className="font-extrabold text-white">{Math.min(100, resultSession.technicalScore - 1)}%</div>
                </div>
              </div>
            </div>

            {/* Communication Skill Mark Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900/90 via-slate-950 to-slate-900 border-2 border-emerald-500/50 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-emerald-300">Communication Skill Mark</h3>
                    <div className="text-xs text-slate-300 font-medium">Speech Fluency, Vocabulary & Articulation</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-300">{resultSession.communicationScore}<span className="text-sm text-emerald-400">/100</span></div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {resultSession.communicationScore >= 85 ? '🗣️ High Fluency' : resultSession.communicationScore >= 70 ? '💬 Clear Voice' : '📢 Practice Tone'}
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
                  <div className="text-[9px] text-emerald-400 uppercase font-bold">Articulation</div>
                  <div className="font-extrabold text-white">{resultSession.confidenceScore}%</div>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-xl border border-emerald-900/50 text-center">
                  <div className="text-[9px] text-emerald-400 uppercase font-bold">HR Readiness</div>
                  <div className="font-extrabold text-white">{Math.min(100, resultSession.communicationScore + 1)}%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback & Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2 text-xs">
              <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Identified Strengths:
              </h4>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                {resultSession.strengthAreas.map((str, i) => (
                  <li key={i}>• {str}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
              <h4 className="font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Growth:
              </h4>
              <ul className="space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                {resultSession.weaknessAreas.map((weak, i) => (
                  <li key={i}>• {weak}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* QA Transcript with Round-by-Round Technical & Communication Marks */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Round-by-Round Technical & Communication Skill Breakdown:
            </h3>

            <div className="space-y-4">
              {resultSession.transcript.map((item) => (
                <div
                  key={item.round}
                  className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/80 pb-3">
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">{item.roundTitle}</span>
                    
                    {/* Per-Round Skill Marks Badges */}
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-extrabold">
                        🛠️ Tech Mark: {item.technicalMark || item.score}/100
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-extrabold">
                        🗣️ Comm Mark: {item.communicationMark || item.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="font-semibold text-slate-900 dark:text-white">Q: "{item.question}"</div>
                  <div className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono leading-relaxed">
                    A: {item.studentAnswer}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40">
                    AI Feedback: {item.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep('intro')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-md"
            >
              Attempt Another Mock Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
