import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get('assignmentId');
  if (assignmentId) {
    const subs = dbStore.getSubmissionsByAssignment(assignmentId);
    return NextResponse.json({ submissions: subs });
  }
  const submissions = dbStore.getSubmissions();
  return NextResponse.json({ submissions });
}

// Student submit assignment
export async function POST(req: Request) {
  const auth = authorizeRole(['STUDENT']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { assignmentId, submissionType, codeText, contentUrl } = body;

  const existing = dbStore.getStudentSubmission(assignmentId, auth.user.id);
  const submission = {
    id: existing?.id || `sub_${Date.now()}`,
    assignmentId,
    studentId: auth.user.id,
    studentName: auth.user.name,
    studentRollNumber: auth.user.rollNumber || '21CS104',
    department: auth.user.department,
    submissionType: submissionType || 'Code',
    codeText,
    contentUrl,
    status: 'Submitted' as const,
    submittedAt: new Date().toISOString()
  };

  dbStore.addOrUpdateSubmission(submission);
  return NextResponse.json({ submission });
}

// Faculty grade submission
export async function PUT(req: Request) {
  const auth = authorizeRole(['FACULTY']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { submissionId, marksObtained, feedback, status } = body;

  const submissions = dbStore.getSubmissions();
  const target = submissions.find(s => s.id === submissionId);
  if (!target) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  target.marksObtained = marksObtained;
  target.feedback = feedback;
  target.status = status || 'Graded';
  target.gradedAt = new Date().toISOString();

  dbStore.addOrUpdateSubmission(target);

  // Notify student
  dbStore.addNotification({
    id: `nt_sub_${Date.now()}`,
    targetUserId: target.studentId,
    title: 'Assignment Graded',
    message: `Your submission for assignment has been graded: ${marksObtained}/100 marks. Feedback: "${feedback || 'Good effort'}"`,
    category: 'Assignment',
    read: false,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ submission: target });
}
