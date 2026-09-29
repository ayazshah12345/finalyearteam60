import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { dbStore } from '@/lib/db-store';
import { processInteractiveRound, InteractiveRoundRequest } from '@/lib/gemini-interview';
import { ResumeData } from '@/types';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let resumeData: Partial<ResumeData> | null = body.resume || null;
    if (!resumeData) {
      resumeData = dbStore.getResume(user.id) || null;
    }

    const userDept = user.department || 'Computer Science & Engineering';
    const defaultRole = userDept.toLowerCase().includes('mech')
      ? 'Mechanical Engineer'
      : userDept.toLowerCase().includes('civil')
      ? 'Civil Engineer'
      : 'Software Development Engineer';

    if (!resumeData) {
      const studentSkills = (user.skills && user.skills.length > 0)
        ? user.skills
        : ['Java', 'C++', 'Data Structures & Algorithms', 'OOPs', 'Problem Solving'];
      resumeData = {
        id: `res_${user.id}`,
        studentId: user.id,
        title: `${user.name || 'Candidate'} - Profile Resume`,
        sector: userDept.toLowerCase().includes('mech')
          ? 'Mechanical Engineering'
          : userDept.toLowerCase().includes('civil')
          ? 'Civil Engineering'
          : 'Software Engineering & Computer Science',
        targetRole: body.targetRole || defaultRole,
        summary: `${user.name || 'Candidate'} is a student specializing in ${userDept} with highlighted skills in ${studentSkills.join(', ')}.`,
        skills: [{ category: 'Core Programming & Technical Skills', list: studentSkills }],
        projects: [
          {
            title: 'Engineering & Algorithmic Problem Solving Project',
            tech: studentSkills.slice(0, 3).join(', '),
            points: ['Engineered core components, verified algorithmic efficiency and handled edge cases.']
          }
        ],
        education: [
          {
            institution: 'College of Engineering & Technology',
            degree: `B.Tech in ${userDept}`,
            year: '2022-2026',
            cgpa: `${user.cgpa || '8.5'}`
          }
        ]
      };
    }

    const roundRequest: InteractiveRoundRequest = {
      resume: resumeData,
      targetRole: body.targetRole || resumeData?.targetRole || defaultRole,
      difficulty: body.difficulty || 'Easy',
      roundIndex: typeof body.roundIndex === 'number' ? body.roundIndex : 0,
      totalRounds: typeof body.totalRounds === 'number' ? body.totalRounds : 5,
      timeRemainingSeconds: body.timeRemainingSeconds,
      candidateName: user.name || body.candidateName || 'Candidate',
      candidateAnswer: body.candidateAnswer,
      previousQuestion: body.previousQuestion,
      previousRoundTitle: body.previousRoundTitle,
      transcriptHistory: body.transcriptHistory || []
    };

    const result = await processInteractiveRound(roundRequest);

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (err: any) {
    console.error('Error in interactive-round route:', err);
    return NextResponse.json(
      { error: 'Failed to process interactive interview round: ' + err.message },
      { status: 500 }
    );
  }
}
