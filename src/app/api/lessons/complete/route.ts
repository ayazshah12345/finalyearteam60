import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await authorizeRole(['STUDENT'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { courseId, lessonId } = body;
  if (!courseId || !lessonId) {
    return NextResponse.json({ error: 'courseId and lessonId required' }, { status: 400 });
  }

  const prog = dbStore.markLessonComplete(auth.user.id, courseId, lessonId);

  // Check if course completed -> auto-generate portfolio certificate
  const lessons = dbStore.getLessonsByCourse(courseId);
  const userProgress = lessons.map(l => dbStore.getLessonProgress(auth.user.id, l.id)?.completed || false);
  const isCourseComplete = userProgress.every(Boolean);

  if (isCourseComplete) {
    const course = dbStore.getCourseById(courseId);
    if (course) {
      dbStore.addPortfolioItem({
        id: `pf_cert_${Date.now()}`,
        studentId: auth.user.id,
        type: 'CERTIFICATE',
        title: `Certified: ${course.title}`,
        description: `Successfully completed all modules of ${course.title}. Instructor: ${course.instructorName}.`,
        date: new Date().toISOString().split('T')[0],
        tags: course.skillsGained,
        autoSynced: true,
        publicVisible: true
      });
    }
  }

  return NextResponse.json({ success: true, progress: prog, isCourseComplete });
}
