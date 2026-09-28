'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import {
  Bot,
  Send,
  User as UserIcon,
  Sparkles,
  Code2,
  Building2,
  HelpCircle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  BookOpen,
  Calculator,
  PenTool
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
  timestamp: string;
}

// =====================================================================
// COMPONENT: Rich Code Block with Language Badge and One-Click Copy
// =====================================================================
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 text-slate-100 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-sans text-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[11.5px] font-mono leading-relaxed text-emerald-300/90 whitespace-pre">
        <code>{code}</code>
      </div>
    </div>
  );
}

// =====================================================================
// COMPONENT: Markdown Formatter (Headings, Code, Lists, Tables, Inline)
// =====================================================================
function MarkdownRenderer({ content }: { content: string }) {
  // 1. Split text by code blocks ```lang ... ```
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = content.substring(lastIndex, match.index);
      parts.push(renderTextMarkdown(textBefore, `text_${lastIndex}`));
    }
    const lang = match[1] || 'code';
    const code = match[2];
    parts.push(<CodeBlock key={`code_${match.index}`} code={code} language={lang} />);
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderTextMarkdown(content.substring(lastIndex), `text_${lastIndex}`));
  }

  return <div className="space-y-2 text-xs leading-relaxed">{parts}</div>;
}

function renderTextMarkdown(rawText: string, keyPrefix: string): React.ReactNode {
  const lines = rawText.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let isOrdered = false;

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      if (isOrdered) {
        renderedElements.push(
          <ol key={key} className="list-decimal list-outside ml-5 space-y-1 my-2">
            {listItems}
          </ol>
        );
      } else {
        renderedElements.push(
          <ul key={key} className="list-disc list-outside ml-5 space-y-1 my-2">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList(`list_flush_${i}`);
      continue;
    }

    // Heading 1
    if (line.startsWith('# ')) {
      flushList(`list_flush_${i}`);
      renderedElements.push(
        <h1 key={`${keyPrefix}_h1_${i}`} className="text-base font-black text-slate-900 dark:text-white mt-3 mb-1.5 border-b pb-1 border-slate-200 dark:border-slate-800">
          {renderInline(line.substring(2))}
        </h1>
      );
      continue;
    }

    // Heading 2
    if (line.startsWith('## ')) {
      flushList(`list_flush_${i}`);
      renderedElements.push(
        <h2 key={`${keyPrefix}_h2_${i}`} className="text-sm font-extrabold text-slate-900 dark:text-white mt-2.5 mb-1 text-indigo-700 dark:text-indigo-400">
          {renderInline(line.substring(3))}
        </h2>
      );
      continue;
    }

    // Heading 3
    if (line.startsWith('### ')) {
      flushList(`list_flush_${i}`);
      renderedElements.push(
        <h3 key={`${keyPrefix}_h3_${i}`} className="text-xs font-bold text-slate-900 dark:text-slate-200 mt-2 mb-1">
          {renderInline(line.substring(4))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList(`list_flush_${i}`);
      renderedElements.push(
        <blockquote key={`${keyPrefix}_bq_${i}`} className="border-l-4 border-indigo-500 pl-3 py-1 my-1.5 text-slate-600 dark:text-slate-300 italic bg-indigo-50/50 dark:bg-indigo-950/30 rounded-r-lg">
          {renderInline(line.substring(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered List (- or *)
    const ulMatch = line.match(/^[-*]\s+(.*)/);
    if (ulMatch) {
      if (!inList || isOrdered) {
        flushList(`list_switch_${i}`);
        inList = true;
        isOrdered = false;
      }
      listItems.push(<li key={`li_${i}`}>{renderInline(ulMatch[1])}</li>);
      continue;
    }

    // Ordered List (1. 2. etc)
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inList || !isOrdered) {
        flushList(`list_switch_${i}`);
        inList = true;
        isOrdered = true;
      }
      listItems.push(<li key={`li_${i}`}>{renderInline(olMatch[2])}</li>);
      continue;
    }

    // Table rows (start and end with |)
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList(`list_flush_${i}`);
      // Skip separator rows like |--|---|
      if (line.replace(/[\s|:-]/g, '').length === 0) continue;

      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      renderedElements.push(
        <div key={`${keyPrefix}_tbl_row_${i}`} className="grid grid-flow-col auto-cols-fr gap-2 py-1 px-2 border-b border-slate-200 dark:border-slate-800 text-[11px] bg-slate-100/60 dark:bg-slate-800/40 rounded">
          {cells.map((cell, cIdx) => (
            <div key={`c_${cIdx}`} className="truncate">{renderInline(cell)}</div>
          ))}
        </div>
      );
      continue;
    }

    // Standard paragraph
    flushList(`list_flush_${i}`);
    renderedElements.push(
      <p key={`${keyPrefix}_p_${i}`} className="my-1">
        {renderInline(line)}
      </p>
    );
  }

  flushList(`list_flush_end`);
  return <div key={keyPrefix}>{renderedElements}</div>;
}

// Inline formatting: **bold**, *italic*, `code`, [links](url)
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const inlineRegex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|\[.*?\]\(.*?\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b_${match.index}`} className="font-bold text-[#0f2942]">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={`i_${match.index}`} className="italic">{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`ic_${match.index}`} className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1e3a8a] font-mono text-[11px] border border-blue-200">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('[') && token.includes('](')) {
      const labelMatch = token.match(/\[(.*?)\]\((.*?)\)/);
      if (labelMatch) {
        parts.push(
          <a
            key={`a_${match.index}`}
            href={labelMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1e3a8a] hover:underline font-semibold"
          >
            {labelMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// =====================================================================
// MAIN STUDENT PAGE CHATBOT COMPONENT
// =====================================================================
export default function ChatbotPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `Welcome! I am your **SGIP AI Placement & Academic Advisor**.

I am available to assist you with:
• **Technical Coding & Algorithms** (Python, Java, C++, DSA, System Design)
• **Campus Placement Drives & Eligibility** (Google, Microsoft, Amazon, Zoho criteria, CTC, packages)
• **Academic Concept Coaching** (Curriculum breakdown, university 16-mark answers)
• **Quantitative Aptitude & Calculations** (Formulas, percentage, step-by-step solutions)
• **Interview Readiness & STAR Method** (HR questions, behavioral answers, ATS resume bullet points)

Select a quick topic below or type your question to start!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, aiLoading]);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

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

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: queryToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Prepare current conversation history including this user query
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setAiLoading(true);

    // Placeholder assistant message for live streaming
    const assistantMsgId = `a_${Date.now()}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, initialAssistantMsg]);

    try {
      // Build conversation payload without the welcome message to maintain clean context
      const historyPayload = updatedMessages
        .filter(m => m.id !== 'msg_welcome' && !m.id.startsWith('msg_welcome_'))
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream'
        },
        body: JSON.stringify({
          query: queryToSend.trim(),
          messages: historyPayload,
          isTestActive: false,
          stream: true
        })
      });

      const contentType = res.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream') && res.body) {
        // Handle real-time Server-Sent Events stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.replace(/^data:\s*/, '');
              if (jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMsgId ? { ...m, content: accumulatedText } : m
                    )
                  );
                }
              } catch {
                // Ignore partial JSON chunks
              }
            }
          }
        }
      } else {
        // Fallback for standard JSON responses
        const data = await res.json();
        if (res.ok && data.answer) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: data.answer,
                    sources: data.sources || []
                  }
                : m
            )
          );
        } else {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content: data.error || 'I encountered an issue generating a response. Please verify your AI setup.'
                  }
                : m
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: 'Connection error while communicating with the AI service. Please check your network or try again.'
              }
            : m
        )
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        content: `Chat session cleared. How can I assist you with your campus placements or coursework today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div>
        <span className="font-mono text-xs text-[#0f2942]">Initializing SGIP AI Student Assistant...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto font-sans flex flex-col h-[calc(100vh-115px)]">
      {/* Header Banner - Strict Dark Blue and White */}
      <div className="bg-[#1e3a8a] border border-[#0f2942] rounded-3xl p-4 md:p-5 text-white shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-sm flex items-center justify-center shrink-0 border border-blue-200">
            <img src="/emojis/chatbot.png" alt="AI Robot" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono font-extrabold text-blue-200 uppercase tracking-widest">
              <img src="/emojis/sparkles.png" alt="" className="w-3.5 h-3.5 object-contain" /> SGIP Placement Intelligence Agent
            </div>
            <h1 className="font-display text-xl font-extrabold text-white tracking-tight">AI Student Chatbot</h1>
            <p className="font-sans text-xs text-blue-100 font-medium">
              Autonomous collegiate AI advisor for placements, coding, data structures, and university preparation.
            </p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 shadow-xs"
          title="Clear Conversation History"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Preset Quick Query Chips with Realistic 3D Emojis */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
          <img src="/emojis/sparkles.png" alt="" className="w-3.5 h-3.5 object-contain" /> Quick Starters:
        </span>

        <button
          onClick={() => handleSendMessage(undefined, 'Am I eligible for Google, Microsoft, and Zoho placement drives?')}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0f2942] hover:text-[#1e3a8a] text-xs font-bold border border-slate-200 hover:border-[#1e3a8a] transition-all shrink-0 flex items-center gap-2 shadow-xs"
        >
          <img src="/emojis/placement.png" alt="" className="w-4 h-4 object-contain" />
          <span>Placement Eligibility?</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'Explain the difference between AI and machine learning')}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0f2942] hover:text-[#1e3a8a] text-xs font-bold border border-slate-200 hover:border-[#1e3a8a] transition-all shrink-0 flex items-center gap-2 shadow-xs"
        >
          <img src="/emojis/courses.png" alt="" className="w-4 h-4 object-contain" />
          <span>AI vs Machine Learning</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'Write Dijkstra algorithm in Python with graph example')}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0f2942] hover:text-[#1e3a8a] text-xs font-bold border border-slate-200 hover:border-[#1e3a8a] transition-all shrink-0 flex items-center gap-2 shadow-xs"
        >
          <img src="/emojis/coding.png" alt="" className="w-4 h-4 object-contain" />
          <span>Python Dijkstra Code</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'How to answer Tell Me About Yourself using STAR method?')}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0f2942] hover:text-[#1e3a8a] text-xs font-bold border border-slate-200 hover:border-[#1e3a8a] transition-all shrink-0 flex items-center gap-2 shadow-xs"
        >
          <img src="/emojis/interview.png" alt="" className="w-4 h-4 object-contain" />
          <span>Tell Me About Yourself (HR)</span>
        </button>

        <button
          onClick={() => handleSendMessage(undefined, 'Calculate 15% of 2400 step-by-step')}
          className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-[#0f2942] hover:text-[#1e3a8a] text-xs font-bold border border-slate-200 hover:border-[#1e3a8a] transition-all shrink-0 flex items-center gap-2 shadow-xs"
        >
          <img src="/emojis/target.png" alt="" className="w-4 h-4 object-contain" />
          <span>Math Calculation</span>
        </button>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-4 md:p-6 shadow-xs overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center font-bold shrink-0 shadow-xs mt-1">
                <img src="/emojis/chatbot.png" alt="Bot" className="w-full h-full object-contain" />
              </div>
            )}

            <div
              className={`max-w-3xl p-4 rounded-3xl space-y-2 relative group ${
                msg.role === 'user'
                  ? 'bg-[#1e3a8a] text-white font-medium shadow-xs rounded-tr-xs'
                  : 'bg-slate-50 text-[#0f2942] border border-slate-200 shadow-xs rounded-tl-xs'
              }`}
            >
              {msg.role === 'assistant' ? (
                msg.content ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <div className="flex items-center gap-2 py-1 text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a] animate-pulse delay-300"></div>
                  </div>
                )
              ) : (
                <div className="whitespace-pre-wrap font-sans text-xs leading-relaxed">
                  {msg.content}
                </div>
              )}

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                  <span className="font-bold uppercase text-[#1e3a8a]">Verified Source:</span> {msg.sources.map(s => s.title).join(', ')}
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[10px] opacity-75 font-mono">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && msg.content && (
                  <button
                    onClick={() => handleCopy(msg.content, idx)}
                    className="hover:text-[#1e3a8a] flex items-center gap-1 font-sans font-bold transition-colors"
                  >
                    {copiedIdx === idx ? <Check className="w-3 h-3 text-[#1e3a8a]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center font-bold shrink-0 shadow-xs mt-1">
                <img src="/emojis/profile.png" alt="Student" className="w-full h-full object-contain" />
              </div>
            )}
          </div>
        ))}

        {aiLoading && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-center gap-3 py-2 text-xs text-[#1e3a8a] font-bold pl-1 font-mono">
            <div className="w-5 h-5 rounded-xl bg-[#1e3a8a] text-white flex items-center justify-center animate-spin">
              <Bot className="w-3 h-3" />
            </div>
            <span>SGIP AI Assistant is generating answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Multiline Query Input Box */}
      <form onSubmit={(e) => handleSendMessage(e)} className="flex items-end gap-2.5 shrink-0">
        <div className="flex-1 relative bg-white border-2 border-slate-200 focus-within:border-[#1e3a8a] rounded-2xl shadow-xs transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything (Coding, Math, Placement eligibility, Company interview prep)... Press Enter to send"
            className="w-full px-4 py-3 bg-transparent text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none max-h-36 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={aiLoading || !query.trim()}
          className="px-6 py-3.5 rounded-2xl bg-[#1e3a8a] hover:bg-[#0f2942] disabled:opacity-50 text-white font-sans text-xs font-extrabold uppercase tracking-wider shadow-xs transition-all flex items-center gap-2 shrink-0 h-[46px]"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
