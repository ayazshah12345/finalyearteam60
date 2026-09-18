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
  Trash2,
  Zap,
  ShieldCheck,
  Clock,
  Send,
  BookOpen
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
    badgeColor: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/30',
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
    badgeColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-500/30',
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
    badgeColor: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-500/30',
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
    badgeColor: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-500/30',
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
    badgeColor: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-500/30',
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
    badgeColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-500/30',
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
    Python: `def two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n\nprint("Two Sum Result:", two_sum([2, 7, 11, 15], 9))\n`,
    'C++': `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    int target = 9;\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); ++i) {\n        if (mp.count(target - nums[i])) {\n            cout << "Indices: [" << mp[target - nums[i]] << ", " << i << "]" << endl;\n            return 0;\n        }\n        mp[nums[i]] = i;\n    }\n    return 0;\n}\n`,
    Java: `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        int[] nums = {2, 7, 11, 15};\n        int target = 9;\n        Map<Integer, Integer> mp = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (mp.containsKey(target - nums[i])) {\n                System.out.println("Pair found at: [" + mp.get(target - nums[i]) + ", " + i + "]");\n                return;\n            }\n            mp.put(nums[i], i);\n        }\n    }\n}\n`,
    JavaScript: `const twoSum = (nums, target) => {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    if (map.has(target - nums[i])) return [map.get(target - nums[i]), i];\n    map.set(nums[i], i);\n  }\n  return [];\n};\nconsole.log("Two Sum Result:", twoSum([2, 7, 11, 15], 9));\n`
  },
  'Valid Parentheses': {
    Python: `def is_valid(s):\n    stack = []\n    mapping = {")": "(", "}": "{", "]": "["}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack\n\nfor test in ["()[]{}", "([)]", "{[]}"]:\n    print(f"{test} -> {'Valid' if is_valid(test) else 'Invalid'}")\n`,
    'C++': `#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nbool isValid(string s) {\n    stack<char> st;\n    for (char c : s) {\n        if (c == '(' || c == '{' || c == '[') st.push(c);\n        else {\n            if (st.empty()) return false;\n            char top = st.top(); st.pop();\n            if (c == ')' && top != '(') return false;\n            if (c == '}' && top != '{') return false;\n            if (c == ']' && top != '[') return false;\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    cout << "(){}[]: " << (isValid("(){}[]") ? "VALID" : "INVALID") << endl;\n    cout << "(]: " << (isValid("(]") ? "VALID" : "INVALID") << endl;\n    return 0;\n}\n`,
    Java: `import java.util.Stack;\npublic class Main {\n    public static boolean isValid(String s) {\n        Stack<Character> st = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') st.push(')');\n            else if (c == '{') st.push('}');\n            else if (c == '[') st.push(']');\n            else if (st.isEmpty() || st.pop() != c) return false;\n        }\n        return st.isEmpty();\n    }\n    public static void main(String[] args) {\n        System.out.println("([{}]) is: " + (isValid("([{}])") ? "VALID" : "INVALID"));\n    }\n}\n`,
    JavaScript: `function isValid(s) {\n  const stack = [];\n  const pairs = { '(': ')', '{': '}', '[': ']' };\n  for (const c of s) {\n    if (pairs[c]) stack.push(pairs[c]);\n    else if (stack.pop() !== c) return false;\n  }\n  return stack.length === 0;\n}\nconsole.log("([{}]) ->", isValid("([{}])"));\n`
  },
  'Binary Search': {
    Python: `def binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n\nnums = [1, 3, 5, 7, 9, 11, 13, 15]\nprint("Index of 9:", binary_search(nums, 9))\n`,
    'C++': `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint binarySearch(const vector<int>& a, int target) {\n    int l = 0, r = a.size() - 1;\n    while (l <= r) {\n        int m = l + (r - l) / 2;\n        if (a[m] == target) return m;\n        if (a[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}\n\nint main() {\n    vector<int> v = {1, 3, 5, 7, 9, 11};\n    cout << "Index of 7: " << binarySearch(v, 7) << endl;\n    return 0;\n}\n`,
    Java: `public class Main {\n    public static int search(int[] arr, int target) {\n        int l = 0, r = arr.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (arr[m] == target) return m;\n            if (arr[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n    public static void main(String[] args) {\n        int[] nums = {10, 20, 30, 40, 50};\n        System.out.println("Index of 30: " + search(nums, 30));\n    }\n}\n`,
    JavaScript: `function binarySearch(arr, val) {\n  let l = 0, r = arr.length - 1;\n  while (l <= r) {\n    const m = Math.floor((l + r) / 2);\n    if (arr[m] === val) return m;\n    if (arr[m] < val) l = m + 1;\n    else r = m - 1;\n  }\n  return -1;\n}\nconsole.log("Index of 25:", binarySearch([5, 10, 15, 20, 25, 30], 25));\n`
  }
};

