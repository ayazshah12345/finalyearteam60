import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole, getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const reports = dbStore.getDailyReports();
  return NextResponse.json({ reports });
}

// Student submit daily report
export async function POST(req: Request) {
  const auth = await authorizeRole(['STUDENT'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const report = {
    id: `dr_${Date.now()}`,
    studentId: auth.user.id,
    studentName: auth.user.name,
    department: auth.user.department,
    date: new Date().toISOString().split('T')[0],
    studyHours: parseFloat(body.studyHours || '3.5'),
    topicsLearned: body.topicsLearned || ['DSA', 'React'],
    completedTasks: body.completedTasks || ['Solved 2 LeetCode problems'],
    codingProblemsSolved: parseInt(body.codingProblemsSolved || '2'),
    reflection: body.reflection || 'Productive study session.',
    tomorrowPlan: body.tomorrowPlan || 'Revise dynamic programming.',
    status: 'Pending' as const,
    createdAt: new Date().toISOString()
  };

  dbStore.addDailyReport(report);

  // Notify faculty
  dbStore.addNotification({
    id: `nt_dr_${Date.now()}`,
    targetRole: 'FACULTY',
    title: 'Daily Report Submitted',
    message: `${auth.user.name} submitted a daily learning report (${report.studyHours} study hours).`,
    category: 'Daily Report',
    read: false,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ report });
}

// Faculty review daily report
export async function PUT(req: Request) {
  const auth = await authorizeRole(['FACULTY'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { id, facultyComment } = body;
  if (!id) {
    return NextResponse.json({ error: 'report id is required' }, { status: 400 });
  }

  const updated = dbStore.reviewDailyReport(id, facultyComment || 'Good progress!', auth.user.name);

  if (updated) {
    dbStore.addNotification({
      id: `nt_dr_rev_${Date.now()}`,
      targetUserId: updated.studentId,
      title: 'Daily Report Reviewed',
      message: `${auth.user.name} reviewed your daily report: "${facultyComment || 'Good progress!'}"`,
      category: 'Daily Report',
      read: false,
      createdAt: new Date().toISOString()
    });
  }

  return NextResponse.json({ report: updated });
}
