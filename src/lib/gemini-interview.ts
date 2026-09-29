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
 * Format resume into a clean, comprehensive text digest for Gemini prompt context
 */
export function formatResumeContext(resume: Partial<ResumeData> | null | undefined): string {
  if (!resume) {
    return 'Candidate has a standard Computer Science & Engineering background with core Data Structures, Web Development, and SQL competencies.';
  }

  const sections: string[] = [];

  if (resume.title || resume.summary) {
    sections.push(`Summary: ${resume.summary || resume.title || 'Technical Candidate'}`);
  }

  if (resume.skills && Array.isArray(resume.skills)) {
    const skillsText = resume.skills
      .map((s) => `${s.category}: ${(s.list || []).join(', ')}`)
      .join(' | ');
    if (skillsText) sections.push(`Skills: ${skillsText}`);
  }

  if (resume.projects && Array.isArray(resume.projects) && resume.projects.length > 0) {
    const projectsText = resume.projects
      .map((p) => `• Project "${p.title}" (Tech: ${p.tech}): ${(p.points || []).join('; ')}`)
      .join('\n');
    sections.push(`Academic & Portfolio Projects:\n${projectsText}`);
  }

  if (resume.experience && Array.isArray(resume.experience) && resume.experience.length > 0) {
    const expText = resume.experience
      .map((e) => `• ${e.role} at ${e.company} (${e.period}): ${(e.points || []).join('; ')}`)
      .join('\n');
    sections.push(`Experience / Internships:\n${expText}`);
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
 */
export async function analyzeResumeWithGemini(
  resume: Partial<ResumeData> | null,
  targetRole: string
): Promise<ResumeAnalysisResult> {
  const resumeText = formatResumeContext(resume);

  const systemInstruction = `You are a Principal Engineering Director & Senior Corporate Technical Interviewer at a premier technology company.
Your role is to meticulously analyze the candidate's uploaded resume and generate realistic, highly personalized interview questions divided into 3 distinct difficulty categories: Easy, Hard, and Tough.

Requirements for each tier:
- Easy: Foundational knowledge, candidate background, and high-level architecture/logic of the specific projects listed on their resume.
- Hard: In-depth technical implementation, complex algorithmic logic, state management, database query optimization, and tricky edge-cases related to their exact technologies.
- Tough: High-scale system design, concurrency/race conditions, distributed caching, failover recovery, architectural trade-offs, and critical high-pressure engineering decisions based on their domain.

Output STRICT JSON ONLY matching the requested schema.`;

  const prompt = `Analyze this candidate's resume for the target placement role of "${targetRole || 'Software Development Engineer'}":

=== CANDIDATE RESUME ===
${resumeText}
========================

Generate a complete analysis and a structured question bank separated into 3 Easy, 3 Hard, and 3 Tough questions. Each question MUST directly reference or connect with the candidate's actual projects, skills, or experience from their resume.

Respond in this EXACT JSON structure:
{
  "candidateSummary": "2-3 sentence executive assessment of the candidate's strengths and tech stack",
  "detectedTechStack": ["React", "TypeScript", "Node.js", "PostgreSQL"],
  "keyProjects": ["Project Name 1", "Project Name 2"],
  "strengths": ["Strong full-stack architecture", "Good database fundamentals"],
  "recommendedFocus": "Focus on distributed system scalability and concurrency trade-offs",
  "questions": {
    "easy": [
      {
        "id": "easy_1",
        "roundTitle": "Round 1: [Easy] Candidate Background & Resume Project Overview",
        "question": "Clear, professional question inviting them to explain their background and primary resume project architecture",
        "difficulty": "Easy",
        "topic": "Background & Architecture",
        "expectedKeywords": ["project overview", "architecture", "framework"]
      },
      {
        "id": "easy_2",
        "roundTitle": "Round 2: [Easy] Core Language Fundamentals & Tech Stack",
        "question": "Question on fundamental concepts of their primary language/framework (e.g. event loop, memory, OOP, promises)",
        "difficulty": "Easy",
        "topic": "Core Fundamentals",
        "expectedKeywords": ["concept", "memory", "lifecycle"]
      },
      {
        "id": "easy_3",
        "roundTitle": "Round 3: [Easy] Database & API Basic Flow",
        "question": "Question asking how their resume project connects front-end to database, REST/HTTP status codes, and schema design",
        "difficulty": "Easy",
        "topic": "API & Database Flow",
        "expectedKeywords": ["REST", "schema", "CRUD"]
      }
    ],
    "hard": [
      {
        "id": "hard_1",
        "roundTitle": "Round 4: [Hard] Algorithmic Logic & Edge Cases",
        "question": "Challenging question requiring efficient time/space complexity, data structures (Trees/Graphs/Hashmaps/DP) or tricky logic relevant to their domain",
        "difficulty": "Hard",
        "topic": "DSA & Time Complexity",
        "expectedKeywords": ["O(N)", "time complexity", "optimization", "data structure"]
      },
      {
        "id": "hard_2",
        "roundTitle": "Round 5: [Hard] In-Depth Project Implementation & Debugging",
        "question": "Deep dive into a specific feature of their listed resume projects (e.g., authentication, async queues, state sync, or caching) and how they handle failure",
        "difficulty": "Hard",
        "topic": "Feature Deep Dive",
        "expectedKeywords": ["implementation", "concurrency", "error handling"]
      },
      {
        "id": "hard_3",
        "roundTitle": "Round 6: [Hard] Database Performance & Query Optimization",
        "question": "Specific question on indexing, query bottlenecks, N+1 query problems, transactions, or ACID guarantees in their tech stack",
        "difficulty": "Hard",
        "topic": "Database Optimization",
        "expectedKeywords": ["index", "execution plan", "transaction", "isolation"]
      }
    ],
    "tough": [
      {
        "id": "tough_1",
        "roundTitle": "Round 7: [Tough] High-Scale System Design & Distributed Architecture",
        "question": "Rigorous system design scenario tailored to scale their resume project to 500,000 concurrent users (caching, load balancing, sharding, message queues)",
        "difficulty": "Tough",
        "topic": "High-Scale System Architecture",
        "expectedKeywords": ["Redis", "horizontal scaling", "load balancer", "Kafka", "sharding"]
      },
      {
        "id": "tough_2",
        "roundTitle": "Round 8: [Tough] Concurrency, Race Conditions & Failure Recovery",
        "question": "Tough technical question on distributed race conditions, cache stampede / thundering herd, idempotency, or split-brain recovery",
        "difficulty": "Tough",
        "topic": "Concurrency & Resilience",
        "expectedKeywords": ["idempotency", "distributed locks", "cache stampede", "circuit breaker"]
      },
      {
        "id": "tough_3",
        "roundTitle": "Round 9: [Tough] High-Pressure Architectural Trade-offs & Production Incidents",
        "question": "A production crisis scenario where latency spikes 10x or database connection pool exhausts. How do you triage under pressure, root cause, and re-architect?",
        "difficulty": "Tough",
        "topic": "Crisis Triage & Trade-offs",
        "expectedKeywords": ["root cause analysis", "profiling", "connection pooling", "trade-offs"]
      }
    ]
  }
}`;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction, true);
    // Parse json
    const parsed = JSON.parse(rawResponse);
    return parsed;
  } catch (err) {
    console.error('[Gemini Interview] Error analyzing resume, falling back to intelligent template:', err);
    // Safe intelligent fallback derived from resume data
    const skillsList = resume?.skills?.flatMap((s) => s.list) || ['Python', 'Data Structures', 'React', 'SQL'];
    const projectTitle = resume?.projects?.[0]?.title || 'Campus Web Application';

    return {
      candidateSummary: `Candidate with background in ${resume?.education?.[0]?.degree || 'Computer Science'}, presenting hands-on project experience in ${projectTitle} and core skills in ${skillsList.slice(0, 4).join(', ')}.`,
      detectedTechStack: skillsList.slice(0, 6),
      keyProjects: resume?.projects?.map((p) => p.title) || [projectTitle],
      strengths: ['Solid foundation in core computer science', 'Practical project implementation'],
      recommendedFocus: 'Practice scaling architecture trade-offs and time complexity analysis.',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] Resume Project Walkthrough & Background',
            question: `Welcome! Please introduce yourself, your academic journey, and provide a walkthrough of your project "${projectTitle}". What motivated you to build it and what core technologies did you use?`,
            difficulty: 'Easy',
            topic: 'Background & Project',
            expectedKeywords: ['project', 'technologies', 'architecture']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] Core Language & Stack Fundamentals',
            question: `In your resume, you highlighted ${skillsList[0] || 'Python/JavaScript'}. Can you explain how memory management and execution context work in it, and how it differs from other paradigms?`,
            difficulty: 'Easy',
            topic: 'Language Fundamentals',
            expectedKeywords: ['memory', 'execution', 'paradigm']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] Database & API Design',
            question: `How did you structure the database tables and REST endpoints in ${projectTitle}? What criteria did you use to choose your database engine?`,
            difficulty: 'Easy',
            topic: 'API & Data',
            expectedKeywords: ['database', 'endpoints', 'schema']
          }
        ],
        hard: [
          {
            id: 'hard_1',
            roundTitle: 'Round 4: [Hard] Algorithmic Optimization & Complexity',
            question: `Let's discuss algorithmic efficiency. Suppose you need to process large sets of records in ${projectTitle}. How would you detect cycles or find top elements in O(N log K) time, and how do you evaluate space-time trade-offs?`,
            difficulty: 'Hard',
            topic: 'Algorithms & Complexity',
            expectedKeywords: ['O(N log K)', 'heap', 'space complexity']
          },
          {
            id: 'hard_2',
            roundTitle: 'Round 5: [Hard] Deep Feature Implementation & Debugging',
            question: `Walk me through the most technically complex module of "${projectTitle}". What was an unexpected edge case or critical bug you encountered, and how did you diagnose and resolve it?`,
            difficulty: 'Hard',
            topic: 'Implementation & Debugging',
            expectedKeywords: ['debugging', 'edge case', 'root cause']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Database Indexing & Transaction Integrity',
            question: `Explain how indexing works under the hood (B-Trees / Hash indexes) in SQL. If two users simultaneously update the same entity in your project, how do you prevent dirty reads and lost updates?`,
            difficulty: 'Hard',
            topic: 'Database & Concurrency',
            expectedKeywords: ['B-Tree', 'ACID', 'isolation levels', 'locking']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] High-Scale System Design (500K Users)',
            question: `Imagine your project "${projectTitle}" is deployed enterprise-wide with 500,000 active students concurrently refreshing pages. Design the end-to-end architecture with CDNs, load balancers, caching layers, and database replicas to guarantee sub-100ms response times.`,
            difficulty: 'Tough',
            topic: 'Enterprise Scalability',
            expectedKeywords: ['load balancer', 'Redis', 'read replicas', 'caching']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] Cache Stampede, Idempotency & Queues',
            question: `In a high-throughput notification system, what happens when a popular cache key expires during peak traffic (cache stampede)? How do you prevent database collapse using mutex locks or probabilistic early expiration?`,
            difficulty: 'Tough',
            topic: 'System Resilience',
            expectedKeywords: ['cache stampede', 'mutex', 'message queue']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] Production Outage Triage & Critical Trade-offs',
            question: `Your production service goes down with 100% CPU utilization and database connection timeouts during a critical campus drive. Walk me through your real-time incident triage: what metrics do you inspect first, and what emergency mitigation steps do you take?`,
            difficulty: 'Tough',
            topic: 'Incident Triage',
            expectedKeywords: ['connection pool', 'CPU profiling', 'circuit breaker']
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
  totalRounds: number;
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
 * Evaluates candidate's previous answer dynamically, provides immediate speech feedback,
 * and formulates the NEXT question based on what the candidate just answered and the target difficulty!
 */
