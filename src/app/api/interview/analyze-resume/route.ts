import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbStore } from '@/lib/db-store';
import { analyzeResumeWithGemini } from '@/lib/gemini-interview';
import { ResumeData } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    let resumeData: Partial<ResumeData> | null = body.resume || null;
    if (!resumeData) {
      resumeData = dbStore.getResume(user.id) || null;
    }

    if (!resumeData) {
      const { SYED_AYAZ_RESUME } = await import('@/lib/gemini-interview');
      resumeData = {
        ...SYED_AYAZ_RESUME,
        studentId: user.id
      };
    }

    const targetRole =
      body.targetRole && !body.targetRole.includes('Full Stack')
        ? body.targetRole
        : resumeData.targetRole || 'Market Analyst / Quantitative Trader';

    const analysis = await analyzeResumeWithGemini(resumeData, targetRole);

    return NextResponse.json({
      success: true,
      resume: resumeData,
      analysis
    });
  } catch (err: any) {
    console.error('Error in analyze-resume route:', err);
    return NextResponse.json(
      { error: 'Failed to analyze resume with Gemini AI: ' + err.message },
      { status: 500 }
    );
  }
}
