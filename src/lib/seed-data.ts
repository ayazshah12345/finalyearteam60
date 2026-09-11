import {
  User,
  Course,
  Module,
  Lesson,
  LessonProgress,
  Assignment,
  Submission,
  Question,
  Quiz,
  QuizAttempt,
  DailyReport,
  CodingProfile,
  CodingProblem,
  CodingSubmission,
  PortfolioItem,
  ResumeData,
  Company,
  PlacementDrive,
  PlacementApplication,
  AIKnowledgeSource,
  Notification,
  AuditLog,
  MalpracticeIncident
} from '../types';

export const SEED_USERS: User[] = [
  {
    id: 'usr_student_1787857636457',
    name: 'syed ayaz shah',
    email: 'syedayazshahsyeds@gmail.com',
    role: 'STUDENT',
    department: 'AI & Data Science',
    rollNumber: '922523243111',
    semester: 6,
    batch: '2022-2026',
    cgpa: 8.5,
    backlogs: 0,
    bio: 'VSB Engineering College Student - AI & Data Science',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    password: 'password123',
    skills: ['Python', 'Data Structures', 'Web Development'],
    xp: 250,
    level: 1,
    streak: 1,
    createdAt: '2026-08-27T19:07:16.457Z'
  },
  {
    id: 'usr_faculty_manivannan',
    name: 'Prof. Manivannan',
    email: 'manivanan.vsb@gmail.com',
    password: 'manivannan@vsb2027',
    role: 'FACULTY',
    department: 'Computer Science & Engineering',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80',
    bio: 'Senior Faculty Member & Academic Coordinator, VSB Engineering College.',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'usr_coord_1',
    name: 'Dr. S. K. Narayanan',
    email: 'placement@vsb.ac.in',
    password: 'coordinator@vsb2026',
    role: 'PLACEMENT_COORDINATOR',
    department: 'Training & Placement Division',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'Dean of Training & Corporate Placement Relations, VSB Engineering College.',
    createdAt: '2026-08-01T10:00:00Z'
  }
];

export const SEED_COURSES: Course[] = [];
export const SEED_MODULES: Module[] = [];
export const SEED_LESSONS: Lesson[] = [];
export const SEED_LESSON_PROGRESS: LessonProgress[] = [];
export const SEED_ASSIGNMENTS: Assignment[] = [];
export const SEED_SUBMISSIONS: Submission[] = [];


import { PLACEMENT_50_QUESTIONS } from './placement-50-questions';

export const SEED_QUESTIONS: Question[] = [
  ...PLACEMENT_50_QUESTIONS,
  {
    id: 'q_1',
    questionText: 'What is the time complexity of building a heap from an array of N elements?',
    optionA: 'O(N log N)',
    optionB: 'O(N)',
    optionC: 'O(log N)',
    optionD: 'O(N^2)',
    correctAnswer: 'B',
    difficulty: 'Medium',
    subject: 'Data Structures',
    topic: 'Heaps & Priority Queues',
    explanation: 'Building a heap bottom-up takes linear time O(N) due to converging arithmetic-geometric series.',
    marks: 4,
    negativeMarks: 1,
    imported: false
  },
  {
    id: 'q_2',
    questionText: 'Which algorithm is guaranteed to find the shortest path in a graph with negative edge weights without negative cycles?',
    optionA: 'Dijkstra Algorithm',
    optionB: 'Prim Algorithm',
    optionC: 'Bellman-Ford Algorithm',
    optionD: 'Kruskal Algorithm',
    correctAnswer: 'C',
    difficulty: 'Medium',
    subject: 'Algorithms',
    topic: 'Graph Algorithms',
    explanation: 'Bellman-Ford handles negative edge weights in O(V * E) time and detects negative cycles.',
    marks: 4,
    negativeMarks: 1,
    imported: false
  },
  {
    id: 'q_3',
    questionText: 'In React Server Components (RSC), where is the JSX rendered?',
    optionA: 'In the user browser DOM only',
    optionB: 'Exclusively on the server environment',
    optionC: 'In a Web Worker thread on client',
    optionD: 'During client-side hydration',
    correctAnswer: 'B',
    difficulty: 'Easy',
    subject: 'Web Development',
    topic: 'Next.js & React',
    explanation: 'RSC code executes exclusively on the Node/Server runtime and sends a rendered stream payload to the client.',
    marks: 2,
    negativeMarks: 0,
    imported: false
  }
];

