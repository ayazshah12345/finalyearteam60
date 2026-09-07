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
  AuditLog
} from '../types';

export const SEED_USERS: User[] = [
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
  }
];

export const SEED_COURSES: Course[] = [
  {
    id: 'crs_dsa_101',
    title: 'Advanced Data Structures & Algorithms',
    description: 'Master Trees, Graphs, Dynamic Programming, and System Design with hands-on coding challenges for Tier-1 placements.',
    category: 'Programming',
    instructorId: 'usr_faculty_1',
    instructorName: 'Prof. Manivannan',
    department: 'Computer Science & Engineering',
    durationHours: 42,
    difficulty: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1516116211223-4c7141944510?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Understand time/space complexity trade-offs in tree and graph algorithms',
      'Implement DP memoization and tabulation patterns from scratch',
      'Solve FAANG level coding interview questions efficiently'
    ],
    skillsGained: ['C++', 'Java', 'DSA', 'Graph Algorithms', 'Dynamic Programming', 'Problem Solving'],
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'crs_py_102',
    title: 'Python Programming & Algorithm Mastery',
    description: 'Complete Python mastery from syntax fundamentals to Object-Oriented design, DSA problem solving, and LeetCode Medium/Hard challenges.',
    category: 'Programming',
    instructorId: 'usr_faculty_1',
    instructorName: 'Prof. Manivannan',
    department: 'AI & Data Science',
    durationHours: 38,
    difficulty: 'Beginner',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Write clean, pythonic code using list comprehensions, generators, and decorators',
      'Implement custom Data Structures (LinkedList, Stack, Queue, Heap, Hash Map)',
      'Solve corporate screening coding challenges in Python 3'
    ],
    skillsGained: ['Python 3', 'OOPs', 'Data Structures', 'Algorithms', 'Debugging'],
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'crs_web_201',
    title: 'Full Stack Web Architecture & React/Next.js',
    description: 'Build modern enterprise web applications using Next.js 15, TypeScript, REST/GraphQL APIs, and cloud deployments.',
    category: 'Web Development',
    instructorId: 'usr_faculty_1',
    instructorName: 'Dr. Ramesh Verma',
    department: 'Computer Science & Engineering',
    durationHours: 35,
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Build responsive client interfaces with Tailwind CSS and Framer Motion',
      'Design RESTful server APIs and handle secure session authorization',
      'Deploy web apps to production platforms like Vercel & AWS'
    ],
    skillsGained: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL'],
    createdAt: '2026-01-15T10:00:00Z'
  },
  {
    id: 'crs_java_202',
    title: 'Java Enterprise Systems & OOPs Design Patterns',
    description: 'Deep-dive into Java 17+, JVM Internals, Multithreading, Garbage Collection, Spring Boot microservices, and OOPs SOLID principles.',
    category: 'Programming',
    instructorId: 'usr_faculty_1',
    instructorName: 'Prof. Manivannan',
    department: 'Computer Science & Engineering',
    durationHours: 40,
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Master Java OOPs 4 pillars and SOLID object-oriented design patterns',
      'Understand JVM memory architecture (Heap, Stack, Metaspace, GC tuning)',
      'Build scalable backend microservices with Spring Boot and JDBC'
    ],
    skillsGained: ['Java 17', 'JVM', 'Multithreading', 'Spring Boot', 'SOLID Principles'],
    createdAt: '2026-01-18T10:00:00Z'
  },
  {
    id: 'crs_dbms_301',
    title: 'Database Management Systems & SQL Query Tuning',
    description: 'Master RDBMS design, Normalization (1NF to 3NF/BCNF), Indexing, B-Trees, ACID transactions, and complex SQL joins.',
    category: 'Department Subjects',
    instructorId: 'usr_faculty_1',
    instructorName: 'Prof. Sunita Rao',
    department: 'Computer Science & Engineering',
    durationHours: 30,
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Write optimized SQL queries using Window Functions, CTEs, and Subqueries',
      'Design ER Diagrams and normalize database schemas to eliminate anomalies',
      'Optimize query execution plans using indexes and execution profiling'
    ],
    skillsGained: ['SQL', 'PostgreSQL', 'MySQL', 'Normalization', 'Indexing', 'DBMS'],
    createdAt: '2026-01-22T10:00:00Z'
  },
  {
    id: 'crs_sys_401',
    title: 'System Design & Distributed Cloud Systems',
    description: 'Learn High-Level & Low-Level System Design (HLD/LLD), Load Balancers, Caching (Redis), Kafka Queues, and Microservices Architecture.',
    category: 'Cloud Computing',
    instructorId: 'usr_faculty_1',
    instructorName: 'Dr. Ramesh Verma',
    department: 'Information Technology',
    durationHours: 36,
    difficulty: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Design high-throughput distributed systems handling millions of requests',
      'Understand CAP Theorem, Consistent Hashing, Rate Limiting, and Database Sharding',
      'Architect microservices with Docker, Kubernetes, and AWS Cloud'
    ],
    skillsGained: ['System Design', 'HLD/LLD', 'Redis', 'Kafka', 'Docker', 'AWS'],
    createdAt: '2026-01-25T10:00:00Z'
  },
  {
    id: 'crs_aiml_501',
    title: 'AI & Machine Learning Foundations for Engineers',
    description: 'Hands-on Machine Learning using Python, Scikit-Learn, Pandas, Neural Networks, Computer Vision, and Generative AI prompt engineering.',
    category: 'AI & ML',
    instructorId: 'usr_faculty_1',
    instructorName: 'Prof. Manivannan',
    department: 'AI & Data Science',
    durationHours: 45,
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Train Supervised & Unsupervised ML models (Regression, Decision Trees, SVM)',
      'Preprocess datasets with Pandas, NumPy, and Feature Engineering',
      'Build Neural Networks with PyTorch/TensorFlow for real-world predictions'
    ],
    skillsGained: ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'PyTorch', 'Generative AI'],
    createdAt: '2026-01-28T10:00:00Z'
  },
  {
    id: 'crs_apt_301',
    title: 'Quantitative Aptitude & Logical Reasoning for Campus Drives',
    description: 'Comprehensive preparation for company screening tests including TCS NQT, Infosys InfyTQ, Cognizant, and Amazon OA.',
    category: 'Placement Preparation',
    instructorId: 'usr_faculty_1',
    instructorName: 'Dr. Ramesh Verma',
    department: 'Placement & Training Cell',
    durationHours: 25,
    difficulty: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: [
      'Solve speed math tricks for percentages, profit/loss, and time-speed-distance',
      'Master syllogisms, blood relations, data interpretation, and coding-decoding',
      'Improve speed and accuracy under timed exam environments'
    ],
    skillsGained: ['Aptitude', 'Logical Reasoning', 'Data Interpretation', 'Problem Solving'],
    createdAt: '2026-02-01T10:00:00Z'
  }
];

