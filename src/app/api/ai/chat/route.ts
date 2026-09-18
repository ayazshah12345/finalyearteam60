import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import { evaluateStudentEligibility } from '@/lib/eligibility';

interface ChatHistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Build rich SGIP Portal Ground Truth context from database store
function buildSgipContext(activeUser: any) {
  const drives = dbStore.getPlacementDrives ? dbStore.getPlacementDrives() : [];
  const courses = dbStore.getCourses ? dbStore.getCourses() : [];
  const knowledgeSources = dbStore.getKnowledgeSources ? dbStore.getKnowledgeSources() : [];
  const applications = dbStore.getApplications ? dbStore.getApplications() : [];

  // Evaluate user eligibility for all drives
  const driveDetails = drives.map(d => {
    let evalStatus = 'Check portal for criteria';
    try {
      const res = evaluateStudentEligibility(activeUser, d.eligibility);
      evalStatus = res.isEligible ? 'ELIGIBLE' : `INELIGIBLE (${res.reasons.filter(r => r.startsWith('Ineligible')).join('; ')})`;
    } catch {
      // fallback if rule eval fails
    }
    return `- Company: ${d.companyName} | Role: ${d.roleTitle} | CTC: ${d.packageLPA} LPA | Location: ${d.location} | Min CGPA: ${d.eligibility.minCgpa} | Max Backlogs: ${d.eligibility.maxBacklogs} | Batch: ${d.eligibility.graduationYear} | Drive Date: ${d.driveDate} | Deadline: ${d.deadlineDate} | Current Student Status: ${evalStatus}`;
  }).join('\n');

  const courseList = courses.map(c => `- ${c.title} (${c.department}, Category: ${c.category || 'General'}, Difficulty: ${c.difficulty || 'Intermediate'})`).slice(0, 10).join('\n');

  const userApps = applications
    .filter(a => a.studentId === activeUser.id || a.studentRollNumber === activeUser.rollNumber)
    .map(a => `- Applied to ${a.companyName} (${a.roleTitle}): Status = ${a.status}`)
    .join('\n');

  const knowledgeSnippets = knowledgeSources
    .slice(0, 5)
    .map(k => `[${k.title} - ${k.courseTitle || 'General'}]: ${k.content.slice(0, 250)}...`)
    .join('\n');

  return `
=== SGIP PORTAL GROUND TRUTH INFORMATION ===
Logged-in Student Information:
- Name: ${activeUser.name || 'Student'}
- Roll Number: ${activeUser.rollNumber || 'N/A'}
- Department: ${activeUser.department || 'Computer Science & Engineering'}
- Current CGPA: ${activeUser.cgpa ?? '8.4'}
- Active Backlogs/Arrears: ${activeUser.backlogs ?? 0}
- Graduation Batch: ${activeUser.batch || '2026'}

Active SGIP Placement Drives & Schemes:
${driveDetails || 'No active placement drives currently scheduled.'}

Student's Existing Placement Applications:
${userApps || 'No placement applications submitted yet.'}

Available Courses in SGIP Portal:
${courseList || 'Standard Engineering & CS Curriculum'}

Faculty Approved Knowledge Base Snippets:
${knowledgeSnippets || 'No additional notes uploaded.'}

Portal Navigation & Usage Guidelines:
- How to apply for a placement drive: Navigate to the Placement Drives tab (/placement), browse active drives, check your eligibility status, and click "Apply Now".
- Where to check application status: Go to the Placement Drives page (/placement) under "My Applications" tab, or check your Student Dashboard (/dashboard).
- ATS Resume: Accessible under /resume. Students can build or upload their ATS resume for placement drives.
- Daily Proctored Test: Accessible under /daily-test. 10-minute tests boost the SGIP Growth Score and XP.
- Coding Practice & Compiler: Accessible under /coding (LeetCode practice) and /compiler (code execution engine).
- Profile Update: Accessible under /profile to update CGPA, skills, certifications, and contact details.
=== END SGIP PORTAL GROUND TRUTH ===
`.trim();
}

