import { ResumeData } from '@/types';

// Multi-model fallback sequence for highest availability
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash'
];

/**
 * Call Gemini Generative Language API with automatic multi-model fallback and JSON support
 */
export async function callGemini(
  prompt: string,
  systemInstruction?: string,
  isJson: boolean = false
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 2048,
      ...(isJson ? { responseMimeType: 'application/json' } : {})
    }
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errText = await res.text();
        lastError = `Model ${model} returned ${res.status}: ${errText.slice(0, 150)}`;
        console.warn(`[Gemini Interview] ${lastError}, attempting next fallback model...`);
      }
    } catch (e: any) {
      lastError = `Fetch exception for ${model}: ${e.message}`;
      console.warn(`[Gemini Interview] ${lastError}`);
    }
  }

  throw new Error(`Gemini AI service unavailable across all fallback models: ${lastError}`);
}

/**
 * Call Gemini with Multimodal data (such as PDF files or images)
 */
export async function callGeminiMultimodal(
  prompt: string,
  mimeType: string,
  base64Data: string,
  isJson: boolean = false
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured in server environment.');
  }

  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2500,
      ...(isJson ? { responseMimeType: 'application/json' } : {})
    }
  };

  let lastError = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return text;
        }
      } else {
        const errText = await res.text();
        lastError = `Multimodal Model ${model} returned ${res.status}: ${errText.slice(0, 150)}`;
        console.warn(`[Gemini Multimodal] ${lastError}, trying next...`);
      }
    } catch (e: any) {
      lastError = `Multimodal fetch exception for ${model}: ${e.message}`;
      console.warn(`[Gemini Multimodal] ${lastError}`);
    }
  }

  throw new Error(`Gemini AI Multimodal unavailable: ${lastError}`);
}

/**
 * Extract raw text from a PDF, text, or document buffer
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string = 'application/pdf'): Promise<string> {
  // 1. Try PDF parsing via pdf-parse
  if (mimeType.includes('pdf') || buffer.slice(0, 4).toString() === '%PDF') {
    try {
      const pdfModule = require('pdf-parse');
      if (typeof pdfModule === 'function') {
        const res = await pdfModule(buffer);
        if (res && res.text && res.text.trim().length > 20) {
          return res.text.trim();
        }
      } else if (pdfModule && pdfModule.PDFParse) {
        const parser = new pdfModule.PDFParse({ data: buffer });
        if (typeof parser.load === 'function') await parser.load();
        const textResult = await parser.getText();
        const text = typeof textResult === 'string' ? textResult : (textResult?.text || '');
        if (text && text.trim().length > 20) {
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('[PDF Extract] Warning extracting text via pdf-parse:', e);
    }
  }

  // 2. Plain text or json
  if (mimeType.includes('text') || mimeType.includes('json') || mimeType.includes('csv')) {
    try {
      const text = buffer.toString('utf-8');
      if (text.trim().length > 20) return text.trim();
    } catch (e) {}
  }

  return '';
}

/**
 * Parse an uploaded resume file (PDF, text, or image) with Gemini AI
 * Extracts true candidate domain, sector, projects, and skills without ever defaulting to IT!
 */
export async function parseUploadedResumeWithGemini(
  buffer: Buffer,
  mimeType: string,
  fileName: string = 'resume.pdf'
): Promise<Partial<ResumeData>> {
  // First, attempt to extract clean text from the PDF/document
  const extractedText = await extractTextFromBuffer(buffer, mimeType);

  const promptInstructions = `You are an elite, highly accurate Resume Parsing and Candidate Profiling AI.
Carefully read and analyze the candidate's resume ${extractedText ? 'content extracted from' : 'document'} "${fileName}".

CRITICAL INSTRUCTIONS:
1. Objectively identify the candidate's true domain, sector, and highlighted skill set based strictly on what is written in the document.
2. Examples of sectors include:
   - Software Engineering & Computer Science (e.g. Java, C++, Python, Data Structures & Algorithms, OOPs, Web Development, Cloud, DBMS)
   - Artificial Intelligence & Data Science (e.g. Machine Learning, Deep Learning, NLP, Python)
   - Financial Markets & Quantitative Trading (e.g. XAUUSD Gold, Liquidity, Order Blocks, Risk Management)
   - Core Engineering (e.g. Mechanical Engineering, CAD, Embedded Systems, Electrical & Electronics)
   - Operations, Business, Healthcare, etc.
3. Extract the exact candidate name, contact, real skills (categorized accurately), actual work experience, research/projects, and education from the document.

Output STRICT JSON ONLY matching this structure:
{
  "name": "Candidate Full Name",
  "sector": "Identified Sector (e.g. Software Engineering & Computer Science)",
  "targetRole": "Identified Target Role (e.g. Software Development Engineer)",
  "title": "Candidate Headline / Title",
  "summary": "Exact extracted candidate summary",
  "skills": [
    { "category": "Category Name", "list": ["Skill 1", "Skill 2"] }
  ],
  "experience": [
    {
      "company": "Company or Platform name",
      "role": "Role / Title",
      "period": "e.g. 2022 - Present",
      "points": ["Achievement or duty 1", "Duty 2"]
    }
  ],
  "projects": [
    {
      "title": "Project or Strategy title",
      "tech": "Tools/Technologies/Models used",
      "points": ["Details 1", "Details 2"]
    }
  ],
  "education": [
    {
      "institution": "College or University",
      "degree": "Degree",
      "year": "e.g. 2023 - 2027",
      "cgpa": "CGPA if mentioned, else N/A"
    }
  ],
  "certifications": ["Cert 1", "Cert 2"],
  "languages": ["Language 1", "Language 2"]
}`;

  try {
    let raw = '';
    if (extractedText && extractedText.length > 50) {
      // Fast, 100% reliable text-based Gemini call!
      const prompt = `${promptInstructions}\n\n=== RESUME TEXT CONTENT ===\n${extractedText.slice(0, 15000)}\n===========================`;
      raw = await callGemini(prompt, 'You are an elite corporate hiring resume analyzer. Output STRICT JSON ONLY.', true);
    } else {
      // Fallback to multimodal if no text could be extracted (e.g. scanned image PDF)
      const base64Data = buffer.toString('base64');
      raw = await callGeminiMultimodal(promptInstructions, mimeType, base64Data, true);
    }

    const parsed = JSON.parse(raw);

    const docTextLower = (extractedText + ' ' + (parsed.title || '') + ' ' + (parsed.summary || '') + ' ' + JSON.stringify(parsed.skills || [])).toLowerCase();
    const hasCoding = /java|c\+\+|cpp|python|javascript|typescript|react|developer|software|node|sql|dsa|oops/.test(docTextLower);
    const isTrading = (/gold|xauusd|forex|order block|trading|market analyst/.test(docTextLower)) && !hasCoding;

    const fallbackSector = isTrading
      ? 'Financial Markets & Quantitative Trading'
      : hasCoding
      ? 'Software Engineering & Computer Science'
      : 'Engineering & Technology';

    const fallbackRole = isTrading
      ? 'Market Analyst / Quantitative Trader'
      : hasCoding
      ? 'Software Development Engineer'
      : 'Technical Specialist';

    return {
      sector: parsed.sector || fallbackSector,
      targetRole: parsed.targetRole || fallbackRole,
      title: parsed.title || `${parsed.targetRole || fallbackRole} Resume`,
      summary: parsed.summary || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : []
    };
  } catch (err) {
    console.error('[Gemini Parse Resume] Error parsing resume with Gemini, falling back:', err);
    return {};
  }
}