export const SEED_MODULES: Module[] = [
  { id: 'mod_1', courseId: 'crs_dsa_101', title: 'Module 1: Recursion & Backtracking', description: 'Fundamental recursive calls, call stacks, and permutation search spaces.', order: 1 },
  { id: 'mod_2', courseId: 'crs_dsa_101', title: 'Module 2: Tree Algorithms & BST Traversal', description: 'Binary Tree traversals, Segment Trees, Trie structures, and LCA algorithms.', order: 2 },
  { id: 'mod_3', courseId: 'crs_dsa_101', title: 'Module 3: Graph Traversal & Shortest Paths', description: 'BFS, DFS, Dijkstra, Bellman-Ford, and Topological Sort.', order: 3 },
  { id: 'mod_4', courseId: 'crs_web_201', title: 'Module 1: Next.js App Router Architecture', description: 'Server components, client components, routing, and data fetching.', order: 1 },
];

export const SEED_LESSONS: Lesson[] = [
  {
    id: 'lsn_101',
    courseId: 'crs_dsa_101',
    moduleId: 'mod_1',
    title: 'Understanding Call Stacks & Recursion Trees',
    description: 'Deconstruct base cases, recursive steps, memory frames, and tail recursion optimizations.',
    durationMinutes: 45,
    videoUrl: 'https://www.youtube.com/embed/gBC_Fd8EE8A',
    pdfUrl: '/resources/recursion-notes.pdf',
    notesContent: '### Key Recursion Principles\n1. **Base Case:** Always define the terminating condition to prevent stack overflow.\n2. **Subproblem Reduction:** Each recursive step must shrink the input towards the base case.\n3. **Call Stack Overhead:** Each call allocates a frame containing local variables and return address.',
    codeSnippet: `// Example N-Queens Backtracking Helper in C++
void solveNQueens(int col, vector<string>& board, vector<vector<string>>& ans,
                 vector<int>& leftRow, vector<int>& upperDiag, vector<int>& lowerDiag, int n) {
    if (col == n) {
        ans.push_back(board);
        return;
    }
    for (int row = 0; row < n; row++) {
        if (leftRow[row] == 0 && lowerDiag[row + col] == 0 && upperDiag[n - 1 + col - row] == 0) {
            board[row][col] = 'Q';
            leftRow[row] = 1; lowerDiag[row + col] = 1; upperDiag[n - 1 + col - row] = 1;
            solveNQueens(col + 1, board, ans, leftRow, upperDiag, lowerDiag, n);
            board[row][col] = '.';
            leftRow[row] = 0; lowerDiag[row + col] = 0; upperDiag[n - 1 + col - row] = 0;
        }
    }
}`,
    order: 1,
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'lsn_102',
    courseId: 'crs_dsa_101',
    moduleId: 'mod_1',
    title: 'Backtracking Patterns: Subsets & Combinations',
    description: 'Explore the choice-decision-backtrack paradigm for generating permutations and combinations.',
    durationMinutes: 50,
    videoUrl: 'https://www.youtube.com/embed/REOH22XwdQE',
    notesContent: 'Backtracking explores state space trees depth-first and prunes invalid subtrees early.',
    order: 2,
    createdAt: '2026-01-12T10:00:00Z'
  },
  {
    id: 'lsn_103',
    courseId: 'crs_dsa_101',
    moduleId: 'mod_2',
    title: 'Binary Search Trees & Lowest Common Ancestor',
    description: 'Properties of BST, inorder traversal guarantees, and LCA optimization using recursion.',
    durationMinutes: 40,
    notesContent: 'LCA of nodes p and q in BST can be found by comparing values with root node.',
    order: 3,
    createdAt: '2026-01-15T10:00:00Z'
  }
];

