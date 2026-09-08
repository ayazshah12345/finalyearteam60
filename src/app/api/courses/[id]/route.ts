import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = dbStore.getCourseById(id);
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const modules = dbStore.getModulesByCourse(id);
  const lessons = dbStore.getLessonsByCourse(id);
  const user = await getAuthenticatedUser(req);

  const userProgress = lessons.map(l => {
    const prog = dbStore.getLessonProgress(user.id, l.id);
    return {
      lessonId: l.id,
      completed: prog?.completed || false
    };
  });

  const completedCount = userProgress.filter(p => p.completed).length;
  const totalCount = lessons.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return NextResponse.json({
    course,
    modules,
    lessons,
    userProgress,
    progressPercent
  });
}
