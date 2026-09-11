import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import { MalpracticeIncident } from '@/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let incidents = dbStore.getMalpracticeIncidents();

    if (category && category !== 'ALL') {
      incidents = incidents.filter((i) => i.category === category);
    }
    if (studentId) {
      incidents = incidents.filter((i) => i.studentId === studentId);
    }
    if (status) {
      incidents = incidents.filter((i) => i.status === status);
    }

    const unnotedCount = dbStore.getUnnotedMalpracticeCount();
    const lastNotedAt = dbStore.getLastMalpracticeNotedAt();

    return NextResponse.json({ incidents, unnotedCount, lastNotedAt });
  } catch (err: any) {
    console.error('Failed to get malpractice incidents:', err);
    return NextResponse.json({ error: 'Failed to retrieve malpractice incidents' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    const body = await req.json();

    if (body.action === 'MARK_NOTED') {
      dbStore.markAllMalpracticeNoted();
      return NextResponse.json({ success: true, unnotedCount: 0 });
    }

    const studentId = body.studentId || user?.id || 'usr_student_1';
    const studentUser = dbStore.getUserById(studentId) || user;

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
      defaultDesc = `Student repeatedly attempted to swipe/drag video timeline ahead to skip lecture content in "${body.lessonTitle || body.courseTitle || 'Technical Lecture'}". Scrubber was automatically snapped back by Focus Guard.`;
      severity = 'MEDIUM';
    } else if (type === 'TAB_SWITCH') {
      defaultTitle = `Test Focus Loss / Tab Switching (Strike #${body.count || 1})`;
      defaultDesc = `Student switched away from the proctored test window or opened another browser tab during "${body.quizTitle || 'Daily Test Assessment'}".`;
      severity = (body.count && body.count >= 3) ? 'HIGH' : 'MEDIUM';
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

    const incident: MalpracticeIncident = {
      id: `mal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentId: studentUser?.id || studentId,
      studentName: studentUser?.name || body.studentName || 'Student',
      studentRollNumber: studentUser?.rollNumber || body.studentRollNumber || '22CS101',
      studentDepartment: studentUser?.department || body.studentDepartment || 'Computer Science & Engineering',
      studentAvatarUrl: studentUser?.avatarUrl || body.studentAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
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

    // Log to audit trail
    dbStore.logAudit({
      id: `aud_mal_${Date.now()}`,
      userId: incident.studentId,
      userName: incident.studentName,
      role: 'STUDENT',
      action: 'MALPRACTICE_RECORDED',
      entity: 'MalpracticeIncident',
      entityId: incident.id,
      timestamp: incident.timestamp,
      details: `[${incident.category}] ${incident.title}: ${incident.description}`
    });

    return NextResponse.json({ success: true, incident });
  } catch (err: any) {
    console.error('Failed to record malpractice incident:', err);
    return NextResponse.json({ error: 'Failed to record malpractice incident' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, ids, status } = body;

    const targetIds: string[] = ids || (id ? [id] : []);

    if (targetIds.length === 0 || !status) {
      return NextResponse.json({ error: 'Incident id/ids and status are required' }, { status: 400 });
    }

    const updated = dbStore.updateMalpracticeIncidentStatus(targetIds, status);
    if (!updated) {
      return NextResponse.json({ error: 'No matching incidents found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, count: targetIds.length, status });
  } catch (err: any) {
    console.error('Failed to update incident:', err);
    return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
  }
}
