import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { User } from '@/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, rollNumber, department, cgpa, backlogs, password, semester, batch, bio, avatarUrl } = body;

    if (!name || !email || !rollNumber) {
      return NextResponse.json({ error: 'Name, Email, and Roll Number are required fields.' }, { status: 400 });
    }

    const allUsers = dbStore.getUsers();

    // Check existing email or roll number
    const existingEmail = allUsers.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existingEmail) {
      return NextResponse.json({ error: 'A student account with this email already exists.' }, { status: 400 });
    }

    const existingRoll = allUsers.find(u => u.rollNumber && u.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase());
    if (existingRoll) {
      return NextResponse.json({ error: 'A student account with this Roll Number already exists.' }, { status: 400 });
    }

    const newStudentId = `usr_student_${Date.now()}`;
    const parsedCgpa = cgpa !== undefined && cgpa !== '' ? parseFloat(cgpa) : 8.0;
    const parsedBacklogs = backlogs !== undefined && backlogs !== '' ? parseInt(backlogs) : 0;

    const newStudent: User = {
      id: newStudentId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'STUDENT',
      department: department || 'Computer Science & Engineering',
      rollNumber: rollNumber.trim().toUpperCase(),
      semester: semester ? parseInt(semester) : 6,
      batch: batch || '2022-2026',
      cgpa: parsedCgpa,
      backlogs: parsedBacklogs,
      bio: bio || 'VSB Engineering College Student',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      password: password || 'password123',
      skills: ['Python', 'Data Structures', 'Web Development'],
      xp: 250,
      level: 1,
      streak: 1,
      createdAt: new Date().toISOString()
    };

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

    return NextResponse.json({ success: true, activeUser: newStudent });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to process student registration.' }, { status: 500 });
  }
}