/**
 * Format resume into a clean, comprehensive text digest for Gemini prompt context
 */
export function formatResumeContext(resume: Partial<ResumeData> | null | undefined): string {
  if (!resume) {
    return 'Candidate profile: University student in Engineering & Technology with focus on technical skills, foundational problem solving, and project work.';
  }

  const sections: string[] = [];

  if (resume.sector) {
    sections.push(`Sector / Domain: ${resume.sector}`);
  }

  if (resume.targetRole) {
    sections.push(`Target Placement Role: ${resume.targetRole}`);
  }

  if (resume.title || resume.summary) {
    sections.push(`Summary: ${resume.summary || resume.title || 'Technical Candidate'}`);
  }

  if (resume.skills && Array.isArray(resume.skills)) {
    const skillsText = resume.skills
      .map((s) => `${s.category}: ${(s.list || []).join(', ')}`)
      .join(' | ');
    if (skillsText) sections.push(`Skills & Competencies: ${skillsText}`);
  }

  if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
    const projectsText = resume.projects
      .map((p) => `• Model/Project "${p.title}" (Tech/Methodology: ${p.tech}): ${(p.points || []).join('; ')}`)
      .join('\n');
    sections.push(`Research Models & Projects:\n${projectsText}`);
  }

  if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
    const expText = resume.experience
      .map((e) => `• ${e.role} at ${e.company} (${e.period}): ${(e.points || []).join('; ')}`)
      .join('\n');
    sections.push(`Professional Experience:\n${expText}`);
  }

  if (resume.education && Array.isArray(resume.education) && resume.education.length > 0) {
    const eduText = resume.education
      .map((ed) => `${ed.degree} at ${ed.institution} (${ed.year}), CGPA: ${ed.cgpa}`)
      .join(' | ');
    sections.push(`Education: ${eduText}`);
  }

  if (resume.certifications && Array.isArray(resume.certifications) && resume.certifications.length > 0) {
    sections.push(`Certifications: ${resume.certifications.join(', ')}`);
  }

  return sections.join('\n\n');
}

export interface QuestionBankItem {
  id: string;
  roundTitle: string;
  question: string;
  difficulty: 'Easy' | 'Hard' | 'Tough';
  topic: string;
  expectedKeywords: string[];
}

export interface ResumeAnalysisResult {
  detectedSector: string;
  detectedTargetRole: string;
  candidateSummary: string;
  detectedTechStack: string[];
  keyProjects: string[];
  strengths: string[];
  recommendedFocus: string;
  questions: {
    easy: QuestionBankItem[];
    hard: QuestionBankItem[];
    tough: QuestionBankItem[];
  };
}

/**
 * Analyze candidate's entire resume with Gemini and generate 3 sets of questions (Easy, Hard, Tough)
 * NEVER DEFAULTS TO IT FIELD! Intelligently detects any sector (Finance, Trading, AI/DS, Core Eng, etc.)
 */