export const SEED_LESSON_PROGRESS: LessonProgress[] = [
  { id: 'prog_1', userId: 'usr_student_1', courseId: 'crs_dsa_101', lessonId: 'lsn_101', completed: true, timeSpentSeconds: 2700, lastAccessedAt: '2026-08-05T14:30:00Z', completedAt: '2026-08-05T15:15:00Z' },
  { id: 'prog_2', userId: 'usr_student_1', courseId: 'crs_dsa_101', lessonId: 'lsn_102', completed: true, timeSpentSeconds: 3000, lastAccessedAt: '2026-08-06T11:00:00Z', completedAt: '2026-08-06T11:50:00Z' },
];

export const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_101',
    courseId: 'crs_dsa_101',
    courseTitle: 'Advanced Data Structures & Algorithms',
    title: 'Assignment 1: N-Queens & Graph Shortest Path Implementation',
    description: 'Implement an optimal solution to the N-Queens problem using Bit Manipulation and Dijkstra algorithm for weighted directed graphs.',
    instructions: 'Submit either a single source file (.cpp/.java/.py) or a GitHub repository link containing clean code, time complexity analysis, and unit test results.',
    totalMarks: 100,
    dueDate: '2026-08-15T23:59:59Z',
    submissionType: 'Code',
    published: true,
    createdBy: 'usr_faculty_1',
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'asg_102',
    courseId: 'crs_web_201',
    courseTitle: 'Full Stack Web Architecture',
    title: 'Assignment 2: Next.js API Routes & Auth System',
    description: 'Build a secure JWT-authenticated API router in Next.js 15 with middleware protection and persistent JSON database store.',
    instructions: 'Provide a public GitHub repo link and zip file containing client & server code.',
    totalMarks: 100,
    dueDate: '2026-08-20T23:59:59Z',
    submissionType: 'GitHub Repository',
    published: true,
    createdBy: 'usr_faculty_1',
    createdAt: '2026-08-02T10:00:00Z'
  }
];

