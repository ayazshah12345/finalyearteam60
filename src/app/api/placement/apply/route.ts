import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { evaluateStudentEligibility } from '@/lib/eligibility';

export async function POST(req: Request) {
  const auth = await authorizeRole(['STUDENT'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const { driveId } = body;
  if (!driveId) {
    return NextResponse.json({ error: 'driveId is required' }, { status: 400 });
  }

  const drive = dbStore.getPlacementDriveById(driveId);
  if (!drive) {
    return NextResponse.json({ error: 'Drive not found' }, { status: 404 });
  }

  const eligibilityEval = evaluateStudentEligibility(auth.user, drive.eligibility);

  const application = {
    id: `app_${Date.now()}`,
    driveId: drive.id,
    companyName: drive.companyName,
    roleTitle: drive.roleTitle,
    packageLPA: drive.packageLPA,
    studentId: auth.user.id,
    studentName: auth.user.name,
    studentRollNumber: auth.user.rollNumber || '21CS104',
    department: auth.user.department,
    cgpaSnapshot: auth.user.cgpa || 0,
    backlogsSnapshot: auth.user.backlogs || 0,
    isEligible: eligibilityEval.isEligible,
    eligibilityReasons: eligibilityEval.reasons,
    status: eligibilityEval.isEligible ? ('Applied' as const) : ('Rejected' as const),
    appliedAt: new Date().toISOString()
  };

  dbStore.addOrUpdateApplication(application);

  dbStore.addNotification({
    id: `notif_apply_fac_${Date.now()}`,
    targetRole: 'FACULTY',
    title: `📋 Placement Application: ${auth.user.name}`,
    message: `Student ${auth.user.name} (${auth.user.rollNumber || 'N/A'}) applied for ${drive.companyName} (${drive.roleTitle}). Eligibility: ${eligibilityEval.isEligible ? 'Eligible' : 'Not Eligible'}.`,
    category: 'Placement',
    read: false,
    createdAt: new Date().toISOString()
  });

  dbStore.addNotification({
    id: `notif_apply_coord_${Date.now()}`,
    targetRole: 'PLACEMENT_COORDINATOR',
    title: `📋 Drive Application: ${auth.user.name}`,
    message: `${auth.user.name} applied for ${drive.companyName} (${drive.roleTitle}).`,
    category: 'Placement',
    read: false,
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({
    application,
    eligibility: eligibilityEval
  });
}