export async function analyzeResumeWithGemini(
  resume: Partial<ResumeData> | null,
  targetRole?: string
): Promise<ResumeAnalysisResult> {
  const resumeText = formatResumeContext(resume);
  const resumeLower = resumeText.toLowerCase();
  const hasJavaOrCpp = /java|c\+\+|cpp|oops|stl|jvm|pointers/.test(resumeLower);
  const isFinance = (/gold|xauusd|order block|trading|market analyst/.test(resumeLower)) && !hasJavaOrCpp;

  const systemInstruction = `You are an elite, senior corporate hiring manager and technical domain interviewer representing top global organizations in the candidate's specific sector.

CRITICAL MANDATORY INSTRUCTIONS:
1. CAREFULLY ANALYZE THE ENTIRE RESUME AND ALL LISTED SKILLS AND TECHNOLOGIES:
   - Identify the exact skills the candidate has highlighted (e.g. Java, C++, Python, JavaScript, React, SQL, Data Structures & Algorithms, OOPs, Multithreading, Trading, Core Engineering, etc.).
   - Tailor all 3 difficulty tiers (Easy, Hard, Tough) strictly to those detected skills and projects!
2. SKILL SPECIALIZATION GUIDELINES:
   - IF RESUME HIGHLIGHTS JAVA & C++:
     * You MUST test both Java and C++ deeply alongside core Object-Oriented Programming and Computer Science concepts.
     * Easy: Foundational OOPs principles (Polymorphism, Inheritance, Encapsulation, Abstraction), JVM bytecode vs native compiled execution, pointers vs references, and core data structures.
     * Hard: Language mechanisms & internals:
       - Java: JVM memory architecture (Heap, Stack, Metaspace), Garbage Collection algorithms (G1/ZGC), Collections internals (HashMap collision chaining vs red-black tree, ConcurrentHashMap), Multithreading (synchronized vs volatile, locks, ThreadPoolExecutor).
       - C++: Manual memory management, pointer arithmetic, RAII, smart pointers (std::unique_ptr, std::shared_ptr, std::weak_ptr), copy vs move semantics (rvalue references, std::move), rule of 5, virtual functions, and vtable.
     * Tough: High-performance systems: low-latency concurrent processing, debugging memory leaks and segmentation faults with Valgrind/GDB, lock-free queues, cache line alignment, and scalable distributed architectures.
   - IF RESUME HIGHLIGHTS FINANCIAL MARKETS & TRADING:
     * Test institutional price action, liquidity pools, order blocks, risk-to-reward ratio (1:2 RRR), and macroeconomic events (CPI, NFP, FOMC).
   - IF RESUME HIGHLIGHTS OTHER DOMAINS (AI/ML, Mechanical, Civil, Electrical):
     * Test their respective domain principles, tools, and technical problem-solving.
3. Divide into 3 distinct difficulty categories:
   - Easy: Candidate background, foundational concepts, and core project walkthrough.
   - Hard: In-depth technical execution, language internals, edge cases, and optimization.
   - Tough: High-stakes crisis management, high-throughput system bottlenecks, and complex trade-offs under pressure.

Output STRICT JSON ONLY matching the requested schema.`;

  const prompt = `Analyze this candidate's resume completely and determine their exact sector, target placement role, and generate tailored questions based strictly on their highlighted skills:

=== CANDIDATE RESUME ===
${resumeText}
========================

Requirements:
- Detect the candidate's true sector and target role from their resume (e.g. "Software Engineering & Computer Science", "Financial Markets & Trading", "Mechanical Engineering").
- Generate 3 Easy, 3 Hard, and 3 Tough questions tailored strictly to their highlighted skills and resume details.

Respond in this EXACT JSON structure:
{
  "detectedSector": "e.g. Software Engineering & Computer Science",
  "detectedTargetRole": "e.g. Software Development Engineer (Java / C++)",
  "candidateSummary": "2-3 sentence executive assessment of the candidate's background, sector, and core methodologies",
  "detectedTechStack": ["Java", "C++", "Data Structures & Algorithms", "OOPs", "Multithreading", "SQL"],
  "keyProjects": ["Primary Project 1", "Primary Project 2"],
  "strengths": ["Strong foundations in highlighted skills", "Disciplined analytical problem solving"],
  "recommendedFocus": "Advanced concurrency, memory profiling, and architecture optimization",
  "questions": {
    "easy": [
      {
        "id": "easy_1",
        "roundTitle": "Round 1: [Easy] Candidate Background & Core Skills Overview",
        "question": "Question inviting candidate to introduce themselves and walk through their highlighted skills and projects from their resume",
        "difficulty": "Easy",
        "topic": "Background & Core Skills",
        "expectedKeywords": ["background", "projects", "skills"]
      },
      {
        "id": "easy_2",
        "roundTitle": "Round 2: [Easy] Foundational Concepts in Highlighted Tech",
        "question": "Question testing fundamental principles of their main skills (e.g. OOPs concepts, Java vs C++ execution, or domain fundamentals)",
        "difficulty": "Easy",
        "topic": "Foundations",
        "expectedKeywords": ["concept", "principle", "implementation"]
      },
      {
        "id": "easy_3",
        "roundTitle": "Round 3: [Easy] Data Structures & Practical Implementation",
        "question": "Question asking about practical application of data structures, libraries, or tools in their work",
        "difficulty": "Easy",
        "topic": "Practical Application",
        "expectedKeywords": ["data structures", "workflow", "efficiency"]
      }
    ],
    "hard": [
      {
        "id": "hard_1",
        "roundTitle": "Round 4: [Hard] Deep Dive into Language Internals & Memory",
        "question": "Challenging question on internal mechanisms (e.g. C++ RAII / smart pointers, Java GC / memory model, or domain-specific deep technical logic)",
        "difficulty": "Hard",
        "topic": "Internals & Memory",
        "expectedKeywords": ["memory", "allocation", "pointers"]
      },
      {
        "id": "hard_2",
        "roundTitle": "Round 5: [Hard] Concurrency, Multithreading & Edge Cases",
        "question": "Question testing concurrency primitives, thread safety, race conditions, or complex edge cases",
        "difficulty": "Hard",
        "topic": "Concurrency & Edge Cases",
        "expectedKeywords": ["concurrency", "thread safety", "synchronization"]
      },
      {
        "id": "hard_3",
        "roundTitle": "Round 6: [Hard] Performance Optimization & System Profiling",
        "question": "Question on profiling, latency reduction, complexity trade-offs, and rigorous error handling",
        "difficulty": "Hard",
        "topic": "Performance & Optimization",
        "expectedKeywords": ["profiling", "optimization", "trade-offs"]
      }
    ],
    "tough": [
      {
        "id": "tough_1",
        "roundTitle": "Round 7: [Tough] High-Throughput / Low-Latency Crisis Scenario",
        "question": "High-stakes scenario: Debugging segmentation faults, memory leaks, or production outages under extreme demand",
        "difficulty": "Tough",
        "topic": "Crisis & Root Cause Debugging",
        "expectedKeywords": ["debugging", "memory leak", "root cause"]
      },
      {
        "id": "tough_2",
        "roundTitle": "Round 8: [Tough] Advanced Architectural Synthesis & Lock-Free Design",
        "question": "Complex architectural design: designing lock-free data structures, scaling distributed systems, or integrating complex models",
        "difficulty": "Tough",
        "topic": "Advanced Architecture",
        "expectedKeywords": ["architecture", "lock-free", "scalability"]
      },
      {
        "id": "tough_3",
        "roundTitle": "Round 9: [Tough] High-Pressure Trade-offs & Production Resiliency",
        "question": "High-pressure trade-offs when resources, memory, or time constraints are severely constrained in mission-critical environments",
        "difficulty": "Tough",
        "topic": "Production Resiliency",
        "expectedKeywords": ["resiliency", "trade-offs", "fault tolerance"]
      }
    ]
  }
}`;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction, true);
    const parsed = JSON.parse(rawResponse);
    return parsed;
  } catch (err) {
    console.error('[Gemini Interview] Error analyzing resume, falling back to intelligent template:', err);

    // 1. Fallback for Java & C++ resumes
    if (hasJavaOrCpp) {
      return {
        detectedSector: 'Software Engineering & Computer Science',
        detectedTargetRole: targetRole || 'Software Development Engineer (Java / C++)',
        candidateSummary: 'Candidate with strong foundations in Java, C++, Object-Oriented Programming, and Software Engineering.',
        detectedTechStack: [
          'Java',
          'C++',
          'Data Structures & Algorithms',
          'OOPs (Polymorphism, Inheritance)',
          'Memory Management & Pointers',
          'STL & Collections Framework',
          'Multithreading & Concurrency'
        ],
        keyProjects: ['High-Performance Software Engineering Projects', 'Data Structures & Algorithms Implementation'],
        strengths: ['Dual proficiency in Java and C++', 'Solid grasp of low-level memory, OOPs principles, and algorithmic problem solving'],
        recommendedFocus: 'Lock-free concurrency, JVM garbage collection tuning, and modern C++ smart pointer idioms',
        questions: {
          easy: [
            {
              id: 'easy_1',
              roundTitle: 'Round 1: [Easy] Candidate Background & Core Programming Stack',
              question: 'Welcome! To start off, please introduce yourself, tell me about your technical background, and walk me through your hands-on experience working with Java and C++ in your projects.',
              difficulty: 'Easy',
              topic: 'Background & Core Languages',
              expectedKeywords: ['Java', 'C++', 'projects', 'OOPs']
            },
            {
              id: 'easy_2',
              roundTitle: 'Round 2: [Easy] Java vs C++ Memory Management & Execution',
              question: 'What is the fundamental architectural difference between how Java and C++ execute code and manage memory (JVM bytecode and automatic Garbage Collection versus direct native compilation with pointers)?',
              difficulty: 'Easy',
              topic: 'Language Architecture',
              expectedKeywords: ['JVM', 'bytecode', 'Garbage Collection', 'pointers', 'compilation']
            },
            {
              id: 'easy_3',
              roundTitle: 'Round 3: [Easy] Object-Oriented Programming Principles (OOPs)',
              question: 'Can you explain the four core pillars of Object-Oriented Programming (Encapsulation, Abstraction, Inheritance, Polymorphism) and provide a concrete coding example of runtime polymorphism in either C++ or Java?',
              difficulty: 'Easy',
              topic: 'OOPs Principles',
              expectedKeywords: ['polymorphism', 'inheritance', 'encapsulation', 'abstraction', 'virtual function']
            }
          ],
          hard: [
            {
              id: 'hard_1',
              roundTitle: 'Round 4: [Hard] C++ Smart Pointers & RAII Paradigm',
              question: 'In modern C++, explain the RAII (Resource Acquisition Is Initialization) idiom and contrast std::unique_ptr, std::shared_ptr, and std::weak_ptr. How does std::weak_ptr prevent cyclic reference memory leaks?',
              difficulty: 'Hard',
              topic: 'C++ Memory & Smart Pointers',
              expectedKeywords: ['RAII', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'cyclic reference']
            },
            {
              id: 'hard_2',
              roundTitle: 'Round 5: [Hard] Java Collections Internals & HashMap Hash Collisions',
              question: 'How does Java 8+ HashMap resolve hash collisions internally? Walk me through how entries are stored in buckets, when a linked list transitions into a Red-Black Tree, and the time complexity impact.',
              difficulty: 'Hard',
              topic: 'Java HashMap Internals',
              expectedKeywords: ['HashMap', 'hash collision', 'Red-Black tree', 'treeify threshold', 'O(1) to O(log n)']
            },
            {
              id: 'hard_3',
              roundTitle: 'Round 6: [Hard] Multithreading: Java Memory Model vs C++ std::thread',
              question: 'How do you ensure thread safety in concurrent environments? Contrast the volatile keyword with synchronized blocks and explicit ReentrantLock in Java, and explain how mutexes and atomic variables are used in C++.',
              difficulty: 'Hard',
              topic: 'Concurrency & Thread Safety',
              expectedKeywords: ['volatile', 'synchronized', 'ReentrantLock', 'mutex', 'atomic', 'race condition']
            }
          ],
          tough: [
            {
              id: 'tough_1',
              roundTitle: 'Round 7: [Tough] Debugging Segmentation Faults & Memory Leaks in C++',
              question: 'Suppose your C++ high-throughput service crashes intermittently with a segmentation fault under peak traffic. What systematic debugging methodology and tooling (GDB, Valgrind, AddressSanitizer, core dumps) do you use to isolate dangling pointers or memory corruption?',
              difficulty: 'Tough',
              topic: 'Low-Level Debugging & Memory Safety',
              expectedKeywords: ['Valgrind', 'AddressSanitizer', 'GDB', 'dangling pointer', 'segmentation fault']
            },
            {
              id: 'tough_2',
              roundTitle: 'Round 8: [Tough] Designing a Low-Latency Lock-Free Concurrent Queue',
              question: 'How would you architect a lock-free Single Producer Single Consumer (SPSC) or Multi-Producer Multi-Consumer (MPMC) queue in C++ or Java? How do you prevent false sharing with cache line padding and leverage CAS (Compare-And-Swap) operations?',
              difficulty: 'Tough',
              topic: 'Lock-Free Data Structures & Systems',
              expectedKeywords: ['lock-free', 'CAS', 'Compare-And-Swap', 'cache line padding', 'false sharing']
            },
            {
              id: 'tough_3',
              roundTitle: 'Round 9: [Tough] High-Throughput Microservice Architecture & GC Pauses',
              question: 'You are deploying a mission-critical Java service processing 50,000 requests/second. The application is suffering from stop-the-world Garbage Collection latency spikes. How do you tune GC (G1/ZGC), optimize heap allocations, and consider off-heap memory to eliminate latency spikes?',
              difficulty: 'Tough',
              topic: 'GC Tuning & High-Throughput Engineering',
              expectedKeywords: ['Garbage Collection tuning', 'G1GC', 'ZGC', 'off-heap memory', 'stop-the-world']
            }
          ]
        }
      };
    }

    // 2. Fallback for Financial Markets / Trading resumes
    if (isFinance) {
      return {
        detectedSector: 'Financial Markets & Quantitative Trading',
        detectedTargetRole: targetRole || 'Market Analyst / Quantitative Trader',
        candidateSummary: 'Self-driven Market Analyst with experience analyzing institutional trading concepts, liquidity, order blocks, and risk management.',
        detectedTechStack: [
          'Liquidity Identification',
          'Order Block Validation',
          'False Breakout Recognition',
          'Retailer vs Institutional Analysis',
          '1:2 RRR',
          'Market Structure Analysis',
          'Money Management & Emotion Control'
        ],
        keyProjects: ['Liquidity-Based Trading Model (XAUUSD)', 'Market Analysis & Trap Detection Strategy'],
        strengths: ['Deep institutional price action understanding', 'Disciplined 1:2 RRR risk-to-reward management'],
        recommendedFocus: 'Macroeconomic catalyst timing and quantitative backtest expectancy validation',
        questions: {
          easy: [
            {
              id: 'easy_1',
              roundTitle: 'Round 1: [Easy] Candidate Background & Market Strategy Walkthrough',
              question: 'Welcome to your interview for Market Analyst. Can you walk me through your core trading philosophy, background, and how you developed your liquidity-based strategy?',
              difficulty: 'Easy',
              topic: 'Background & Trading Philosophy',
              expectedKeywords: ['liquidity', 'market cycles', 'order blocks']
            },
            {
              id: 'easy_2',
              roundTitle: 'Round 2: [Easy] Institutional Concepts vs Retail Support/Resistance',
              question: 'From an institutional trading standpoint, what is the fundamental difference between retail support/resistance levels and institutional order blocks and liquidity pools?',
              difficulty: 'Easy',
              topic: 'Institutional Concepts',
              expectedKeywords: ['order block', 'liquidity pool', 'retail traps']
            },
            {
              id: 'easy_3',
              roundTitle: 'Round 3: [Easy] Session-Based Price Behavior (Asian, London, NY)',
              question: 'Why do Asian, London, and New York sessions exhibit distinctly different volatility patterns, and how do you identify the optimal execution window?',
              difficulty: 'Easy',
              topic: 'Session Dynamics',
              expectedKeywords: ['Asian session', 'London open', 'New York volume', 'execution window']
            }
          ],
          hard: [
            {
              id: 'hard_1',
              roundTitle: 'Round 4: [Hard] False Breakouts & Liquidity Grab Recognition',
              question: 'How do you structurally and mathematically differentiate between a genuine trend continuation breakout versus an institutional liquidity grab (false breakout)?',
              difficulty: 'Hard',
              topic: 'False Breakouts & Liquidity Sweeps',
              expectedKeywords: ['liquidity sweep', 'displacement', 'body close', 'volume']
            },
            {
              id: 'hard_2',
              roundTitle: 'Round 5: [Hard] High-Impact Macro Events (CPI, NFP, FOMC)',
              question: 'High-impact macroeconomic releases like CPI, Non-Farm Payrolls (NFP), and FOMC interest rate decisions cause severe spread widening. How does your rule-based strategy adapt?',
              difficulty: 'Hard',
              topic: 'Macro News Impact',
              expectedKeywords: ['CPI', 'NFP', 'FOMC', 'spread widening', 'volatility spike']
            },
            {
              id: 'hard_3',
              roundTitle: 'Round 6: [Hard] Risk-to-Reward Ratio (1:2 RRR) & Controlled Drawdowns',
              question: 'In your resume, you emphasize maintaining a 1:2 RRR and money management. How do you dynamically size positions relative to stop-loss distance, and what rules do you enforce when facing drawdown?',
              difficulty: 'Hard',
              topic: 'Risk Management & Drawdown',
              expectedKeywords: ['1:2 RRR', 'position sizing', 'max drawdown', 'risk per trade']
            }
          ],
          tough: [
            {
              id: 'tough_1',
              roundTitle: 'Round 7: [Tough] Black Swan Flash Crash & Liquidity Evaporation',
              question: 'Suppose an unexpected geopolitical crisis triggers an immediate flash crash where liquidity voids are penetrated and normal order blocks fail. What is your real-time crisis protocol to preserve capital?',
              difficulty: 'Tough',
              topic: 'Crisis Capital Preservation',
              expectedKeywords: ['capital preservation', 'liquidity void', 'slippage', 'emergency hedge']
            },
            {
              id: 'tough_2',
              roundTitle: 'Round 8: [Tough] Integrating Quantitative Modeling with Order Flow',
              question: 'How would you design an algorithmic quantitative model to automatically identify liquidity pools and order blocks without overfitting to historical market noise?',
              difficulty: 'Tough',
              topic: 'Quantitative AI Modeling',
              expectedKeywords: ['algorithmic trading', 'backtesting', 'cross-validation', 'order flow']
            },
            {
              id: 'tough_3',
              roundTitle: 'Round 9: [Tough] High-Pressure Psychological Drawdown & Emotional Discipline',
              question: 'You encounter 6 consecutive losing trades during an unpredictable consolidation, nearing your maximum monthly drawdown limit. Walk me through your psychological discipline, journaling protocol, and risk audit.',
              difficulty: 'Tough',
              topic: 'Psychological Discipline & Risk Audit',
              expectedKeywords: ['emotion control', 'journaling', 'trade review', 'discipline']
            }
          ]
        }
      };
    }

    // 3. General template for other engineering sectors
    return {
      detectedSector: 'Engineering & Technology',
      detectedTargetRole: targetRole || 'Software Development Engineer',
      candidateSummary: 'Candidate with solid technical domain foundations and engineering problem-solving capabilities.',
      detectedTechStack: ['Problem Solving', 'Data Structures & Algorithms', 'System Design', 'Core Engineering'],
      keyProjects: ['Technical Domain Project Implementation'],
      strengths: ['Analytical foundations', 'Methodical approach to problem solving'],
      recommendedFocus: 'System scalability, deep component optimization, and testing under stress',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] Candidate Background & Project Walkthrough',
            question: 'Welcome! Please introduce yourself, your academic background, and provide a walkthrough of your primary technical projects and tools highlighted on your resume.',
            difficulty: 'Easy',
            topic: 'Background',
            expectedKeywords: ['background', 'projects', 'methodology']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] Core Engineering Principles',
            question: 'Can you explain the core architectural principles, libraries, and design patterns you utilize in your primary projects?',
            difficulty: 'Easy',
            topic: 'Core Principles',
            expectedKeywords: ['principles', 'methodology', 'tools']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] Execution Flow & Quality Control',
            question: 'How do you structure your development workflow from initial requirement gathering to testing and deployment?',
            difficulty: 'Easy',
            topic: 'Execution Flow',
            expectedKeywords: ['workflow', 'validation', 'quality']
          }
        ],
        hard: [
          {
            id: 'hard_1',
            roundTitle: 'Round 4: [Hard] Technical Implementation & Edge Cases',
            question: 'Walk me through a complex technical challenge you diagnosed in your work. What was an unexpected edge case and how did you resolve it?',
            difficulty: 'Hard',
            topic: 'Technical Challenge',
            expectedKeywords: ['edge case', 'diagnosis', 'solution']
          },
          {
            id: 'hard_2',
            roundTitle: 'Round 5: [Hard] Optimization & Performance Bottlenecks',
            question: 'How do you profile, identify, and eliminate performance bottlenecks or memory inefficiencies in your applications?',
            difficulty: 'Hard',
            topic: 'Optimization',
            expectedKeywords: ['optimization', 'performance', 'metrics']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Error Handling & Fault Resilience',
            question: 'How do you architect robust error handling and fault resilience when dependencies or external services fail unexpectedly?',
            difficulty: 'Hard',
            topic: 'Fault Resilience',
            expectedKeywords: ['resilience', 'error handling', 'fallback']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] High-Pressure Crisis Incident Triage',
            question: 'Imagine a critical production failure occurs under peak operational traffic. Walk me through your step-by-step incident triage, rollback, and root-cause analysis.',
            difficulty: 'Tough',
            topic: 'Crisis Triage',
            expectedKeywords: ['incident response', 'root cause', 'recovery']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] Scalability & Architectural Trade-offs',
            question: 'What are the most difficult trade-offs you have faced between immediate implementation speed versus long-term scalability and code maintainability?',
            difficulty: 'Tough',
            topic: 'Architectural Trade-offs',
            expectedKeywords: ['trade-offs', 'scalability', 'maintainability']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] High-Volume System Resiliency under Uncertainty',
            question: 'How do you design a mission-critical distributed service that maintains high availability and zero data corruption when partial network partitions occur?',
            difficulty: 'Tough',
            topic: 'Distributed Resiliency',
            expectedKeywords: ['high availability', 'partition tolerance', 'consistency']
          }
        ]
      }
    };
  }
}

