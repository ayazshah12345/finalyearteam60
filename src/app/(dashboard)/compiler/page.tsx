'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Terminal,
  Play,
  RotateCcw,
  Code2,
  Copy,
  Check,
  Cpu,
  AlertCircle,
  CheckCircle2,
  Bug,
  Sliders,
  FileCode,
  Sparkles,
  Layers,
  Trash2
} from 'lucide-react';

interface LanguageConfig {
  name: string;
  version: string;
  ext: string;
  badgeColor: string;
  defaultCode: string;
}

const LANGUAGES: Record<string, LanguageConfig> = {
  Python: {
    name: 'Python',
    version: '3.13.1',
    ext: 'solution.py',
    badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-500/30',
    defaultCode: `# Python 3.13 Placement Code Runner
def two_sum(nums, target):
    """Finds indices of two numbers that add up to target"""
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test execution
numbers = [2, 7, 11, 15]
target_val = 9
result = two_sum(numbers, target_val)

print(f"Input Array: {numbers}")
print(f"Target Sum: {target_val}")
print(f"Found Indices: {result}")
`
  },
  'C++': {
    name: 'C++',
    version: 'GCC 13.2 / C++20',
    ext: 'solution.cpp',
    badgeColor: 'text-blue-400 bg-blue-950/40 border-blue-500/30',
    defaultCode: `// C++20 Placement Code Runner
#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    unordered_map<int, int> mp;
    for (int i = 0; i < nums.size(); ++i) {
        int complement = target - nums[i];
        if (mp.find(complement) != mp.end()) {
            return {mp[complement], i};
        }
        mp[nums[i]] = i;
    }
    return {};
}

int main() {
    cout << "=== VSB C++20 Placement Compiler ===" << endl;
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    
    vector<int> res = twoSum(nums, target);
    if (!res.empty()) {
        cout << "Target " << target << " found at indices: [" 
             << res[0] << ", " << res[1] << "]" << endl;
    }
    return 0;
}
`
  },
  Java: {
    name: 'Java',
    version: 'OpenJDK 17',
    ext: 'Main.java',
    badgeColor: 'text-orange-400 bg-orange-950/40 border-orange-500/30',
    defaultCode: `// Java 17 Placement Code Runner
import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("=== VSB Java 17 Code Studio ===");
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        
        int[] result = solveTwoSum(nums, target);
        System.out.println("Target: " + target);
        System.out.println("Solution Indices: " + Arrays.toString(result));
    }

    public static int[] solveTwoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
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
`
  },
  C: {
    name: 'C',
    version: 'C11 / GCC 13.2',
    ext: 'main.c',
    badgeColor: 'text-teal-400 bg-teal-950/40 border-teal-500/30',
    defaultCode: `/* C11 Placement Code Runner */
#include <stdio.h>

void printBinary(unsigned int n) {
    for (int i = 7; i >= 0; i--) {
        int k = n >> i;
        if (k & 1)
            printf("1");
        else
            printf("0");
    }
    printf("\\n");
}

int main() {
    printf("=== VSB C11 Compiler Engine ===\\n");
    int val = 42;
    printf("Decimal Value: %d\\n", val);
    printf("Binary Representation: ");
    printBinary(val);
    return 0;
}
`
  },
  JavaScript: {
    name: 'JavaScript',
    version: 'Node.js v24.x',
    ext: 'index.js',
    badgeColor: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30',
    defaultCode: `// JavaScript (Node.js v24 Sandbox)
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}

const dataset = [3, 8, 12, 19, 25, 33, 47, 59, 72, 88];
const searchTarget = 33;
const index = binarySearch(dataset, searchTarget);

console.log("Dataset:", dataset);
console.log(\`Target \${searchTarget} located at index:\`, index);
`
  },
  SQL: {
    name: 'SQL',
    version: 'SQLite 3.44',
    ext: 'query.sql',
    badgeColor: 'text-purple-400 bg-purple-950/40 border-purple-500/30',
    defaultCode: `-- SQL Relational Query Execution
SELECT 
    u.id, 
    u.name, 
    u.department, 
    u.cgpa, 
    u.backlogs,
    CASE 
        WHEN u.cgpa >= 8.5 THEN 'Tier-1 High CTC Eligible'
        WHEN u.cgpa >= 7.5 THEN 'Tier-2 Product Eligible'
        ELSE 'Core Industry Eligible'
    END AS placement_tier
FROM users u
WHERE u.backlogs = 0
ORDER BY u.cgpa DESC
LIMIT 5;
`
  }
};