export async function processInteractiveRound(
  req: InteractiveRoundRequest
): Promise<InteractiveRoundResponse> {
  const resumeText = formatResumeContext(req.resume);
  const { difficulty, roundIndex, totalRounds, targetRole, candidateAnswer, previousQuestion, transcriptHistory } = req;

  const hasPreviousAnswer = candidateAnswer && candidateAnswer.trim().length > 0 && candidateAnswer.trim() !== 'No response provided.';

  const systemInstruction = `You are a real-time AI Technical Interviewer conducting a live, voice-interactive corporate interview.
You speak clearly, professionally, and encouragingly yet rigorously.
You adapt to the candidate's answers dynamically.

YOUR GOALS:
1. If the candidate answered a previous question:
   - Provide a natural, spoken interviewer response (1-2 sentences) acknowledging their points and constructively pointing out strengths or gaps.
   - Evaluate their Technical Depth (0-100 mark) and Communication Fluency (0-100 mark).
   - Formulate constructive feedback.
2. Ask the NEXT interview question:
   - MUST be tailored to the candidate's uploaded resume (projects, skills, education) and the target placement role (${targetRole}).
   - MUST strictly adhere to the requested difficulty tier: "${difficulty}".
     * Easy: Foundational concepts & resume project architecture walkthrough.
     * Hard: In-depth code logic, algorithms, edge-cases, error handling, performance optimization of their stack.
     * Tough: High-scale system design, concurrency, race conditions, distributed trade-offs, and critical incident scenarios.
   - Formulate the question in a natural conversational tone so that it sounds engaging when read aloud via Speech Synthesis.

Output STRICT JSON ONLY.`;

  const prompt = `LIVE INTERVIEW CONTEXT:
Target Placement Role: ${targetRole || 'Software Development Engineer'}
Current Round: Round ${roundIndex + 1} of ${totalRounds}
Difficulty Tier: ${difficulty}

=== CANDIDATE RESUME ===
${resumeText}
========================

${
  hasPreviousAnswer
    ? `=== PREVIOUS QUESTION ASKED ===
"${previousQuestion}"

=== CANDIDATE'S SPOKEN/TYPED ANSWER ===
"${candidateAnswer}"

Evaluate this answer carefully based on technical correctness, conceptual depth, and communication fluency.`
    : `This is the opening question for the interview or round.`
}

${
  transcriptHistory && transcriptHistory.length > 0
    ? `=== INTERVIEW HISTORY SO FAR ===\n` +
      transcriptHistory
        .map(
          (t) =>
            `Round ${t.round} [${t.difficulty || 'Normal'}]: Q: "${t.question}" -> Candidate: "${t.studentAnswer}" (Tech: ${t.technicalMark || 75}%, Comm: ${t.communicationMark || 75}%)`
        )
        .join('\n')
    : ''
}

Generate the response in this EXACT JSON structure:
{
  "interviewerReaction": "Spoken reaction to candidate's answer (1-2 sentences). If first round, a brief warm professional welcome.",
  "feedback": "Concise bullet-point evaluation of their technical points and communication delivery.",
  "technicalMark": 85,
  "communicationMark": 88,
  "nextQuestion": "The next conversational interview question tailored to their resume and difficulty tier (${difficulty}).",
  "roundTitle": "Round ${roundIndex + 1}: [${difficulty}] Descriptive Round Subtitle",
  "difficulty": "${difficulty}",
  "tips": "Quick 1-sentence tip on what interviewers look for in this question."
}`;

  try {
    const rawResponse = await callGemini(prompt, systemInstruction, true);
    const parsed: InteractiveRoundResponse = JSON.parse(rawResponse);
    parsed.score = Math.round(((parsed.technicalMark || 75) * 0.6) + ((parsed.communicationMark || 75) * 0.4));
    parsed.difficulty = difficulty;
    return parsed;
  } catch (err) {
    console.error('[Gemini Interview] Error in interactive round, generating intelligent fallback:', err);
    
    // Heuristic evaluation if network or rate limit occurred
    let techMark = 75;
    let commMark = 75;
    let reaction = 'Thank you for your response.';

    if (hasPreviousAnswer) {
      const words = candidateAnswer.trim().split(/\s+/).length;
      if (words > 40) {
        techMark = 85;
        commMark = 88;
        reaction = 'Good detailed explanation with clear technical structure.';
      } else if (words > 15) {
        techMark = 78;
        commMark = 75;
        reaction = 'Understood your core idea. Let us explore deeper in the next question.';
      } else {
        techMark = 60;
        commMark = 65;
        reaction = 'Try to elaborate further with specific code architecture and trade-off details.';
      }
    } else {
      reaction = `Welcome to your AI Voice Mock Interview for the position of ${targetRole}. Let us begin with your resume background.`;
    }

    const fallbackQuestions: Record<string, string> = {
      Easy: `Based on your resume, can you explain the architectural flow of your primary project, and how you structured the communication between the front-end and backend?`,
      Hard: `In your listed tech stack, how would you optimize database queries and handle concurrency when multiple operations occur simultaneously?`,
      Tough: `If your resume application experiences a 100x traffic surge causing high database latency and connection timeouts, walk me through your end-to-end diagnosis and scaling architecture.`
    };

    return {
      interviewerReaction: reaction,
      feedback: hasPreviousAnswer
        ? 'Demonstrated understanding of core software principles. Continue to articulate concrete time/space complexity and real-world system trade-offs.'
        : 'Starting interview session.',
      technicalMark: techMark,
      communicationMark: commMark,
      score: Math.round((techMark * 0.6) + (commMark * 0.4)),
      nextQuestion: fallbackQuestions[difficulty] || fallbackQuestions.Easy,
      roundTitle: `Round ${roundIndex + 1}: [${difficulty}] Technical Evaluation`,
      difficulty,
      tips: `Focus on clear logical articulation, step-by-step problem breakdown, and engineering trade-offs.`
    };
  }
}
