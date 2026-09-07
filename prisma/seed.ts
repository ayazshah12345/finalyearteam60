import { PrismaClient } from '@prisma/client';
import {
  SEED_USERS,
  SEED_COURSES,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_QUESTIONS,
  SEED_QUIZZES,
  SEED_QUIZ_ATTEMPTS,
  SEED_DAILY_REPORTS,
  SEED_CODING_PROFILES,
  SEED_CODING_PROBLEMS,
  SEED_CODING_SUBMISSIONS,
  SEED_PORTFOLIO_ITEMS,
  SEED_RESUME,
  SEED_COMPANIES,
  SEED_PLACEMENT_DRIVES,
  SEED_APPLICATIONS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS
} from '../src/lib/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Users
  for (const user of SEED_USERS) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
        semester: user.semester,
        rollNumber: user.rollNumber,
        avatarUrl: user.avatarUrl,
        cgpa: user.cgpa,
        backlogs: user.backlogs,
        bio: user.bio,
      },
    });
  }
  console.log('✅ Users seeded');

  // Courses
  for (const course of SEED_COURSES) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        instructorId: course.instructorId,
        instructorName: course.instructorName,
        department: course.department,
        durationHours: course.durationHours,
        difficulty: course.difficulty,
        coverImage: course.coverImage,
        published: course.published,
        learningObjectives: course.learningObjectives,
        skillsGained: course.skillsGained,
      },
    });
  }
  console.log('✅ Courses seeded');

  // Companies & Placement Drives
  for (const comp of SEED_COMPANIES) {
    await prisma.company.upsert({
      where: { id: comp.id },
      update: {},
      create: {
        id: comp.id,
        name: comp.name,
        logoUrl: comp.logoUrl,
        website: comp.website,
        location: comp.location,
        industry: comp.industry,
        about: comp.about,
      },
    });
  }

  for (const drive of SEED_PLACEMENT_DRIVES) {
    await prisma.placementDrive.upsert({
      where: { id: drive.id },
      update: {},
      create: {
        id: drive.id,
        companyId: drive.companyId,
        companyName: drive.companyName,
        companyLogoUrl: drive.companyLogoUrl,
        roleTitle: drive.roleTitle,
        packageLPA: drive.packageLPA,
        location: drive.location,
        jobDescription: drive.jobDescription,
        driveDate: new Date(drive.driveDate),
        deadlineDate: new Date(drive.deadlineDate),
        minCgpa: drive.eligibility.minCgpa,
        maxBacklogs: drive.eligibility.maxBacklogs,
        allowedDepts: drive.eligibility.allowedDepartments,
        published: drive.published,
      },
    });
  }
  console.log('✅ Placement Drives seeded');

  // Coding Profiles
  for (const cp of SEED_CODING_PROFILES) {
    const userExists = await prisma.user.findUnique({ where: { id: cp.studentId } });
    if (userExists) {
      await prisma.codingProfile.upsert({
        where: { studentId: cp.studentId },
        update: {},
        create: {
          id: cp.id,
          studentId: cp.studentId,
          leetcodeUsername: cp.leetcodeUsername,
          leetcodeSolved: cp.totalSolved,
          easyCount: cp.easyCount,
          mediumCount: cp.mediumCount,
          hardCount: cp.hardCount,
          leetcodeRating: cp.contestRating,
          streakDays: cp.streakDays,
          verificationStatus: cp.verificationStatus,
        },
      });
    }
  }
  console.log('✅ Coding Profiles seeded');

  // Coding Problems
  for (const prob of SEED_CODING_PROBLEMS) {
    await prisma.codingProblem.upsert({
      where: { slug: prob.slug },
      update: {},
      create: {
        id: prob.id,
        title: prob.title,
        slug: prob.slug,
        difficulty: prob.difficulty,
        topics: prob.topics,
        description: prob.description,
        constraints: prob.constraints,
        starterCodeJson: prob.starterCode as any,
        sampleCasesJson: prob.sampleCases as any,
      },
    });
  }
  console.log('✅ Coding Problems seeded');

  // Coding Submissions
  for (const sub of SEED_CODING_SUBMISSIONS) {
    const userExists = await prisma.user.findUnique({ where: { id: sub.studentId } });
    if (userExists) {
      await prisma.codingSubmission.upsert({
        where: { id: sub.id },
        update: {},
        create: {
          id: sub.id,
          studentId: sub.studentId,
          studentName: sub.studentName,
          problemId: sub.problemId,
          problemTitle: sub.problemTitle,
          language: sub.language,
          code: sub.code,
          status: sub.status,
          testCasesPassed: sub.testCasesPassed,
          totalTestCases: sub.totalTestCases,
          executionTimeMs: sub.executionTimeMs,
        },
      });
    }
  }
  console.log('✅ Coding Submissions seeded');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
