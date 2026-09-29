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
 * Parse an uploaded resume file (PDF or image) with Gemini Multimodal AI
 */
export async function parseUploadedResumeWithGemini(
  buffer: Buffer,
  mimeType: string,
  fileName: string = 'resume.pdf'
): Promise<Partial<ResumeData>> {
  const base64Data = buffer.toString('base64');

  const prompt = `You are an elite, highly accurate Resume Parsing and Candidate Profiling AI.
Carefully read and analyze the attached document ("${fileName}").

CRITICAL INSTRUCTIONS:
1. DO NOT DEFAULT TO IT OR SOFTWARE ENGINEERING!
2. Identify the candidate's exact sector and domain. For example:
   - Financial Markets / Quantitative Trading / Forex / Commodities
   - Artificial Intelligence & Data Science
   - Mechanical Engineering / Core Manufacturing
   - Healthcare / Pharmaceuticals
   - Operations / Marketing / Sales / HR
3. Extract the exact candidate information, real skills, actual work experience, research/projects, and education.

Output STRICT JSON ONLY matching this structure:
{
  "sector": "Identified Sector (e.g. Financial Markets & Quantitative Trading)",
  "targetRole": "Identified Target Role (e.g. Market Analyst / Quantitative Trader)",
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
    const raw = await callGeminiMultimodal(prompt, mimeType, base64Data, true);
    const parsed = JSON.parse(raw);
    return {
      sector: parsed.sector || 'Financial Markets & Quantitative Trading',
      targetRole: parsed.targetRole || 'Market Analyst / Quantitative Trader',
      title: parsed.title || `${parsed.targetRole || 'Candidate'} Resume`,
      summary: parsed.summary || '',
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      certifications: Array.isArray(parsed.certifications) ? parsed.certifications : []
    };
  } catch (err) {
    console.error('Failed to parse resume with Gemini multimodal, falling back:', err);
    return {};
  }
}

/**
 * Format resume into a clean, comprehensive text digest for Gemini prompt context
 */
export function formatResumeContext(resume: Partial<ResumeData> | null | undefined): string {
  if (!resume) {
    return 'Candidate has an analytical background in Artificial Intelligence & Data Science with hands-on focus in Financial Markets, XAUUSD (Gold) Price Action, and Quantitative Trading Models.';
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

  const systemInstruction = `You are an elite, senior corporate hiring manager and technical domain interviewer representing top global institutions in the candidate's specific sector.

CRITICAL MANDATORY INSTRUCTIONS:
1. DO NOT DEFAULT TO IT OR SOFTWARE ENGINEERING!
2. Detect the candidate's true sector and domain from their resume.
   - If the candidate's resume is in Market Analysis, Trading, Forex, Commodities (e.g. XAUUSD Gold), Order Blocks, Liquidity, or Financial Markets, the interviewer MUST act as a Senior Portfolio Manager / Head of Trading & Risk at an institutional proprietary trading firm. All questions MUST be deeply grounded in market analysis, institutional concepts (order blocks, liquidity pools, false breakouts), risk management (1:2 RRR, drawdowns), macro events (CPI, NFP, FOMC), and session dynamics (London, New York, Asian)!
   - If the resume is in Artificial Intelligence / Data Science, tailor to machine learning, model validation, and analytical strategy.
   - If the resume is in another sector, tailor 100% to that exact sector.
3. Generate realistic, highly personalized interview questions divided into 3 distinct difficulty categories: Easy, Hard, and Tough:
   - Easy: Foundational domain knowledge, candidate background, and high-level strategy/project overview from their resume.
   - Hard: In-depth technical/analytical execution, risk calculations, edge-case market traps, statistical expectancy, and strategy optimization.
   - Tough: High-stakes crisis management, black-swan market volatility, drawdown recovery, capital preservation, and institutional trade-offs under extreme pressure.

Output STRICT JSON ONLY matching the requested schema.`;

  const prompt = `Analyze this candidate's resume completely and determine their exact sector, target placement role, and generate tailored questions:

=== CANDIDATE RESUME ===
${resumeText}
========================

Requirements:
- Detect the candidate's true sector and target role from their resume (e.g. "Financial Markets & Trading", "Market Analyst / Quantitative Trader").
- Generate 3 Easy, 3 Hard, and 3 Tough questions tailored strictly to their domain and resume details.

Respond in this EXACT JSON structure:
{
  "detectedSector": "e.g. Financial Markets & Trading",
  "detectedTargetRole": "e.g. Market Analyst / Quantitative Trader",
  "candidateSummary": "2-3 sentence executive assessment of the candidate's background, sector, and core methodologies",
  "detectedTechStack": ["Liquidity Identification", "Order Block Validation", "False Breakout Recognition", "1:2 RRR", "XAUUSD Gold", "Macro Events (CPI/NFP/FOMC)"],
  "keyProjects": ["Liquidity-Based Trading Model", "Market Analysis & Trap Detection"],
  "strengths": ["Deep institutional price action understanding", "Strict risk management and drawdown discipline"],
  "recommendedFocus": "Advanced macro integration and algorithmic backtesting validation",
  "questions": {
    "easy": [
      {
        "id": "easy_1",
        "roundTitle": "Round 1: [Easy] Candidate Background & Core Strategy Overview",
        "question": "Question inviting them to explain their background in their sector and summarize their primary strategy or project from their resume",
        "difficulty": "Easy",
        "topic": "Background & Strategy",
        "expectedKeywords": ["methodology", "structure", "strategy"]
      },
      {
        "id": "easy_2",
        "roundTitle": "Round 2: [Easy] Core Concepts & Market Dynamics",
        "question": "Question testing fundamental concepts of their domain (e.g. order blocks vs support/resistance, session liquidity footprints)",
        "difficulty": "Easy",
        "topic": "Domain Fundamentals",
        "expectedKeywords": ["liquidity", "order block", "market structure"]
      },
      {
        "id": "easy_3",
        "roundTitle": "Round 3: [Easy] Session Behavior & Setup Criteria",
        "question": "Question asking about session-based volatility (Asian, London, NY) or entry confirmation rules",
        "difficulty": "Easy",
        "topic": "Execution Criteria",
        "expectedKeywords": ["session", "volatility", "confirmation"]
      }
    ],
    "hard": [
      {
        "id": "hard_1",
        "roundTitle": "Round 4: [Hard] False Breakouts & Institutional Trap Recognition",
        "question": "Challenging technical question on how to structurally differentiate a false breakout/liquidity sweep from genuine continuation",
        "difficulty": "Hard",
        "topic": "Trap Recognition",
        "expectedKeywords": ["liquidity sweep", "false breakout", "confirmation"]
      },
      {
        "id": "hard_2",
        "roundTitle": "Round 5: [Hard] Macroeconomic Catalysts & News Volatility",
        "question": "Deep dive into how high-impact macro releases (CPI, NFP, FOMC) impact their asset volatility and risk rules",
        "difficulty": "Hard",
        "topic": "Macroeconomic Impact",
        "expectedKeywords": ["CPI", "NFP", "FOMC", "slippage"]
      },
      {
        "id": "hard_3",
        "roundTitle": "Round 6: [Hard] Risk Management & Expectancy (1:2 RRR)",
        "question": "Question on mathematical position sizing, maintaining 1:2 RRR, and controlled drawdown management",
        "difficulty": "Hard",
        "topic": "Risk & Drawdown Control",
        "expectedKeywords": ["1:2 RRR", "drawdown", "expectancy"]
      }
    ],
    "tough": [
      {
        "id": "tough_1",
        "roundTitle": "Round 7: [Tough] Black Swan Flash Crash & Liquidity Evaporation",
        "question": "High-stakes crisis scenario: Extreme volatility or flash crash causes liquidity to evaporate and order blocks to fail. How do you triage capital preservation and emergency hedging under pressure?",
        "difficulty": "Tough",
        "topic": "Crisis & Capital Preservation",
        "expectedKeywords": ["capital preservation", "drawdown", "liquidity void"]
      },
      {
        "id": "tough_2",
        "roundTitle": "Round 8: [Tough] Algorithmic Quantitative Modeling & ML Integration",
        "question": "Given their AI & Data Science background, how would they architect a quantitative/algorithmic pipeline to systematically detect and validate setups without overfitting?",
        "difficulty": "Tough",
        "topic": "Quantitative & ML Synthesis",
        "expectedKeywords": ["quantitative", "backtesting", "overfitting"]
      },
      {
        "id": "tough_3",
        "roundTitle": "Round 9: [Tough] High-Pressure Psychological Drawdown & Consecutive Losses",
        "question": "A severe 6-trade losing streak tests their max drawdown threshold during a chaotic market week. How do they enforce emotion control, audit strategy edge, and manage psychological pressure?",
        "difficulty": "Tough",
        "topic": "Psychology & Risk Stress",
        "expectedKeywords": ["emotion control", "journaling", "risk audit"]
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
    // Intelligent domain fallback based on resume content
    const isFinance = resumeText.toLowerCase().includes('gold') ||
      resumeText.toLowerCase().includes('xauusd') ||
      resumeText.toLowerCase().includes('trading') ||
      resumeText.toLowerCase().includes('order block') ||
      resumeText.toLowerCase().includes('market analyst');

    if (isFinance) {
      return {
        detectedSector: 'Financial Markets & Quantitative Trading',
        detectedTargetRole: 'Market Analyst / Quantitative Trader',
        candidateSummary: 'Self-driven Market Analyst with 3+ years analyzing XAUUSD (Gold) across multiple market cycles, specialized in institutional trading concepts, liquidity, order blocks, and risk management.',
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
              roundTitle: 'Round 1: [Easy] Candidate Background & Gold (XAUUSD) Strategy Walkthrough',
              question: 'Welcome to your interview for Market Analyst. You have a background in AI & Data Science and extensive experience analyzing XAUUSD. Can you walk me through your core trading philosophy and how you developed your liquidity-based model?',
              difficulty: 'Easy',
              topic: 'Background & Trading Philosophy',
              expectedKeywords: ['XAUUSD', 'liquidity', 'market cycles', 'order blocks']
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
              question: 'Why do Asian, London, and New York sessions exhibit distinctly different volatility patterns for XAUUSD, and how do you identify the optimal execution window?',
              difficulty: 'Easy',
              topic: 'Session Dynamics',
              expectedKeywords: ['Asian session', 'London open', 'New York volume', 'execution window']
            }
          ],
          hard: [
            {
              id: 'hard_1',
              roundTitle: 'Round 4: [Hard] False Breakouts & Liquidity Grab Recognition',
              question: 'How do you structurally and mathematically differentiate between a genuine trend continuation breakout versus an institutional liquidity grab (false breakout)? What specific confirmation signals do you look for?',
              difficulty: 'Hard',
              topic: 'False Breakouts & Liquidity Sweeps',
              expectedKeywords: ['liquidity sweep', 'displacement', 'body close', 'volume']
            },
            {
              id: 'hard_2',
              roundTitle: 'Round 5: [Hard] High-Impact Macro Events (CPI, NFP, FOMC)',
              question: 'Gold is exceptionally sensitive to US macroeconomic releases like CPI, Non-Farm Payrolls (NFP), and FOMC interest rate decisions. How does your rule-based strategy adapt to extreme spread widening and slippage during these releases?',
              difficulty: 'Hard',
              topic: 'Macro News Impact',
              expectedKeywords: ['CPI', 'NFP', 'FOMC', 'spread widening', 'volatility spike']
            },
            {
              id: 'hard_3',
              roundTitle: 'Round 6: [Hard] Risk-to-Reward Ratio (1:2 RRR) & Controlled Drawdowns',
              question: 'In your resume, you emphasize maintaining a 1:2 RRR and money management. How do you dynamically size positions relative to stop-loss distance, and what rules do you enforce when facing a period of adverse market drawdown?',
              difficulty: 'Hard',
              topic: 'Risk Management & Drawdown',
              expectedKeywords: ['1:2 RRR', 'position sizing', 'max drawdown', 'risk per trade']
            }
          ],
          tough: [
            {
              id: 'tough_1',
              roundTitle: 'Round 7: [Tough] Black Swan Flash Crash & Liquidity Evaporation',
              question: 'Suppose an unexpected geopolitical crisis triggers an immediate 150-pip flash crash in Gold during the NY session. All standard liquidity voids are penetrated and normal order blocks fail. What is your real-time crisis protocol to preserve capital and manage risk?',
              difficulty: 'Tough',
              topic: 'Crisis Capital Preservation',
              expectedKeywords: ['capital preservation', 'liquidity void', 'slippage', 'emergency hedge']
            },
            {
              id: 'tough_2',
              roundTitle: 'Round 8: [Tough] Integrating AI & Data Science with Quantitative Order Flow',
              question: 'Leveraging your AI & Data Science degree, how would you design an algorithmic quantitative model to automatically identify liquidity pools and order blocks without overfitting to historical market noise?',
              difficulty: 'Tough',
              topic: 'Quantitative AI Modeling',
              expectedKeywords: ['algorithmic trading', 'backtesting', 'cross-validation', 'order flow']
            },
            {
              id: 'tough_3',
              roundTitle: 'Round 9: [Tough] High-Pressure Psychological Drawdown & Emotional Discipline',
              question: 'You encounter 6 consecutive losing trades in your model during an unpredictable market consolidation, nearing your maximum monthly drawdown limit. Walk me through your psychological discipline, journaling protocol, and risk audit under intense financial pressure.',
              difficulty: 'Tough',
              topic: 'Psychological Discipline & Risk Audit',
              expectedKeywords: ['emotion control', 'journaling', 'trade review', 'discipline']
            }
          ]
        }
      };
    }

    // Default template for other sectors
    return {
      detectedSector: 'Artificial Intelligence & Engineering',
      detectedTargetRole: targetRole || 'Technical Specialist',
      candidateSummary: 'Candidate with analytical and technical domain expertise.',
      detectedTechStack: ['Problem Solving', 'Data Analysis', 'Strategy Modeling'],
      keyProjects: ['Primary Domain Project'],
      strengths: ['Solid domain foundations', 'Disciplined analytical approach'],
      recommendedFocus: 'Expanding deep sector implementation and stress trade-offs',
      questions: {
        easy: [
          {
            id: 'easy_1',
            roundTitle: 'Round 1: [Easy] Candidate Background & Project Walkthrough',
            question: 'Welcome! Please introduce yourself, your academic background, and provide an executive summary of your primary projects and methodologies.',
            difficulty: 'Easy',
            topic: 'Background',
            expectedKeywords: ['background', 'projects', 'methodology']
          },
          {
            id: 'easy_2',
            roundTitle: 'Round 2: [Easy] Core Domain Principles',
            question: 'Can you explain the core analytical principles and tools you utilize in your primary domain?',
            difficulty: 'Easy',
            topic: 'Core Principles',
            expectedKeywords: ['principles', 'methodology', 'tools']
          },
          {
            id: 'easy_3',
            roundTitle: 'Round 3: [Easy] Execution Flow & Quality Control',
            question: 'How do you structure your workflow from initial analysis to final delivery or execution?',
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
            roundTitle: 'Round 5: [Hard] Optimization & Performance',
            question: 'How do you evaluate and optimize performance and efficiency in your projects?',
            difficulty: 'Hard',
            topic: 'Optimization',
            expectedKeywords: ['optimization', 'performance', 'metrics']
          },
          {
            id: 'hard_3',
            roundTitle: 'Round 6: [Hard] Risk & Error Management',
            question: 'How do you handle risk, anomalies, and unexpected failures in your operational pipeline?',
            difficulty: 'Hard',
            topic: 'Risk Management',
            expectedKeywords: ['risk', 'anomalies', 'error handling']
          }
        ],
        tough: [
          {
            id: 'tough_1',
            roundTitle: 'Round 7: [Tough] High-Pressure Crisis Scenario',
            question: 'Imagine a critical failure occurs under peak operational demand. Walk me through your step-by-step incident triage and recovery.',
            difficulty: 'Tough',
            topic: 'Crisis Triage',
            expectedKeywords: ['incident response', 'root cause', 'recovery']
          },
          {
            id: 'tough_2',
            roundTitle: 'Round 8: [Tough] Scalability & Trade-offs',
            question: 'What are the most difficult trade-offs you have faced between immediate results versus long-term sustainability?',
            difficulty: 'Tough',
            topic: 'Architectural Trade-offs',
            expectedKeywords: ['trade-offs', 'scalability', 'sustainability']
          },
          {
            id: 'tough_3',
            roundTitle: 'Round 9: [Tough] Strategic Decision-Making under Uncertainty',
            question: 'How do you make high-stakes strategic decisions when market or data parameters are incomplete or ambiguous?',
            difficulty: 'Tough',
            topic: 'Decision-Making under Uncertainty',
            expectedKeywords: ['decision making', 'uncertainty', 'risk mitigation']
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
 * Adapts to the candidate's specific sector (Finance, Trading, AI, etc.) dynamically!
 */
export async function processInteractiveRound(
  req: InteractiveRoundRequest
): Promise<InteractiveRoundResponse> {
  const resumeText = formatResumeContext(req.resume);
  const { difficulty, roundIndex, totalRounds, targetRole, candidateAnswer, previousQuestion, transcriptHistory } = req;

  const hasPreviousAnswer = candidateAnswer && candidateAnswer.trim().length > 0 && candidateAnswer.trim() !== 'No response provided.';

  const isFinance = resumeText.toLowerCase().includes('gold') ||
    resumeText.toLowerCase().includes('xauusd') ||
    resumeText.toLowerCase().includes('trading') ||
    resumeText.toLowerCase().includes('order block') ||
    resumeText.toLowerCase().includes('market analyst');

  const interviewerRole = isFinance
    ? 'Senior Head of Trading Strategy & Portfolio Risk at a Global Institutional Trading Desk'
    : `Senior Corporate Director & Technical Lead in ${targetRole || 'Engineering'}`;

  const systemInstruction = `You are a real-time AI Technical Interviewer conducting a live, voice-interactive corporate interview.
Your Persona: ${interviewerRole}.
You speak clearly, professionally, and encouragingly yet rigorously.
You adapt to the candidate's answers dynamically.

CRITICAL INSTRUCTION:
DO NOT DEFAULT TO IT OR SOFTWARE CODING!
Tailor your questions and evaluations strictly to the candidate's actual sector (e.g. Financial Markets, Forex/Gold Trading, Order Blocks, Liquidity, AI & Data Science).
${
  isFinance
    ? 'All questions and evaluations must be centered on market analysis, institutional concepts (order blocks, liquidity pools, false breakouts), risk management (1:2 RRR, drawdowns), macro events (CPI, NFP, FOMC), and session dynamics (London, New York, Asian)!'
    : ''
}

YOUR GOALS:
1. If the candidate answered a previous question:
   - Provide a natural, spoken interviewer response (1-2 sentences) acknowledging their points and constructively pointing out strengths or gaps in their domain.
   - Evaluate their Technical/Analytical Depth (0-100 mark) and Communication Fluency (0-100 mark).
   - Formulate constructive feedback.
2. Ask the NEXT interview question:
   - MUST be tailored to the candidate's uploaded resume (projects, skills, education) and the target role (${targetRole}).
   - MUST strictly adhere to the requested difficulty tier: "${difficulty}".
     * Easy: Foundational domain concepts & resume project/strategy walkthrough.
     * Hard: In-depth technical/market execution, risk-reward ratios, macro news catalysts, and edge-case handling.
     * Tough: High-stakes crisis management, extreme volatility, capital preservation, and psychological drawdown control.
   - Formulate the question in a natural conversational tone so that it sounds engaging when read aloud via Speech Synthesis.

Output STRICT JSON ONLY.`;

  const prompt = `LIVE INTERVIEW CONTEXT:
Target Placement Role: ${targetRole || 'Market Analyst'}
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

Evaluate this answer carefully based on technical/analytical correctness, conceptual depth in their sector, and communication fluency.`
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
    
    let techMark = 75;
    let commMark = 75;
    let reaction = 'Thank you for your response.';

    if (hasPreviousAnswer) {
      const words = candidateAnswer.trim().split(/\s+/).length;
      if (words > 40) {
        techMark = 85;
        commMark = 88;
        reaction = 'Good detailed explanation with clear structured analysis.';
      } else if (words > 15) {
        techMark = 78;
        commMark = 75;
        reaction = 'Understood your core idea. Let us explore deeper in the next question.';
      } else {
        techMark = 60;
        commMark = 65;
        reaction = 'Try to elaborate further with specific strategy details and risk management rules.';
      }
    } else {
      reaction = `Welcome to your AI Voice Mock Interview for the position of ${targetRole}. Let us begin with your resume background.`;
    }

    const fallbackQuestions: Record<string, string> = isFinance
      ? {
          Easy: `Can you explain your experience analyzing XAUUSD (Gold), and how you identify institutional liquidity and order blocks across market sessions?`,
          Hard: `How do you handle macroeconomic volatility during CPI, NFP, or FOMC news releases, and how do you ensure you maintain a minimum 1:2 Risk-to-Reward Ratio?`,
          Tough: `Suppose an unexpected market crisis causes a 150-pip flash crash in Gold with massive spread widening and slippage. Walk me through your real-time risk triage and capital preservation protocols.`
        }
      : {
          Easy: `Based on your resume, can you explain the core strategy and methodology of your primary project?`,
          Hard: `How do you diagnose and resolve unexpected anomalies or performance bottlenecks in your domain?`,
          Tough: `Walk me through your emergency triage when a critical failure occurs under peak operational stress.`
        };

    return {
      interviewerReaction: reaction,
      feedback: hasPreviousAnswer
        ? 'Demonstrated understanding of core domain principles. Continue to articulate concrete risk management and real-world execution rules.'
        : 'Starting interview session.',
      technicalMark: techMark,
      communicationMark: commMark,
      score: Math.round((techMark * 0.6) + (commMark * 0.4)),
      nextQuestion: fallbackQuestions[difficulty] || fallbackQuestions.Easy,
      roundTitle: `Round ${roundIndex + 1}: [${difficulty}] Technical Evaluation`,
      difficulty,
      tips: `Focus on clear logical articulation, risk-managed breakdown, and real-world execution rules.`
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

