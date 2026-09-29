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
    const targetRole = body.targetRole || 'Software Development Engineer';

    // Check if custom resume provided in request, else load from dbStore
    let resumeData: Partial<ResumeData> | null = body.resume || null;
    if (!resumeData) {
      resumeData = dbStore.getResume(user.id) || null;
    }

    if (!resumeData) {
      resumeData = {
        studentId: user.id,
        title: `${user.name} - Resume`,
        summary: `Computer Science student at VSB Engineering College (${user.department}), CGPA: ${user.cgpa || 8.4}.`,
        skills: [
          { category: 'Programming Languages', list: ['Python', 'Java', 'SQL', 'JavaScript'] },
          { category: 'Frameworks & Tools', list: ['React', 'Next.js', 'PostgreSQL', 'Git'] }
        ],
        projects: [
          {
            title: 'Student Growth Intelligence Platform',
            tech: 'Next.js, TypeScript, PostgreSQL',
            points: ['Campus placement intelligence and algorithmic evaluation system.']
          }
        ],
        education: [
          {
            institution: 'VSB Engineering College',
            degree: `B.E. ${user.department || 'CSE'}`,
            year: '2022 - 2026',
            cgpa: `${user.cgpa || 8.4}`
          }
        ]
      };
    }

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