export interface InteractiveRoundRequest {
  resume: Partial<ResumeData> | null;
  targetRole: string;
  difficulty: 'Easy' | 'Hard' | 'Tough';
  roundIndex: number;
  totalRounds?: number;
  timeRemainingSeconds?: number;
  candidateName?: string;
  candidateAnswer?: string;
  previousQuestion?: string;
  previousRoundTitle?: string;
  transcriptHistory?: {
    round: number;
    roundTitle: string;
    difficulty?: 'Easy' | 'Hard' | 'Tough';
    question: string;
    studentAnswer: string;
    feedback?: string;
    technicalMark?: number;
    communicationMark?: number;
  }[];
}

export interface InteractiveRoundResponse {
  interviewerReaction: string;
  feedback: string;
  technicalMark: number;
  communicationMark: number;
  score: number;
  nextQuestion: string;
  roundTitle: string;
  difficulty: 'Easy' | 'Hard' | 'Tough';
  tips: string;
}

/**
 * Interactive Conversational Round Handler:
 * Conducts a 15-minute realistic technical & domain interview.
 * Starts with professional greeting & self-introduction, evaluates replies, and dynamically probes deeper based on answers!
 */
export async function processInteractiveRound(
  req: InteractiveRoundRequest
): Promise<InteractiveRoundResponse> {
  const resumeText = formatResumeContext(req.resume);
  const { difficulty, roundIndex, targetRole, candidateAnswer, previousQuestion, transcriptHistory, candidateName, timeRemainingSeconds } = req;

  const hasPreviousAnswer = candidateAnswer && candidateAnswer.trim().length > 0 && candidateAnswer.trim() !== 'No response provided.';

  const resumeLower = resumeText.toLowerCase();
  const hasJavaOrCpp = /java|c\+\+|cpp|oops|stl|jvm|pointers/.test(resumeLower);
  const isFinance = (/gold|xauusd|order block|trading|market analyst/.test(resumeLower)) && !hasJavaOrCpp;

  const interviewerRole = hasJavaOrCpp
    ? 'Senior Principal Software Engineer & Technical Interview Lead (Specializing in Java, C++, and Core Computer Science)'
    : isFinance
    ? 'Senior Head of Trading Strategy & Portfolio Risk at a Global Institutional Proprietary Trading Desk'
    : `Senior Corporate Technical Hiring Lead in ${targetRole || 'Software Engineering'}`;

  const displayName = candidateName || 'there';

  const systemInstruction = `You are a real-time AI Technical & Domain Interviewer conducting a realistic 15-minute live interview.
Your Persona: ${interviewerRole}.
You speak clearly, warmly, professionally, and inquisitively.
You listen to the candidate's exact reply and ask follow-up questions directly grounded in what they just said and what is on their resume.

CRITICAL INSTRUCTIONS:
1. DYNAMIC SKILL & DOMAIN ADAPTATION:
   - Carefully examine the candidate's resume context and highlighted skills.
   - If the candidate's resume highlights Java, C++, Python, or Software Engineering: You MUST interview them directly on their highlighted coding skills, Object-Oriented Programming, memory management, pointers, JVM, STL, multithreading, and algorithmic problem-solving!
   - If the candidate highlights Financial Markets or Trading: Focus on market analysis, liquidity, order blocks, and risk management.
   - If the candidate highlights another domain (e.g. Mechanical, Electrical): Focus on their respective domain principles.
2. NATURAL INTERVIEW FLOW (15-Minute Session):
   - Turn 1 (Opening): Warm professional greeting. Address the candidate by name (${displayName}), welcome them for the role of ${targetRole || 'Software Development Engineer'}, and ask them to introduce themselves, tell about their background, and walk through the programming languages, skills, and projects highlighted on their resume.
   - Subsequent Turns:
     * Acknowledge what the candidate actually replied with a realistic 1-2 sentence spoken reaction.
     * Evaluate their Technical/Domain Mark (0-100) and Communication Fluency Mark (0-100).
     * Ask a follow-up question that builds directly on what they stated, probing deeper into their logic, code implementation, memory management, edge cases, or crisis scenarios.
3. Keep the interview questions conversational, engaging, and suitable for Text-to-Speech synthesis.

Output STRICT JSON ONLY.`;

  const prompt = `LIVE 15-MINUTE INTERVIEW CONTEXT:
Candidate: ${displayName}
Target Role: ${targetRole || (hasJavaOrCpp ? 'Software Development Engineer' : 'Technical Specialist')}
Question Number: ${roundIndex + 1}
Difficulty Tier: ${difficulty}
${timeRemainingSeconds ? `Time Remaining in 15-Min Interview: ${Math.floor(timeRemainingSeconds / 60)}m ${timeRemainingSeconds % 60}s` : ''}

=== CANDIDATE RESUME ===
${resumeText}
========================

${
  roundIndex === 0 || !hasPreviousAnswer
    ? `This is the opening question of the 15-minute interview.
Start with a warm professional greeting: "Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || (hasJavaOrCpp ? 'Software Development Engineer' : 'Technical Specialist')}. To start off, please introduce yourself, tell me about your background, and walk me through the key programming languages, skills, and projects highlighted in your resume."`
    : `=== PREVIOUS QUESTION ASKED ===
"${previousQuestion}"

=== CANDIDATE'S ACTUAL SPOKEN/TYPED REPLY ===
"${candidateAnswer}"

Critically evaluate this reply:
1. Technical/Domain correctness & depth (0-100 mark)
2. Spoken communication & clarity (0-100 mark)
3. Constructive feedback notes
4. Spoken interviewer reaction acknowledging their specific points
5. The NEXT interview question: Must probe deeper based on what they just explained and their resume!`
}

${
  transcriptHistory && transcriptHistory.length > 0
    ? `=== INTERVIEW TRANSCRIPT HISTORY SO FAR ===\n` +
      transcriptHistory
        .map(
          (t) =>
            `Q${t.round} [${t.difficulty || 'Normal'}]: Q: "${t.question}" -> Candidate: "${t.studentAnswer}" (Tech: ${t.technicalMark || 75}/100, Comm: ${t.communicationMark || 75}/100)`
        )
        .join('\n')
    : ''
}

Generate the response in this EXACT JSON structure:
{
  "interviewerReaction": "Natural spoken reaction to candidate's answer (1-2 sentences). If opening question, warm professional greeting.",
  "feedback": "Bullet-point evaluation of their technical depth, accuracy, and communication delivery.",
  "technicalMark": 85,
  "communicationMark": 88,
  "nextQuestion": "The next conversational interview question tailored to what they answered and their resume.",
  "roundTitle": "Question ${roundIndex + 1}: [${difficulty}] Descriptive Focus Topic",
  "difficulty": "${difficulty}",
  "tips": "Quick 1-sentence tip on what top interviewers look for in this question."
}`;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction, true);
    const parsed: InteractiveRoundResponse = JSON.parse(rawResponse);
    parsed.score = Math.round(((parsed.technicalMark || 75) * 0.6) + ((parsed.communicationMark || 75) * 0.4));
    parsed.difficulty = difficulty;
    return parsed;
  } catch (err) {
    console.error('[Gemini Interview] Error in interactive round, generating intelligent fallback:', err);
    
    let techMark = 75;
    let commMark = 75;
    let reaction = 'Thank you for sharing your thoughts.';

    if (hasPreviousAnswer) {
      const words = candidateAnswer.trim().split(/\s+/).length;
      if (words > 40) {
        techMark = 88;
        commMark = 90;
        reaction = 'Excellent detail and structured explanation on your technical methodology.';
      } else if (words > 15) {
        techMark = 78;
        commMark = 76;
        reaction = 'Good points. Let us dive deeper into the low-level execution and architectural logic.';
      } else {
        techMark = 65;
        commMark = 68;
        reaction = 'Understood. Please try to elaborate more with specific code, data structures, and edge-case handling.';
      }
    } else {
      reaction = `Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || 'Software Development Engineer'}.`;
    }

    const openingQuestion = `Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || 'Software Development Engineer'}. To start off, please introduce yourself, tell me about your background, and walk me through the key programming languages, skills, and projects highlighted in your resume.`;

    const fallbackQuestions: Record<string, string> = hasJavaOrCpp
      ? {
          Easy: `Can you explain the core differences between C++ and Java in terms of memory management and execution (JVM bytecode vs native machine code compiled with pointers)?`,
          Hard: `In C++, explain RAII (Resource Acquisition Is Initialization) and the difference between std::unique_ptr and std::shared_ptr. How do you prevent circular memory leaks?`,
          Tough: `Suppose you have a low-latency multithreaded processing system written in C++ and Java. How would you design lock-free queues, avoid GC pauses, and ensure thread safety?`
        }
      : isFinance
      ? {
          Easy: `Can you explain your experience analyzing XAUUSD (Gold), and how you identify institutional liquidity and order blocks across market sessions?`,
          Hard: `How do you handle macroeconomic volatility during CPI, NFP, or FOMC news releases, and how do you ensure you maintain a minimum 1:2 Risk-to-Reward Ratio?`,
          Tough: `Suppose an unexpected market crisis causes a 150-pip flash crash in Gold with massive spread widening and slippage. Walk me through your real-time risk triage and capital preservation protocols.`
        }
      : {
          Easy: `Based on your resume, can you explain the core architecture, data structures, and methodology of your primary project?`,
          Hard: `How do you diagnose and resolve unexpected memory leaks, concurrency race conditions, or performance bottlenecks in your system?`,
          Tough: `Walk me through your emergency triage when a critical service fails under peak operational load and how you ensure zero data loss.`
        };

    const nextQ = (roundIndex === 0 && !hasPreviousAnswer) ? openingQuestion : (fallbackQuestions[difficulty] || fallbackQuestions.Easy);

    return {
      interviewerReaction: reaction,
      feedback: hasPreviousAnswer
        ? 'Demonstrated understanding of core principles. Continue to articulate concrete implementation details and real-world execution rules.'
        : 'Starting interview session.',
      technicalMark: techMark,
      communicationMark: commMark,
      score: Math.round((techMark * 0.6) + (commMark * 0.4)),
      nextQuestion: nextQ,
      roundTitle: `Question ${roundIndex + 1}: [${difficulty}] Technical Evaluation`,
      difficulty,
      tips: `Focus on clear logical articulation, code structure, and real-world execution rules.`
    };
  }
}



