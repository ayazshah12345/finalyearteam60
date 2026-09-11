import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { prisma } from '@/lib/prisma';
import { getSupabaseClient } from '@/lib/supabase/admin';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      rollNumber,
      department,
      cgpa,
      backlogs,
      password,
      semester,
      batch,
      bio,
      phoneNumber,
      parentName,
      parentPhone,
      bloodGroup,
      currentYear,
      classSection
    } = body;

    if (!name || !email || !rollNumber) {
      return NextResponse.json({ error: 'Name, Email, and Roll Number are required fields.' }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedRoll = rollNumber.trim().toUpperCase();

    // Check existing email or roll number in Supabase PostgreSQL
    try {
      const existingDbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: trimmedEmail },
            { rollNumber: trimmedRoll }
          ]
        }
      });

      if (existingDbUser) {
        if (existingDbUser.email === trimmedEmail) {
          return NextResponse.json({ error: 'A student account with this email already exists.' }, { status: 400 });
        }
        return NextResponse.json({ error: 'A student account with this Roll Number already exists.' }, { status: 400 });
      }
    } catch (e) {
      console.warn('Prisma database check warning:', e);
    }

    const allUsers = dbStore.getUsers();
    const existingEmail = allUsers.find(u => u.email.toLowerCase() === trimmedEmail);
    if (existingEmail) {
      return NextResponse.json({ error: 'A student account with this email already exists.' }, { status: 400 });
    }

    const existingRoll = allUsers.find(u => u.rollNumber && u.rollNumber.toUpperCase() === trimmedRoll);
    if (existingRoll) {
      return NextResponse.json({ error: 'A student account with this Roll Number already exists.' }, { status: 400 });
    }

    const newStudentId = `usr_student_${Date.now()}`;
    const parsedCgpa = cgpa !== undefined && cgpa !== '' ? parseFloat(cgpa) : 8.0;
    const parsedBacklogs = backlogs !== undefined && backlogs !== '' ? parseInt(backlogs) : 0;

    const { packStudentBio } = await import('@/lib/student-profile');
    const packedBio = packStudentBio({
      about: bio || 'VSB Engineering College Student',
      phoneNumber: phoneNumber || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      bloodGroup: bloodGroup || 'O+',
      currentYear: currentYear || '3rd Year',
      classSection: classSection || 'AI & DS - A'
    });

    const newStudent: User = {
      id: newStudentId,
      name: name.trim(),
      email: trimmedEmail,
      role: 'STUDENT',
      department: department || 'Computer Science & Engineering',
      rollNumber: trimmedRoll,
      semester: semester ? parseInt(semester) : 6,
      batch: batch || '2022-2026',
      cgpa: parsedCgpa,
      backlogs: parsedBacklogs,
      bio: packedBio,
      phoneNumber: phoneNumber || '',
      parentName: parentName || '',
      parentPhone: parentPhone || '',
      bloodGroup: bloodGroup || 'O+',
      currentYear: currentYear || '3rd Year',
      classSection: classSection || 'AI & DS - A',
      avatarUrl: '/vsb-logo.png',
      password: password || 'password123',
      skills: ['Python', 'Data Structures', 'Web Development'],
      xp: 250,
      level: 1,
      streak: 1,
      createdAt: new Date().toISOString()
    };

    // 🌟 1. Insert into Supabase via Prisma ORM
    try {
      await prisma.user.create({
        data: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          role: 'STUDENT',
          department: newStudent.department,
          batch: newStudent.batch,
          semester: newStudent.semester,
          rollNumber: newStudent.rollNumber,
          avatarUrl: newStudent.avatarUrl,
          cgpa: newStudent.cgpa,
          backlogs: newStudent.backlogs,
          bio: newStudent.bio,
          password: newStudent.password,
        }
      });
      console.log('✅ Student successfully stored in Supabase PostgreSQL via Prisma:', newStudent.name);
    } catch (dbErr) {
      console.error('Prisma insert warning, trying Supabase JS Client:', dbErr);
      
      // 🌟 2. Direct Fallback via Supabase JS SDK
      try {
        const supabase = getSupabaseClient();
        await supabase.from('User').insert([{
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          role: 'STUDENT',
          department: newStudent.department,
          batch: newStudent.batch,
          semester: newStudent.semester,
          rollNumber: newStudent.rollNumber,
          avatarUrl: newStudent.avatarUrl,
          cgpa: newStudent.cgpa,
          backlogs: newStudent.backlogs,
          bio: newStudent.bio,
          password: newStudent.password,
        }]);
        console.log('✅ Student successfully stored via Supabase JS Client:', newStudent.name);
      } catch (spErr) {
        console.error('Supabase JS Client insert fallback:', spErr);
      }
    }

    // Save student in Database Store
    dbStore.addUser(newStudent);

    // Set as currently active session
    dbStore.setActiveUser(newStudent.id);

    // Log Audit Event
    dbStore.logAudit({
      id: `aud_${Date.now()}`,
      userId: newStudent.id,
      userName: newStudent.name,
      role: 'STUDENT',
      action: 'STUDENT_REGISTERED',
      entity: 'User',
      entityId: newStudent.id,
      timestamp: new Date().toISOString(),
      details: `New student self-registered. Name: ${newStudent.name}, Roll: ${newStudent.rollNumber}, CGPA: ${newStudent.cgpa}, Backlogs: ${newStudent.backlogs}`
    });

    // Notify Faculty of new student registration
    dbStore.addNotification({
      id: `notif_reg_${Date.now()}`,
      targetRole: 'FACULTY',
      title: `🎓 New Student Registered: ${newStudent.name}`,
      message: `Student ${newStudent.name} (${newStudent.rollNumber}, ${newStudent.department}) created an account. CGPA: ${newStudent.cgpa}, Backlogs: ${newStudent.backlogs}`,
      category: 'System',
      read: false,
      createdAt: new Date().toISOString()
    });

    const res = NextResponse.json({ success: true, activeUser: newStudent });
    res.cookies.set('sgip_session_user_id', newStudent.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: false
    });
    res.cookies.set('sgip_session_role', 'STUDENT', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: false
    });
    return res;
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to process student registration.' }, { status: 500 });
  }
}
