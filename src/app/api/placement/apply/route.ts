import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { evaluateStudentEligibility } from '@/lib/eligibility';

export async function POST(req: Request) {
  const auth = authorizeRole(['STUDENT']);
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

  return NextResponse.json({
    application,
    eligibility: eligibilityEval
  });
}
