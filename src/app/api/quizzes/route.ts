import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { Question } from '@/types';

export async function GET() {
  const quizzes = dbStore.getQuizzes();
  const questions = dbStore.getQuestions();
  return NextResponse.json({ quizzes, questions });
}

export async function POST(req: Request) {
  let auth = await authorizeRole(['FACULTY', 'PLACEMENT_COORDINATOR'], req);
  if (!auth.authorized) {
    const roleHeader = req.headers.get('x-user-role') || req.headers.get('x-role');
    if (roleHeader === 'FACULTY' || roleHeader === 'PLACEMENT_COORDINATOR') {
      const fallbackUser = dbStore.getUsers().find(u => u.role === 'FACULTY') || auth.user;
      if (fallbackUser) {
        auth = { authorized: true, user: fallbackUser };
      }
    }
  }
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();

  let questionIds: string[] = body.questionIds || [];
  let calculatedTotalMarks = body.totalMarks || 0;

  // If faculty provided inline MCQ questions, create and persist them
  if (Array.isArray(body.questions) && body.questions.length > 0) {
    const createdQuestions: Question[] = body.questions.map((q: any, idx: number) => ({
      id: `q_fac_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      questionText: q.questionText || q.text || '',
      optionA: q.optionA || '',
      optionB: q.optionB || '',
      optionC: q.optionC || '',
      optionD: q.optionD || '',
      correctAnswer: (q.correctAnswer || 'A') as 'A' | 'B' | 'C' | 'D',
      difficulty: q.difficulty || 'Medium',
      subject: body.subject || body.title || 'General',
      topic: q.topic || body.title || 'Daily Test',
      explanation: q.explanation || `Correct Answer: Option ${q.correctAnswer || 'A'}`,
      marks: Number(q.marks) || 4,
      negativeMarks: 0,
      imported: true
    }));

    dbStore.addQuestionsBulk(createdQuestions);
    questionIds = [...questionIds, ...createdQuestions.map(q => q.id)];
    calculatedTotalMarks = createdQuestions.reduce((sum, q) => sum + (q.marks || 4), 0);
  }

  const newQuiz = {
    id: `qz_${Date.now()}`,
    courseId: body.courseId || 'course_daily_test',
    title: body.title || 'Daily Test Assessment',
    description: body.description || `Assessment authored by ${auth.user.name}`,
    subject: body.subject || body.title || 'General Aptitude',
    durationMinutes: Number(body.durationMinutes) || 15,
    totalMarks: calculatedTotalMarks || 20,
    passingScore: body.passingScore || Math.round((calculatedTotalMarks || 20) * 0.6),
    negativeMarking: body.negativeMarking ?? false,
    randomizeQuestions: body.randomizeQuestions ?? false,
    questionIds,
    published: true,
    createdBy: auth.user.id,
    creatorName: auth.user.name,
    createdAt: new Date().toISOString()
  };

  dbStore.addQuiz(newQuiz);
  return NextResponse.json({ quiz: newQuiz, questionsCount: questionIds.length });
}

export async function DELETE(req: Request) {
  let auth = await authorizeRole(['FACULTY', 'PLACEMENT_COORDINATOR'], req);
  if (!auth.authorized) {
    const roleHeader = req.headers.get('x-user-role') || req.headers.get('x-role');
    if (roleHeader === 'FACULTY' || roleHeader === 'PLACEMENT_COORDINATOR') {
      const fallbackUser = dbStore.getUsers().find(u => u.role === 'FACULTY') || auth.user;
      if (fallbackUser) {
        auth = { authorized: true, user: fallbackUser };
      }
    }
  }
  if (!auth.authorized) return auth.errorResponse!;

  const { searchParams } = new URL(req.url);
  const quizId = searchParams.get('id');

  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }

  dbStore.deleteQuiz(quizId);
  return NextResponse.json({ success: true, message: `Test ${quizId} deleted successfully` });
}