export const SEED_QUIZZES: Quiz[] = [
  {
    id: 'qz_50_master_placement',
    courseId: 'crs_dsa_101',
    title: '🔥 50 Questions Placement & Programming Master Assessment',
    description: 'Comprehensive 50-Question Campus Placement Assessment covering Python, Java, C++, C, JavaScript, SQL, and Aptitude.',
    subject: 'Full Placement Suite',
    durationMinutes: 50,
    totalMarks: 100,
    passingScore: 60,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: PLACEMENT_50_QUESTIONS.map(q => q.id),
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_python_1',
    courseId: 'crs_dsa_101',
    title: '🐍 Python Placement & Data Structures Test',
    description: 'Test Python mutability, GIL, generators, decorators, and list comprehensions for software placement drives.',
    subject: 'Python',
    durationMinutes: 15,
    totalMarks: 24,
    passingScore: 16,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_py_1', 'q_py_2', 'q_py_3', 'q_py_4', 'q_py_5', 'q_py_6', 'q_py_7', 'q_py_8', 'q_py_9', 'q_py_10'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_java_1',
    courseId: 'crs_dsa_101',
    title: '☕ Java Architecture & OOPs Placement Test',
    description: 'Master Java JVM Bytecode, Collections Framework, Multithreading, and String immutability.',
    subject: 'Java',
    durationMinutes: 15,
    totalMarks: 28,
    passingScore: 18,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_jv_11', 'q_jv_12', 'q_jv_13', 'q_jv_14', 'q_jv_15', 'q_jv_16', 'q_jv_17', 'q_jv_18', 'q_jv_19', 'q_jv_20'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_cpp_1',
    courseId: 'crs_dsa_101',
    title: '⚡ C++ STL & Memory Management Placement Test',
    description: 'Practice Virtual Functions, VTABLE, RAII, Smart Pointers, and STL Map complexities.',
    subject: 'C++',
    durationMinutes: 15,
    totalMarks: 24,
    passingScore: 16,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_cpp_21', 'q_cpp_22', 'q_cpp_23', 'q_cpp_24', 'q_cpp_25', 'q_cpp_26', 'q_cpp_27', 'q_cpp_28'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_c_1',
    courseId: 'crs_dsa_101',
    title: '🔧 C Language Pointers & Memory Placement Test',
    description: 'Pointers, Dynamic Memory (malloc/calloc), Storage Classes, Struct Padding, and Undefined Behavior.',
    subject: 'C',
    durationMinutes: 10,
    totalMarks: 18,
    passingScore: 12,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_c_29', 'q_c_30', 'q_c_31', 'q_c_32', 'q_c_33', 'q_c_34'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_js_1',
    courseId: 'crs_web_201',
    title: '🟨 JavaScript & Event Loop Web Placement Test',
    description: 'Closures, Event Loop order, Promises, Hoisting, and strict equality coercions.',
    subject: 'JavaScript',
    durationMinutes: 10,
    totalMarks: 18,
    passingScore: 12,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_js_35', 'q_js_36', 'q_js_37', 'q_js_38', 'q_js_39', 'q_js_40'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_sql_1',
    courseId: 'crs_web_201',
    title: '🗄️ SQL Databases & Normalization Placement Test',
    description: 'ACID transactions, Joins, Group By vs Having, B-Tree Indexes, and 1NF-3NF Normalization.',
    subject: 'SQL',
    durationMinutes: 10,
    totalMarks: 16,
    passingScore: 10,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_sql_41', 'q_sql_42', 'q_sql_43', 'q_sql_44', 'q_sql_45'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_apt_1',
    courseId: 'crs_apt_301',
    title: '🧮 Campus Aptitude & Logical Reasoning Test',
    description: 'Speed-Time-Distance, Work-Time, Percentages, Series Completion, and Venn Diagrams.',
    subject: 'Quantitative Aptitude',
    durationMinutes: 10,
    totalMarks: 16,
    passingScore: 10,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_apt_46', 'q_apt_47', 'q_apt_48', 'q_apt_49', 'q_apt_50'],
    published: true,
    createdBy: 'usr_placement_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'qz_dsa_1',
    courseId: 'crs_dsa_101',
    title: 'Comprehensive DSA Mid-Term Quiz',
    description: 'Test your understanding of Heap Construction, Graph Algorithms, and Time Complexity.',
    subject: 'Data Structures & Algorithms',
    durationMinutes: 30,
    totalMarks: 10,
    passingScore: 6,
    negativeMarking: true,
    randomizeQuestions: true,
    questionIds: ['q_1', 'q_2', 'q_3'],
    published: true,
    createdBy: 'usr_faculty_1',
    createdAt: '2026-08-01T10:00:00Z'
  }
];

