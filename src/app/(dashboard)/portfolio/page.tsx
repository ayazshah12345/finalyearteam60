'use client';

import React, { useState, useEffect } from 'react';
import { PortfolioItem, User } from '@/types';
import { GraduationCap, Award, ExternalLink, ShieldCheck, Eye, EyeOff, Plus } from 'lucide-react';

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // New item modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('React, Next.js, Node.js');
  const [linkUrl, setLinkUrl] = useState('https://github.com/aaravsharma/project');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const authRes = await fetch('/api/auth/me');
      const authData = await authRes.json();
      setUser(authData.activeUser);

      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(',').map(t => t.trim()),
          linkUrl,
          type: 'PROJECT'
        })
      });
      const data = await res.json();
      if (data.item) {
        setItems([data.item, ...items]);
        setShowModal(false);
        setTitle('');
        setDescription('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-widest">
            <GraduationCap className="w-4 h-4" /> SGIP Portfolio Showcase
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Verified Student Portfolio & Certifications
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Auto-synced course completion credentials and public technical projects.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold hover:bg-brand-500 transition-all shadow-glow"
        >
          <Plus className="w-4 h-4" /> Add Custom Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-subtle space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  item.type === 'CERTIFICATE'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                }`}>
                  {item.type} {item.autoSynced && '(Auto-Synced)'}
                </span>

                <div className="flex items-center gap-2 text-xs text-slate-400">
                  {item.publicVisible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-slate-500" />}
                  <span>{item.publicVisible ? 'Public' : 'Private'}</span>
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 leading-snug">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-3">
                {item.tags?.map((tg, i) => (
                  <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                    {tg}
                  </span>
                ))}
              </div>
            </div>

            {item.linkUrl && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-400 font-bold hover:underline flex items-center gap-1.5"
                >
                  <span>View Project / Credential Source</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Project to Portfolio</h2>
            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">GitHub / Demo Link</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-brand-600 text-white font-semibold shadow-glow">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
