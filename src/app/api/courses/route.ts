import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

function formatVideoEmbedUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();

  // YouTube Watch or youtu.be URL
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?enablejsapi=1&rel=0&modestbranding=1&disablekb=1`;
  }

  // Vimeo URL
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?dnt=1`;
  }

  return trimmed;
}

export async function GET() {
  const courses = dbStore.getCourses();
  return NextResponse.json({ courses });
}

export async function POST(req: Request) {
  const auth = await authorizeRole(['FACULTY'], req);
  if (!auth.authorized) return auth.errorResponse!;

  const body = await req.json();

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
  }

  const newCourse = {
    id: `crs_${Date.now()}`,
    title: body.title.trim(),
    description: body.description?.trim() || 'Comprehensive technical course curated by VSB Engineering College faculty.',
    category: body.category || 'Programming',
    instructorId: auth.user.id,
    instructorName: auth.user.name,
    department: body.department || auth.user.department || 'Computer Science & Engineering',
    durationHours: Number(body.durationHours) || 20,
    difficulty: body.difficulty || 'Intermediate',
    coverImage:
      body.coverImage ||
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    published: true,
    learningObjectives: Array.isArray(body.learningObjectives)
      ? body.learningObjectives
      : typeof body.learningObjectives === 'string'
      ? body.learningObjectives.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Master technical fundamentals', 'Practical hands-on projects', 'Interview preparation'],
    skillsGained: Array.isArray(body.skillsGained)
      ? body.skillsGained
      : typeof body.skillsGained === 'string'
      ? body.skillsGained.split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Problem Solving', 'System Design', 'Technical Implementation'],
    createdAt: new Date().toISOString()
  };

  dbStore.addCourse(newCourse);

  // Automatically attach Module and Lesson with Video Link if provided
  if (body.videoUrl) {
    const embedUrl = formatVideoEmbedUrl(body.videoUrl);
    const modId = `mod_${Date.now()}`;

    const moduleItem = {
      id: modId,
      courseId: newCourse.id,
      title: 'Module 1: Core Technical Video Lectures',
      description: 'Hands-on technical demonstrations and conceptual walkthroughs.',
      order: 1
    };
    dbStore.addModule(moduleItem);

    const lessonItem = {
      id: `lsn_${Date.now()}`,
      courseId: newCourse.id,
      moduleId: modId,
      title: body.videoTitle?.trim() || `${newCourse.title} - Main Video Lecture`,
      description:
        body.description?.trim() ||
        'Watch this comprehensive technical video lecture. Anti-skip focus guard is enabled to ensure thorough conceptual mastery.',
      durationMinutes: Number(body.durationMinutes) || (Number(body.durationHours) ? Number(body.durationHours) * 60 : 45),
      videoUrl: embedUrl,
      notesContent:
        body.notesContent ||
        `### Lecture Notes: ${newCourse.title}\n\n- Key Concepts: ${newCourse.skillsGained.join(', ')}\n- Review the video demonstration attentively.\n- Fast-forwarding is restricted to guarantee academic mastery.`,
      codeSnippet: body.codeSnippet || undefined,
      order: 1,
      createdAt: new Date().toISOString()
    };
    dbStore.addLesson(lessonItem);
  }

  // Broadcast Notification to all students
  dbStore.addNotification({
    id: `notif_crs_${Date.now()}`,
    targetRole: 'STUDENT',
    title: `🎓 New Technical Course: ${newCourse.title}`,
    message: `Faculty ${auth.user.name} published a new course in ${newCourse.category}. Check the Technical Courses page to start learning!`,
    category: 'System',
    read: false,
    createdAt: new Date().toISOString()
  });

  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: auth.user.id,
    userName: auth.user.name,
    role: auth.user.role,
    action: 'CREATE_COURSE',
    entity: 'Course',
    entityId: newCourse.id,
    timestamp: new Date().toISOString(),
    details: `Faculty ${auth.user.name} published technical course with video: ${newCourse.title}`
  });

  return NextResponse.json({ success: true, course: newCourse });
}
