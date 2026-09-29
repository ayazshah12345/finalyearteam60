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

    const roundRequest: InteractiveRoundRequest = {
      resume: resumeData,
      targetRole: body.targetRole || resumeData?.targetRole || 'Market Analyst / Quantitative Trader',
      difficulty: body.difficulty || 'Easy',
      roundIndex: typeof body.roundIndex === 'number' ? body.roundIndex : 0,
      totalRounds: typeof body.totalRounds === 'number' ? body.totalRounds : 5,
      timeRemainingSeconds: body.timeRemainingSeconds,
      candidateName: user.name || body.candidateName || 'Syed Ayaz Shah',
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
