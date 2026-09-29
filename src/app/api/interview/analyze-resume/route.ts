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

    const userDept = user.department || 'Computer Science & Engineering';
    const isMech = userDept.toLowerCase().includes('mech');
    const isCivil = userDept.toLowerCase().includes('civil');
    const defaultSector = isMech ? 'Mechanical Engineering' : isCivil ? 'Civil Engineering' : 'Software Engineering & Computer Science';
    const defaultRole = isMech ? 'Mechanical Engineer' : isCivil ? 'Civil Engineer' : 'Software Development Engineer';

    if (!resumeData) {
      const studentSkills = (user.skills && user.skills.length > 0) ? user.skills : ['Java', 'C++', 'Data Structures', 'OOPs', 'Problem Solving'];
      resumeData = {
        id: `res_${user.id}`,
        studentId: user.id,
        title: `${user.name || 'Student'} - Resume`,
        sector: defaultSector,
        targetRole: body.targetRole || defaultRole,
        summary: `${user.name || 'Candidate'} is a student in ${userDept} with focus on core engineering and problem solving.`,
        skills: [{ category: 'Technical Skills', list: studentSkills }],
        projects: [],
        experience: [],
        education: [{ institution: 'Engineering College', degree: `B.Tech in ${userDept}`, year: '2022-2026', cgpa: `${user.cgpa || '8.5'}` }]
      };
    }

    const targetRole = body.targetRole || resumeData.targetRole || defaultRole;

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
