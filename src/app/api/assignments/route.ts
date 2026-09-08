import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET() {
  const assignments = dbStore.getAssignments();
  return NextResponse.json({ assignments });
}

export async function POST(req: Request) {
  const auth = await authorizeRole(['FACULTY'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const newAssignment = {
    id: `asg_${Date.now()}`,
    courseId: body.courseId || 'crs_dsa_101',
    courseTitle: body.courseTitle || 'Advanced Data Structures & Algorithms',
    title: body.title,
    description: body.description,
    instructions: body.instructions || 'Follow submission guidelines.',
    totalMarks: body.totalMarks || 100,
    dueDate: body.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    submissionType: body.submissionType || 'Code',
    published: true,
    createdBy: auth.user.id,
    createdAt: new Date().toISOString()
  };

  dbStore.addAssignment(newAssignment);
  dbStore.addNotification({
    id: `nt_asg_${Date.now()}`,
    targetRole: 'STUDENT',
    title: 'New Assignment Published',
    message: `${auth.user.name} published assignment: ${newAssignment.title}`,
    category: 'Assignment',
    read: false,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ assignment: newAssignment });
}
