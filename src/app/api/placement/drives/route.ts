import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function GET() {
  const drives = dbStore.getPlacementDrives();
  const companies = dbStore.getCompanies();
  return NextResponse.json({ drives, companies });
}

export async function POST(req: Request) {
  const auth = authorizeRole(['PLACEMENT_COORDINATOR', 'FACULTY']);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();
  const newDrive = {
    id: `drv_${Date.now()}`,
    companyId: body.companyId || 'cmp_google',
    companyName: body.companyName || 'Google Cloud India',
    companyLogoUrl: body.companyLogoUrl || 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
    roleTitle: body.roleTitle,
    jobDescription: body.jobDescription || 'Full Stack SDE role.',
    packageLPA: parseFloat(body.packageLPA || '20.0'),
    location: body.location || 'Pan India',
    driveDate: body.driveDate || '2026-09-01',
    deadlineDate: body.deadlineDate || '2026-08-25',
    eligibility: {
      minCgpa: parseFloat(body.minCgpa || '7.5'),
      maxBacklogs: parseInt(body.maxBacklogs || '0'),
      allowedDepartments: body.allowedDepartments || ['Computer Science & Engineering', 'AI & Data Science'],
      graduationYear: body.graduationYear || '2026',
      requiredSkills: body.requiredSkills || ['DSA', 'Python', 'SQL']
    },
    published: true,
    createdAt: new Date().toISOString()
  };

  dbStore.addPlacementDrive(newDrive);

  // Notify students
  dbStore.addNotification({
    id: `nt_drv_${Date.now()}`,
    targetRole: 'STUDENT',
    title: 'New Placement Drive Published',
    message: `${newDrive.companyName} launched drive for ${newDrive.roleTitle} (${newDrive.packageLPA} LPA). Check eligibility now!`,
    category: 'Placement',
    read: false,
    createdAt: new Date().toISOString()
  });

  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: auth.user.id,
    userName: auth.user.name,
    role: auth.user.role,
    action: 'CREATE_PLACEMENT_DRIVE',
    entity: 'PlacementDrive',
    entityId: newDrive.id,
    timestamp: new Date().toISOString(),
    details: `Created drive for ${newDrive.companyName} (${newDrive.packageLPA} LPA, min CGPA ${newDrive.eligibility.minCgpa})`
  });

  return NextResponse.json({ drive: newDrive });
}
