import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';

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

  const activeUser = dbStore.getActiveUser();
  const attempts = dbStore.getQuizAttemptsByStudent(activeUser.id);
  return NextResponse.json({ attempts });
}
