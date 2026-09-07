'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal, Play, RotateCcw, CheckCircle2, Code2, Sparkles, Copy, Check, Cpu } from 'lucide-react';

const CODE_TEMPLATES: Record<string, string> = {
  Python: `# Python 3.11 Placement Code Runner
def dijkstra(graph, start):
    import heapq
    pq = [(0, start)]
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    
    while pq:
        current_dist, u = heapq.heappop(pq)
        if current_dist > distances[u]:
            continue
        for neighbor, weight in graph[u].items():
            distance = current_dist + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    return distances

graph = {
    'A': {'B': 4, 'C': 2},
    'B': {'A': 4, 'C': 1, 'D': 5},
    'C': {'A': 2, 'B': 1, 'D': 8, 'E': 10},
    'D': {'B': 5, 'C': 8, 'E': 2},
    'E': {'C': 10, 'D': 2}
}

print("Shortest Distances from 'A':")
print(dijkstra(graph, 'A'))
`,
  Java: `// Java 17 Placement Code Runner
public class Main {
    public static void main(String[] args) {
        System.out.println("Java Placement Code Compiler Active!");
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = solveTwoSum(nums, target);
        System.out.println("Target Pair Indices: [" + result[0] + ", " + result[1] + "]");
    }

    public static int[] solveTwoSum(int[] nums, int target) {
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}
`,
  'C++': `// C++20 Placement Code Runner
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

int main() {
    cout << "C++20 Compiler Engine Active!" << endl;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    unordered_map<int, int> mp;
    
    for (int i = 0; i < nums.size(); i++) {
        int comp = target - nums[i];
        if (mp.count(comp)) {
            cout << "Found indices: " << mp[comp] << ", " << i << endl;
            return 0;
        }
        mp[nums[i]] = i;
    }
    return 0;
}
`,
  C: `/* C11 Placement Code Runner */
#include <stdio.h>

void solve() {
    printf("C Code Execution Status: SUCCESS\\n");
    printf("Pointer Arithmetic Test: Passed\\n");
}

int main() {
    solve();
    return 0;
}
`,
  JavaScript: `// JavaScript (Node.js v20) Code Runner
function solveTwoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            return [map.get(comp), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log("JavaScript Solution:", solveTwoSum([2, 7, 11, 15], 9));
`,
  SQL: `-- SQLite Relational Database Engine
SELECT 
    u.id, 
    u.name, 
    u.department, 
    u.cgpa, 
    u.backlogs
FROM users u
WHERE u.cgpa >= 8.0 AND u.backlogs = 0;
`
};

export default function CodeCompilerPage() {
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<string>('Python');
  const [code, setCode] = useState<string>(CODE_TEMPLATES['Python']);
  const [inputStdin, setInputStdin] = useState<string>('');
  const [output, setOutput] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.activeUser?.role === 'FACULTY') {
          router.push('/faculty');
        }
      })
      .catch(() => {});
  }, [router]);

  const handleLanguageChange = (lang: string) => {
    setSelectedLang(lang);
    setCode(CODE_TEMPLATES[lang] || '');
    setOutput(null);
    setExecutionTime(null);
  };

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsCompiling(true);
    setOutput(null);
    setExecutionTime(null);

    try {
      const res = await fetch('/api/compiler/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang,
          code,
          input: inputStdin
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.output);
        setExecutionTime(data.executionTimeMs);
      } else {
        setOutput(`Compilation Error:\n${data.error || 'Failed to execute code.'}`);
      }
    } catch (e: any) {
      setOutput(`Runtime Exception:\n${e.message || 'Server connection error.'}`);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
            <Terminal className="w-4 h-4 text-emerald-500" /> Interactive Placement Code Compiler System
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Multi-Language Code Runner & Execution Engine
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
            Write, compile, run, and evaluate placement coding solutions in Python, Java, C++, C, JavaScript & SQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCode(CODE_TEMPLATES[selectedLang])}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Starter Code
          </button>
          <button
            onClick={handleRunCode}
            disabled={isCompiling}
            className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Compiling & Running...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run & Compile Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Compiler Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          {/* Language Selector Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Language:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'Java', 'C++', 'C', 'JavaScript', 'SQL'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all border ${
                      selectedLang === lang
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Editor Textarea */}
          <div className="relative font-mono text-xs">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              rows={18}
              spellCheck={false}
              className="w-full p-4 rounded-2xl bg-slate-900 text-indigo-200 border border-slate-800 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed tracking-wide resize-none shadow-inner"
            />
          </div>

          {/* Custom Stdin Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              Custom Input (stdin):
            </label>
            <input
              type="text"
              value={inputStdin}
              onChange={(e) => setInputStdin(e.target.value)}
              placeholder="e.g. 4 5 10 20 (space separated input data)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        {/* Right Column: Terminal Output Console (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-200">Terminal Output Console</span>
                </div>
                {executionTime !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
                    ⏱️ {executionTime} ms
                  </span>
                )}
              </div>

              {/* Console Output Screen */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-300 min-h-[320px] max-h-[420px] overflow-y-auto whitespace-pre-line leading-relaxed shadow-inner">
                {isCompiling ? (
                  <div className="flex gap-2 items-center text-amber-400 font-semibold py-8 justify-center">
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Compiling {selectedLang} source code...</span>
                  </div>
                ) : output ? (
                  output
                ) : (
                  <div className="text-slate-500 italic text-center py-16">
                    Click "Run & Compile Code" to view program output here.
                  </div>
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Compiler Specs:
              </div>
              <div>• Python 3.11 | GCC 13.2 | JDK 17 | Node v20</div>
              <div>• Memory Limit: 256 MB | Time Limit: 2.0s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