export const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    assignmentId: 'asg_101',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    studentRollNumber: '21CS104',
    department: 'Computer Science & Engineering',
    submissionType: 'Code',
    codeText: `// N-Queens Optimized Solution by Aarav Sharma
#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    int totalNQueens(int n) {
        int count = 0;
        solve(0, 0, 0, 0, n, count);
        return count;
    }
    void solve(int row, int cols, int diags1, int diags2, int n, int& count) {
        if (row == n) { count++; return; }
        int availablePositions = ((1 << n) - 1) & ~(cols | diags1 | diags2);
        while (availablePositions) {
            int position = availablePositions & -availablePositions;
            availablePositions &= availablePositions - 1;
            solve(row + 1, cols | position, (diags1 | position) << 1, (diags2 | position) >> 1, n, count);
        }
    }
};`,
    status: 'Graded',
    marksObtained: 95,
    feedback: 'Excellent use of bit manipulation for optimal state tracking! Code is clean and well-structured.',
    submittedAt: '2026-08-04T16:20:00Z',
    gradedAt: '2026-08-05T10:00:00Z'
  }
];

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

export const SEED_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'qa_1',
    quizId: 'qz_dsa_1',
    quizTitle: 'Comprehensive DSA Mid-Term Quiz',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    answers: { 'q_1': 'B', 'q_2': 'C', 'q_3': 'B' },
    score: 10,
    totalMarks: 10,
    percentage: 100,
    passed: true,
    timeSpentSeconds: 840,
    startedAt: '2026-08-03T10:00:00Z',
    completedAt: '2026-08-03T10:14:00Z'
  }
];

export const SEED_DAILY_REPORTS: DailyReport[] = [
  {
    id: 'dr_1',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    department: 'Computer Science & Engineering',
    date: '2026-08-07',
    studyHours: 4.5,
    topicsLearned: ['N-Queens Backtracking', 'Next.js App Router API Routes', 'Quantitative Aptitude Series'],
    completedTasks: ['Watched Recursion Lesson 101', 'Solved 3 Medium LeetCode Questions', 'Submitted DSA Assignment 1'],
    codingProblemsSolved: 3,
    reflection: 'Felt confident with bitmask optimization in recursion. Need to revise Dijkstra edge relaxation proofs.',
    tomorrowPlan: 'Attempt Graph Shortest Path problems on LeetCode and practice timed aptitude quiz.',
    facultyComment: 'Great momentum, Aarav! Keep up the consistency in your daily reports.',
    reviewedBy: 'Dr. Ramesh Verma',
    status: 'Reviewed',
    createdAt: '2026-08-07T18:30:00Z'
  }
];

export const SEED_CODING_PROFILES: CodingProfile[] = [
  {
    id: 'cp_1',
    studentId: 'usr_student_1',
    leetcodeUsername: 'aarav_codes',
    hackerrankUsername: 'aarav_sharma',
    codechefUsername: 'aarav_dev',
    codeforcesUsername: 'aarav_s',
    geeksforgeeksUsername: 'aarav_gfg',
    totalSolved: 312,
    easyCount: 140,
    mediumCount: 145,
    hardCount: 27,
    contestRating: 1785,
    streakDays: 14,
    verificationStatus: 'Imported / Verified',
    lastUpdated: '2026-08-07T20:00:00Z'
  },
  {
    id: 'cp_2',
    studentId: 'usr_student_2',
    leetcodeUsername: 'rahul_k',
    totalSolved: 45,
    easyCount: 30,
    mediumCount: 14,
    hardCount: 1,
    contestRating: 1320,
    streakDays: 2,
    verificationStatus: 'Manual Entry',
    lastUpdated: '2026-08-05T12:00:00Z'
  }
];

export const SEED_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'pf_1',
    studentId: 'usr_student_1',
    type: 'CERTIFICATE',
    title: 'Advanced Data Structures & Algorithms Mastery',
    description: 'Certified completion of 42-hour intensive DSA program with distinction.',
    date: '2026-08-05',
    tags: ['DSA', 'Algorithms', 'Certification'],
    autoSynced: true,
    publicVisible: true
  },
  {
    id: 'pf_2',
    studentId: 'usr_student_1',
    type: 'PROJECT',
    title: 'Distributed Cloud Log Search Engine',
    description: 'Built a high-performance log indexing engine in Go & React handling 100k events/sec.',
    date: '2026-07-20',
    tags: ['Go', 'React', 'Distributed Systems'],
    linkUrl: 'https://github.com/aaravsharma/log-engine',
    autoSynced: false,
    publicVisible: true
  }
];