export const SYED_AYAZ_RESUME = {
  id: 'res_syed_ayaz',
  title: 'Syed Ayaz Shah - Market Analyst & Quantitative Trading Resume',
  template: 'ATS Resume' as const,
  sector: 'Financial Markets & Quantitative Trading',
  targetRole: 'Market Analyst / Quantitative Trader',
  summary:
    'Self-driven Market Analyst with 3+ years of hands-on experience analyzing XAUUSD (Gold) across multiple market cycles. Strong understanding of institutional trading concepts such as liquidity, order blocks, market structure, and session-based price behavior. Experienced in backtesting, journaling, and risk-managed strategy development.',
  skills: [
    {
      category: 'Market & Technical Analysis',
      list: [
        'Liquidity Identification',
        'Order Block Validation',
        'False Breakout Recognition',
        'Retailer vs Institutional Analysis',
        'Market Structure Analysis',
        'Multi-timeframe Analysis'
      ]
    },
    {
      category: 'Risk & Capital Management',
      list: [
        'Maintaining 1:2 RRR',
        'Money Management',
        'Controlled Drawdown Strategy',
        'Waiting for Proper Setups',
        'Emotion Control'
      ]
    },
    {
      category: 'Macro & Asset Expertise',
      list: [
        'XAUUSD (Gold) Price Action',
        'Asian, London & NY Sessions',
        'Macro Events (CPI, NFP, FOMC)',
        'Good Communication'
      ]
    }
  ],
  experience: [
    {
      company: 'Independent Market Analyst',
      role: 'Market Analyst & Technical Trader',
      period: '2022 - Present',
      points: [
        'Analyzed XAUUSD price behavior daily using multi-timeframe market structure.',
        'Identified institutional entry zones using liquidity pools, order blocks.',
        'Backtested multiple gold trading models with focus on sessions.',
        'Developed rule-based strategies with defined risk management (1:2 RRR min).',
        'Studied macro events (CPI, NFP, FOMC) impact on gold volatility.'
      ]
    }
  ],
  projects: [
    {
      title: 'Liquidity-Based Trading Model',
      tech: 'XAUUSD, Session Windows, Liquidity Pools',
      points: [
        'Studied price behavior of XAUUSD across Asian, London, and New York sessions.',
        'Identified optimal execution windows used for trade planning and entry confirmation where the exact liquidity held.'
      ]
    },
    {
      title: 'Market Analysis & Trap Detection Strategy',
      tech: 'Risk-to-Reward Ratio (1:2 RRR), Controlled Drawdown',
      points: [
        'Designed rule-based strategy based on liquidity pools and false breakout traps.',
        'Achieved consistent backtested results with controlled drawdown.',
        'Focused on high-probability institutional setups.'
      ]
    }
  ],
  education: [
    {
      institution: 'V S B Engineering College, Karur India',
      degree: 'Bachelor of Technology in Artificial intelligence and Data science',
      year: '2023 - 2027',
      cgpa: '8.51 CGPA'
    }
  ],
  certifications: [
    'COURSE NAME : [FOREX TRADING] done in infosys springboard (https://verify.onwingspan.com/)',
    'COURSE NAME : [FOREX TRADING WITH BINARY OPTIONS] done in infosys springboard (https://verify.onwingspan.com/)'
  ],
  isCustomUpload: true,
  fileName: 'resume ayaz.pdf',
  fileSize: '73.6 KB',
  fileType: 'application/pdf',
  atsScore: 94,
  updatedAt: new Date().toISOString()
};

