import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSupabaseClient } from '@/lib/supabase/admin';
import { MalpracticeIncident } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const since = searchParams.get('since');

    const supabase = getSupabaseClient();

    // 1. Fetch registered students directly from PostgreSQL Supabase
    try {
      const { data: dbStudents } = await supabase
        .from('User')
        .select('*')
        .eq('role', 'STUDENT');

      if (dbStudents && dbStudents.length > 0) {
        dbStudents.forEach((u: any) => {
          dbStore.addUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: 'STUDENT',
            department: u.department,
            batch: u.batch || '2022-2026',
            semester: u.semester || 6,
            rollNumber: u.rollNumber || undefined,
            avatarUrl: u.avatarUrl || undefined,
            cgpa: u.cgpa || 8.0,
            backlogs: u.backlogs || 0,
            bio: u.bio || 'VSB Student',
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()
          });
        });
      }
    } catch (e) {
      // Supabase fetch fallback to Prisma / dbStore
      try {
        const pStudents = await prisma.user.findMany({ where: { role: 'STUDENT' } });
        pStudents.forEach((u) => {
          dbStore.addUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: 'STUDENT',
            department: u.department,
            batch: u.batch || '2022-2026',
            semester: u.semester || 6,
            rollNumber: u.rollNumber || undefined,
            avatarUrl: u.avatarUrl || undefined,
            cgpa: u.cgpa || 8.0,
            backlogs: u.backlogs || 0,
            bio: u.bio || 'VSB Student',
            createdAt: u.createdAt.toISOString()
          });
        });
      } catch (pe) {}
    }

    // Identify registered students
    const registeredStudents = dbStore.getUsers().filter((u) => u.role === 'STUDENT');
    const registeredIds = new Set(registeredStudents.map((s) => s.id));
    const registeredRolls = new Set(
      registeredStudents.map((s) => s.rollNumber).filter((r): r is string => Boolean(r))
    );
    const registeredEmails = new Set(
      registeredStudents.map((s) => s.email.toLowerCase()).filter(Boolean)
    );

    // 2. Fetch persistent malpractice incidents directly from PostgreSQL Supabase AuditLog
    const dbIncidentsMap = new Map<string, MalpracticeIncident>();

    try {
      const { data: dbLogs } = await supabase
        .from('AuditLog')
        .select('*')
        .eq('action', 'MALPRACTICE_RECORDED')
        .order('timestamp', { ascending: false });

      if (dbLogs && dbLogs.length > 0) {
        for (const row of dbLogs) {
          try {
            const parsed = JSON.parse(row.details);
            if (parsed && parsed.id) {
              // Ensure student belongs to registered users
              if (
                registeredIds.has(parsed.studentId) ||
                (parsed.studentRollNumber && registeredRolls.has(parsed.studentRollNumber)) ||
                (parsed.studentEmail && registeredEmails.has(parsed.studentEmail.toLowerCase()))
              ) {
                dbIncidentsMap.set(parsed.id, parsed);
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Supabase AuditLog fetch warning:', e);
    }

    // Merge in-memory / local incidents
    const localIncidents = dbStore.getMalpracticeIncidents();
    for (const inc of localIncidents) {
      if (!dbIncidentsMap.has(inc.id)) {
        dbIncidentsMap.set(inc.id, inc);
      }
    }

    // Convert map to array sorted by timestamp descending
    let incidents = Array.from(dbIncidentsMap.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    if (category && category !== 'ALL') {
      incidents = incidents.filter((i) => i.category === category);
    }
    if (studentId) {
      incidents = incidents.filter((i) => i.studentId === studentId);
    }
    if (status) {
      incidents = incidents.filter((i) => i.status === status);
    }

    // Fetch latest global noted timestamp from Supabase
    let lastNotedAt = dbStore.getLastMalpracticeNotedAt();
    try {
      const { data: latestNoted } = await supabase
        .from('AuditLog')
        .select('timestamp')
        .eq('action', 'MALPRACTICE_DESK_NOTED')
        .order('timestamp', { ascending: false })
        .limit(1);

      if (latestNoted && latestNoted.length > 0 && latestNoted[0].timestamp) {
        lastNotedAt = new Date(latestNoted[0].timestamp).toISOString();
      }
    } catch (e) {}

    let unnotedCount = 0;
    if (since && since.trim().length > 0) {
      const sinceTime = new Date(since).getTime();
      if (!isNaN(sinceTime)) {
        unnotedCount = incidents.filter(
          (i) => new Date(i.timestamp).getTime() > sinceTime
        ).length;
      } else {
        unnotedCount = incidents.filter(
          (i) => !lastNotedAt || new Date(i.timestamp).getTime() > new Date(lastNotedAt).getTime()
        ).length;
      }
    } else {
      unnotedCount = incidents.filter(
        (i) => !lastNotedAt || new Date(i.timestamp).getTime() > new Date(lastNotedAt).getTime()
      ).length;
    }

    return NextResponse.json(
      { incidents, unnotedCount, lastNotedAt },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (err: any) {
    console.error('Failed to get malpractice incidents:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve malpractice incidents' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();
    const supabase = getSupabaseClient();

    if (body.action === 'MARK_NOTED') {
      dbStore.markAllMalpracticeNoted();
      const nowIso = new Date().toISOString();

      // Persist noted marker in PostgreSQL Supabase AuditLog
      try {
        const facultyUser = user || dbStore.getUsers().find((u) => u.role === 'FACULTY');
        if (facultyUser) {
          await supabase.from('AuditLog').insert({
            id: `noted_${Date.now()}`,
            userId: facultyUser.id,
            userName: facultyUser.name,
            role: 'FACULTY',
            action: 'MALPRACTICE_DESK_NOTED',
            details: JSON.stringify({ notedAt: nowIso }),
            timestamp: nowIso
          });
        }
      } catch (e) {
        console.warn('Failed to record MALPRACTICE_DESK_NOTED to Supabase:', e);
      }

      return NextResponse.json(
        { success: true, unnotedCount: 0, lastNotedAt: nowIso },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate'
          }
        }
      );
    }

    // 1. Resolve registered student from Supabase / Prisma / dbStore
    let studentUser: any = null;

    // Check by body.studentEmail first
    if (body.studentEmail) {
      try {
        const { data } = await supabase
          .from('User')
          .select('*')
          .ilike('email', body.studentEmail.trim())
          .single();
        if (data) studentUser = data;
      } catch (e) {}
    }

    // Check by body.studentId
    if (!studentUser && body.studentId) {
      try {
        const { data } = await supabase
          .from('User')
          .select('*')
          .eq('id', body.studentId)
          .single();
        if (data) studentUser = data;
      } catch (e) {}
    }

    // Check by session user
    if (!studentUser && user?.role === 'STUDENT') {
      studentUser = user;
    }

    // Check dbStore
    if (!studentUser && body.studentId) {
      studentUser = dbStore.getUserById(body.studentId);
    }

    // Check Prisma
    if (!studentUser && body.studentEmail) {
      try {
        const pUser = await prisma.user.findFirst({
          where: { email: { equals: body.studentEmail.trim(), mode: 'insensitive' } }
        });
        if (pUser) studentUser = pUser;
      } catch (e) {}
    }

    // Fallback to active registered student
    if (!studentUser) {
      studentUser = dbStore.getUsers().find((u) => u.role === 'STUDENT');
    }

    if (!studentUser) {
      return NextResponse.json(
        { error: 'No registered student identified for this incident.' },
        { status: 400 }
      );
    }

    const category = body.category === 'VIDEO_TAMPERING' ? 'VIDEO_TAMPERING' : 'TEST_SESSION';
    const type = body.type || (category === 'VIDEO_TAMPERING' ? 'VIDEO_SPEEDUP_ATTEMPT' : 'TAB_SWITCH');

    // Auto generate descriptive titles if not explicitly passed
    let defaultTitle = 'Malpractice Incident Detected';
    let defaultDesc = 'Academic integrity violation recorded.';
    let severity: 'HIGH' | 'MEDIUM' | 'WARNING' = body.severity || 'MEDIUM';

    if (type === 'VIDEO_SPEEDUP_ATTEMPT') {
      defaultTitle = 'Attempted Fast Video Playback (Speed Tampering)';
      defaultDesc = `Student attempted to speed up video to ${body.speed || 'faster'}x in "${body.lessonTitle || body.courseTitle || 'Technical Lecture'}" to bypass controlled learning requirements. Standard 1.0x speed was forcefully restored.`;
      severity = 'MEDIUM';
    } else if (type === 'VIDEO_SEEK_TAMPER') {
      defaultTitle = 'Video Scrubber Fast-Forward Tampering';
      defaultDesc = `Student repeatedly attempted to swipe/drag video timeline ahead to skip lecture content in "${body.lessonTitle || body.courseTitle || 'Technical Lecture'}". Scrubber was automatically snapped back to 0s by Focus Guard.`;
      severity = 'MEDIUM';
    } else if (type === 'TAB_SWITCH') {
      defaultTitle = `Test Focus Loss / Tab Switching (Strike #${body.count || 1})`;
      defaultDesc = `Student switched away from the proctored test window or opened another browser tab during "${body.quizTitle || 'Daily Test Assessment'}".`;
      severity = body.count && body.count >= 3 ? 'HIGH' : 'MEDIUM';
    } else if (type === 'TEST_TERMINATION') {
      defaultTitle = 'Critical Test Termination for Proctoring Violations';
      defaultDesc = `Student was disqualified and terminated with 0 marks due to repeated tab switching/focus loss during "${body.quizTitle || 'Daily Test Assessment'}".`;
      severity = 'HIGH';
    } else if (type === 'FULLSCREEN_EXIT') {
      defaultTitle = 'Exited Fullscreen Proctored Environment';
      defaultDesc = `Student exited the required fullscreen proctoring view during "${body.quizTitle || 'Assessment'}".`;
      severity = 'HIGH';
    } else if (type === 'CAMERA_ABSENCE') {
      defaultTitle = 'Face Out of Camera Frame / Absence';
      defaultDesc = `AI proctor detected student face was missing or obscured from webcam frame during "${body.quizTitle || 'Timed Assessment'}".`;
      severity = 'MEDIUM';
    }

    const incident: MalpracticeIncident & { studentEmail?: string } = {
      id: `mal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: studentUser.id,
      studentName: studentUser.name,
      studentRollNumber: studentUser.rollNumber || body.studentRollNumber || 'N/A',
      studentDepartment: studentUser.department || 'AI & Data Science',
      studentAvatarUrl: studentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      studentEmail: studentUser.email || body.studentEmail,
      category,
      type,
      title: body.title || defaultTitle,
      description: body.description || defaultDesc,
      severity,
      contextTitle: body.contextTitle || body.quizTitle || body.courseTitle || body.lessonTitle || 'VSB Academic Activity',
      contextId: body.contextId || body.quizId || body.courseId,
      timestamp: new Date().toISOString(),
      status: 'REPORTED',
      details: body.details || {
        speed: body.speed,
        count: body.count,
        quizTitle: body.quizTitle,
        courseTitle: body.courseTitle,
        lessonTitle: body.lessonTitle
      }
    };

    // 2. Save permanently into PostgreSQL Supabase AuditLog table
    try {
      const { error: dbError } = await supabase.from('AuditLog').insert({
        id: incident.id,
        userId: studentUser.id,
        userName: studentUser.name,
        role: 'STUDENT',
        action: 'MALPRACTICE_RECORDED',
        details: JSON.stringify(incident),
        timestamp: incident.timestamp
      });

      if (dbError) {
        console.error('Supabase AuditLog insert error:', dbError);
      }
    } catch (dbErr) {
      console.error('Database connection error during malpractice insert:', dbErr);
    }

    // 3. Cache into dbStore
    dbStore.addMalpracticeIncident(incident);

    // Send high-priority alert notification to faculty
    dbStore.addNotification({
      id: `notif_mal_${Date.now()}`,
      targetRole: 'FACULTY',
      title: `🚨 Malpractice: ${incident.studentName} (${incident.studentRollNumber || 'N/A'})`,
      message: `${incident.title} — ${incident.description.substring(0, 120)}... Check the Malpractice Desk immediately.`,
      category: 'System',
      read: false,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json(
      { success: true, incident },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('Failed to record malpractice incident:', err);
    return NextResponse.json(
      { error: 'Failed to record malpractice incident' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ids, status } = body;
    const supabase = getSupabaseClient();

    const targetIds: string[] = ids || (id ? [id] : []);

    if (targetIds.length === 0 || !status) {
      return NextResponse.json({ error: 'Incident id/ids and status are required' }, { status: 400 });
    }

    // 1. Update in local dbStore
    const updated = dbStore.updateMalpracticeIncidentStatus(targetIds, status);

    // 2. Update permanently in PostgreSQL Supabase AuditLog table
    try {
      const { data: currentLogs } = await supabase
        .from('AuditLog')
        .select('*')
        .in('id', targetIds);

      if (currentLogs && currentLogs.length > 0) {
        for (const log of currentLogs) {
          try {
            const parsed = JSON.parse(log.details);
            parsed.status = status;
            await supabase
              .from('AuditLog')
              .update({ details: JSON.stringify(parsed) })
              .eq('id', log.id);
          } catch (pe) {}
        }
      }
    } catch (dbErr) {
      console.warn('Failed to update Supabase AuditLog records:', dbErr);
    }

    return NextResponse.json(
      { success: true, count: targetIds.length, status },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('Failed to update incident:', err);
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