export default function CodeCompilerPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

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

  // Synchronize line numbers gutter scrolling with textarea
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

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
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-10">
      {/* 1. Decorative Studio Header: Royal VSB Ambient Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 dark:border-slate-800 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        {/* Ambient decorative glowing orbs */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-slate-800/80 border border-white/15 text-[11px] font-black uppercase tracking-widest text-amber-300 backdrop-blur-md">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>VSB Code Studio • Smart Cloud Compiler</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2.5 text-white font-serif">
              Placement Compiler & Diagnostic Engine
            </h1>
            <p className="text-xs md:text-sm text-indigo-100/85 mt-1.5 font-medium max-w-2xl">
              High-performance sandbox for Python, C++, Java, C, JavaScript & SQL. Real-time syntax diagnostics, input streaming, and millisecond telemetry.
            </p>
          </div>

          {/* Quick Actions in Header */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                setCode(currentLang.defaultCode);
                setStatus('IDLE');
                setOutput('');
                setErrorDetails(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 hover:border-white/30 transition-all flex items-center gap-1.5 backdrop-blur-md shadow-sm"
              title="Reset starter template"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
              <span>Reset Starter</span>
            </button>

            <button
              onClick={handleRunCode}
              disabled={isCompiling}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2 disabled:opacity-50 border border-emerald-200 active:scale-98"
            >
              {isCompiling ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Executing...</span>
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
      </div>

      {/* 2. Language Selector & Preset Algorithms Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-xs">
        {/* Language Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {Object.keys(LANGUAGES).map((lang) => {
            const isSelected = selectedLang === lang;
            return (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lang}</span>
                {isSelected && (
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono font-normal">
                    {LANGUAGES[lang].version.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Interview Algorithm Presets */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 overflow-x-auto py-0.5">
          <span className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Presets:
          </span>
          {Object.keys(PRESET_ALGORITHMS).map((preset) => (
            <button
              key={preset}
              onClick={() => handleLoadPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold border border-indigo-200/80 dark:border-indigo-800/70 transition-all shrink-0 active:scale-95"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 3. The Unified Decorative Code Studio (Light in Light Mode, Dark in Dark Mode) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-colors">
        {/* Studio Top Control Ribbon */}
        <div className="px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* File Tab & Window Decorators */}
          <div className="flex items-center gap-3.5">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400/90 border border-rose-500/40 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400/90 border border-amber-500/40 inline-block shadow-2xs"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400/90 border border-emerald-500/40 inline-block shadow-2xs"></span>
            </div>

            <div className="h-4 w-px bg-slate-300 dark:bg-slate-800"></div>

            {/* Active File Tab */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 shadow-xs">
              <FileCode className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{currentLang.ext}</span>
            </div>

            {/* Language Version Pill */}
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400">
              {currentLang.version}
            </span>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStdin(!showStdin)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
                showStdin || inputStdin
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/60'
                  : 'bg-white dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Toggle Custom Input (stdin)"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>stdin {inputStdin ? '•' : ''}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-750 shadow-2xs"
              title="Copy code to clipboard"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Stdin Drawer if Active */}
        {showStdin && (
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border-b border-amber-200/80 dark:border-amber-800/50 space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
              <span>Standard Input (stdin):</span>
              <span className="text-slate-500 lowercase font-normal">Passed directly to stdin / scanner / input()</span>
            </div>
            <textarea
              value={inputStdin}
              onChange={(e) => setInputStdin(e.target.value)}
              rows={2}
              placeholder="Type standard input data (newline or space separated values)..."
              className="w-full p-3 rounded-xl bg-white dark:bg-slate-950 border border-amber-300/80 dark:border-amber-800 text-xs font-mono text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none shadow-inner"
            />
          </div>
        )}

        {/* Dual-Pane Workbench: Left Editor (7 cols) + Right Execution Console (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
          {/* LEFT PANE: Light/Dark Decorative Code Editor */}
          <div className="lg:col-span-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 dark:border-slate-800">
            {/* Synchronized Code Editor Area with Line Numbers Gutter */}
            <div className="relative flex flex-1 overflow-hidden min-h-[420px] max-h-[620px] font-mono text-xs">
              {/* Line Numbers Column */}
              <div
                ref={lineNumbersRef}
                className="w-12 py-4 bg-slate-100/80 dark:bg-slate-950/80 border-r border-slate-200/80 dark:border-slate-800/80 text-right pr-3 select-none text-slate-400 dark:text-slate-600 font-mono text-[11.5px] leading-6 shrink-0 overflow-hidden"
              >
                {Array.from({ length: Math.max(18, lineCount) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Textarea: Light off-white in light mode, midnight in dark mode */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={handleScroll}
                spellCheck={false}
                autoCapitalize="off"
                autoComplete="off"
                rows={Math.max(18, lineCount)}
                className="flex-1 p-4 bg-[#fafbfd] dark:bg-slate-950 text-slate-900 dark:text-emerald-300 caret-indigo-600 dark:caret-emerald-400 selection:bg-indigo-100 dark:selection:bg-indigo-900/60 selection:text-indigo-900 dark:selection:text-emerald-200 font-mono text-xs leading-6 resize-none focus:outline-none overflow-y-auto"
                placeholder="Type or paste your source code here..."
              />
            </div>

            {/* Editor Footer Status Strip */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lines: {lineCount}</span>
                <span>Chars: {code.length}</span>
                <span className="hidden sm:inline">Indent: 4 spaces</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>UTF-8</span>
                <span className="hidden sm:inline text-slate-400">• Ctrl+Enter to Run</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE: Light/Dark Decorative Execution Console */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#f8fafc] dark:bg-slate-950">
            <div className="p-4 md:p-5 flex-1 flex flex-col space-y-3">
              {/* Terminal Title Bar & Live Status Pill */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600 dark:text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white font-mono">
                    Execution Console
                  </span>
                </div>

                {/* Status Indicator Pill */}
                {isCompiling ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Compiling
                  </span>
                ) : status === 'SUCCESS' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Exit Code 0
                  </span>
                ) : status === 'COMPILATION_ERROR' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Compile Error
                  </span>
                ) : status === 'RUNTIME_ERROR' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-700">
                    <Bug className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Runtime Error
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 uppercase font-semibold">
                    Idle • Ready
                  </span>
                )}
              </div>

              {/* Console Tabs & Actions */}
              <div className="flex items-center justify-between bg-slate-200/60 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('output')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'output'
                        ? 'bg-white dark:bg-indigo-600 text-indigo-700 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                        ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Diagnostics</span>
                    {errorDetails && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>}
                  </button>

                  {inputStdin && (
                    <button
                      onClick={() => setActiveTab('input')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'input'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 rounded hover:bg-white dark:hover:bg-slate-800 transition-all"
                    title="Clear console"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleCopyOutput}
                    className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 rounded hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-1 text-[11px] font-mono"
                    title="Copy console output"
                  >
                    {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Error Callout Banner if detected */}
              {errorDetails && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-rose-900 dark:text-rose-200">
                      {status === 'COMPILATION_ERROR' ? 'Compilation / Syntax Error Detected' : 'Runtime Exception Encountered'}
                    </div>
                    <div className="text-[11px] text-rose-700 dark:text-rose-400/90 mt-0.5 font-medium">
                      Inspect the exact compiler error and line number below to resolve the issue.
                    </div>
                  </div>
                </div>
              )}

              {/* Success Callout Banner */}
              {status === 'SUCCESS' && output && (
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="font-bold text-[11px]">
                    Code compiled and executed cleanly in {executionTime} ms.
                  </div>
                </div>
              )}

              {/* Terminal Viewport: Crisp White in Light Theme, Deep Midnight in Dark Theme */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 font-mono text-xs min-h-[300px] max-h-[460px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                {isCompiling ? (
                  <div className="flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 font-semibold py-16 gap-3">
                    <div className="w-8 h-8 border-3 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-wider font-mono">Executing {selectedLang} Code...</span>
                  </div>
                ) : activeTab === 'error' && errorDetails ? (
                  <div className="text-rose-600 dark:text-rose-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {errorDetails}
                  </div>
                ) : activeTab === 'input' ? (
                  <div className="text-amber-700 dark:text-amber-300 font-mono whitespace-pre-wrap">
                    {inputStdin || '(no standard input provided)'}
                  </div>
                ) : output ? (
                  <div className="text-slate-800 dark:text-slate-100 font-mono whitespace-pre-wrap selection:bg-indigo-100 dark:selection:bg-indigo-900">
                    {output}
                  </div>
                ) : (
                  <div className="text-slate-400 dark:text-slate-500 italic text-center py-20 flex flex-col items-center justify-center gap-2">
                    <Terminal className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                    <span>Click "Run Code" to compile and see stdout here.</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-600 font-mono">
                      Syntax errors and runtime exceptions will be highlighted automatically.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Console Bottom Telemetry Bar */}
            <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>{selectedLang} ({currentLang.version})</span>
              </div>
              {executionTime !== null && (
                <div className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-bold">
                  ⏱️ {executionTime} ms
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Decorative Feature Badges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-800/60">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Instant Sandbox</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Zero-setup isolated runner</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/60">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Smart Diagnostics</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Exact line-number syntax catch</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-800/60">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Live Telemetry</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Millisecond round-trip timers</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/60">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Campus Interview Ready</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Curated algorithms & presets</div>
          </div>
        </div>
      </div>
    </div>
  );
}