function buildSystemPrompt(sgipContext: string) {
  return `You are the AI assistant inside the SGIP Student Portal. You are a general-purpose conversational AI assistant. Help students with education, technology, coding, mathematics, writing, career questions, general knowledge, casual conversation, and SGIP Portal-related questions. Understand the user's intent rather than matching keywords. Use conversation history to understand follow-up questions. Adapt the response length and format to the user's request. Never fabricate SGIP-specific information.

Guidelines:
1. RESPONSE STYLE & ADAPTATION:
   - For casual greetings or chat ("Hi", "How are you?"): Be friendly, warm, and natural. Do NOT start every response with generic canned phrases like "Certainly! I'd be happy to help." or "How can I assist you today?".
   - For simple questions: Provide a clear, direct answer without artificial padding.
   - For complex questions or academic requests (e.g. "Give me a 16-mark answer", "Explain machine learning in detail"): Provide comprehensive, well-structured explanations with headings, intuition, and real-world examples.
   - For "how-to" or step-by-step requests: Use clean numbered steps.
   - For comparisons: Use clear comparison sections or Markdown tables.
   - For coding queries: Provide clean, idiomatic, and properly formatted code blocks with language identifiers (e.g. \`\`\`python, \`\`\`java, \`\`\`sql) along with concise explanations.
   - For mathematics / calculations: Show the step-by-step calculation clearly.
   - For writing tasks (e.g., leave letters, emails to professors, resume summaries): Provide ready-to-use, polished text tailored to the requested tone.
   - If the user asks to "make it shorter", "explain deeper", "give another example", or "why?", adapt seamlessly while preserving the ongoing conversation context.

2. CONVERSATION MEMORY:
   - Always track the ongoing dialogue. References like "it", "that", "the first one", "give an example of that", or "explain the difference" refer directly to prior turns.

3. SGIP PORTAL QUESTIONS:
   - Use the SGIP PORTAL GROUND TRUTH provided below to answer questions about placement drives, eligibility cutoffs, application procedures, portal navigation, and student records.
   - Never invent SGIP information. If the answer is not available in the SGIP data/context, clearly state that you don't have enough SGIP-specific information rather than making something up.

4. AMBIGUITY:
   - If a question is genuinely ambiguous and cannot be resolved from context, ask a helpful clarification (e.g. "Which company or scheme are you referring to?").

${sgipContext}`;
}

