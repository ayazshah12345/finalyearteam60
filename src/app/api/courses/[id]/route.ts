import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase/admin';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);

  let course: any = null;
  let modules: any[] = [];
  let lessons: any[] = [];

  // 1. Try Supabase Permanent PostgreSQL Database first
  try {
    const supabase = getSupabaseClient();
    const [cRes, mRes, lRes] = await Promise.all([
      supabase.from('Course').select('*').eq('id', id).maybeSingle(),
      supabase.from('Module').select('*').eq('courseId', id).order('order', { ascending: true }),
      supabase.from('Lesson').select('*').eq('courseId', id).order('order', { ascending: true })
    ]);

    if (!cRes.error && cRes.data) {
      course = cRes.data;
      modules = mRes.data || [];
      lessons = lRes.data || [];
    }
  } catch (err) {
    console.warn('Supabase course detail fetch error:', err);
  }

  // 2. Fallback to in-memory store
  if (!course) {
    course = dbStore.getCourseById(id);
    if (course) {
      modules = dbStore.getModulesByCourse(id);
      lessons = dbStore.getLessonsByCourse(id);
    }
  }

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const userProgress = lessons.map((l: any) => {
    const prog = dbStore.getLessonProgress(user.id, l.id);
    return {
      lessonId: l.id,
      completed: prog?.completed || false
    };
  });

  const completedCount = userProgress.filter((p: any) => p.completed).length;
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
