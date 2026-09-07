import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET() {
  const quizzes = dbStore.getQuizzes();
  const questions = dbStore.getQuestions();
  return NextResponse.json({ quizzes, questions });
}

export async function POST(req: Request) {
  const auth = authorizeRole(['FACULTY']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const newQuiz = {
    id: `qz_${Date.now()}`,
    courseId: body.courseId,
    title: body.title,
    description: body.description || '',
    subject: body.subject || 'Computer Science',
    durationMinutes: body.durationMinutes || 30,
    totalMarks: body.totalMarks || 20,
    passingScore: body.passingScore || 12,
    negativeMarking: body.negativeMarking ?? true,
    randomizeQuestions: body.randomizeQuestions ?? true,
    questionIds: body.questionIds || [],
    published: true,
    createdBy: auth.user.id,
    createdAt: new Date().toISOString()
  };

  dbStore.addQuiz(newQuiz);
  return NextResponse.json({ quiz: newQuiz });
}
