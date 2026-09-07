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
