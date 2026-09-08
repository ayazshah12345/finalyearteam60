import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');

  if (studentId === 'ALL') {
    const attempts = dbStore.getAllQuizAttempts();
    return NextResponse.json({ attempts });
  }

  if (studentId) {
    const attempts = dbStore.getQuizAttemptsByStudent(studentId);
    return NextResponse.json({ attempts });
  }

  const activeUser = await getAuthenticatedUser(req);
  const attempts = dbStore.getQuizAttemptsByStudent(activeUser.id);
  return NextResponse.json({ attempts });
}
