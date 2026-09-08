import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const user = await getAuthenticatedUser(req);

  if (!q) {
    return NextResponse.json({ courses: [], assignments: [], drives: [], questions: [] });
  }

  // 1. Search Courses
  const courses = dbStore.getCourses().filter(c =>
    c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.skillsGained.some(s => s.toLowerCase().includes(q))
  );

  // 2. Search Assignments
  const assignments = dbStore.getAssignments().filter(a =>
    a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)
  );

  // 3. Search Placement Drives
  const drives = dbStore.getPlacementDrives().filter(d =>
    d.companyName.toLowerCase().includes(q) || d.roleTitle.toLowerCase().includes(q)
  );

  // 4. Role-restricted: Questions search for Faculty only
  let questions: any[] = [];
  if (user.role === 'FACULTY') {
    questions = dbStore.getQuestions().filter(qu =>
      qu.questionText.toLowerCase().includes(q) || qu.topic.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    courses,
    assignments,
    drives,
    questions
  });
}
