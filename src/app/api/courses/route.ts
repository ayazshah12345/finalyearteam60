import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase/admin';

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
  try {
    // 1. Fetch from Supabase PostgreSQL Database (Permanent Cloud Storage)
    const supabase = getSupabaseClient();
    const { data: cloudCourses, error } = await supabase
      .from('Course')
      .select('*')
      .order('createdAt', { ascending: false });

    if (!error && Array.isArray(cloudCourses)) {
      // Sync in-memory store with permanent cloud courses
      cloudCourses.forEach((c) => {
        if (!dbStore.getCourseById(c.id)) {
          dbStore.addCourse(c);
        }
      });

      // Merge with any in-memory courses
      const inMemory = dbStore.getCourses();
      const combined = [...cloudCourses];
      inMemory.forEach((c) => {
        if (!combined.some((item) => item.id === c.id)) {
          combined.push(c);
        }
      });

      return NextResponse.json({ courses: combined });
    }
  } catch (err) {
    console.warn('Supabase courses fetch error, falling back to local store:', err);
  }

  // 2. Fallback to local store
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

  const nowIso = new Date().toISOString();
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
      : ['Problem Solving', 'System Design', 'Technical Mastery'],
    createdAt: nowIso
  };

  const modId = `mod_${Date.now()}`;
  const moduleItem = {
    id: modId,
    courseId: newCourse.id,
    title: `${newCourse.title} - Foundation & Core Curriculum`,
    description: 'Core concepts, hands-on architectural code walkthroughs, and practical interview implementations.',
    order: 1
  };

  const embedUrl = formatVideoEmbedUrl(body.videoUrl || '');
  const lessonItem = {
    id: `lsn_${Date.now()}`,
    courseId: newCourse.id,
    moduleId: modId,
    title: body.videoTitle?.trim() || `${newCourse.title} - Video Lecture`,
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
    createdAt: nowIso
  };

  // 1. Permanent Storage in Supabase PostgreSQL Database
  try {
    const supabase = getSupabaseClient();
    
    // Insert Course
    await supabase.from('Course').insert({
      id: newCourse.id,
      title: newCourse.title,
      description: newCourse.description,
      category: newCourse.category,
      instructorId: newCourse.instructorId,
      instructorName: newCourse.instructorName,
      department: newCourse.department,
      durationHours: newCourse.durationHours,
      difficulty: newCourse.difficulty,
      coverImage: newCourse.coverImage,
      published: true,
      learningObjectives: newCourse.learningObjectives,
      skillsGained: newCourse.skillsGained,
      createdAt: newCourse.createdAt
    });

    // Insert Primary Module
    await supabase.from('Module').insert({
      id: moduleItem.id,
      courseId: moduleItem.courseId,
      title: moduleItem.title,
      description: moduleItem.description,
      order: moduleItem.order
    });

    // Insert Lecture Lesson
    await supabase.from('Lesson').insert({
      id: lessonItem.id,
      courseId: lessonItem.courseId,
      moduleId: lessonItem.moduleId,
      title: lessonItem.title,
      description: lessonItem.description,
      durationMinutes: lessonItem.durationMinutes,
      videoUrl: lessonItem.videoUrl,
      notesContent: lessonItem.notesContent,
      codeSnippet: lessonItem.codeSnippet,
      order: lessonItem.order,
      createdAt: lessonItem.createdAt
    });
  } catch (dbErr) {
    console.error('Failed to insert into Supabase DB (continuing with local store):', dbErr);
  }

  // 2. Storage in In-Memory / File Store
  dbStore.addCourse(newCourse);
  dbStore.addModule(moduleItem);
  dbStore.addLesson(lessonItem);

  // 3. Broadcast Notification to all students
  dbStore.addNotification({
    id: `notif_crs_${Date.now()}`,
    targetRole: 'STUDENT',
    title: `🎓 New Technical Course: ${newCourse.title}`,
    message: `Faculty ${auth.user.name} published a new course in ${newCourse.category}. Check the Technical Courses page to start learning!`,
    category: 'System',
    read: false,
    createdAt: nowIso
  });

  dbStore.logAudit({
    id: `aud_${Date.now()}`,
    userId: auth.user.id,
    userName: auth.user.name,
    role: auth.user.role,
    action: 'CREATE_TECHNICAL_COURSE',
    entity: 'Course',
    entityId: newCourse.id,
    timestamp: nowIso,
    details: `Created course "${newCourse.title}" (${newCourse.category}) with lecture video.`
  });

  return NextResponse.json({
    success: true,
    course: newCourse,
    module: moduleItem,
    lesson: lessonItem
  });
}