export const SEED_QUIZ_ATTEMPTS: QuizAttempt[] = [];
export const SEED_DAILY_REPORTS: DailyReport[] = [];
export const SEED_CODING_PROFILES: CodingProfile[] = [];
export const SEED_PORTFOLIO_ITEMS: PortfolioItem[] = [];

export const SEED_RESUME: ResumeData = {
  id: 'res_1',
  studentId: 'usr_student_1787857636457',
  title: 'Full Stack Software Engineer - 2026',
  template: 'ATS Resume',
  summary: 'Detail-oriented Computer Science undergrad with strong foundations in Data Structures, Next.js, Cloud Architecture, and Problem Solving (300+ LeetCode solved). Seeking SDE roles in high-growth engineering teams.',
  skills: [
    { category: 'Languages', list: ['C++', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Go'] },
    { category: 'Frameworks & Tools', list: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Git', 'Docker'] },
    { category: 'Core CS', list: ['Data Structures & Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks'] }
  ],
  experience: [
    {
      company: 'TechCorp Innovations',
      role: 'Full Stack Development Intern',
      period: 'May 2025 – July 2025',
      points: [
        'Engineered responsive analytics dashboard serving 50k monthly active users using Next.js & Tailwind CSS.',
        'Optimized SQL database query latency by 35% through indexing and server response caching.'
      ]
    }
  ],
  projects: [
    {
      title: 'SGIP - Student Growth Intelligence Platform',
      tech: 'Next.js 15, TypeScript, Tailwind CSS, SQLite, RAG AI Engine',
      githubUrl: 'https://github.com/aaravsharma/sgip-platform',
      points: [
        'Built full-stack AI placement readiness platform featuring RBAC authorization, automated eligibility engine, and RAG vector search.',
        'Designed explainable Growth & Placement Readiness scoring models with Recharts visualization.'
      ]
    }
  ],
  education: [
    {
      institution: 'Delhi Technological University / SGIP Institute of Technology',
      degree: 'B.Tech in Computer Science & Engineering',
      year: '2022 – 2026',
      cgpa: '8.4 / 10.0'
    }
  ],
  certifications: ['Advanced DSA Mastery - SGIP', 'AWS Certified Developer Associate'],
  updatedAt: '2026-08-07T12:00:00Z'
};

export const SEED_COMPANIES: Company[] = [
  {
    id: 'cmp_google',
    name: 'Google Cloud India',
    website: 'https://cloud.google.com',
    logoUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    location: 'Bengaluru / Hyderabad',
    industry: 'Cloud Infrastructure & Enterprise Tech',
    about: 'Google Cloud empowers organizations worldwide with industry-leading data analytics, AI/ML, and infrastructure services.'
  },
  {
    id: 'cmp_microsoft',
    name: 'Microsoft India Development Center',
    website: 'https://microsoft.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    location: 'Hyderabad / Noida',
    industry: 'Software & Cloud Computing',
    about: 'Microsoft IDC is one of Microsoft’s largest R&D centers outside Redmond, working on Azure, Office 365, and AI innovations.'
  },
  {
    id: 'cmp_tcs',
    name: 'Tata Consultancy Services (Digital & Innovator)',
    website: 'https://tcs.com',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    location: 'Pan India',
    industry: 'IT Services & Consulting',
    about: 'TCS Digital and Prime offers high-growth technical career tracks for engineering graduates.'
  }
];

export const SEED_PLACEMENT_DRIVES: PlacementDrive[] = [
  {
    id: 'drv_google_2026',
    companyId: 'cmp_google',
    companyName: 'Google Cloud India',
    companyLogoUrl: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    roleTitle: 'Software Development Engineer I (SDE-1)',
    jobDescription: 'Design scalable distributed backend microservices, implement low-latency APIs, and collaborate on cutting-edge cloud infrastructure products.',
    packageLPA: 24.5,
    location: 'Bengaluru / Hyderabad',
    driveDate: '2026-08-25',
    deadlineDate: '2026-08-18',
    eligibility: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedDepartments: ['Computer Science & Engineering', 'AI & Data Science', 'Information Technology'],
      graduationYear: '2026',
      requiredSkills: ['DSA', 'C++', 'Java', 'Python', 'SQL', 'System Design Basics'],
      minCourseCompletionPercent: 70
    },
    published: true,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'drv_ms_2026',
    companyId: 'cmp_microsoft',
    companyName: 'Microsoft India',
    companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    roleTitle: 'Software Engineer - Azure Core',
    jobDescription: 'Build next-generation Azure distributed storage and cloud virtual computing platform services.',
    packageLPA: 28.0,
    location: 'Hyderabad / Noida',
    driveDate: '2026-09-02',
    deadlineDate: '2026-08-25',
    eligibility: {
      minCgpa: 8.0,
      maxBacklogs: 0,
      allowedDepartments: ['Computer Science & Engineering', 'AI & Data Science'],
      graduationYear: '2026',
      requiredSkills: ['C++', 'DSA', 'Operating Systems', 'Networks'],
      minCourseCompletionPercent: 80
    },
    published: true,
    createdAt: '2026-08-03T10:00:00Z'
  },
  {
    id: 'drv_zoho_2026',
    companyId: 'cmp_zoho',
    companyName: 'Zoho Corporation',
    companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Zoho_Corporation_2023_logo.svg',
    roleTitle: 'Software Development Engineer',
    jobDescription: 'Design enterprise SaaS modules, solve complex algorithmic challenges, and create resilient backend architectures.',
    packageLPA: 9.0,
    location: 'Chennai / Tenkasi',
    driveDate: '2026-09-15',
    deadlineDate: '2026-09-08',
    eligibility: {
      minCgpa: 7.0,
      maxBacklogs: 1,
      allowedDepartments: ['Computer Science & Engineering', 'AI & Data Science', 'Information Technology', 'ECE', 'EEE'],
      graduationYear: '2026',
      requiredSkills: ['C', 'C++', 'Java', 'Data Structures', 'OOPs', 'Problem Solving'],
      minCourseCompletionPercent: 60
    },
    published: true,
    createdAt: '2026-08-10T10:00:00Z'
  },
  {
    id: 'drv_aws_2026',
    companyId: 'cmp_amazon',
    companyName: 'Amazon Web Services (AWS)',
    companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    roleTitle: 'Cloud Support Engineer - Linux & DevOps',
    jobDescription: 'Troubleshoot complex enterprise cloud architectures, build automation pipelines, and optimize AWS cloud deployments.',
    packageLPA: 19.5,
    location: 'Bengaluru / Hyderabad',
    driveDate: '2026-09-22',
    deadlineDate: '2026-09-14',
    eligibility: {
      minCgpa: 7.5,
      maxBacklogs: 0,
      allowedDepartments: ['Computer Science & Engineering', 'AI & Data Science', 'Information Technology'],
      graduationYear: '2026',
      requiredSkills: ['Linux', 'Networking', 'Python', 'AWS Services', 'Docker'],
      minCourseCompletionPercent: 75
    },
    published: true,
    createdAt: '2026-08-12T10:00:00Z'
  },
  {
    id: 'drv_tcs_2026',
    companyId: 'cmp_tcs',
    companyName: 'TCS Digital & Prime',
    companyLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    roleTitle: 'Digital Systems Engineer (R&D Track)',
    jobDescription: 'High-growth elite engineering cohort focusing on full stack modern web applications, AI copilots, and cloud architecture.',
    packageLPA: 9.5,
    location: 'Chennai / Bengaluru / Pan India',
    driveDate: '2026-09-28',
    deadlineDate: '2026-09-20',
    eligibility: {
      minCgpa: 7.0,
      maxBacklogs: 0,
      allowedDepartments: ['Computer Science & Engineering', 'AI & Data Science', 'Information Technology', 'ECE'],
      graduationYear: '2026',
      requiredSkills: ['Data Structures', 'Python', 'SQL', 'Algorithms'],
      minCourseCompletionPercent: 65
    },
    published: true,
    createdAt: '2026-08-15T10:00:00Z'
  }
];

export const SEED_APPLICATIONS: PlacementApplication[] = [];

export const SEED_KNOWLEDGE_SOURCES: AIKnowledgeSource[] = [
  {
    id: 'ks_1',
    title: 'Advanced DSA & Recursion Reference Notes',
    sourceType: 'Notes',
    department: 'Computer Science & Engineering',
    courseTitle: 'Advanced Data Structures & Algorithms',
    uploadedBy: 'Dr. Ramesh Verma',
    chunkCount: 3,
    content: `Recursion is a computational method where the solution to a problem depends on solutions to smaller instances of the same problem. Base cases prevent stack overflow errors by terminating recursion. Time complexity of recursive algorithms can be calculated using the Master Theorem or Recursion Tree method. Common backtracking problems include N-Queens, Sudoku Solver, and Subset Generation.`,
    chunks: [
      { id: 'chk_1', text: 'Recursion is a computational method where the solution to a problem depends on solutions to smaller instances of the same problem. Base cases prevent stack overflow errors by terminating recursion.' },
      { id: 'chk_2', text: 'Time complexity of recursive algorithms can be calculated using the Master Theorem or Recursion Tree method. Master Theorem applies to divide-and-conquer recurrences T(n) = aT(n/b) + f(n).' },
      { id: 'chk_3', text: 'Common backtracking problems include N-Queens, Sudoku Solver, and Subset Generation. Backtracking prunes state space tree branches early using constraint checks.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  }
];

export const SEED_NOTIFICATIONS: Notification[] = [];

export const SEED_AUDIT_LOGS: AuditLog[] = [];

export const SEED_MOCK_INTERVIEWS: any[] = [];

export const SEED_CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'lc_1',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    starterCode: {
      Python: `def twoSum(nums, target):
    # Write your solution here
    hashmap = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in hashmap:
            return [hashmap[diff], i]
        hashmap[num] = i
    return []

print(twoSum([2, 7, 11, 15], 9))`,
      JavaScript: `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            return [map.get(diff), i];
        }
        map.set(nums[i], i);
    }
    return [];
}
console.log(twoSum([2, 7, 11, 15], 9));`,
      Java: `public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        java.util.Map<Integer, Integer> map = new java.util.HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[] { map.get(comp), i };
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
      'C++': `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> mp;
        for (int i = 0; i < nums.size(); i++) {
            int diff = target - nums[i];
            if (mp.count(diff)) return {mp[diff], i};
            mp[nums[i]] = i;
        }
        return {};
    }
};`
    },
    sampleCases: [
      { id: 'tc1', input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { id: 'tc2', input: 'nums = [3,2,4], target = 6', expectedOutput: '[1, 2]', explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].' },
      { id: 'tc3', input: 'nums = [3,3], target = 6', expectedOutput: '[0, 1]', explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'lc_2',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    difficulty: 'Easy',
    topics: ['String', 'Hash Table', 'Sorting'],
    description: `Given two strings \`s\` and \`t\`, return \`true\` if \`t\` is an anagram of \`s\`, and \`false\` otherwise.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    constraints: [
      '1 <= s.length, t.length <= 5 * 10^4',
      's and t consist of lowercase English letters.'
    ],
    starterCode: {
      Python: `def isAnagram(s: str, t: str) -> bool:
    if len(s) != len(t):
        return False
    count = {}
    for char in s:
        count[char] = count.get(char, 0) + 1
    for char in t:
        if char not in count or count[char] == 0:
            return False
        count[char] -= 1
    return True

print(isAnagram("anagram", "nagaram"))`,
      JavaScript: `function isAnagram(s, t) {
    if (s.length !== t.length) return false;
    const count = {};
    for (let char of s) count[char] = (count[char] || 0) + 1;
    for (let char of t) {
        if (!count[char]) return false;
        count[char]--;
    }
    return true;
}
console.log(isAnagram("anagram", "nagaram"));`,
      Java: `public class Solution {
    public boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) return false;
        int[] counts = new int[26];
        for (int i = 0; i < s.length(); i++) {
            counts[s.charAt(i) - 'a']++;
            counts[t.charAt(i) - 'a']--;
        }
        for (int c : counts) if (c != 0) return false;
        return true;
    }
}`,
      'C++': `class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.length() != t.length()) return false;
        int count[26] = {0};
        for (char c : s) count[c - 'a']++;
        for (char c : t) {
            if (--count[c - 'a'] < 0) return false;
        }
        return true;
    }
};`
    },
    sampleCases: [
      { id: 'tc1', input: 's = "anagram", t = "nagaram"', expectedOutput: 'true', explanation: 'All characters match with identical frequencies.' },
      { id: 'tc2', input: 's = "rat", t = "car"', expectedOutput: 'false', explanation: 'Frequencies do not match.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'lc_3',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'Medium',
    topics: ['Hash Table', 'String', 'Sliding Window'],
    description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    starterCode: {
      Python: `def lengthOfLongestSubstring(s: str) -> int:
    char_map = {}
    left = max_len = 0
    for right, char in enumerate(s):
        if char in char_map and char_map[char] >= left:
            left = char_map[char] + 1
        char_map[char] = right
        max_len = max(max_len, right - left + 1)
    return max_len