const PRESET_ALGORITHMS: Record<string, Record<string, string>> = {
  'Two Sum': {
    Python: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9))\n`,
    'C++': `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); ++i) {\n        if (mp.count(target - nums[i])) {\n            cout << "Indices: " << mp[target - nums[i]] << ", " << i << endl;\n            return 0;\n        }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}\n`,
    Java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        Map<Integer, Integer> mp = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (mp.containsKey(target - nums[i])) {\n                System.out.println("Pair found: [" + mp.get(target - nums[i]) + ", " + i + "]");\n                return;\n            }\n            mp.put(nums[i], i);\n        }\n    }\n}\n`,
    JavaScript: `const twoSum = (nums, target) => {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (map.has(target - nums[i])) return [map.get(target - nums[i]), i];\n    map.set(nums[i], i);\n  }\n  return [];\n};\nconsole.log("Two Sum Result:", twoSum([2, 7, 11, 15], 9));\n`
  },
  'Valid Parentheses': {
    Python: `def is_valid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nfor test in ["()[]{}", "([)]", "{[]}"]:\n    print(f"{test} -> {'Valid' if is_valid(test) else 'Invalid'}")\n`,
    'C++': `#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    cout << "(){}[]: " << (isValid("(){}[]") ? "VALID" : "INVALID") << endl;\n    cout << "(]: " << (isValid("(]") ? "VALID" : "INVALID") << endl;\n    return 0;\n}\n`,
    Java: `import java.util.Stack;\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> st = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.isEmpty() || st.pop() != c) return false;\n        }\n        return st.isEmpty();\n    }\n    public static void main(String[] args) {\n        System.out.println("([{}]) is: " + (isValid("([{}])") ? "VALID" : "INVALID"));\n    }\n}\n`,
    JavaScript: `function isValid(s) {\n  const stack = [];\n  const pairs = { '(': ')', '{': '}', '[': ']' };\n  for (const c of s) {\n    if (pairs[c]) stack.push(pairs[c]);\n    else if (stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}\nconsole.log("([{}]) ->", isValid("([{}])"));\n`
  }
};

