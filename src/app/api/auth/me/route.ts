import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbStore } from '@/lib/db-store';
import { prisma } from '@/lib/prisma';
import { getSupabaseClient } from '@/lib/supabase/admin';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
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

  // 3. Inspect Session Cookie and Header to determine precise active user
  let activeUser: User | null = null;
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get('sgip_session_user_id')?.value;
    const headerUserId = req.headers.get('x-user-id');
    const url = new URL(req.url);
    const paramUserId = url.searchParams.get('userId');

    const targetId = paramUserId || headerUserId || sessionUserId;
    if (targetId) {
      let found = dbStore.getUserById(targetId);
      if (!found) {
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: targetId } });
          if (dbUser) {
            found = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role as any,
              department: dbUser.department,
              batch: dbUser.batch || '2022-2026',
              semester: dbUser.semester || 6,
              rollNumber: dbUser.rollNumber || undefined,
              avatarUrl: dbUser.avatarUrl || undefined,
              cgpa: dbUser.cgpa || 8.0,
              backlogs: dbUser.backlogs || 0,
              bio: dbUser.bio || 'VSB Student',
              createdAt: dbUser.createdAt.toISOString()
            };
            dbStore.addUser(found);
          }
        } catch (e) {}
      }

      if (found) {
        activeUser = found;
        dbStore.setActiveUser(found.id);
      }
    }
  } catch (cookieErr) {
    console.warn('Cookie reading warning:', cookieErr);
  }

  if (!activeUser) {
    activeUser = dbStore.getActiveUser();
  }

  const allUsers = dbStore.getUsers();
  const res = NextResponse.json({ activeUser, allUsers });

  // Ensure persistent cookie is refreshed
  if (activeUser) {
    res.cookies.set('sgip_session_user_id', activeUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: false
    });
    res.cookies.set('sgip_session_role', activeUser.role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: false
    });
  }

  return res;
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
      } catch (dbErr) {
        try {
          const supabase = getSupabaseClient();
          const term = (identifier || rollNumber || email || '').trim().toLowerCase();
          const { data: supaUsers } = await supabase.from('User').select('*');
          const found = supaUsers?.find((u: any) => 
            u.id === userId ||
            u.email?.toLowerCase() === term ||
            u.rollNumber?.toLowerCase() === term
          );
          if (found) {
            targetUser = {
              id: found.id,
              name: found.name,
              email: found.email,
              role: found.role,
              department: found.department,
              batch: found.batch || '2022-2026',
              semester: found.semester || 6,
              rollNumber: found.rollNumber || undefined,
              avatarUrl: found.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
              cgpa: found.cgpa || 8.0,
              backlogs: found.backlogs || 0,
              bio: found.bio || 'VSB Student',
              password: found.password || undefined,
              createdAt: found.createdAt || new Date().toISOString(),
            };
            dbStore.addUser(targetUser);
          }
        } catch (spErr) {
          console.warn('Supabase fallback error:', spErr);
        }
      }
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User record not found with the provided credentials.' }, { status: 404 });
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

    const res = NextResponse.json({ success: true, activeUser: updatedUser });
    
    // Set persistent session cookies for both Student and Faculty
    res.cookies.set('sgip_session_user_id', targetUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      httpOnly: false
    });
    res.cookies.set('sgip_session_role', targetUser.role, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      httpOnly: false
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Failed to process login request.' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set('sgip_session_user_id', '', { path: '/', maxAge: 0 });
  res.cookies.set('sgip_session_role', '', { path: '/', maxAge: 0 });
  return res;
}

export async function PUT(req: Request) {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('sgip_session_user_id')?.value;
  const headerUserId = req.headers.get('x-user-id');
  const targetSessionId = headerUserId || sessionUserId;

  let activeUser = targetSessionId ? dbStore.getUserById(targetSessionId) : null;
  if (!activeUser) {
    activeUser = dbStore.getActiveUser();
  }

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

  // Notify Faculty about student profile updates
  dbStore.addNotification({
    id: `notif_prof_${Date.now()}`,
    targetRole: 'FACULTY',
    title: `👤 Student Profile Updated: ${updatedUser?.name || targetId}`,
    message: `Student ${updatedUser?.name} updated profile. CGPA: ${updatedUser?.cgpa}, Arrears: ${updatedUser?.backlogs}, Dept: ${updatedUser?.department}`,
    category: 'System',
    read: false,
    createdAt: new Date().toISOString()
  });

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
