import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { dbStore } from '@/lib/db-store';
import { prisma } from '@/lib/prisma';
import { getSupabaseClient } from '@/lib/supabase/admin';
import { User } from '@/types';

export const dynamic = 'force-dynamic';

import { parseStudentBio } from '@/lib/student-profile';

export async function GET(req: Request) {
  // 1. Sync from Supabase via Prisma ORM or Supabase Client
  try {
    const supabase = getSupabaseClient();
    const { data: supaUsers } = await supabase.from('User').select('*');
    if (supaUsers && supaUsers.length > 0) {
      supaUsers.forEach((u: any) => {
        const parsed = parseStudentBio(u.bio);
        const formattedUser: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          department: u.department,
          batch: u.batch || '2022-2026',
          semester: u.semester || 6,
          rollNumber: u.rollNumber || undefined,
          avatarUrl: u.role === 'STUDENT' ? '/vsb-logo.png' : (u.avatarUrl || '/vsb-logo.png'),
          cgpa: u.cgpa ?? 8.0,
          backlogs: u.backlogs ?? 0,
          bio: parsed.about || u.bio || 'VSB Student',
          phoneNumber: parsed.phoneNumber || undefined,
          parentName: parsed.parentName || undefined,
          parentPhone: parsed.parentPhone || undefined,
          bloodGroup: parsed.bloodGroup || undefined,
          currentYear: parsed.currentYear || undefined,
          classSection: parsed.classSection || undefined,
          password: u.password || undefined,
          createdAt: u.createdAt || new Date().toISOString(),
        };
        const existing = dbStore.getUserById(u.id);
        if (!existing) {
          dbStore.addUser(formattedUser);
        } else {
          dbStore.updateUser(u.id, formattedUser);
        }
      });
    }
  } catch (e) {
    // Fallback: sync via Prisma
    try {
      const dbUsers = await prisma.user.findMany();
      if (dbUsers && dbUsers.length > 0) {
        dbUsers.forEach((u) => {
          const parsed = parseStudentBio(u.bio);
          const formattedUser: User = {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role as any,
            department: u.department,
            batch: u.batch || '2022-2026',
            semester: u.semester || 6,
            rollNumber: u.rollNumber || undefined,
            avatarUrl: u.role === 'STUDENT' ? '/vsb-logo.png' : (u.avatarUrl || '/vsb-logo.png'),
            cgpa: u.cgpa ?? 8.0,
            backlogs: u.backlogs ?? 0,
            bio: parsed.about || u.bio || 'VSB Student',
            phoneNumber: parsed.phoneNumber || undefined,
            parentName: parsed.parentName || undefined,
            parentPhone: parsed.parentPhone || undefined,
            bloodGroup: parsed.bloodGroup || undefined,
            currentYear: parsed.currentYear || undefined,
            classSection: parsed.classSection || undefined,
            password: u.password || undefined,
            createdAt: u.createdAt.toISOString(),
          };
          const existing = dbStore.getUserById(u.id);
          if (!existing) {
            dbStore.addUser(formattedUser);
          } else {
            dbStore.updateUser(u.id, formattedUser);
          }
        });
      }
    } catch (pe) {}
  }

  // 2. Inspect Session Cookie and Header to determine precise active user
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
          const supabase = getSupabaseClient();
          const { data: supaUser } = await supabase.from('User').select('*').eq('id', targetId).single();
          if (supaUser) {
            const parsed = parseStudentBio(supaUser.bio);
            found = {
              id: supaUser.id,
              name: supaUser.name,
              email: supaUser.email,
              role: supaUser.role as any,
              department: supaUser.department,
              batch: supaUser.batch || '2022-2026',
              semester: supaUser.semester || 6,
              rollNumber: supaUser.rollNumber || undefined,
              avatarUrl: supaUser.role === 'STUDENT' ? '/vsb-logo.png' : (supaUser.avatarUrl || '/vsb-logo.png'),
              cgpa: supaUser.cgpa ?? 8.0,
              backlogs: supaUser.backlogs ?? 0,
              bio: parsed.about || supaUser.bio || 'VSB Student',
              phoneNumber: parsed.phoneNumber || undefined,
              parentName: parsed.parentName || undefined,
              parentPhone: parsed.parentPhone || undefined,
              bloodGroup: parsed.bloodGroup || undefined,
              currentYear: parsed.currentYear || undefined,
              classSection: parsed.classSection || undefined,
              createdAt: supaUser.createdAt || new Date().toISOString()
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

    if (!targetUser) {
      try {
        const supabase = getSupabaseClient();
        let query = supabase.from('User').select('*');
        if (email) query = query.ilike('email', email.trim());
        else if (rollNumber) query = query.ilike('rollNumber', rollNumber.trim());
        else if (identifier) query = query.or(`email.ilike.${identifier.trim()},rollNumber.ilike.${identifier.trim()}`);
        
        const { data: supaUser } = await query.limit(1).maybeSingle();
        if (supaUser) {
          const parsed = parseStudentBio(supaUser.bio);
          targetUser = {
            id: supaUser.id,
            name: supaUser.name,
            email: supaUser.email,
            role: supaUser.role as any,
            department: supaUser.department,
            batch: supaUser.batch || '2022-2026',
            semester: supaUser.semester || 6,
            rollNumber: supaUser.rollNumber || undefined,
            avatarUrl: supaUser.role === 'STUDENT' ? '/vsb-logo.png' : (supaUser.avatarUrl || '/vsb-logo.png'),
            cgpa: supaUser.cgpa ?? 8.0,
            backlogs: supaUser.backlogs ?? 0,
            bio: parsed.about || supaUser.bio || 'VSB Student',
            phoneNumber: parsed.phoneNumber || undefined,
            parentName: parsed.parentName || undefined,
            parentPhone: parsed.parentPhone || undefined,
            bloodGroup: parsed.bloodGroup || undefined,
            currentYear: parsed.currentYear || undefined,
            classSection: parsed.classSection || undefined,
            password: supaUser.password || undefined,
            createdAt: supaUser.createdAt || new Date().toISOString()
          };
          dbStore.addUser(targetUser);
        }
      } catch (e) {}
    }

    if (!targetUser) {
      return NextResponse.json({ error: 'User account not found. Please register or check credentials.' }, { status: 404 });
    }

    if (password && targetUser.password && targetUser.password !== password) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    dbStore.setActiveUser(targetUser.id);

    const res = NextResponse.json({
      success: true,
      activeUser: targetUser,
      message: `Signed in as ${targetUser.name} (${targetUser.role})`
    });

    res.cookies.set('sgip_session_user_id', targetUser.id, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
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
  } catch (err: any) {
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
  const body = await req.json();

  const {
    studentId,
    email,
    name,
    cgpa,
    backlogs,
    department,
    semester,
    rollNumber,
    batch,
    phoneNumber,
    parentName,
    parentPhone,
    bloodGroup,
    currentYear,
    classSection,
    bio
  } = body;

  const targetSessionId = studentId || headerUserId || sessionUserId;
  const supabase = getSupabaseClient();

  // 1. Locate student in PostgreSQL Supabase directly
  let supaUser: any = null;
  try {
    if (targetSessionId) {
      const { data } = await supabase.from('User').select('*').eq('id', targetSessionId).maybeSingle();
      if (data) supaUser = data;
    }
    if (!supaUser && email) {
      const { data } = await supabase.from('User').select('*').ilike('email', email.trim()).maybeSingle();
      if (data) supaUser = data;
    }
    if (!supaUser && rollNumber) {
      const { data } = await supabase.from('User').select('*').ilike('rollNumber', rollNumber.trim()).maybeSingle();
      if (data) supaUser = data;
    }
  } catch (e) {
    console.warn('Supabase initial lookup error:', e);
  }

  // 2. Locate student in in-memory dbStore as fallback context
  let localUser = targetSessionId ? dbStore.getUserById(targetSessionId) : null;
  if (!localUser && email) localUser = dbStore.getUserByEmail(email);
  if (!localUser && supaUser) {
    localUser = {
      id: supaUser.id,
      name: supaUser.name,
      email: supaUser.email,
      role: supaUser.role as any,
      department: supaUser.department,
      batch: supaUser.batch || '2022-2026',
      semester: supaUser.semester || 6,
      rollNumber: supaUser.rollNumber,
      avatarUrl: '/vsb-logo.png',
      cgpa: supaUser.cgpa ?? 8.0,
      backlogs: supaUser.backlogs ?? 0,
      bio: supaUser.bio,
      createdAt: supaUser.createdAt || new Date().toISOString()
    };
    dbStore.addUser(localUser);
  }

  if (!localUser && !supaUser) {
    localUser = dbStore.getActiveUser();
  }

  const existingBio = parseStudentBio(supaUser?.bio || localUser?.bio);

  const studentDetails = {
    about: bio !== undefined ? bio : existingBio.about,
    phoneNumber: phoneNumber !== undefined ? phoneNumber : (localUser?.phoneNumber || existingBio.phoneNumber),
    parentName: parentName !== undefined ? parentName : (localUser?.parentName || existingBio.parentName),
    parentPhone: parentPhone !== undefined ? parentPhone : (localUser?.parentPhone || existingBio.parentPhone),
    bloodGroup: bloodGroup !== undefined ? bloodGroup : (localUser?.bloodGroup || existingBio.bloodGroup),
    currentYear: currentYear !== undefined ? currentYear : (localUser?.currentYear || existingBio.currentYear),
    classSection: classSection !== undefined ? classSection : (localUser?.classSection || existingBio.classSection)
  };

  const packedBio = JSON.stringify(studentDetails);

  const parsedCgpa = cgpa !== undefined && cgpa !== '' ? parseFloat(cgpa) : (supaUser?.cgpa ?? localUser?.cgpa ?? 8.0);
  const parsedBacklogs = backlogs !== undefined && backlogs !== '' ? parseInt(backlogs) : (supaUser?.backlogs ?? localUser?.backlogs ?? 0);
  const parsedSemester = semester !== undefined && semester !== '' ? parseInt(semester) : (supaUser?.semester ?? localUser?.semester ?? 6);

  const dbUpdatePayload: any = {
    name: (name !== undefined && name.trim() !== '') ? name.trim() : (supaUser?.name || localUser?.name),
    department: (department !== undefined && department.trim() !== '') ? department.trim() : (supaUser?.department || localUser?.department || 'AI & Data Science'),
    rollNumber: (rollNumber !== undefined && rollNumber.trim() !== '') ? rollNumber.trim() : (supaUser?.rollNumber || localUser?.rollNumber),
    semester: parsedSemester,
    batch: (batch !== undefined && batch.trim() !== '') ? batch.trim() : (supaUser?.batch || localUser?.batch || '2022-2026'),
    cgpa: parsedCgpa,
    backlogs: parsedBacklogs,
    bio: packedBio,
    avatarUrl: '/vsb-logo.png',
    updatedAt: new Date().toISOString()
  };

  let savedSupabaseUser = null;

  // 3. Save directly to Supabase PostgreSQL database
  try {
    if (supaUser) {
      const { data: updatedData, error: updateErr } = await supabase
        .from('User')
        .update(dbUpdatePayload)
        .eq('id', supaUser.id)
        .select()
        .single();

      if (updateErr) {
        console.error('Supabase update error:', updateErr);
        throw new Error(updateErr.message);
      }
      savedSupabaseUser = updatedData;
    } else {
      // User not yet in Supabase table - insert as registered student
      const newUserId = targetSessionId || `usr_student_${Date.now()}`;
      const insertPayload = {
        id: newUserId,
        email: email || localUser?.email || 'student@vsb.ac.in',
        role: 'STUDENT',
        ...dbUpdatePayload,
        createdAt: new Date().toISOString()
      };
      const { data: insertedData, error: insertErr } = await supabase
        .from('User')
        .insert(insertPayload)
        .select()
        .single();

      if (insertErr) {
        console.error('Supabase insert error:', insertErr);
        throw new Error(insertErr.message);
      }
      savedSupabaseUser = insertedData;
    }

    // Also record profile update in PostgreSQL AuditLog
    await supabase.from('AuditLog').insert({
      id: `prof_upd_${Date.now()}`,
      userId: savedSupabaseUser?.id || targetSessionId,
      userName: dbUpdatePayload.name,
      role: 'STUDENT',
      action: 'PROFILE_UPDATED',
      details: JSON.stringify({
        ...studentDetails,
        ...dbUpdatePayload
      }),
      timestamp: new Date().toISOString()
    });
  } catch (dbErr: any) {
    console.error('Database persistence failure:', dbErr);
    return NextResponse.json({
      error: `Failed to save changes to database: ${dbErr?.message || 'Unknown database error'}`
    }, { status: 500 });
  }

  // 4. Update in-memory dbStore with the exact saved record
  const finalUserId = savedSupabaseUser?.id || supaUser?.id || localUser?.id || targetSessionId;
  const formattedUser: User = {
    id: finalUserId,
    name: dbUpdatePayload.name,
    email: savedSupabaseUser?.email || supaUser?.email || localUser?.email || email,
    role: 'STUDENT',
    department: dbUpdatePayload.department,
    batch: dbUpdatePayload.batch,
    semester: dbUpdatePayload.semester,
    rollNumber: dbUpdatePayload.rollNumber,
    avatarUrl: '/vsb-logo.png',
    cgpa: dbUpdatePayload.cgpa,
    backlogs: dbUpdatePayload.backlogs,
    bio: packedBio,
    phoneNumber: studentDetails.phoneNumber,
    parentName: studentDetails.parentName,
    parentPhone: studentDetails.parentPhone,
    bloodGroup: studentDetails.bloodGroup,
    currentYear: studentDetails.currentYear,
    classSection: studentDetails.classSection,
    createdAt: savedSupabaseUser?.createdAt || supaUser?.createdAt || new Date().toISOString()
  };

  if (dbStore.getUserById(finalUserId)) {
    dbStore.updateUser(finalUserId, formattedUser);
  } else {
    dbStore.addUser(formattedUser);
  }

  // 5. Notify Faculty about student profile updates
  dbStore.addNotification({
    id: `notif_prof_${Date.now()}`,
    targetRole: 'FACULTY',
    title: `👤 Student Profile Updated: ${formattedUser.name}`,
    message: `Student ${formattedUser.name} updated profile. Phone: ${studentDetails.phoneNumber || 'N/A'}, Parents: ${studentDetails.parentName || 'N/A'}, CGPA: ${formattedUser.cgpa}, Arrears: ${formattedUser.backlogs}, Class: ${studentDetails.classSection || 'N/A'}`,
    category: 'System',
    read: false,
    createdAt: new Date().toISOString()
  });

  const res = NextResponse.json({
    success: true,
    user: formattedUser,
    message: 'Profile and academic records saved to Supabase PostgreSQL database successfully.'
  });

  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.cookies.set('sgip_session_user_id', formattedUser.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    sameSite: 'lax',
    httpOnly: false
  });

  return res;
}
