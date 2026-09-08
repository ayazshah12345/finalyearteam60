import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { evaluateStudentEligibility } from '@/lib/eligibility';

export async function GET(req: Request) {
  const auth = await authorizeRole(['FACULTY', 'PLACEMENT_COORDINATOR'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const activeUser = auth.user;
  
  // Get all registered students
  const allUsers = dbStore.getUsers();
  const students = allUsers.filter(u => u.role === 'STUDENT');

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
      avatarUrl: student.avatarUrl,
      cgpa: student.cgpa ?? 0,
      backlogs: student.backlogs ?? 0,
      bio: student.bio,
      
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

  return NextResponse.json({
    coordinator: activeUser,
    totalRegisteredStudents: students.length,
    studentRecords,
    drivesCount: drives.length
  });
}
