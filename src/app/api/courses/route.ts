import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET() {
  const courses = dbStore.getCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const auth = authorizeRole(['FACULTY']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const newCourse = {
    id: `crs_${Date.now()}`,
    title: body.title,
    description: body.description,
    category: body.category || 'Department Subjects',
    instructorId: auth.user.id,
    instructorName: auth.user.name,
    department: auth.user.department,
    durationHours: body.durationHours || 30,
    difficulty: body.difficulty || 'Intermediate',
    coverImage: body.coverImage || 'https://images.unsplash.com/photo-1516116211223-4c7141944510?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: body.learningObjectives || ['Master core concepts'],
    skillsGained: body.skillsGained || ['Problem Solving'],
    createdAt: new Date().toISOString()
  };

  dbStore.addCourse(newCourse);
  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: auth.user.id,
    userName: auth.user.name,
    role: auth.user.role,
    action: 'CREATE_COURSE',
    entity: 'Course',
    entityId: newCourse.id,
    timestamp: new Date().toISOString(),
    details: `Faculty ${auth.user.name} published new course: ${newCourse.title}`
  });

  return NextResponse.json({ course: newCourse });
}
