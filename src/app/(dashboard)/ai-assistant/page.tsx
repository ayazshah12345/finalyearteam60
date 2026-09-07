'use client';

import React, { useState, useEffect } from 'react';
import { User, AIKnowledgeSource } from '@/types';
import { Bot, Send, Sparkles, Upload, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AIAssistantPage() {
  const [user, setUser] = useState<User | null>(null);
  const [sources, setSources] = useState<AIKnowledgeSource[]>([]);
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload Document State for Faculty
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('Operating Systems & Concurrency Notes');
  const [docType, setDocType] = useState<'PDF' | 'PPT' | 'Notes' | 'Course Material'>('Notes');
  const [docContent, setDocContent] = useState('Process synchronization involves mutex locks, semaphores, and condition variables to prevent race conditions in concurrent execution environments.');

  const [isTestActive, setIsTestActive] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/ai/knowledge');
      const data = await res.json();
      setSources(data.sources || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { id: `m_${Date.now()}`, role: 'user', content: query, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: currentQuery })
      });
      const data = await res.json();
      const botMsg = {
        id: `m_bot_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/ai/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: docTitle, sourceType: docType, content: docContent })
      });
      const data = await res.json();
      if (data.source) {
        setSources([data.source, ...sources]);
        setShowUploadModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isTestActive) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl mt-8">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            🚫 AI Placement Agent Locked During Test
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium leading-relaxed">
            The AI Placement Assistant is disabled while an active proctored daily test session is in progress to preserve strict exam security & anti-cheating policy. Please complete or submit your test to reactivate AI assistance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest">
            <Bot className="w-4 h-4" /> SGIP RAG Knowledge Assistant
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            AI Learning Assistant & Course Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Grounded vector search over approved engineering course materials and faculty notes.
          </p>
        </div>

        {user?.role === 'FACULTY' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-all shadow-glow"
          >
            <Upload className="w-4 h-4" /> Upload Knowledge Source PDF/Notes
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chat Conversation Shell (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle flex flex-col h-[600px]">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
              <Sparkles className="w-4 h-4 text-amber-400" /> Grounded Q&A Session
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Department: {user?.department}</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {messages.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                <Bot className="w-8 h-8 mx-auto text-brand-400 opacity-60" />
                <p className="font-bold text-slate-300">Ask SGIP Assistant any question about your courses</p>
                <p className="text-[11px] text-slate-500">e.g. "Explain base case in recursion" or "What is linear heap creation proof?"</p>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-glow">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-lg p-4 rounded-2xl ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white font-medium shadow-glow'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>
                  {m.sources?.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-300 dark:border-slate-700 text-[10px] space-y-1">
                      <span className="font-bold uppercase tracking-wider text-slate-400">Sources Cited:</span>
                      {m.sources.map((s: any, idx: number) => (
                        <div key={idx} className="text-brand-400 font-semibold">• {s.title}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                Searching RAG Knowledge Chunks...
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={handleAsk} className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type your academic or technical question..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-glow hover:bg-brand-500 flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Ask AI
            </button>
          </form>
        </div>

        {/* Knowledge Base Repository List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-subtle space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-400" /> Vectorized Knowledge Sources ({sources.length})
          </div>

          <div className="space-y-3">
            {sources.map((src) => (
              <div key={src.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white">{src.title}</span>
                  <span className="text-[10px] bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded font-mono border border-brand-500/20">{src.sourceType}</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Uploaded by: {src.uploadedBy} • {src.chunkCount} Vector Chunks</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal for Faculty */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Upload Knowledge Source Document</h2>
            <form onSubmit={handleUploadKnowledge} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Document Content Text</label>
                <textarea
                  rows={5}
                  required
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste lecture notes or text contents..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold shadow-glow">Vectorize & Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