export const SEED_RESUME: ResumeData = {
  id: 'res_1',
  studentId: 'usr_student_1',
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
  }
];

export const SEED_APPLICATIONS: PlacementApplication[] = [
  {
    id: 'app_1',
    driveId: 'drv_google_2026',
    companyName: 'Google Cloud India',
    roleTitle: 'Software Development Engineer I (SDE-1)',
    packageLPA: 24.5,
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    studentRollNumber: '21CS104',
    department: 'Computer Science & Engineering',
    cgpaSnapshot: 8.4,
    backlogsSnapshot: 0,
    isEligible: true,
    eligibilityReasons: [
      'CGPA 8.4 satisfies min required 7.5',
      '0 Active backlogs satisfies criteria',
      'Department Computer Science & Engineering is allowed',
      'Required skills (DSA, C++, Python, SQL) verified'
    ],
    status: 'Technical Interview',
    appliedAt: '2026-08-02T14:00:00Z',
    interviewSchedule: '2026-08-26 11:00 AM IST (Google Meet Link)'
  }
];

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

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'nt_1',
    targetUserId: 'usr_student_1',
    title: 'Placement Drive Released!',
    message: 'Google Cloud India has launched SDE-1 placement drive for 2026 batch (24.5 LPA). Check your eligibility now.',
    category: 'Placement',
    read: false,
    createdAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'nt_2',
    targetUserId: 'usr_student_1',
    title: 'Assignment Graded',
    message: 'Dr. Ramesh Verma graded your submission for Assignment 1: N-Queens & Graph Shortest Path (95/100).',
    category: 'Assignment',
    read: true,
    createdAt: '2026-08-05T10:00:00Z'
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    userId: 'usr_faculty_1',
    userName: 'Dr. Ramesh Verma',
    role: 'FACULTY',
    action: 'GRADE_ASSIGNMENT',
    entity: 'Submission',
    entityId: 'sub_1',
    timestamp: '2026-08-05T10:00:00Z',
    details: 'Graded student Aarav Sharma submission for Assignment 1: 95/100'
  },
  {
    id: 'aud_2',
    userId: 'usr_placement_1',
    userName: 'Prof. Sunita Rao',
    role: 'PLACEMENT_COORDINATOR',
    action: 'CREATE_PLACEMENT_DRIVE',
    entity: 'PlacementDrive',
    entityId: 'drv_google_2026',
    timestamp: '2026-08-01T10:00:00Z',
    details: 'Created drive for Google Cloud India (24.5 LPA, min CGPA 7.5)'
  }
];