export async function POST(req: Request) {
  try {
    const activeUser = await getAuthenticatedUser(req);
    const body = await req.json();
    const { query, messages = [], isTestActive, stream: requestStream } = body;

    // SECURITY RULE: Block AI Chatbot ONLY during active proctored daily tests
    if (isTestActive === true) {
      return NextResponse.json(
        {
          error: '🚫 AI Student Chatbot is locked during an active proctored test session to preserve exam integrity.',
          locked: true
        },
        { status: 403 }
      );
    }

    if (!query || !query.trim()) {
      return NextResponse.json({ error: 'Query string is required.' }, { status: 400 });
    }

    const qRaw = query.trim();

    // Check available AI API keys
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Construct Ground Truth SGIP Context & System Prompt
    const sgipContext = buildSgipContext(activeUser);
    const systemPrompt = buildSystemPrompt(sgipContext);

    // Format conversation history
    const history: ChatHistoryMessage[] = Array.isArray(messages)
      ? messages
          .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
          .map((m: any) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content.trim()
          }))
          .filter(m => m.content.length > 0)
      : [];

    const isStreamingRequested = requestStream === true || req.headers.get('accept')?.includes('text/event-stream');

    // ----------------------------------------------------
    // Scenario A: No API key configured in .env.local
    // ----------------------------------------------------
    if (!geminiKey && !openaiKey) {
      const guidanceMessage = `### 🔑 AI API Key Setup Required

I am your **SGIP AI Student Assistant**. To enable live, ChatGPT-style generative AI responses for any question (coding, math, academics, career, and SGIP drives), please add your **Google Gemini API Key** to your \`.env.local\` file:

\`\`\`env
GEMINI_API_KEY="your_api_key_here"
\`\`\`

**How to get a key in 30 seconds (Free):**
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in and click **"Create API Key"**
3. Add the key to \`.env.local\` as shown above
4. Restart your development server (\`npm run dev\`)

*(You can also use \`OPENAI_API_KEY="sk-..."\` if you prefer OpenAI).*

Once added, I will immediately be able to answer any question, maintain conversation memory, write code, solve problems, and guide you through the SGIP portal!`;

      if (isStreamingRequested) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: guidanceMessage })}\n\n`));
            controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
            controller.close();
          }
        });
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        });
      }

      return NextResponse.json({
        answer: guidanceMessage,
        sources: [{ title: 'SGIP AI Setup Guide', chunkText: 'API key configuration instructions' }],
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // Scenario B: Google Gemini Provider
    // ----------------------------------------------------
    if (geminiKey) {
      // Build Gemini contents array from history + current query
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add previous conversation turns (limit to last 16 turns to avoid exceeding context)
      const relevantHistory = history.slice(-16);
      for (const msg of relevantHistory) {
        const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
        // Avoid consecutive roles with identical role in Gemini API
        if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
          contents[contents.length - 1].parts[0].text += `\n\n${msg.content}`;
        } else {
          contents.push({
            role: geminiRole,
            parts: [{ text: msg.content }]
          });
        }
      }

      // Ensure first message is from user if history started with model
      if (contents.length > 0 && contents[0].role === 'model') {
        contents.shift();
      }

      // Add current user query
      if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
        contents[contents.length - 1].parts[0].text += `\n\n${qRaw}`;
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: qRaw }]
        });
      }

// Global fast model cache to prevent repeated trial requests
let activeFastestModel = 'gemini-3.5-flash-lite';

      const geminiPayload = {
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 2048
        }
      };

      const candidateModels = Array.from(new Set([
        activeFastestModel,
        'gemini-3.5-flash-lite',
        'gemini-flash-lite-latest',
        'gemini-3.1-flash-lite',
        process.env.GEMINI_MODEL,
        'gemini-3.6-flash',
        'gemini-flash-latest'
      ].filter(Boolean))) as string[];

      if (isStreamingRequested) {
        let geminiRes: Response | null = null;
        let selectedModel = candidateModels[0];

        for (const model of candidateModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${geminiKey}`;
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiPayload)
            });

            if (res.ok) {
              geminiRes = res;
              selectedModel = model;
              activeFastestModel = model;
              break;
            } else {
              const errText = await res.text();
              console.warn(`Gemini Model ${model} returned ${res.status}, trying next fallback model... Details:`, errText.slice(0, 150));
            }
          } catch (e) {
            console.warn(`Fetch error for ${model}, trying next...`);
          }
        }

        if (!geminiRes || !geminiRes.ok) {
          return NextResponse.json(
            { error: 'AI model service is momentarily busy. Please try asking again in a moment.' },
            { status: 502 }
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const sseStream = new ReadableStream({
          async start(controller) {
            const reader = geminiRes.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            let buffer = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('data:')) {
                    const jsonStr = trimmed.replace(/^data:\s*/, '');
                    if (jsonStr === '[DONE]') {
                      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                      continue;
                    }
                    try {
                      const parsed = JSON.parse(jsonStr);
                      const textChunk = (parsed.candidates?.[0]?.content?.parts || [])
                        .map((p: any) => p.text || '')
                        .join('');
                      if (textChunk) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: textChunk })}\n\n`));
                      }
                    } catch {
                      // skip non-json chunk lines
                    }
                  }
                }
              }
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            } catch (streamErr) {
              console.error('Stream processing error:', streamErr);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(sseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        });
      } else {
        // Non-streaming Gemini request with automatic fallback
        let geminiRes: Response | null = null;
        let selectedModel = candidateModels[0];

        for (const model of candidateModels) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
            const res = await fetch(geminiUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(geminiPayload)
            });

            if (res.ok) {
              geminiRes = res;
              selectedModel = model;
              activeFastestModel = model;
              break;
            } else {
              const errText = await res.text();
              console.warn(`Gemini Model ${model} non-streaming returned ${res.status}, trying fallback...`, errText.slice(0, 150));
            }
          } catch (e) {
            console.warn(`Fetch error for ${model}, trying next...`);
          }
        }

        if (!geminiRes || !geminiRes.ok) {
          return NextResponse.json(
            { error: 'AI model service is momentarily busy. Please try asking again in a moment.' },
            { status: 502 }
          );
        }

        const data = await geminiRes.json();
        const answer = (data.candidates?.[0]?.content?.parts || [])
          .map((p: any) => p.text || '')
          .join('')
          .trim() || 'No response generated.';

        return NextResponse.json({
          answer,
          sources: [{ title: `SGIP Generative AI (${selectedModel})`, chunkText: qRaw }],
          timestamp: new Date().toISOString()
        });
      }
    }

    // ----------------------------------------------------
    // Scenario C: OpenAI Provider
    // ----------------------------------------------------
    if (openaiKey) {
      const openAiModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      const openAiUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';

      const openAiMessages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-16).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: qRaw }
      ];

      if (isStreamingRequested) {
        const openAiRes = await fetch(openAiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: openAiMessages,
            temperature: 0.7,
            stream: true
          })
        });

        if (!openAiRes.ok) {
          const errText = await openAiRes.text();
          console.error('OpenAI API Error:', openAiRes.status, errText);
          return NextResponse.json(
            { error: 'AI model service returned an error. Please verify your OPENAI_API_KEY.' },
            { status: 502 }
          );
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const sseStream = new ReadableStream({
          async start(controller) {
            const reader = openAiRes.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            let buffer = '';
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('data:')) {
                    const jsonStr = trimmed.replace(/^data:\s*/, '');
                    if (jsonStr === '[DONE]') {
                      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                      continue;
                    }
                    try {
                      const parsed = JSON.parse(jsonStr);
                      const textChunk = parsed.choices?.[0]?.delta?.content;
                      if (textChunk) {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: textChunk })}\n\n`));
                      }
                    } catch {
                      // skip non-json lines
                    }
                  }
                }
              }
              controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            } catch (err) {
              console.error('OpenAI stream processing error:', err);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(sseStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
          }
        });
      } else {
        const openAiRes = await fetch(openAiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: openAiModel,
            messages: openAiMessages,
            temperature: 0.7
          })
        });

        if (!openAiRes.ok) {
          const errText = await openAiRes.text();
          console.error('OpenAI API Error:', openAiRes.status, errText);
          return NextResponse.json(
            { error: 'AI model service returned an error. Please verify your OPENAI_API_KEY.' },
            { status: 502 }
          );
        }

        const data = await openAiRes.json();
        const answer = data.choices?.[0]?.message?.content || 'No response generated.';

        return NextResponse.json({
          answer,
          sources: [{ title: 'SGIP Generative AI (OpenAI)', chunkText: qRaw }],
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ error: 'No supported AI provider configured.' }, { status: 500 });
  } catch (error: any) {
    console.error('AI Student Chatbot Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI response. Please try again later.' },
      { status: 500 }
    );
  }
}
