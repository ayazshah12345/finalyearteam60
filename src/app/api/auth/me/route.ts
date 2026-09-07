import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { User } from '@/types';

export async function GET() {
  const activeUser = dbStore.getActiveUser();
  const allUsers = dbStore.getUsers();
  return NextResponse.json({ activeUser, allUsers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password, rollNumber, identifier } = body;
    
    const allUsers = dbStore.getUsers();
    let targetUser: User | undefined = undefined;

    if (userId) {
      targetUser = dbStore.getUserById(userId);
    } else if (email) {
      targetUser = dbStore.getUserByEmail(email);
    } else if (rollNumber) {
      targetUser = allUsers.find(u => u.rollNumber?.toLowerCase() === rollNumber.trim().toLowerCase());
    } else if (identifier) {
      const term = identifier.trim().toLowerCase();
      targetUser = allUsers.find(u => 
        u.id === term || 
        u.email.toLowerCase() === term || 
        (u.rollNumber && u.rollNumber.toLowerCase() === term)
      );
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User record not found. Please check your credentials or click Sign Up if you are a new student.' }, { status: 404 });
    }

    // Faculty Credential Checks
    if (targetUser.role === 'FACULTY') {
      const expectedEmail = 'manivanan.vsb@gmail.com';
      const expectedPass = 'manivannan@vsb2027';

      if (!userId && email && email.trim().toLowerCase() !== expectedEmail) {
        return NextResponse.json({ error: 'Invalid faculty email address.' }, { status: 401 });
      }

      if (!userId && password && password !== expectedPass) {
        return NextResponse.json({ error: 'Incorrect faculty password.' }, { status: 401 });
      }
    }

    // Student Credential Checks
    if (targetUser.role === 'STUDENT') {
      if (!userId && targetUser.password) {
        if (!password) {
          return NextResponse.json({ error: 'Password is required to sign into your student account.' }, { status: 400 });
        }
        if (targetUser.password.trim() !== password.trim()) {
          return NextResponse.json({ error: 'Incorrect student password. Please check your password and try again.' }, { status: 401 });
        }
      }
    }

    const updatedUser = dbStore.setActiveUser(targetUser.id);

    dbStore.logAudit({
      id: `aud_${Date.now()}`,
      userId: targetUser.id,
      userName: targetUser.name,
      role: targetUser.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: targetUser.id,
      timestamp: new Date().toISOString(),
      details: `Authenticated user session for ${targetUser.name} (${targetUser.role})`
    });

    return NextResponse.json({ success: true, activeUser: updatedUser });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process login request.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const activeUser = dbStore.getActiveUser();
  if (!activeUser) {
    return NextResponse.json({ error: 'Unauthorized. Session missing.' }, { status: 401 });
  }

  const body = await req.json();
  const { studentId, name, cgpa, backlogs, department, semester, rollNumber, bio, avatarUrl } = body;
  const targetId = studentId || activeUser.id;

  const updates: any = {};
  if (name !== undefined && name.trim() !== '') updates.name = name;
  if (cgpa !== undefined && cgpa !== '') updates.cgpa = parseFloat(cgpa);
  if (backlogs !== undefined && backlogs !== '') updates.backlogs = parseInt(backlogs);
  if (department !== undefined && department.trim() !== '') updates.department = department;
  if (semester !== undefined && semester !== '') updates.semester = parseInt(semester);
  if (rollNumber !== undefined && rollNumber.trim() !== '') updates.rollNumber = rollNumber;
  if (bio !== undefined) updates.bio = bio;
  if (avatarUrl !== undefined && avatarUrl.trim() !== '') updates.avatarUrl = avatarUrl;

  const updatedUser = dbStore.updateUser(targetId, updates);

  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: activeUser.id,
    userName: activeUser.name,
    role: activeUser.role,
    action: 'PROFILE_UPDATE',
    entity: 'User',
    entityId: targetId,
    timestamp: new Date().toISOString(),
    details: `Updated student profile info for ${updatedUser?.name || targetId}. CGPA: ${updatedUser?.cgpa}, Arrears: ${updatedUser?.backlogs}`
  });

  return NextResponse.json({ success: true, user: updatedUser });
}
