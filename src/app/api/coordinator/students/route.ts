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
        const normRoll = (u.rollNumber || '').trim().toUpperCase();
        const normEmail = (u.email || '').trim().toLowerCase();
        const existing = dbStore.getUserById(u.id) ||
          (normEmail ? dbStore.getUserByEmail(normEmail) : undefined) ||
          (normRoll && normRoll !== 'N/A' ? dbStore.getUsers().find(x => x.rollNumber && x.rollNumber.trim().toUpperCase() === normRoll) : undefined);

        if (!existing) {
          dbStore.addUser(formattedStudent);
        } else {
          dbStore.updateUser(existing.id, formattedStudent);
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
        const normRoll = (u.rollNumber || '').trim().toUpperCase();
        const normEmail = (u.email || '').trim().toLowerCase();
        const existing = dbStore.getUserById(u.id) ||
          (normEmail ? dbStore.getUserByEmail(normEmail) : undefined) ||
          (normRoll && normRoll !== 'N/A' ? dbStore.getUsers().find(x => x.rollNumber && x.rollNumber.trim().toUpperCase() === normRoll) : undefined);

        if (!existing) {
          dbStore.addUser(formattedStudent);
        } else {
          dbStore.updateUser(existing.id, formattedStudent);
        }
      });
    } catch (pe) {
      // fallback
    }
  }

  // Get all registered students from dbStore
  const allUsers = dbStore.getUsers();
  const rawStudents = allUsers.filter((u) => u.role === 'STUDENT');

  // Deduplicate raw students by Roll Number, Email, and Name
  const uniqueStudentMap = new Map<string, any>();
  const rollIndex = new Map<string, any>();
  const emailIndex = new Map<string, any>();
  const nameDeptIndex = new Map<string, any>();
  const idIndex = new Map<string, any>();

  for (const st of rawStudents) {
    const roll = (st.rollNumber || '').trim().toUpperCase();
    const hasValidRoll = roll && roll !== 'N/A';
    const email = (st.email || '').trim().toLowerCase();
    const nameDept = `${(st.name || '').trim().toLowerCase()}_${(st.department || '').trim().toLowerCase()}`;
    const id = (st.id || '').trim();

    let target = (hasValidRoll ? rollIndex.get(roll) : undefined) ||
                 (email ? emailIndex.get(email) : undefined) ||
                 (id ? idIndex.get(id) : undefined) ||
                 (nameDept ? nameDeptIndex.get(nameDept) : undefined);

    if (!target) {
      target = { ...st };
      uniqueStudentMap.set(id || roll || email || nameDept, target);
    } else {
      // Merge records - keep the most updated / richer values
      if (hasValidRoll) target.rollNumber = st.rollNumber;
      if (email && !target.email) target.email = st.email;
      if (st.phoneNumber) target.phoneNumber = st.phoneNumber;
      if (st.parentName) target.parentName = st.parentName;
      if (st.parentPhone) target.parentPhone = st.parentPhone;
      if (st.bloodGroup) target.bloodGroup = st.bloodGroup;
      if (st.currentYear) target.currentYear = st.currentYear;
      if (st.classSection) target.classSection = st.classSection;
      if (st.bio && (!target.bio || st.bio.length > target.bio.length)) target.bio = st.bio;
      if (st.semester && (!target.semester || st.semester > target.semester)) target.semester = st.semester;
      if (st.batch && (!target.batch || target.batch === '2022-2026')) target.batch = st.batch;
      if (st.cgpa !== undefined) target.cgpa = st.cgpa;
      if (st.backlogs !== undefined) target.backlogs = st.backlogs;
    }

    if (hasValidRoll) rollIndex.set(roll, target);
    if ((target.rollNumber || '').trim().toUpperCase() && (target.rollNumber || '').trim().toUpperCase() !== 'N/A') {
      rollIndex.set((target.rollNumber || '').trim().toUpperCase(), target);
    }
    if (email) emailIndex.set(email, target);
    if ((target.email || '').trim().toLowerCase()) {
      emailIndex.set((target.email || '').trim().toLowerCase(), target);
    }
    if (nameDept) nameDeptIndex.set(nameDept, target);
    if (id) idIndex.set(id, target);
  }

  const students = Array.from(uniqueStudentMap.values());

  // Get all quiz attempts & placement drives
  const allAttempts = dbStore.getAllQuizAttempts();
  const drives = dbStore.getPlacementDrives();
  const applications = dbStore.getApplications();

  // Combine rich student coordinator analytics
  const studentRecords = students.map((student) => {
    const studentAttempts = allAttempts.filter(att => 
      att.studentId === student.id || 
      (student.name && att.studentName && att.studentName.toLowerCase().includes(student.name.toLowerCase()))
    );
    
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

  // Sort student records by Register Number ascending (natural alphanumeric order)
  studentRecords.sort((a, b) => {
    const rollA = (a.rollNumber || '').trim();
    const rollB = (b.rollNumber || '').trim();
    const hasRollA = rollA && rollA.toUpperCase() !== 'N/A';
    const hasRollB = rollB && rollB.toUpperCase() !== 'N/A';

    if (hasRollA && hasRollB) {
      return rollA.localeCompare(rollB, undefined, { numeric: true, sensitivity: 'base' });
    }
    if (hasRollA) return -1;
    if (hasRollB) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  return NextResponse.json(
    {
      coordinator: activeUser,
      totalRegisteredStudents: studentRecords.length,
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
