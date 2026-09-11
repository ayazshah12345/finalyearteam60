'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Course, User } from '@/types';
import {
  BookOpen,
  Clock,
  BarChart2,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Code2,
  GraduationCap,
  Layers,
  Award,
  X,
  Play,
  Terminal,
  Cpu,
  Brain,
  Globe,
  Database,
  Cloud
} from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Syllabus Modal Preview State
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);

  // New Course Modal State for Faculty
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [durationHours, setDurationHours] = useState(35);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/courses');
      const data = await res.json();
      let list: Course[] = data.courses || [];

      // Sync with client-side permanent storage
      try {
        const cached = JSON.parse(localStorage.getItem('vsb_faculty_courses') || '[]');
        if (Array.isArray(cached) && cached.length > 0) {
          cached.forEach((c: any) => {
            if (!list.some((item) => item.id === c.id)) {
              list.push(c);
            }
          });
        }
      } catch (e) {}

      setCourses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category, difficulty, durationHours })
      });
      const data = await res.json();
      if (data.course) {
        setCourses([data.course, ...courses]);
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { label: 'All', icon: Layers },
    { label: 'Programming', icon: Code2 },
    { label: 'Web Development', icon: Globe },
    { label: 'Department Subjects', icon: Database },
    { label: 'Cloud Computing', icon: Cloud },
    { label: 'AI & ML', icon: Brain },
    { label: 'Placement Preparation', icon: GraduationCap }
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.skillsGained.some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
    return matchesCategory && matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white p-8 border border-indigo-700/40 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Complete Technical & Coding Learning Platform
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Engineering Technical Courses & Skill Academy
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed font-medium">
              Master Data Structures & Algorithms, Full Stack Web Architecture, DBMS SQL Tuning, System Design, and AI/ML with interactive code playgrounds and video lectures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {user?.role === 'FACULTY' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-lg shadow-amber-500/30 transition-all"
              >
                <Plus className="w-4 h-4" /> Publish New Course
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-8 pt-6 border-t border-indigo-700/40 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-indigo-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">8+</div>
              <div className="text-[10px] text-indigo-200/70 uppercase">Technical Domains</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-blue-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">40+</div>
              <div className="text-[10px] text-indigo-200/70 uppercase">Interactive Modules</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-emerald-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">100%</div>
              <div className="text-[10px] text-indigo-200/70 uppercase">Code Playground</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-purple-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-lg font-black text-white">Verified</div>
              <div className="text-[10px] text-indigo-200/70 uppercase">Course Certificate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Python, C++, Java, React, SQL, AI..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Loading Technical Courses Catalog...</div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto border border-indigo-200/60 dark:border-indigo-800/60">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-slate-200">No Technical Courses Uploaded Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Technical courses will appear here as soon as faculty members upload and publish them from the Faculty Command Desk.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md shadow-slate-200/40 hover:shadow-2xl hover:shadow-indigo-200/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image & Category Badges */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={c.coverImage}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                  
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold px-3 py-1 rounded-full border border-slate-700/80 shadow-sm flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-indigo-400" /> {c.category}
                  </div>

                  <div className={`absolute top-3 right-3 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm ${
                    c.difficulty === 'Beginner' ? 'bg-emerald-600' :
                    c.difficulty === 'Intermediate' ? 'bg-indigo-600' : 'bg-rose-600'
                  }`}>
                    {c.difficulty}
                  </div>

                  <div className="absolute bottom-3 left-3 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs bg-slate-900/40 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> {c.durationHours} Hours Total
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                    {c.description}
                  </p>

                  <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Instructor: <strong className="text-slate-800 dark:text-slate-200">{c.instructorName}</strong></span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">{c.department}</span>
                  </div>

                  {/* Skills Gained Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {c.skillsGained.map((sk, idx) => (
                      <span key={idx} className="text-[10px] bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded-md font-mono font-bold border border-indigo-100 dark:border-slate-700">
                        #{sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPreviewCourse(c)}
                  className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center"
                >
                  Syllabus Preview
                </button>
                <Link
                  href={`/courses/${c.id}`}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200 dark:shadow-none"
                >
                  <span>Start Course</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Syllabus Preview Drawer Modal */}
      {previewCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                  {previewCourse.category} • {previewCourse.difficulty}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{previewCourse.title}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{previewCourse.description}</p>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Learning Objectives</h4>
              <div className="space-y-1.5">
                {previewCourse.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Curriculum Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Curriculum Breakdown & Code Playground</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Play className="w-3.5 h-3.5 text-indigo-600" /> Module 1: Foundational Architecture & Core Concepts
                  </div>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-mono px-2 py-0.5 rounded font-bold">12 Lessons</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Code2 className="w-3.5 h-3.5 text-emerald-500" /> Module 2: Hands-on Code Implementations & DSA Benchmarks
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-mono px-2 py-0.5 rounded font-bold">15 Lessons</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <Award className="w-3.5 h-3.5 text-amber-500" /> Module 3: Capstone System Project & Certification Exam
                  </div>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-mono px-2 py-0.5 rounded font-bold">Exam Quiz</span>
                </div>
              </div>
            </div>

            {/* Launch Course Link */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPreviewCourse(null)}
                className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 text-xs font-semibold"
              >
                Close Preview
              </button>
              <Link
                href={`/courses/${previewCourse.id}`}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-md hover:shadow-lg flex items-center gap-1.5"
              >
                <span>Launch Interactive Player</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Faculty Course Creation */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Publish New Technical Course</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Microservices Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Course Overview & Syllabus</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe learning outcomes, target audience, and prerequisite concepts..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-bold"
                  >
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Department Subjects">Department Subjects</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="AI & ML">AI & ML</option>
                    <option value="Placement Preparation">Placement Preparation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-bold"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-bold mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-md hover:bg-indigo-700"
                >
                  Publish Course to Platform
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