export default function CodeCompilerPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [selectedLang, setSelectedLang] = useState<string>('Python');
  const [code, setCode] = useState<string>(LANGUAGES['Python'].defaultCode);
  const [inputStdin, setInputStdin] = useState<string>('');
  const [showStdin, setShowStdin] = useState<boolean>(false);

  // Execution Results
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR'>('IDLE');
  const [output, setOutput] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'output' | 'error' | 'input'>('output');

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);

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
    setCode(LANGUAGES[lang]?.defaultCode || '');
    setStatus('IDLE');
    setOutput('');
    setErrorDetails(null);
    setExecutionTime(null);
  };

  const handleLoadPreset = (presetName: string) => {
    const preset = PRESET_ALGORITHMS[presetName]?.[selectedLang];
    if (preset) {
      setCode(preset);
      setStatus('IDLE');
      setOutput('');
      setErrorDetails(null);
    }
  };

  const handleRunCode = async () => {
    if (!code.trim() || isCompiling) return;
    setIsCompiling(true);
    setStatus('IDLE');
    setOutput('');
    setErrorDetails(null);
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
      setExecutionTime(data.executionTimeMs ?? 45);

      if (data.status === 'COMPILATION_ERROR') {
        setStatus('COMPILATION_ERROR');
        setErrorDetails(data.error || 'Compilation failed. Check syntax and declarations.');
        setOutput(data.output || '');
        setActiveTab('error');
      } else if (data.status === 'RUNTIME_ERROR' || !res.ok) {
        setStatus('RUNTIME_ERROR');
        setErrorDetails(data.error || 'Program crashed during execution.');
        setOutput(data.output || '');
        setActiveTab('error');
      } else {
        setStatus('SUCCESS');
        setOutput(data.output || 'Program completed with exit code 0.');
        setErrorDetails(data.error || null);
        setActiveTab('output');
      }
    } catch (e: any) {
      setStatus('RUNTIME_ERROR');
      setErrorDetails(e.message || 'Server connection error.');
      setActiveTab('error');
    } finally {
      setIsCompiling(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter to run code, Tab to indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRunCode();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      setCode(val.substring(0, start) + '    ' + val.substring(end));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyOutput = () => {
    const textToCopy = activeTab === 'error' && errorDetails ? errorDetails : output;
    navigator.clipboard.writeText(textToCopy);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  };

  const lineCount = code.split('\n').length;
  const currentLang = LANGUAGES[selectedLang] || LANGUAGES['Python'];

  return (
    <div className="space-y-5 max-w-7xl mx-auto font-sans">
      {/* 1. Header Bar with Royal VSB Branding & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-400">
            <Terminal className="w-4 h-4 text-emerald-400" /> VSB Code Studio • Placement Compiler Engine
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight mt-1 text-white font-serif">
            Multi-Language Code Runner & Diagnostic Engine
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            Real-time execution, error diagnostics, and output console for Python, C++, Java, C, JavaScript & SQL.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setCode(currentLang.defaultCode);
              setStatus('IDLE');
              setOutput('');
              setErrorDetails(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5 shadow-sm"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Template</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={isCompiling}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 border border-emerald-300"
          >
            {isCompiling ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Compiling Code...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Run Code (Ctrl+Enter)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Language & Algorithm Presets Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {Object.keys(LANGUAGES).map((lang) => {
            const isSelected = selectedLang === lang;
            return (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lang}</span>
                {isSelected && (
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.2 rounded font-mono font-normal">
                    {LANGUAGES[lang].version.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Placement Presets */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 overflow-x-auto">
          <span className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-500 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Presets:
          </span>
          {Object.keys(PRESET_ALGORITHMS).map((preset) => (
            <button
              key={preset}
              onClick={() => handleLoadPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold border border-indigo-200 dark:border-indigo-800/80 transition-all shrink-0"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Workspace: Code Editor (7 cols) + Terminal Console (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800/90 rounded-3xl p-4 md:p-5 shadow-2xl flex flex-col justify-between space-y-3">
          {/* Editor Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              {/* macOS Window Controls */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block"></span>
              </div>

              {/* Current Active File Tab */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300 font-bold">
                <FileCode className="w-3.5 h-3.5 text-indigo-400" />
                <span>{currentLang.ext}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowStdin(!showStdin)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                  showStdin || inputStdin
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Custom Input (stdin)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>stdin {inputStdin ? '•' : ''}</span>
              </button>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono transition-all flex items-center gap-1 border border-slate-800"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Stdin Drawer if open */}
          {showStdin && (
            <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                <span>Standard Input (stdin):</span>
                <span className="text-slate-500 lowercase font-normal">Passed to cin, input(), scanner</span>
              </div>
              <textarea
                value={inputStdin}
                onChange={(e) => setInputStdin(e.target.value)}
                rows={2}
                placeholder="Enter input data (space or newline separated numbers/strings)..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>
          )}

          {/* Code Textarea with Real Synchronized Line Numbers */}
          <div className="relative flex rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden min-h-[380px] max-h-[560px] shadow-inner font-mono text-xs">
            {/* Line Numbers Column */}
            <div className="w-11 py-4 bg-slate-950/70 border-r border-slate-800/80 text-right pr-3 select-none text-slate-600 font-mono text-[11.5px] leading-6 shrink-0">
              {Array.from({ length: Math.max(16, lineCount) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              rows={Math.max(16, lineCount)}
              className="flex-1 p-4 bg-transparent text-emerald-300 font-mono text-xs leading-6 resize-none focus:outline-none overflow-y-auto selection:bg-indigo-600 selection:text-white"
              placeholder="Type your source code here..."
            />
          </div>

          {/* Editor Footer Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
            <div className="flex items-center gap-3">
              <span>Lines: {lineCount}</span>
              <span>Chars: {code.length}</span>
              <span>Indent: 4 spaces</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>

        {/* Right Column: Terminal Output & Diagnostics Console */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-950 border border-slate-800/90 rounded-3xl p-4 md:p-5 shadow-2xl flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Terminal Title Bar with Status Pill */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-white">Execution Console</span>
                </div>

                {/* Status Indicator Pill */}
                {isCompiling ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span> Compiling
                  </span>
                ) : status === 'SUCCESS' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Exit Code 0
                  </span>
                ) : status === 'COMPILATION_ERROR' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-700">
                    <AlertCircle className="w-3 h-3 text-rose-400" /> Compile Error
                  </span>
                ) : status === 'RUNTIME_ERROR' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-950 text-orange-300 border border-orange-700">
                    <Bug className="w-3 h-3 text-orange-400" /> Runtime Error
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Idle</span>
                )}
              </div>

              {/* Console Tabs */}
              <div className="flex items-center justify-between bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'output'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Output (stdout)
                  </button>

                  <button
                    onClick={() => setActiveTab('error')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'error'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : errorDetails
                        ? 'text-rose-400 hover:text-rose-300'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>Diagnostics</span>
                    {errorDetails && <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>}
                  </button>

                  {inputStdin && (
                    <button
                      onClick={() => setActiveTab('input')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'input'
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      stdin
                    </button>
                  )}
                </div>

                {/* Clear & Copy Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setOutput('');
                      setErrorDetails(null);
                      setStatus('IDLE');
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800"
                    title="Clear console"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyOutput}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 flex items-center gap-1 text-[11px] font-mono"
                    title="Copy output"
                  >
                    {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Error Callout Banner if error occurred */}
              {errorDetails && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-rose-200">
                      {status === 'COMPILATION_ERROR' ? 'Compilation / Syntax Error Detected' : 'Runtime Exception Encountered'}
                    </div>
                    <div className="text-[11px] text-rose-400/90 mt-0.5 font-medium">
                      Inspect the exact compiler error and line number below to resolve the bug.
                    </div>
                  </div>
                </div>
              )}

              {/* Success Callout Banner */}
              {status === 'SUCCESS' && output && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/70 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="font-bold text-[11px]">
                    Code compiled and executed cleanly in {executionTime} ms.
                  </div>
                </div>
              )}

              {/* Main Terminal Screen */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 font-mono text-xs min-h-[300px] max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {isCompiling ? (
                  <div className="flex flex-col items-center justify-center text-amber-400 font-semibold py-16 gap-3">
                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-wider font-mono">Compiling {selectedLang} Code...</span>
                  </div>
                ) : activeTab === 'error' && errorDetails ? (
                  <div className="text-rose-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {errorDetails}
                  </div>
                ) : activeTab === 'input' ? (
                  <div className="text-amber-300 font-mono whitespace-pre-wrap">
                    {inputStdin || '(no input provided)'}
                  </div>
                ) : output ? (
                  <div className="text-slate-100 font-mono whitespace-pre-wrap selection:bg-indigo-600">
                    {output}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-center py-20 flex flex-col items-center justify-center gap-2">
                    <Terminal className="w-8 h-8 text-slate-700" />
                    <span>Click "Run Code" to compile and view execution output here.</span>
                    <span className="text-[11px] text-slate-600 font-mono">Errors will automatically be caught and highlighted.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Compiler Execution Specs Footer */}
            <div className="pt-3 border-t border-slate-800/90 text-[11px] text-slate-400 font-mono flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>{selectedLang} ({currentLang.version})</span>
              </div>
              {executionTime !== null && (
                <div className="text-emerald-400 font-bold">
                  ⏱️ {executionTime} ms
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
