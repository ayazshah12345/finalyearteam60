import { NextResponse } from 'next/server';
import { spawnSync } from 'child_process';
import vm from 'vm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { language, code, input } = body;

    if (!code || !code.trim()) {
      return NextResponse.json({ error: 'Source code is required to compile and run.' }, { status: 400 });
    }

    const langLower = (language || 'python').toLowerCase();
    const startTime = Date.now();
    const stdinData = typeof input === 'string' ? input : '';

    let output = '';
    let error: string | null = null;
    let status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR' = 'SUCCESS';
    let exitCode = 0;

    // =========================================================================
    // 1. JAVASCRIPT: Execute in Node.js Isolated VM Sandbox
    // =========================================================================
    if (langLower.includes('javascript') || langLower.includes('js') || langLower.includes('node')) {
      const logs: string[] = [];
      const errors: string[] = [];

      const sandbox = {
        console: {
          log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args: any[]) => errors.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          info: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' '))
        },
        input: stdinData,
        process: { env: {} },
        setTimeout: undefined,
        setInterval: undefined
      };

      try {
        const script = new vm.Script(code, { filename: 'solution.js' });
        const context = vm.createContext(sandbox);
        script.runInContext(context, { timeout: 3000 });

        output = logs.join('\n');
        if (errors.length > 0) {
          error = errors.join('\n');
        }
        if (!output && !error) {
          output = 'Program executed successfully with no stdout.';
        }
      } catch (err: any) {
        status = err.name === 'SyntaxError' ? 'COMPILATION_ERROR' : 'RUNTIME_ERROR';
        exitCode = 1;
        error = err.stack || err.message || 'JavaScript execution failed.';
        output = logs.join('\n');
      }
    }

    // =========================================================================
    // 2. PYTHON: Native Process Execution with Fallback to AI Compiler
    // =========================================================================
    else if (langLower.includes('python') || langLower.includes('py')) {
      let pySuccess = false;

      // Try running via local python binary
      try {
        const pyCmd = process.platform === 'win32' ? 'python' : 'python3';
        const proc = spawnSync(pyCmd, ['-c', code], {
          input: stdinData,
          timeout: 4000,
          encoding: 'utf-8',
          maxBuffer: 1024 * 1024
        });

        if (proc.error) {
          // Binary not found or failed to spawn -> fall through to AI compiler
          pySuccess = false;
        } else {
          pySuccess = true;
          const stdOutStr = proc.stdout || '';
          const stdErrStr = proc.stderr || '';

          if (proc.status === 0) {
            status = 'SUCCESS';
            output = stdOutStr || 'Program executed successfully with exit code 0.';
            error = stdErrStr ? stdErrStr : null;
            exitCode = 0;
          } else {
            status = stdErrStr.includes('SyntaxError') || stdErrStr.includes('IndentationError')
              ? 'COMPILATION_ERROR'
              : 'RUNTIME_ERROR';
            output = stdOutStr;
            error = stdErrStr || `Python process terminated with status code ${proc.status}`;
            exitCode = proc.status ?? 1;
          }
        }
      } catch {
        pySuccess = false;
      }

      if (!pySuccess) {
        // Fall back to AI Compiler Engine
        const aiRes = await runAiCompiler(language, code, stdinData);
        status = aiRes.status;
        output = aiRes.output;
        error = aiRes.error;
        exitCode = aiRes.exitCode;
      }
    }

    // =========================================================================
    // 3. C++, JAVA, C, SQL: AI Compiler & Diagnostics Engine
    // =========================================================================
    else {
      const aiRes = await runAiCompiler(language, code, stdinData);
      status = aiRes.status;
      output = aiRes.output;
      error = aiRes.error;
      exitCode = aiRes.exitCode;
    }

    const executionTimeMs = Math.max(12, Date.now() - startTime);

    return NextResponse.json({
      language,
      output: output || (status === 'SUCCESS' ? 'Program completed successfully (exit code 0).' : ''),
      error: error || null,
      status,
      exitCode,
      executionTimeMs,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Compiler execution error:', error);
    return NextResponse.json({
      status: 'RUNTIME_ERROR',
      output: '',
      error: error.message || 'Internal compiler service error.',
      exitCode: 1,
      executionTimeMs: 0
    }, { status: 500 });
  }
}

/**
 * High-speed AI Compiler & Runtime Diagnostic Engine powered by Gemini 3.5 Flash-Lite
 */
async function runAiCompiler(
  language: string,
  code: string,
  input: string
): Promise<{ status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR'; output: string; error: string | null; exitCode: number }> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (!geminiKey) {
    return {
      status: 'COMPILATION_ERROR',
      output: '',
      error: 'GEMINI_API_KEY is not configured in .env.local to run the multi-language compiler.',
      exitCode: 1
    };
  }

  const systemInstruction = `You are an exact, industrial code compiler and execution runtime engine for ${language}.
Your task:
1. Examine the user's code for syntax errors, missing semicolons, undefined identifiers, type mismatches, or invalid imports.
2. If ANY compilation or syntax error exists:
   - status must be "COMPILATION_ERROR"
   - error must contain the exact compiler error message with filename (e.g. Solution.${language === 'Java' ? 'java' : language === 'C++' ? 'cpp' : 'c'}), line number, caret pointing to the mistake, and explanation.
   - output must be empty ""
   - exitCode must be 1
3. If the code compiles, simulate its exact execution with any provided standard input (stdin):
   - If it throws a runtime exception (ZeroDivision, OutOfBounds, NullPointer):
     status must be "RUNTIME_ERROR", error must contain the runtime traceback, exitCode must be 1.
   - If it executes normally:
     status must be "SUCCESS", output must contain the exact standard output (stdout), error must be null, exitCode must be 0.
4. Output STRICT JSON ONLY with no backticks, no markdown fence.`;

  const prompt = `Code to compile (${language}):
\`\`\`${language}
${code}
\`\`\`

Standard Input (stdin):
${input || '(none)'}

Provide STRICT JSON output:
{
  "status": "SUCCESS" | "COMPILATION_ERROR" | "RUNTIME_ERROR",
  "output": "stdout string",
  "error": "exact diagnostic error string or null",
  "exitCode": 0 or 1
}`;

  try {
    const model = 'gemini-3.5-flash-lite';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      // Fallback to gemini-flash-lite-latest
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${geminiKey}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
        })
      });

      if (!fallbackRes.ok) {
        return {
          status: 'RUNTIME_ERROR',
          output: '',
          error: 'Remote compiler runtime is currently busy. Please try again in a few seconds.',
          exitCode: 1
        };
      }

      const fbJson = await fallbackRes.json();
      const rawText = fbJson.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      return parseCompilerJson(rawText);
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    return parseCompilerJson(rawText);
  } catch (err: any) {
    return {
      status: 'RUNTIME_ERROR',
      output: '',
      error: `Compiler engine error: ${err.message || 'Execution timeout'}`,
      exitCode: 1
    };
  }
}

function parseCompilerJson(raw: string): { status: 'SUCCESS' | 'COMPILATION_ERROR' | 'RUNTIME_ERROR'; output: string; error: string | null; exitCode: number } {
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(clean);
    return {
      status: parsed.status || (parsed.error ? 'COMPILATION_ERROR' : 'SUCCESS'),
      output: parsed.output || '',
      error: parsed.error || null,
      exitCode: parsed.exitCode ?? (parsed.error ? 1 : 0)
    };
  } catch {
    return {
      status: 'SUCCESS',
      output: raw,
      error: null,
      exitCode: 0
    };
  }
}