print(lengthOfLongestSubstring("abcabcbb"))`,
      JavaScript: `function lengthOfLongestSubstring(s) {
    let map = new Map(), left = 0, max = 0;
    for (let right = 0; right < s.length; right++) {
        if (map.has(s[right]) && map.get(s[right]) >= left) {
            left = map.get(s[right]) + 1;
        }
        map.set(s[right], right);
        max = Math.max(max, right - left + 1);
    }
    return max;
}
console.log(lengthOfLongestSubstring("abcabcbb"));`
    },
    sampleCases: [
      { id: 'tc1', input: 's = "abcabcbb"', expectedOutput: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { id: 'tc2', input: 's = "bbbbb"', expectedOutput: '1', explanation: 'The answer is "b", with the length of 1.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'lc_4',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    difficulty: 'Medium',
    topics: ['Array', 'Two Pointers', 'Greedy'],
    description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i-th\` line are \`(i, 0)\` and \`(i, height[i])\`.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.`,
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    starterCode: {
      Python: `def maxArea(height: list[int]) -> int:
    left, right = 0, len(height) - 1
    max_w = 0
    while left < right:
        h = min(height[left], height[right])
        max_w = max(max_w, h * (right - left))
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_w

print(maxArea([1,8,6,2,5,4,8,3,7]))`,
      JavaScript: `function maxArea(height) {
    let left = 0, right = height.length - 1, max = 0;
    while (left < right) {
        let h = Math.min(height[left], height[right]);
        max = Math.max(max, h * (right - left));
        if (height[left] < height[right]) left++;
        else right--;
    }
    return max;
}
console.log(maxArea([1,8,6,2,5,4,8,3,7]));`
    },
    sampleCases: [
      { id: 'tc1', input: 'height = [1,8,6,2,5,4,8,3,7]', expectedOutput: '49', explanation: 'Max area is between index 1 and index 8.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'lc_5',
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    difficulty: 'Hard',
    topics: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack'],
    description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.`,
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    starterCode: {
      python: `class Solution:
    def trap(self, height: List[int]) -> int:
        pass`,
      javascript: `var trap = function(height) {
    
};`,
      cpp: `class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};`,
      java: `class Solution {
    public int trap(int[] height) {
        return 0;
    }
};`
    },
    sampleCases: [
      { id: 'tc1', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', explanation: 'Total trapped rain water is 6 units.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  }
];

export const SEED_CODING_SUBMISSIONS: CodingSubmission[] = [];

export const SEED_MALPRACTICE_INCIDENTS: MalpracticeIncident[] = [];
