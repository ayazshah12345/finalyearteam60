import { ResumeData } from '@/types';

// Multi-model fallback sequence for highest availability
const CANDIDATE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
  'gemini-1.5-pro'
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
 * Deep local skill and profile extractor:
 * Parses the raw resume text to extract all programming languages, core CS concepts,
 * frameworks, tools, projects, and target role with zero reliance on external APIs.
 */
export function extractSkillsAndProfileFromText(
  text: string,
  fileName: string = 'resume.pdf'
): Partial<ResumeData> {
  const lower = text.toLowerCase();

  // 1. Detect Programming Languages
  const languages: string[] = [];
  if (/\bjava\b(?!\s*script)/i.test(text)) languages.push('Java');
  if (/\b(c\+\+|cpp)\b/i.test(text)) languages.push('C++');
  if (/\bpython\b/i.test(text)) languages.push('Python');
  if (/\bjavascript\b|\bjs\b/i.test(text)) languages.push('JavaScript');
  if (/\btypescript\b|\bts\b/i.test(text)) languages.push('TypeScript');
  if (/\bc\s+(?:programming|language)\b|\bembedded\s+c\b/i.test(text) || (/\bc\b/i.test(text) && /\bprogramming\b|\blanguage\b|\bembedded\b/i.test(lower))) languages.push('C');
  if (/\bsql\b|\bmysql\b|\bpostgresql\b|\bsqlite\b/i.test(text)) languages.push('SQL');
  if (/\bgolang\b|\bgo\b/i.test(text)) languages.push('Go');
  if (/\brust\b/i.test(text)) languages.push('Rust');
  if (/\bkotlin\b/i.test(text)) languages.push('Kotlin');

  // 2. Detect Core Computer Science & Architecture
  const coreCs: string[] = [];
  if (/data structures|dsa|algorithms|leetcode|trees|graphs|binary search/i.test(lower)) {
    coreCs.push('Data Structures & Algorithms');
  }
  if (/object oriented|oops|polymorphism|inheritance|encapsulation|abstraction/i.test(lower)) {
    coreCs.push('Object-Oriented Programming (OOPs)');
  }
  if (/memory management|pointers|raii|smart pointers|valgrind|heap|stack/i.test(lower)) {
    coreCs.push('Memory Management & Pointers');
  }
  if (/multithreading|concurrency|thread safety|parallelism|locks|mutex/i.test(lower)) {
    coreCs.push('Multithreading & Concurrency');
  }
  if (/database management|dbms|normalization|acid|indexing|transactions/i.test(lower)) {
    coreCs.push('DBMS & Database Architecture');
  }
  if (/operating system|os concepts|process management|paging|deadlock/i.test(lower)) {
    coreCs.push('Operating Systems');
  }
  if (/computer network|tcp\/ip|http|rest api|socket|web socket/i.test(lower)) {
    coreCs.push('Computer Networks & APIs');
  }
  if (/system design|scalability|microservices|distributed systems/i.test(lower)) {
    coreCs.push('System Design & Microservices');
  }

  // 3. Detect Frameworks, Libraries & Developer Tools
  const frameworks: string[] = [];
  if (/react|reactjs/i.test(lower)) frameworks.push('React');
  if (/next\.?js/i.test(lower)) frameworks.push('Next.js');
  if (/node\.?js|express/i.test(lower)) frameworks.push('Node.js / Express');
  if (/spring|spring boot/i.test(lower)) frameworks.push('Spring Boot');
  if (/django|fastapi|flask/i.test(lower)) frameworks.push('Django / FastAPI');
  if (/stl|standard template library/i.test(lower)) frameworks.push('C++ STL');
  if (/collections framework|hashmap|arraylist/i.test(lower)) frameworks.push('Java Collections');
  if (/git|github|gitlab/i.test(lower)) frameworks.push('Git & GitHub');
  if (/docker|kubernetes|container/i.test(lower)) frameworks.push('Docker & Containers');
  if (/aws|cloud|azure|gcp/i.test(lower)) frameworks.push('Cloud Architecture');

  // 4. Financial Markets / Quantitative Trading (Only if explicit financial trading terms and zero coding stack)
  const trading: string[] = [];
  if (/xauusd|gold.*trading|forex|binary options/i.test(lower)) trading.push('XAUUSD / Forex Market Analysis');
  if (/order block|liquidity pool/i.test(lower)) trading.push('Institutional Order Blocks & Liquidity');
  if (/1:2 rrr|risk to reward/i.test(lower)) trading.push('Risk-to-Reward (1:2 RRR) Management');

  // 5. Mechanical / Core Engineering
  const mechanical: string[] = [];
  if (/autocad|solidworks|catia|creo/i.test(lower)) mechanical.push('CAD Modeling (AutoCAD / SolidWorks)');
  if (/ansys|fea|finite element/i.test(lower)) mechanical.push('Finite Element Analysis (FEA)');
  if (/thermodynamics|heat transfer|fluid mechanics/i.test(lower)) mechanical.push('Thermodynamics & Fluid Dynamics');

  const skills: { category: string; list: string[] }[] = [];
  if (languages.length > 0) skills.push({ category: 'Programming Languages', list: languages });
  if (coreCs.length > 0) skills.push({ category: 'Core Computer Science', list: coreCs });
  if (frameworks.length > 0) skills.push({ category: 'Frameworks & Tools', list: frameworks });
  if (trading.length > 0 && languages.length === 0 && frameworks.length === 0) skills.push({ category: 'Market & Technical Analysis', list: trading });
  if (mechanical.length > 0 && languages.length === 0 && frameworks.length === 0) skills.push({ category: 'Core Engineering & Design', list: mechanical });

  // Default fallback skills if text was brief
  if (skills.length === 0) {
    skills.push({
      category: 'Core Programming & Problem Solving',
      list: ['Java', 'C++', 'Data Structures & Algorithms', 'OOPs', 'Problem Solving']
    });
  }

  // Determine Sector & Target Role
  const hasJava = languages.includes('Java');
  const hasCpp = languages.includes('C++');
  const hasPython = languages.includes('Python');
  const hasWeb = frameworks.includes('React') || frameworks.includes('Next.js') || frameworks.includes('Node.js / Express') || languages.includes('JavaScript') || languages.includes('TypeScript');
  const isTrading = trading.length > 0 && languages.length === 0 && frameworks.length === 0;
  const isMech = mechanical.length > 0 && languages.length === 0 && frameworks.length === 0;

  let sector = 'Software Engineering & Computer Science';
  let targetRole = 'Software Development Engineer';

  if (hasJava && hasCpp) {
    sector = 'Software Engineering & Computer Science';
    targetRole = 'Software Development Engineer (Java / C++)';
  } else if (hasJava) {
    sector = 'Software Engineering & Computer Science';
    targetRole = 'Java Software Engineer';
  } else if (hasCpp) {
    sector = 'Software Engineering & Computer Science';
    targetRole = 'C++ Software Engineer';
  } else if (hasPython && !hasJava && !hasCpp) {
    sector = 'Artificial Intelligence & Data Science';
    targetRole = 'AI / Python Software Engineer';
  } else if (hasWeb) {
    sector = 'Software Engineering & Computer Science';
    targetRole = 'Full Stack Software Engineer';
  } else if (isTrading) {
    sector = 'Financial Markets & Quantitative Trading';
    targetRole = 'Market Analyst / Quantitative Trader';
  } else if (isMech) {
    sector = 'Mechanical Engineering';
  }

  // Extract Project mentions from text
  const projects: { title: string; tech: string; points: string[] }[] = [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let inProjectsSection = false;
  let currentProject: { title: string; tech: string; points: string[] } | null = null;

  for (const line of lines) {
    if (/^(projects|academic projects|key projects|personal projects)/i.test(line)) {
      inProjectsSection = true;
      continue;
    }
    if (inProjectsSection && /^(education|experience|skills|certifications|achievements)/i.test(line)) {
      inProjectsSection = false;
      if (currentProject) projects.push(currentProject);
      break;
    }
    if (inProjectsSection) {
      if (line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
        if (currentProject) projects.push(currentProject);
        currentProject = {
          title: line,
          tech: languages.join(', ') || 'Software Engineering',
          points: []
        };
      } else if (currentProject && line.length > 10) {
        currentProject.points.push(line.replace(/^[•\-\*]\s*/, ''));
      }
    }
  }
  if (currentProject && !projects.includes(currentProject)) {
    projects.push(currentProject);
  }

  // If no projects parsed from headings, synthesize clean representation
  if (projects.length === 0) {
    if (hasJava && hasCpp) {
      projects.push({
        title: 'Core Systems & Algorithms in Java and C++',
        tech: 'Java, C++, STL, Collections, Multithreading',
        points: [
          'Engineered algorithmic problem solutions and Object-Oriented design patterns across Java and C++.',
          'Implemented memory-safe data structures and evaluated runtime performance trade-offs.'
        ]
      });
    } else if (isTrading) {
      projects.push({
        title: 'Liquidity & Market Structure Model',
        tech: 'XAUUSD, Session Windows, Liquidity Pools',
        points: [
          'Analyzed market structure and institutional order flow across sessions.',
          'Backtested risk-managed execution rules maintaining strict 1:2 RRR.'
        ]
      });
    } else {
      projects.push({
        title: `${targetRole} Implementation Project`,
        tech: skills.flatMap(s => s.list).slice(0, 4).join(', ') || 'Technical Stack',
        points: ['Engineered scalable components and implemented robust domain logic with comprehensive testing.']
      });
    }
  }

  // Extract Summary
  let summary = '';
  const firstParagraph = lines.slice(0, 5).join(' ');
  if (firstParagraph.length > 40) {
    summary = firstParagraph.slice(0, 300);
  } else {
    summary = `Candidate specializing in ${targetRole} with strong foundations in ${skills.flatMap(s => s.list).slice(0, 5).join(', ')}.`;
  }

  return {
    sector,
    targetRole,
    title: `${targetRole} Resume`,
    summary,
    skills,
    projects,
    education: [
      {
        institution: 'Engineering College / University',
        degree: 'B.Tech in Engineering',
        year: '2022 - 2026',
        cgpa: '8.5'
      }
    ],
    certifications: []
  };
}

/**
 * Parse an uploaded resume file (PDF, text, or image) with Gemini AI
 * Extracts true candidate domain, sector, projects, and skills with 100% reliable local fallback!
 */
export async function parseUploadedResumeWithGemini(
  buffer: Buffer,
  mimeType: string,
  fileName: string = 'resume.pdf'
): Promise<Partial<ResumeData>> {
  // First, extract raw text from PDF/document
  const extractedText = await extractTextFromBuffer(buffer, mimeType);

  // Build high-fidelity local extraction profile immediately
  const localProfile = extractSkillsAndProfileFromText(extractedText || buffer.toString('utf-8'), fileName);

  const promptInstructions = `You are an elite, highly accurate Resume Parsing and Candidate Profiling AI.
Carefully read and analyze the candidate's resume content extracted from "${fileName}".

CRITICAL INSTRUCTIONS:
1. Objectively identify the candidate's true domain, sector, and highlighted skill set based strictly on what is written in the document.
2. Examples of sectors include:
   - Software Engineering & Computer Science (e.g. Java, C++, Python, Data Structures & Algorithms, OOPs, Web Development, Cloud, DBMS)
   - Artificial Intelligence & Data Science (e.g. Machine Learning, Deep Learning, NLP, Python)
   - Financial Markets & Quantitative Trading (e.g. XAUUSD Gold, Liquidity, Order Blocks, Risk Management)
   - Core Engineering (e.g. Mechanical Engineering, CAD, Embedded Systems, Electrical & Electronics)
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
      const prompt = `${promptInstructions}\n\n=== RESUME TEXT CONTENT ===\n${extractedText.slice(0, 15000)}\n===========================`;
      raw = await callGemini(prompt, 'You are an elite corporate hiring resume analyzer. Output STRICT JSON ONLY.', true);
    } else {
      const base64Data = buffer.toString('base64');
      raw = await callGeminiMultimodal(promptInstructions, mimeType, base64Data, true);
    }

    const parsed = JSON.parse(raw);

    const mergedSkills = Array.isArray(parsed.skills) && parsed.skills.length > 0
      ? parsed.skills
      : localProfile.skills || [];

    return {
      sector: parsed.sector || localProfile.sector,
      targetRole: parsed.targetRole || localProfile.targetRole,
      title: parsed.title || localProfile.title,
      summary: parsed.summary || localProfile.summary,
      skills: mergedSkills,
      experience: Array.isArray(parsed.experience) && parsed.experience.length > 0 ? parsed.experience : (localProfile.experience || []),
      projects: Array.isArray(parsed.projects) && parsed.projects.length > 0 ? parsed.projects : (localProfile.projects || []),
      education: Array.isArray(parsed.education) && parsed.education.length > 0 ? parsed.education : (localProfile.education || []),
      certifications: Array.isArray(parsed.certifications) && parsed.certifications.length > 0 ? parsed.certifications : []
    };
  } catch (err) {
    console.warn('[Gemini Parse Resume] Gemini parse failed, using comprehensive local skill extraction:', err);
    return localProfile;
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
 * Deep question bank generator tailored specifically to the candidate's highlighted skills:
 * Dynamically covers Java, C++, Python, Web Dev, DSA, OOPs, Trading, Mechanical, etc.
 */
export function generateSkillTailoredQuestionBank(
  resume: Partial<ResumeData> | null,
  requestedRole?: string
): ResumeAnalysisResult {
  const resumeText = formatResumeContext(resume);
  const lower = resumeText.toLowerCase();

  const allSkills: string[] = [];
  if (resume?.skills && Array.isArray(resume.skills)) {
    resume.skills.forEach(c => {
      if (Array.isArray(c.list)) allSkills.push(...c.list);
    });
  }

  const hasJava = /\bjava\b(?!\s*script)/i.test(lower) || allSkills.some(s => /\bjava\b(?!\s*script)/i.test(s));
  const hasCpp = /\b(c\+\+|cpp)\b/i.test(lower) || allSkills.some(s => /\b(c\+\+|cpp)\b/i.test(s));
  const hasPython = /\bpython\b/i.test(lower) || allSkills.some(s => /\bpython\b/i.test(s));
  const hasWeb = /react|next\.?js|node\.?js|javascript|typescript|web/i.test(lower) || allSkills.some(s => /react|next|node|javascript|typescript|web/i.test(s));
  const hasTrading = (/xauusd|order block|liquidity pool/i.test(lower)) && !hasJava && !hasCpp && !hasPython && !hasWeb;
  const hasMech = /cad|solidworks|catia|ansys|thermodynamics|mechanical/i.test(lower) && !hasJava && !hasCpp && !hasPython && !hasWeb;

  // Case 1: HIGHLIGHTS BOTH JAVA AND C++
  if (hasJava && hasCpp) {
    return {
      detectedSector: 'Software Engineering & Computer Science',
      detectedTargetRole: requestedRole || 'Software Development Engineer (Java / C++)',
      candidateSummary: 'Candidate with strong foundations in Java, C++, Object-Oriented Programming, Memory Management, and Data Structures.',
      detectedTechStack: ['Java', 'C++', 'Data Structures & Algorithms', 'OOPs (Polymorphism, Inheritance)', 'Memory Management & Pointers', 'STL & Collections', 'Multithreading & Concurrency'],
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

  // Case 2: PRIMARY JAVA
  if (hasJava && !hasCpp) {
    return {
      detectedSector: 'Software Engineering & Computer Science',
      detectedTargetRole: requestedRole || 'Java Software Development Engineer',
      candidateSummary: 'Candidate with deep expertise in Core Java, OOPs, Collections, Multithreading, and Backend Software Engineering.',
      detectedTechStack: ['Java', 'Data Structures & Algorithms', 'OOPs', 'JVM Architecture', 'Collections Framework', 'Multithreading', 'Spring Boot'],
      keyProjects: ['Java Backend & Enterprise Systems'],
      strengths: ['Clean object-oriented design', 'Deep understanding of JVM internals and concurrent programming'],
      recommendedFocus: 'Garbage Collection profiling, microservice architecture, and database query optimization',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] Java Foundations & Key Projects',
            question: 'Welcome! Please introduce yourself, your academic background, and provide a walkthrough of your primary Java projects and architectural design decisions.',
            difficulty: 'Easy',
            topic: 'Java Background',
            expectedKeywords: ['Java', 'OOPs', 'projects']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] OOPs Principles & Interfaces vs Abstract Classes',
            question: 'In Java, what is the architectural difference between an Abstract Class and an Interface? When would you prefer one over the other in a production design?',
            difficulty: 'Easy',
            topic: 'OOPs & Interfaces',
            expectedKeywords: ['abstract class', 'interface', 'default methods', 'multiple inheritance']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] JVM Memory Model: Heap vs Stack',
            question: 'How does the JVM allocate memory between Stack and Heap? What types of data reside in each, and how does Garbage Collection identify eligible objects?',
            difficulty: 'Easy',
            topic: 'JVM Memory Architecture',
            expectedKeywords: ['heap', 'stack', 'garbage collection', 'reference counting', 'roots']
          }
        ],
        hard: [
          {
            id: 'hard_1',
            roundTitle: 'Round 4: [Hard] Java HashMap Collisions & ConcurrentHashMap',
            question: 'Walk me through how Java 8+ HashMap resolves hash collisions. What causes buckets to transition from linked lists to Red-Black trees, and how does ConcurrentHashMap achieve lock striping and CAS updates?',
            difficulty: 'Hard',
            topic: 'HashMap & Concurrency',
            expectedKeywords: ['hash collision', 'red-black tree', 'ConcurrentHashMap', 'CAS']
          },
          {
            id: 'hard_2',
            roundTitle: 'Round 5: [Hard] Java Concurrency: Volatile, Synchronized & Locks',
            question: 'How does the Java Memory Model handle instruction reordering and CPU caching? Contrast volatile, synchronized blocks, and explicit ReentrantLock with condition variables.',
            difficulty: 'Hard',
            topic: 'Java Multithreading',
            expectedKeywords: ['volatile', 'synchronized', 'ReentrantLock', 'memory barrier', 'visibility']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Spring Boot Bean Lifecycle & Transaction Management',
            question: 'In Spring Boot, how does the container manage bean creation, dependency injection, and proxy generation? How does @Transactional handle rollback across nested method calls?',
            difficulty: 'Hard',
            topic: 'Spring Boot Architecture',
            expectedKeywords: ['bean lifecycle', 'proxy', '@Transactional', 'rollback', 'propagation']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] Diagnosing JVM Memory Leaks & Thread Deadlocks',
            question: 'Your Java production service crashes with java.lang.OutOfMemoryError: Java heap space. How do you analyze heap dumps with Eclipse MAT, identify memory leaks in static caches or listeners, and diagnose thread deadlocks?',
            difficulty: 'Tough',
            topic: 'JVM Memory Profiling',
            expectedKeywords: ['OutOfMemoryError', 'heap dump', 'Eclipse MAT', 'jstack', 'deadlock']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] High-Throughput Microservice Architecture',
            question: 'How do you design a Java backend service handling 50,000 requests/second? Address thread pool exhaustion, HikariCP database connection pooling, circuit breaking, and backpressure.',
            difficulty: 'Tough',
            topic: 'High-Throughput Architecture',
            expectedKeywords: ['thread pool', 'HikariCP', 'circuit breaker', 'backpressure', 'reactive']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] Distributed Transactions & Eventual Consistency',
            question: 'In a distributed microservice setup with separate databases, how do you handle transactional consistency? Contrast the Saga pattern (orchestrated vs choreographed) with Two-Phase Commit (2PC).',
            difficulty: 'Tough',
            topic: 'Distributed Transactions',
            expectedKeywords: ['Saga pattern', 'two-phase commit', 'idempotency', 'eventual consistency']
          }
        ]
      }
    };
  }

  // Case 3: PRIMARY C++
  if (hasCpp && !hasJava) {
    return {
      detectedSector: 'Software Engineering & Computer Science',
      detectedTargetRole: requestedRole || 'C++ Software Development Engineer',
      candidateSummary: 'Candidate with strong capabilities in C++, manual memory management, RAII, STL, and low-level system engineering.',
      detectedTechStack: ['C++', 'Data Structures & Algorithms', 'Pointers & Memory Management', 'RAII & Smart Pointers', 'STL Containers', 'Virtual Functions & vtable'],
      keyProjects: ['Low-Level C++ Systems & Problem Solving'],
      strengths: ['Rigorous understanding of manual memory safety, pointer mechanics, and algorithmic efficiency'],
      recommendedFocus: 'Modern C++ move semantics, lock-free concurrency, and profiling with Valgrind',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] C++ Background & Project Walkthrough',
            question: 'Welcome! Please introduce yourself, your academic background, and provide a walkthrough of your key C++ projects and data structure implementations.',
            difficulty: 'Easy',
            topic: 'C++ Background',
            expectedKeywords: ['C++', 'projects', 'data structures']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] Pointers vs References & const Correctness',
            question: 'What is the fundamental difference between pointers and references in C++? Explain pointer arithmetic, nullability, and the importance of const correctness.',
            difficulty: 'Easy',
            topic: 'Pointers & References',
            expectedKeywords: ['pointer', 'reference', 'pointer arithmetic', 'const']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] C++ STL Containers: vector vs list vs unordered_map',
            question: 'How does std::vector manage memory growth under dynamic capacity reallocation? Contrast its memory layout and cache locality with std::list and std::unordered_map.',
            difficulty: 'Easy',
            topic: 'STL Containers',
            expectedKeywords: ['std::vector', 'capacity reallocation', 'cache locality', 'std::list']
          }
        ],
        hard: [
          {
            id: 'hard_1',
            roundTitle: 'Round 4: [Hard] Modern C++ Smart Pointers & RAII',
            question: 'Explain RAII and contrast std::unique_ptr, std::shared_ptr, and std::weak_ptr. Walk through the control block in std::shared_ptr and how std::weak_ptr avoids cyclic memory leaks.',
            difficulty: 'Hard',
            topic: 'Smart Pointers & RAII',
            expectedKeywords: ['RAII', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'control block']
          },
          {
            id: 'hard_2',
            roundTitle: 'Round 5: [Hard] Virtual Functions, vtable & vptr Mechanics',
            question: 'How does dynamic polymorphism work under the hood in C++? Explain the layout of the virtual table (vtable) and virtual pointer (vptr), and what happens when an object is sliced.',
            difficulty: 'Hard',
            topic: 'Virtual Functions & vtable',
            expectedKeywords: ['vtable', 'vptr', 'dynamic dispatch', 'object slicing']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Move Semantics, Rvalue References & Rule of 5',
            question: 'What problem do rvalue references (&&) and std::move solve? Explain the Rule of 5 and how move constructors eliminate deep copy overhead.',
            difficulty: 'Hard',
            topic: 'Move Semantics',
            expectedKeywords: ['rvalue reference', 'std::move', 'Rule of 5', 'move constructor']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] Debugging Segmentation Faults & Memory Corruption',
            question: 'A mission-critical C++ service crashes intermittently with SIGSEGV under peak load. Walk me through how you inspect core dumps with GDB, detect buffer overruns with AddressSanitizer, and profile heap leaks with Valgrind.',
            difficulty: 'Tough',
            topic: 'Memory Corruption Debugging',
            expectedKeywords: ['SIGSEGV', 'GDB', 'AddressSanitizer', 'Valgrind', 'dangling pointer']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] Lock-Free Concurrency & Memory Ordering',
            question: 'How do you design a lock-free queue in C++ using std::atomic? Explain the difference between memory_order_seq_cst, memory_order_acquire, and memory_order_release in preventing hardware reordering.',
            difficulty: 'Tough',
            topic: 'Lock-Free Memory Ordering',
            expectedKeywords: ['std::atomic', 'lock-free', 'acquire-release', 'CAS']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] Cache Locality & Low-Latency Performance',
            question: 'In low-latency systems, how do hardware CPU caches (L1/L2/L3) impact algorithm speed? Contrast Array of Structures (AoS) vs Structure of Arrays (SoA), and explain how false sharing is mitigated with alignas(64).',
            difficulty: 'Tough',
            topic: 'Low-Latency Cache Optimization',
            expectedKeywords: ['cache locality', 'AoS vs SoA', 'false sharing', 'alignas']
          }
        ]
      }
    };
  }

  // Case 4: PYTHON & AI / MACHINE LEARNING
  if (hasPython && !hasJava && !hasCpp) {
    return {
      detectedSector: 'Artificial Intelligence & Data Science',
      detectedTargetRole: requestedRole || 'AI / Machine Learning Engineer',
      candidateSummary: 'Candidate with expertise in Python, Machine Learning, Data Analytics, Model Validation, and Software Engineering.',
      detectedTechStack: ['Python', 'Machine Learning', 'Data Structures', 'Pandas & NumPy', 'Model Evaluation', 'FastAPI'],
      keyProjects: ['Machine Learning & Data Intelligence Models'],
      strengths: ['Analytical rigor', 'Solid understanding of ML pipelines and model evaluation'],
      recommendedFocus: 'Latency reduction in model inference, drift detection, and pipeline scalability',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] Python & ML Background Walkthrough',
            question: 'Welcome! Please introduce yourself, your academic background, and provide a walkthrough of your key Python and Machine Learning projects.',
            difficulty: 'Easy',
            topic: 'Python & ML Background',
            expectedKeywords: ['Python', 'machine learning', 'projects']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] Python Memory Management & GIL',
            question: 'How does Python manage memory using reference counting and cyclic garbage collection? What is the Global Interpreter Lock (GIL) and how does it affect CPU-bound multithreading?',
            difficulty: 'Easy',
            topic: 'Python Internals & GIL',
            expectedKeywords: ['GIL', 'reference counting', 'garbage collection', 'multiprocessing']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] Data Wrangling: Pandas & NumPy Vectorization',
            question: 'Why are vectorized NumPy operations orders of magnitude faster than standard Python loops? How do you handle missing data and feature normalization in Pandas?',
            difficulty: 'Easy',
            topic: 'NumPy & Pandas',
            expectedKeywords: ['vectorization', 'NumPy', 'Pandas', 'broadcasting']
          }
        ],
        hard: [
          {
            id: 'hard_1',
            roundTitle: 'Round 4: [Hard] Python Generators, Decorators & Memory Optimization',
            question: 'Explain how Python generator functions using yield optimize memory consumption when processing large datasets. Walk through how custom decorators with functools.wraps work internally.',
            difficulty: 'Hard',
            topic: 'Generators & Decorators',
            expectedKeywords: ['yield', 'generator', 'decorator', 'functools.wraps']
          },
          {
            id: 'hard_2',
            roundTitle: 'Round 5: [Hard] Model Evaluation Metrics & Bias-Variance Trade-off',
            question: 'When evaluating an imbalanced classification model, why is accuracy misleading? Contrast Precision, Recall, F1-Score, and ROC-AUC, and explain the bias-variance trade-off.',
            difficulty: 'Hard',
            topic: 'Evaluation Metrics',
            expectedKeywords: ['Precision', 'Recall', 'F1-Score', 'ROC-AUC', 'bias-variance']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Mitigating Overfitting: Regularization & Cross-Validation',
            question: 'How do L1 (Lasso) and L2 (Ridge) regularization mathematically prevent model overfitting? How does K-Fold cross-validation ensure generalization to unseen data?',
            difficulty: 'Hard',
            topic: 'Regularization & Overfitting',
            expectedKeywords: ['L1 regularization', 'L2 regularization', 'cross-validation', 'overfitting']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] Low-Latency Model Inference Deployment',
            question: 'How do you architect a production model serving microservice using FastAPI, Redis caching, and batching to maintain sub-50ms inference latency under high concurrency?',
            difficulty: 'Tough',
            topic: 'Production ML Deployment',
            expectedKeywords: ['FastAPI', 'inference latency', 'batching', 'ONNX', 'caching']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] Production Model Drift & Data Drift Detection',
            question: 'Once an ML model is deployed in production, performance often degrades over time. How do you build automated monitoring to detect Data Drift and Concept Drift using statistical tests?',
            difficulty: 'Tough',
            topic: 'Model Drift Detection',
            expectedKeywords: ['data drift', 'concept drift', 'monitoring', 'KS test', 'retraining']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] Production Crisis: Anomaly Outage Response',
            question: 'A deployed predictive model starts outputting severely biased or anomalous predictions during peak operational hours. Walk through your emergency rollback, traffic shadow testing, and root-cause analysis.',
            difficulty: 'Tough',
            topic: 'Crisis Response in AI Systems',
            expectedKeywords: ['rollback', 'shadow testing', 'anomaly detection', 'root cause']
          }
        ]
      }
    };
  }

  // Case 5: FINANCIAL MARKETS & TRADING
  if (hasTrading) {
    return {
      detectedSector: 'Financial Markets & Quantitative Trading',
      detectedTargetRole: requestedRole || 'Market Analyst / Quantitative Trader',
      candidateSummary: 'Self-driven Market Analyst with hands-on experience in institutional trading concepts, liquidity, order blocks, and risk management.',
      detectedTechStack: ['Liquidity Identification', 'Order Block Validation', 'False Breakout Recognition', '1:2 RRR', 'Market Structure Analysis', 'Macro Volatility'],
      keyProjects: ['Liquidity-Based Trading Model (XAUUSD)', 'Market Analysis & Trap Detection Strategy'],
      strengths: ['Deep institutional price action understanding', 'Strict risk management and drawdown discipline'],
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

  // Case 6: GENERAL SOFTWARE & WEB ENGINEERING (DEFAULT)
  return {
    detectedSector: 'Software Engineering & Computer Science',
    detectedTargetRole: requestedRole || 'Software Development Engineer',
    candidateSummary: 'Candidate with solid engineering foundations, problem-solving skills, and software development capabilities.',
    detectedTechStack: allSkills.length > 0 ? allSkills.slice(0, 6) : ['Data Structures & Algorithms', 'System Architecture', 'Object-Oriented Design', 'SQL & Databases', 'Problem Solving'],
    keyProjects: ['Core Software Engineering Project'],
    strengths: ['Analytical foundations', 'Methodical approach to software design and testing'],
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

/**
 * Analyze candidate's entire resume with Gemini and generate 3 sets of questions (Easy, Hard, Tough)
 * Deeply grounds questions in the candidate's exact highlighted skills!
 */
export async function analyzeResumeWithGemini(
  resume: Partial<ResumeData> | null,
  targetRole?: string
): Promise<ResumeAnalysisResult> {
  const localAnalysis = generateSkillTailoredQuestionBank(resume, targetRole);
  const resumeText = formatResumeContext(resume);

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
3. Divide into 3 distinct difficulty categories: Easy, Hard, and Tough.

Output STRICT JSON ONLY matching the requested schema.`;

  const prompt = `Analyze this candidate's resume completely and determine their exact sector, target placement role, and generate tailored questions based strictly on their highlighted skills:

=== CANDIDATE RESUME ===
${resumeText}
========================

Requirements:
- Detect the candidate's true sector and target role from their resume.
- Generate 3 Easy, 3 Hard, and 3 Tough questions tailored strictly to their highlighted skills and resume details.

Respond in this EXACT JSON structure:
{
  "detectedSector": "${localAnalysis.detectedSector}",
  "detectedTargetRole": "${localAnalysis.detectedTargetRole}",
  "candidateSummary": "${localAnalysis.candidateSummary}",
  "detectedTechStack": ${JSON.stringify(localAnalysis.detectedTechStack)},
  "keyProjects": ${JSON.stringify(localAnalysis.keyProjects)},
  "strengths": ${JSON.stringify(localAnalysis.strengths)},
  "recommendedFocus": "${localAnalysis.recommendedFocus}",
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
    console.warn('[Gemini Interview] Gemini API call did not complete, using rich skill-tailored analysis:', err);
    return localAnalysis;
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
  const { difficulty, roundIndex, targetRole, candidateAnswer, previousQuestion, transcriptHistory, candidateName, timeRemainingSeconds } = req;
  const resumeText = formatResumeContext(req.resume);
  const questionBank = generateSkillTailoredQuestionBank(req.resume, targetRole);

  const hasPreviousAnswer = candidateAnswer && candidateAnswer.trim().length > 0 && candidateAnswer.trim() !== 'No response provided.';

  const isFinance = questionBank.detectedSector.includes('Financial');
  const isSoftware = questionBank.detectedSector.includes('Software') || questionBank.detectedSector.includes('Computer');

  const interviewerRole = isSoftware
    ? 'Senior Principal Software Engineer & Technical Interview Lead'
    : isFinance
    ? 'Senior Head of Trading Strategy & Portfolio Risk at a Global Institutional Proprietary Trading Desk'
    : `Senior Corporate Technical Hiring Lead in ${targetRole || 'Engineering'}`;

  const displayName = candidateName || 'there';
  const primarySkillsSummary = questionBank.detectedTechStack.slice(0, 4).join(', ');

  const systemInstruction = `You are a real-time AI Technical & Domain Interviewer conducting a realistic 15-minute live interview.
Your Persona: ${interviewerRole}.
You speak clearly, warmly, professionally, and inquisitively.
You listen to the candidate's exact reply and ask follow-up questions directly grounded in what they just said and what is on their resume.

CRITICAL INSTRUCTIONS:
1. DYNAMIC SKILL & DOMAIN ADAPTATION:
   - Candidate Highlighted Skills: ${primarySkillsSummary}.
   - You MUST tailor your questions and evaluations directly to these highlighted skills!
   - If candidate highlighted Java & C++: Ask deep questions on memory management, JVM vs Native execution, pointers, RAII, smart pointers, HashMap collisions, multithreading, and low-level debugging!
   - If candidate highlighted Trading: Focus on market analysis, order blocks, liquidity, and 1:2 RRR.
   - If candidate highlighted another domain: Focus on their specific domain principles.
2. NATURAL INTERVIEW FLOW (15-Minute Session):
   - Turn 1 (Opening): Warm professional greeting. Address candidate by name (${displayName}), welcome them for the role of ${targetRole || questionBank.detectedTargetRole}, and ask them to introduce themselves, tell about their background, and walk through how they have utilized their highlighted skills (${primarySkillsSummary}) in their projects.
   - Subsequent Turns:
     * Acknowledge what the candidate actually replied with a realistic 1-2 sentence spoken reaction.
     * Evaluate their Technical/Domain Mark (0-100) and Communication Fluency Mark (0-100).
     * Ask a follow-up question that builds directly on what they stated, probing deeper into their logic, code implementation, memory management, edge cases, or crisis scenarios.
3. Keep the interview questions conversational, engaging, and suitable for Text-to-Speech synthesis.

Output STRICT JSON ONLY.`;

  const prompt = `LIVE 15-MINUTE INTERVIEW CONTEXT:
Candidate: ${displayName}
Target Role: ${targetRole || questionBank.detectedTargetRole}
Question Number: ${roundIndex + 1}
Difficulty Tier: ${difficulty}
Candidate Highlighted Skills: ${primarySkillsSummary}
${timeRemainingSeconds ? `Time Remaining in 15-Min Interview: ${Math.floor(timeRemainingSeconds / 60)}m ${timeRemainingSeconds % 60}s` : ''}

=== CANDIDATE RESUME ===
${resumeText}
========================

${
  roundIndex === 0 || !hasPreviousAnswer
    ? `This is the opening question of the 15-minute interview.
Start with a warm professional greeting: "Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || questionBank.detectedTargetRole}. I have reviewed your resume and noted your focus on ${primarySkillsSummary}. To start off, please introduce yourself, tell me about your background, and walk me through how you have applied ${primarySkillsSummary} in your key projects."`
    : `=== PREVIOUS QUESTION ASKED ===
"${previousQuestion}"

=== CANDIDATE'S ACTUAL SPOKEN/TYPED REPLY ===
"${candidateAnswer}"

Critically evaluate this reply:
1. Technical/Domain correctness & depth (0-100 mark)
2. Spoken communication & clarity (0-100 mark)
3. Constructive feedback notes
4. Spoken interviewer reaction acknowledging their specific points
5. The NEXT interview question: Must probe deeper based on what they just explained and their highlighted skills (${primarySkillsSummary})!`
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
    console.warn('[Gemini Interview] Interactive round API call fallback to skill-tailored question bank:', err);

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
      reaction = `Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || questionBank.detectedTargetRole}.`;
    }

    const openingQuestion = `Hi ${displayName}! Welcome to your technical interview for the position of ${targetRole || questionBank.detectedTargetRole}. I have reviewed your resume and noted your focus on ${primarySkillsSummary}. To start off, please introduce yourself, tell me about your background, and walk me through how you have applied ${primarySkillsSummary} in your key projects.`;

    const tierQuestions = questionBank.questions[difficulty.toLowerCase() as 'easy' | 'hard' | 'tough'] || questionBank.questions.easy;
    const selectedFallback = tierQuestions[Math.min(roundIndex, tierQuestions.length - 1)] || tierQuestions[0];

    const nextQ = (roundIndex === 0 && !hasPreviousAnswer) ? openingQuestion : selectedFallback.question;
    const roundTitle = (roundIndex === 0 && !hasPreviousAnswer)
      ? `Question 1: [${difficulty}] Introduction & Candidate Background`
      : `Question ${roundIndex + 1}: [${difficulty}] ${selectedFallback.topic || 'Technical Evaluation'}`;

    return {
      interviewerReaction: reaction,
      feedback: hasPreviousAnswer
        ? 'Demonstrated understanding of core principles. Continue to articulate concrete implementation details and real-world execution rules.'
        : 'Starting interview session.',
      technicalMark: techMark,
      communicationMark: commMark,
      score: Math.round((techMark * 0.6) + (commMark * 0.4)),
      nextQuestion: nextQ,
      roundTitle,
      difficulty,
      tips: `Focus on clear logical articulation, code structure, and real-world execution rules.`
    };
  }
}