export const SEED_MOCK_INTERVIEWS: any[] = [
  {
    id: 'int_1',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    studentRollNumber: '21CS104',
    department: 'Computer Science & Engineering',
    targetRole: 'Full Stack Software Engineer',
    skillsEvaluated: ['Python', 'SQL', 'Data Structures', 'System Design'],
    resumeSummary: 'CS Senior with 8.8 CGPA, proficient in Python, React, SQL, and DSA.',
    overallScore: 86,
    technicalScore: 88,
    communicationScore: 85,
    logicScore: 84,
    confidenceScore: 87,
    hiringRecommendation: 'Strong Hire',
    feedbackSummary: 'Demonstrated solid grasp of Python memory management, GIL, indexing in PostgreSQL, and BFS/DFS graph traversals. Excellent clarity in speech.',
    strengthAreas: ['Python Mutability & Decorators', 'SQL B-Tree Indexing', 'Clear Verbal Articulation'],
    weaknessAreas: ['Distributed Caching (Redis eviction policies)'],
    transcript: [
      {
        round: 1,
        roundTitle: 'Candidate Background & Resume Introduction',
        question: 'Tell me about yourself and your key technical projects listed in your resume.',
        studentAnswer: 'I am a final year CSE student with 8.8 CGPA. I built a full-stack SGIP platform using Next.js, Python, and SQL with AI assistance.',
        feedback: 'Excellent concise elevator pitch highlighting technical skills and project metrics.',
        score: 90
      },
      {
        round: 2,
        roundTitle: 'Technical Core & Language Concepts',
        question: 'Explain how Python manages memory and what the Global Interpreter Lock (GIL) does.',
        studentAnswer: 'Python uses reference counting and garbage collection for cycle detection. The GIL ensures only one thread executes bytecode at a time.',
        feedback: 'Accurate explanation of reference counting and thread locking mechanics in CPython.',
        score: 85
      },
      {
        round: 3,
        roundTitle: 'Data Structures & Algorithmic Logic',
        question: 'How would you detect a cycle in a directed graph efficiently?',
        studentAnswer: 'I would use depth-first search with 3 node states: unvisited, visiting (in current recursion stack), and visited. If we hit a visiting node, a cycle exists.',
        feedback: 'Correct 3-color graph cycle detection algorithm.',
        score: 88
      },
      {
        round: 4,
        roundTitle: 'System Design & Architecture',
        question: 'How would you design a real-time notification service for 100k active students?',
        studentAnswer: 'Use WebSocket connections for live delivery with a Redis Pub/Sub backend and queue fallbacks using Celery or BullMQ for offline push notifications.',
        feedback: 'Solid architectural proposal balancing WebSockets and message queues.',
        score: 82
      },
      {
        round: 5,
        roundTitle: 'HR & Behavioral Competency',
        question: 'Describe a situation where a technical project deadline was tight. How did you prioritize?',
        studentAnswer: 'I broke down requirements into core MVP features vs nice-to-haves, automated unit testing early, and communicated progress daily.',
        feedback: 'Demonstrates strong agile teamwork and risk mitigation strategy.',
        score: 85
      }
    ],
    completedAt: '2026-08-26T14:30:00Z'
  }
];

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
      Python: `def trap(height: list[int]) -> int:
    if not height: return 0
    l, r = 0, len(height) - 1
    left_max, right_max = height[l], height[r]
    water = 0
    while l < r:
        if left_max < right_max:
            l += 1
            left_max = max(left_max, height[l])
            water += left_max - height[l]
        else:
            r -= 1
            right_max = max(right_max, height[r])
            water += right_max - height[r]
    return water

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))`
    },
    sampleCases: [
      { id: 'tc1', input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', expectedOutput: '6', explanation: 'Total trapped rain water is 6 units.' }
    ],
    createdAt: '2026-08-01T10:00:00Z'
  }
];

export const SEED_CODING_SUBMISSIONS: CodingSubmission[] = [
  {
    id: 'sub_1',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    problemId: 'lc_1',
    problemTitle: 'Two Sum',
    language: 'Python',
    code: `def twoSum(nums, target):
    hashmap = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in hashmap:
            return [hashmap[diff], i]
        hashmap[num] = i
    return []`,
    status: 'Accepted',
    testCasesPassed: 3,
    totalTestCases: 3,
    executionTimeMs: 42,
    submittedAt: '2026-08-05T14:20:00Z'
  },
  {
    id: 'sub_2',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    problemId: 'lc_2',
    problemTitle: 'Valid Anagram',
    language: 'Python',
    code: `def isAnagram(s, t):
    return sorted(s) == sorted(t)`,
    status: 'Accepted',
    testCasesPassed: 2,
    totalTestCases: 2,
    executionTimeMs: 55,
    submittedAt: '2026-08-06T16:10:00Z'
  },
  {
    id: 'sub_3',
    studentId: 'usr_student_1',
    studentName: 'Aarav Sharma',
    problemId: 'lc_3',
    problemTitle: 'Longest Substring Without Repeating Characters',
    language: 'JavaScript',
    code: `function lengthOfLongestSubstring(s) {
    let set = new Set(), l = 0, res = 0;
    for (let r = 0; r < s.length; r++) {
        while (set.has(s[r])) set.delete(s[l++]);
        set.add(s[r]);
        res = Math.max(res, r - l + 1);
    }
    return res;
}`,
    status: 'Accepted',
    testCasesPassed: 2,
    totalTestCases: 2,
    executionTimeMs: 68,
    submittedAt: '2026-08-07T11:45:00Z'
  }
];

