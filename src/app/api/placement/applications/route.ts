import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole, getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = getAuthenticatedUser();
  if (user.role === 'STUDENT') {
    const studentApps = dbStore.getApplicationsByStudent(user.id);
    return NextResponse.json({ applications: studentApps });
  }
  const allApps = dbStore.getApplications();
  return NextResponse.json({ applications: allApps });
}

// Update selection status (Placement Coordinator only)
export async function PUT(req: Request) {
  const auth = authorizeRole(['PLACEMENT_COORDINATOR']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { applicationId, status, interviewSchedule, offerLetterUrl } = body;

  const apps = dbStore.getApplications();
  const target = apps.find(a => a.id === applicationId);
  if (!target) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  target.status = status;
  if (interviewSchedule) target.interviewSchedule = interviewSchedule;
  if (offerLetterUrl) target.offerLetterUrl = offerLetterUrl;

  dbStore.addOrUpdateApplication(target);

  // Notify student
  dbStore.addNotification({
    id: `nt_app_${Date.now()}`,
    targetUserId: target.studentId,
    title: `Placement Update: ${target.companyName}`,
    message: `Your application status for ${target.roleTitle} has updated to: ${status}.`,
    category: 'Placement',
    read: false,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ application: target });
}
