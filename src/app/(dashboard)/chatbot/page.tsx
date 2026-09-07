'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { Bot, Send, User as UserIcon, Sparkles, Code2, Building2, HelpCircle, RefreshCw, Copy, Check, ShieldAlert } from 'lucide-react';

export default function ChatbotPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; sources?: any[]; timestamp: string }>>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Hello! 👋 I am your **SGIP AI Student Chatbot**. 

I am here to answer **all sorts of queries** regarding:
- 🏢 **Campus Placement Drives & CGPA Cutoffs** (Google, Microsoft, Amazon, TCS, etc.)
- 💻 **Coding & Programming Solutions** (Python, C++, Java, Data Structures, Algorithms, SQL)
- 🗣️ **Technical & HR Interview Question Prep**
- 📄 **ATS Resume Optimization & Placement Strategies**

Ask me any question or pick a quick prompt below to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiLoading]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.activeUser);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const queryToSend = presetQuery || query;
    if (!queryToSend.trim() || aiLoading) return;

    const userMsg = {
      id: `u_${Date.now()}`,
      role: 'user' as const,
      content: queryToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToSend, isTestActive: false })
      });

      const data = await res.json();
      if (res.ok && data.answer) {
        const assistantMsg = {
          id: `a_${Date.now()}`,
          role: 'assistant' as const,
          content: data.answer,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            role: 'assistant',
            content: data.error || 'I encountered an error processing your query. Please try asking again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        role: 'assistant',
        content: `Chat session reset. Ask me any query regarding your studies, coding algorithms, or campus placement drives!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span>Initializing SGIP AI Student Chatbot...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 border border-indigo-500/40 rounded-3xl p-5 md:p-6 text-white shadow-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> SGIP Intelligent AI Assistant
            </div>
            <h1 className="text-xl font-black text-white">AI Student Chatbot</h1>
            <p className="text-xs text-slate-300 font-medium">Ask any query regarding coding, company cutoffs, interview prep, or placement rules.</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Preset Quick Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Queries:
        </span>
        <button
          onClick={() => handleSendMessage(undefined, 'Am I eligible for Google and Microsoft placement drives?')}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all shrink-0 flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" /> Google & Microsoft Eligibility?
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'Write Dijkstra algorithm in Python with graph example')}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all shrink-0 flex items-center gap-1.5"
        >
          <Code2 className="w-3.5 h-3.5" /> Python Dijkstra Code
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'How to answer Tell Me About Yourself using STAR method?')}
          className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 transition-all shrink-0 flex items-center gap-1.5"
        >
          <HelpCircle className="w-3.5 h-3.5" /> Tell Me About Yourself (HR)
        </button>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-inner overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl p-4 rounded-3xl space-y-2 relative group ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium shadow-md rounded-tr-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                {msg.content}
              </div>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono">
                  <span className="font-bold uppercase">Verified Data Source:</span> {msg.sources.map(s => s.title).join(', ')}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[10px] opacity-75 font-mono">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="hover:text-indigo-400 flex items-center gap-1 font-sans font-bold"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {aiLoading && (
          <div className="flex items-center gap-3 py-2 text-xs text-indigo-600 font-bold">
            <div className="w-6 h-6 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-spin">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span>SGIP AI Assistant is generating response...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Box */}
      <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-3 shrink-0">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask any question (e.g. 'Explain binary search tree in C++', 'What is the cutoff for Amazon?', 'How to write an ATS summary?')..."
          className="flex-1 px-5 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/40 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 shadow-md"
        />
        <button
          type="submit"
          disabled={aiLoading || !query.trim()}
          className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider shadow-lg transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Send Query</span>
        </button>
      </form>
    </div>
  );
}
