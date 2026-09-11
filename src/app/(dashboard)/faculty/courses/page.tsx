'use client';

import React, { useState, useEffect } from 'react';
import { User, Course } from '@/types';
import { authFetch } from '@/lib/client-auth';
import {
  BookOpen,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Layers,
  Code2,
  Globe,
  Database,
  Cloud,
  Brain,
  GraduationCap,
  Clock,
  ShieldCheck,
  Video,
  FileText,
  Terminal,
  X
} from 'lucide-react';
import Link from 'next/link';

const PRESET_COVERS = [
  {
    name: 'Full Stack Web',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Python & AI',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Data Structures & Algorithms',
    url: 'https://images.unsplash.com/photo-1516116211223-4c7141944510?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Cloud & DevOps',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Database & SQL',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80'
  }
];

export default function FacultyTechnicalCoursesPage() {
  const [faculty, setFaculty] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [durationHours, setDurationHours] = useState('24');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsGained, setSkillsGained] = useState('React, Next.js, REST APIs, Tailwind CSS');
  const [learningObjectives, setLearningObjectives] = useState('Master core frontend concepts, Build scalable full stack applications, Optimize performance');
  const [notesContent, setNotesContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const authRes = await authFetch('/api/auth/me');
      const authData = await authRes.json();
      setFaculty(authData.activeUser);

      const crsRes = await fetch('/api/courses');
      const crsData = await crsRes.json();
      setCourses(crsData.courses || []);
    } catch (e) {
      console.error('Failed to load courses:', e);
    } finally {
      setLoading(false);
    }
  };

  // Convert YouTube Watch URL to embed format for live preview
  const getEmbedPreviewUrl = (url: string) => {
    if (!url) return '';
    const trimmed = url.trim();
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0&modestbranding=1`;
    }
    return trimmed;
  };

  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Course title is required.');
      return;
    }
    if (!videoUrl.trim()) {
      setErrorMsg('Please provide a valid YouTube or video course lecture link.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          difficulty,
          durationHours: Number(durationHours) || 20,
          videoUrl,
          videoTitle: videoTitle.trim() || title,
          description,
          skillsGained,
          learningObjectives,
          notesContent,
          codeSnippet,
          coverImage,
          department: faculty?.department || 'Computer Science & Engineering'
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish course');
      }

      setSuccessMsg(`🎉 Technical course "${title}" published successfully! It is now live on the Student Technical Courses dashboard with Anti-Skip Video Focus Protection.`);
      setCourses((prev) => [data.course, ...prev]);

      // Reset form
      setTitle('');
      setVideoUrl('');
      setVideoTitle('');
      setDescription('');
      setNotesContent('');
      setCodeSnippet('');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'Error publishing technical course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Technical Course Creator Desk...</span>
      </div>
    );
  }

  const liveEmbedUrl = getEmbedPreviewUrl(videoUrl);

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-4 h-4 text-amber-400" /> VSB Engineering College • Faculty Course Desk
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-indigo-400" />
              Add Technical Course & Video Lecture Desk
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium">
              Upload technical course details, YouTube/video lecture links, curriculum notes, and descriptions. Courses immediately reflect on the <strong>Student Technical Courses</strong> dashboard with <strong>anti-skip focus protection</strong>.
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
              href="/courses"
              target="_blank"
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
            >
              <ExternalLink className="w-4 h-4" /> View Student Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-3 shadow-md animate-in fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Creator Form (7 cols) & Live Preview / Catalog (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Course Creator Form (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" /> Upload Course Details & Video Lecture
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the technical course specifications. Videos will be playable within the embedded website player.
            </p>
          </div>

          <form onSubmit={handleSubmitCourse} className="space-y-5 text-xs">
            {/* Course Title */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                Course Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Next.js 15 & React Full-Stack Enterprise Mastery"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Category & Difficulty & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Programming">Programming & DSA</option>
                  <option value="Web Development">Web Development</option>
                  <option value="AI & ML">AI & Machine Learning</option>
                  <option value="Cloud Computing">Cloud Computing & DevOps</option>
                  <option value="Department Subjects">Core Department Subjects</option>
                  <option value="Placement Preparation">Placement & Interview Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">Total Duration (Hours)</label>
                <input
                  type="number"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  min="1"
                  max="200"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>
            </div>

            {/* Video Lecture URL & Platform Link */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Video className="w-4 h-4 text-indigo-600" /> Video Lecture Link (YouTube / Platform Link) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Anti-Skip Guard Enabled
                </span>
              </div>

              <div>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports any YouTube video URL or embedded video stream. Plays in website player without allowing students to skip/fast-forward.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Lecture Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Lecture 1: Comprehensive Architectural Overview"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
                />
              </div>
            </div>

            {/* Course Description */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-extrabold mb-1">
                Course Description & Syllabus Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what students will learn, prerequisites, and key technical outcomes..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium leading-relaxed focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Skills & Learning Objectives */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Skills Gained (Comma separated)
                </label>
                <input
                  type="text"
                  value={skillsGained}
                  onChange={(e) => setSkillsGained(e.target.value)}
                  placeholder="e.g. React, Next.js, Algorithms, System Design"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">
                  Learning Objectives (Comma separated)
                </label>
                <input
                  type="text"
                  value={learningObjectives}
                  onChange={(e) => setLearningObjectives(e.target.value)}
                  placeholder="e.g. Master core architecture, Build real project"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Select Preset Cover Thumbnail */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                Course Cover Image
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {PRESET_COVERS.map((cov) => (
                  <div
                    key={cov.name}
                    onClick={() => setCoverImage(cov.url)}
                    className={`relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                      coverImage === cov.url
                        ? 'border-indigo-600 ring-2 ring-indigo-500/40'
                        : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={cov.url} alt={cov.name} className="w-full h-16 object-cover" />
                    <div className="absolute inset-0 bg-slate-950/40 flex items-end p-1 text-[9px] text-white font-extrabold truncate">
                      {cov.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lecture Notes & Code Snippet (Optional Collapsible) */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Lecture Notes / Summary Content (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Key summary notes displayed below the video player..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Starter Code Snippet (Optional)
                </label>
                <textarea
                  rows={2}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Paste C++, Java, or TypeScript starter code here..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Technical Course...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Publish Technical Course to Student Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Live Video Link Preview & Active Courses (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Video Player Preview Card */}
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Play className="w-4 h-4" /> Live Video Link Player Preview
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                In-Site Player
              </span>
            </div>

            {liveEmbedUrl ? (
              <div className="space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-slate-200 dark:border-slate-800">
                  <iframe
                    src={liveEmbedUrl}
                    title="Live Course Video Preview"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="font-extrabold text-slate-900 dark:text-white truncate">
                    {videoTitle || title || 'Lecture Video'}
                  </div>
                  <div className="text-[11px] text-emerald-600 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Embedded in-site player with anti-fast-forward protection
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 px-4 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 flex items-center justify-center mx-auto">
                  <Video className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Paste a YouTube video link to preview
                </div>
                <p className="text-[11px] text-slate-500">
                  The video will automatically be converted to our website player.
                </p>
              </div>
            )}
          </div>

          {/* Active Technical Courses Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                Published Courses ({courses.length})
              </span>
              <Link
                href="/courses"
                target="_blank"
                className="text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Student Portal ↗
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {courses.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={c.coverImage} alt={c.title} className="w-12 h-10 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">{c.title}</div>
                      <div className="text-[10px] text-slate-500">
                        {c.category} • {c.durationHours} hrs • {c.difficulty}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/courses/${c.id}`}
                    target="_blank"
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 text-indigo-600 hover:bg-indigo-50 border border-slate-200 dark:border-slate-700 shrink-0"
                    title="Preview Course Player"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-600" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
