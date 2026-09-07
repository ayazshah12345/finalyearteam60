'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, FileSpreadsheet, Building2, HelpCircle } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    courses: any[];
    assignments: any[];
    drives: any[];
    questions: any[];
  }>({ courses: [], assignments: [], drives: [], questions: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
        }
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], assignments: [], drives: [], questions: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults = results.courses.length + results.assignments.length + results.drives.length + results.questions.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, assignments, placement drives, questions..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Container */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              Searching SGIP Repository...
            </div>
          )}

          {!loading && query && totalResults === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching records found for "{query}".
            </div>
          )}

          {/* Courses */}
          {results.courses.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-400" /> Courses ({results.courses.length})
              </div>
              <div className="space-y-1">
                {results.courses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/courses/${c.id}`}
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-brand-400">{c.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{c.instructorName} • {c.difficulty}</div>
                    </div>
                    <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                      Course
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Placement Drives */}
          {results.drives.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Placement Drives ({results.drives.length})
              </div>
              <div className="space-y-1">
                {results.drives.map((d) => (
                  <Link
                    key={d.id}
                    href="/placement"
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-emerald-400">{d.companyName} — {d.roleTitle}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{d.packageLPA} LPA • Min CGPA: {d.eligibility.minCgpa}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                      Placement
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Assignments */}
          {results.assignments.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5 text-accent-400" /> Assignments ({results.assignments.length})
              </div>
              <div className="space-y-1">
                {results.assignments.map((a) => (
                  <Link
                    key={a.id}
                    href="/assignments"
                    onClick={onClose}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-between group transition-all"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-white group-hover:text-accent-400">{a.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Marks: {a.totalMarks} • Type: {a.submissionType}</div>
                    </div>
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono border border-purple-500/30">
                      Assignment
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
