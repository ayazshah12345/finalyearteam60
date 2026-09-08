import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const activeUser = await getAuthenticatedUser(req);
  if (!activeUser) {
    return NextResponse.json({ error: 'Unauthorized. Session missing.' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  if (activeUser.role === 'STUDENT') {
    const studentInterviews = dbStore.getMockInterviewsByStudent(activeUser.id);
    return NextResponse.json({ interviews: studentInterviews });
  }

  // Faculty or Placement Coordinator can view all interviews or filtered by studentId
  if (studentId && studentId !== 'ALL') {
    const filtered = dbStore.getMockInterviewsByStudent(studentId);
    return NextResponse.json({ interviews: filtered });
  }

  const allInterviews = dbStore.getMockInterviews();
  return NextResponse.json({ interviews: allInterviews });
}
