import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { prisma } from '@/lib/prisma';
import { getSupabaseClient } from '@/lib/supabase/admin';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  // 1. Sync from Supabase via Prisma ORM
  try {
    const dbUsers = await prisma.user.findMany();
    if (dbUsers && dbUsers.length > 0) {
      dbUsers.forEach((u) => {
        const formattedUser: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          department: u.department,
          batch: u.batch || '2022-2026',
          semester: u.semester || 6,
          rollNumber: u.rollNumber || undefined,
          avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          cgpa: u.cgpa || 8.0,
          backlogs: u.backlogs || 0,
          bio: u.bio || 'VSB Student',
          password: u.password || undefined,
          createdAt: u.createdAt.toISOString(),
        };
        if (!dbStore.getUserById(u.id)) {
          dbStore.addUser(formattedUser);
        }
      });
    }
  } catch (e) {
    // 2. Fallback: Sync via Supabase JS SDK
    try {
      const supabase = getSupabaseClient();
      const { data: supaUsers } = await supabase.from('User').select('*');
      if (supaUsers && supaUsers.length > 0) {
        supaUsers.forEach((u: any) => {
          const formattedUser: User = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            department: u.department,
            batch: u.batch || '2022-2026',
            semester: u.semester || 6,
            rollNumber: u.rollNumber || undefined,
            avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            cgpa: u.cgpa || 8.0,
            backlogs: u.backlogs || 0,
            bio: u.bio || 'VSB Student',
            password: u.password || undefined,
            createdAt: u.createdAt || new Date().toISOString(),
          };
          if (!dbStore.getUserById(u.id)) {
            dbStore.addUser(formattedUser);
          }
        });
      }
    } catch (spErr) {
      console.warn('Supabase JS SDK fallback GET:', spErr);
    }
  }

  const activeUser = dbStore.getActiveUser();
  const allUsers = dbStore.getUsers();
  return NextResponse.json({ activeUser, allUsers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email, password, rollNumber, identifier } = body;
    
    let allUsers = dbStore.getUsers();
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

    // Fallback: Search directly in Supabase PostgreSQL via Prisma or Supabase SDK
    if (!targetUser) {
      try {
        const term = (identifier || rollNumber || email || '').trim().toLowerCase();
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId || '' },
              { email: term },
              { rollNumber: term.toUpperCase() }
            ]
          }
        });

        if (dbUser) {
          targetUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role as any,
            department: dbUser.department,
            batch: dbUser.batch || '2022-2026',
            semester: dbUser.semester || 6,
            rollNumber: dbUser.rollNumber || undefined,
            avatarUrl: dbUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
            cgpa: dbUser.cgpa || 8.0,
            backlogs: dbUser.backlogs || 0,
            bio: dbUser.bio || 'VSB Student',
            password: dbUser.password || undefined,
            createdAt: dbUser.createdAt.toISOString(),
          };
          dbStore.addUser(targetUser);
        }
      } catch (e) {
        console.warn('Prisma POST login search warning:', e);
      }
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

  // Sync profile update with Supabase PostgreSQL via Prisma & Supabase SDK
  try {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.cgpa !== undefined) dbUpdates.cgpa = updates.cgpa;
    if (updates.backlogs !== undefined) dbUpdates.backlogs = updates.backlogs;
    if (updates.department) dbUpdates.department = updates.department;
    if (updates.semester !== undefined) dbUpdates.semester = updates.semester;
    if (updates.rollNumber) dbUpdates.rollNumber = updates.rollNumber;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.avatarUrl) dbUpdates.avatarUrl = updates.avatarUrl;

    await prisma.user.update({
      where: { id: targetId },
      data: dbUpdates
    });
  } catch (e) {
    try {
      const supabase = getSupabaseClient();
      await supabase.from('User').update(updates).eq('id', targetId);
    } catch (spErr) {
      console.warn('Supabase JS SDK update fallback:', spErr);
    }
  }

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
