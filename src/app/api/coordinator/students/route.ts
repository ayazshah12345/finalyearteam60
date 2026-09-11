import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { evaluateStudentEligibility } from '@/lib/eligibility';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = await authorizeRole(['FACULTY', 'PLACEMENT_COORDINATOR'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const activeUser = auth.user;
  
  // Sync legitimately registered students from PostgreSQL database (Supabase & Prisma)
  try {
    const { getSupabaseClient } = await import('@/lib/supabase/admin');
    const { parseStudentBio } = await import('@/lib/student-profile');
    const supabase = getSupabaseClient();
    const { data: supaStudents } = await supabase.from('User').select('*').eq('role', 'STUDENT');
    if (supaStudents && supaStudents.length > 0) {
      supaStudents.forEach((u: any) => {
        const parsed = parseStudentBio(u.bio);
        const formattedStudent = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: 'STUDENT' as const,
          department: u.department,
          batch: u.batch || '2022-2026',
          semester: u.semester || 6,
          rollNumber: u.rollNumber || undefined,
          avatarUrl: '/vsb-logo.png',
          cgpa: u.cgpa ?? 8.0,
          backlogs: u.backlogs ?? 0,
          bio: parsed.about || u.bio || 'VSB Student',
          phoneNumber: parsed.phoneNumber || undefined,
          parentName: parsed.parentName || undefined,
          parentPhone: parsed.parentPhone || undefined,
          bloodGroup: parsed.bloodGroup || undefined,
          currentYear: parsed.currentYear || undefined,
          classSection: parsed.classSection || undefined,
          createdAt: u.createdAt || new Date().toISOString()
        };
        const existing = dbStore.getUserById(u.id);
        if (!existing) {
          dbStore.addUser(formattedStudent);
        } else {
          dbStore.updateUser(u.id, formattedStudent);
        }
      });
    }
  } catch (e) {
    try {
      const { parseStudentBio } = await import('@/lib/student-profile');
      const dbStudents = await prisma.user.findMany({
        where: { role: 'STUDENT' }
      });
      dbStudents.forEach((u) => {
        const parsed = parseStudentBio(u.bio);
        const formattedStudent = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: 'STUDENT' as const,
          department: u.department,
          batch: u.batch || '2022-2026',
          semester: u.semester || 6,
          rollNumber: u.rollNumber || undefined,
          avatarUrl: '/vsb-logo.png',
          cgpa: u.cgpa ?? 8.0,
          backlogs: u.backlogs ?? 0,
          bio: parsed.about || u.bio || 'VSB Student',
          phoneNumber: parsed.phoneNumber || undefined,
          parentName: parsed.parentName || undefined,
          parentPhone: parsed.parentPhone || undefined,
          bloodGroup: parsed.bloodGroup || undefined,
          currentYear: parsed.currentYear || undefined,
          classSection: parsed.classSection || undefined,
          createdAt: u.createdAt.toISOString()
        };
        const existing = dbStore.getUserById(u.id);
        if (!existing) {
          dbStore.addUser(formattedStudent);
        } else {
          dbStore.updateUser(u.id, formattedStudent);
        }
      });
    } catch (pe) {
      // fallback
    }
  }

  // Get all registered students from dbStore
  const allUsers = dbStore.getUsers();
  const students = allUsers.filter((u) => u.role === 'STUDENT');

  // Get all quiz attempts & placement drives
  const allAttempts = dbStore.getAllQuizAttempts();
  const drives = dbStore.getPlacementDrives();
  const applications = dbStore.getApplications();

  // Combine rich student coordinator analytics
  const studentRecords = students.map((student) => {
    const studentAttempts = allAttempts.filter(att => att.studentId === student.id);
    
    const totalTestsAttended = studentAttempts.length;
    const passedTestsCount = studentAttempts.filter(att => att.passed).length;
    const terminatedTestsCount = studentAttempts.filter(att => att.terminated).length;
    const totalTabSwitches = studentAttempts.reduce((acc, att) => acc + (att.tabSwitchCount || 0), 0);

    const avgScorePercent = totalTestsAttended > 0
      ? Math.round(studentAttempts.reduce((acc, att) => acc + (att.percentage || 0), 0) / totalTestsAttended)
      : 0;

    const latestAttempt = studentAttempts.length > 0 ? studentAttempts[0] : null;

    // Check drive eligibility
    const eligibleDrivesCount = drives.filter(d => evaluateStudentEligibility(student, d.eligibility).isEligible).length;

    // Placement applications by student
    const studentApps = applications.filter(app => app.studentId === student.id);

    return {
      studentId: student.id,
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber || 'N/A',
      department: student.department,
      batch: student.batch || '2022-2026',
      semester: student.semester || 6,
      avatarUrl: '/vsb-logo.png',
      cgpa: student.cgpa ?? 8.0,
      backlogs: student.backlogs ?? 0,
      bio: student.bio,
      
      // Detailed Student Profile Records
      phoneNumber: student.phoneNumber || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      bloodGroup: student.bloodGroup || '',
      currentYear: student.currentYear || '',
      classSection: student.classSection || '',
      
      // Test Performance Records
      testPerformance: {
        totalTestsAttended,
        passedTestsCount,
        terminatedTestsCount,
        totalTabSwitches,
        avgScorePercent,
        latestAttempt
      },

      // Placement & Drive Records
      placementStats: {
        eligibleDrivesCount,
        totalDrivesCount: drives.length,
        appliedCount: studentApps.length,
        applications: studentApps
      }
    };
  });

  return NextResponse.json(
    {
      coordinator: activeUser,
      totalRegisteredStudents: students.length,
      studentRecords,
      drivesCount: drives.length
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    }
  );
}
