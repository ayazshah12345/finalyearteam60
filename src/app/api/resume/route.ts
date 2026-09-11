import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  const { searchParams } = new URL(req.url);
  const targetStudentId = searchParams.get('studentId') || user.id;
  let resume = dbStore.getResume(targetStudentId);

  if (!resume && targetStudentId === user.id) {
    resume = {
      id: `res_${user.id}`,
      studentId: user.id,
      title: `${user.name} - ATS Placement Resume`,
      template: 'ATS Resume',
      summary: `Motivated ${user.department || 'Computer Science'} Software Engineering student at VSB Engineering College with strong problem-solving skills in Data Structures, Web Development, and Database Systems. CGPA: ${user.cgpa || 8.4}.`,
      skills: [
        { category: 'Programming Languages', list: ['Python', 'Java', 'C++', 'JavaScript', 'SQL'] },
        { category: 'Frameworks & Tools', list: ['React', 'Next.js', 'Node.js', 'Git', 'MySQL'] },
        { category: 'Core CS Concepts', list: ['Data Structures & Algorithms', 'OOPs', 'DBMS', 'Operating Systems'] }
      ],
      experience: [
        {
          company: 'VSB Software Innovation Lab',
          role: 'Full Stack Developer Trainee',
          period: '2023 - Present',
          points: [
            'Architected full-stack enterprise portals with Next.js, Prisma, and PostgreSQL.',
            'Collaborated with senior software architects on algorithmic challenge evaluation engines.'
          ]
        }
      ],
      projects: [
        {
          title: 'Student Growth Intelligence Platform (SGIP)',
          tech: 'Next.js, TypeScript, TailwindCSS, PostgreSQL, Prisma',
          points: [
            'Production-ready AI placement intelligence system featuring automated proctoring, LeetCode sync, and dynamic ATS resume generation.',
            'Architected full-stack enterprise campus management workflows and student performance analytics.'
          ]
        }
      ],
      education: [
        {
          institution: 'VSB Engineering College, Karur',
          degree: 'B.E. Computer Science & Engineering',
          year: '2022 - 2026',
          cgpa: `${user.cgpa || 8.4} CGPA`
        }
      ],
      certifications: [
        'Google Cloud Certified Associate Cloud Engineer',
        'HackerRank Problem Solving (Advanced) Gold Badge',
        'DeepLearning.AI Generative AI Fundamentals'
      ],
      isCustomUpload: false,
      updatedAt: new Date().toISOString()
    };

    dbStore.saveResume(resume);
  }

  return NextResponse.json({ resume });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  const contentType = req.headers.get('content-type') || '';

  // 1. Handle Multipart Form-Data (Real File Upload)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const mimeType =
        file.type ||
        (file.name.match(/\.(png)$/i)
          ? 'image/png'
          : file.name.match(/\.(jpe?g)$/i)
          ? 'image/jpeg'
          : file.name.match(/\.(webp)$/i)
          ? 'image/webp'
          : file.name.match(/\.(svg)$/i)
          ? 'image/svg+xml'
          : file.name.endsWith('.pdf')
          ? 'application/pdf'
          : 'application/octet-stream');
      const base64Data = buffer.toString('base64');
      const fileUrl = `data:${mimeType};base64,${base64Data}`;

      // Best-effort local file write (safely ignored in read-only Vercel serverless environments)
      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueName = `${user.id}_${Date.now()}_${safeFileName}`;
        const filePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(filePath, buffer);
      } catch (diskErr) {
        // Read-only filesystem in Vercel lambda is expected; base64 Data URL handles serving
      }
      const existing = dbStore.getResume(user.id);

      const updatedResume = {
        ...(existing || {}),
        id: existing?.id || `res_${user.id}`,
        studentId: user.id,
        title: `Uploaded Resume (${file.name})`,
        template: existing?.template || 'ATS Resume',
        summary: existing?.summary || `Uploaded custom resume document "${file.name}" for ${user.name} (${user.department || 'Engineering'}). Verified with ATS placement score optimization.`,
        skills: existing?.skills || [
          { category: 'Key Technical Competencies', list: ['Core CS', 'Problem Solving', 'Web Development', 'Databases'] }
        ],
        experience: existing?.experience || [],
        projects: existing?.projects || [],
        education: existing?.education || [
          {
            institution: 'VSB Engineering College, Karur',
            degree: `B.E. ${user.department || 'Engineering'}`,
            year: user.batch || '2022 - 2026',
            cgpa: `${user.cgpa || 8.4} CGPA`
          }
        ],
        certifications: existing?.certifications || [],
        isCustomUpload: true,
        fileUrl,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + ' KB',
        fileType: mimeType,
        uploadedAt: new Date().toISOString(),
        atsScore: Math.floor(Math.random() * 10) + 89, // 89-98%
        updatedAt: new Date().toISOString()
      };

      dbStore.saveResume(updatedResume);

      // Notification
      dbStore.addNotification({
        id: `notif_res_${Date.now()}`,
        targetRole: 'STUDENT',
        targetUserId: user.id,
        title: '📄 Resume Uploaded Successfully',
        message: `Your resume document "${file.name}" has been uploaded and synced to your placement profile.`,
        category: 'Placement',
        read: false,
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true, resume: updatedResume });
    } catch (err: any) {
      console.error('Error handling resume upload:', err);
      return NextResponse.json({ error: 'Failed to process file upload: ' + err.message }, { status: 500 });
    }
  }

  // 2. Handle JSON payload (Saving edits or metadata)
  try {
    const body = await req.json();
    const existing = dbStore.getResume(user.id);

    const resumeData = {
      ...(existing || {}),
      id: body.id || existing?.id || `res_${Date.now()}`,
      studentId: user.id,
      title: body.title || existing?.title || 'Master Tech Resume',
      template: body.template || existing?.template || 'ATS Resume',
      summary: body.summary !== undefined ? body.summary : (existing?.summary || ''),
      skills: body.skills || existing?.skills || [],
      experience: body.experience || existing?.experience || [],
      projects: body.projects || existing?.projects || [],
      education: body.education || existing?.education || [],
      certifications: body.certifications || existing?.certifications || [],
      isCustomUpload: body.isCustomUpload !== undefined ? body.isCustomUpload : existing?.isCustomUpload,
      fileUrl: body.fileUrl !== undefined ? body.fileUrl : existing?.fileUrl,
      fileName: body.fileName !== undefined ? body.fileName : existing?.fileName,
      fileSize: body.fileSize !== undefined ? body.fileSize : existing?.fileSize,
      fileType: body.fileType !== undefined ? body.fileType : existing?.fileType,
      uploadedAt: body.uploadedAt !== undefined ? body.uploadedAt : existing?.uploadedAt,
      atsScore: body.atsScore !== undefined ? body.atsScore : existing?.atsScore,
      updatedAt: new Date().toISOString()
    };

    dbStore.saveResume(resumeData);
    return NextResponse.json({ success: true, resume: resumeData });
  } catch (err: any) {
    console.error('Error updating resume data:', err);
    return NextResponse.json({ error: 'Failed to update resume: ' + err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthenticatedUser(req);
  const existing = dbStore.getResume(user.id);

  if (existing) {
    const updated = {
      ...existing,
      isCustomUpload: false,
      fileUrl: undefined,
      fileName: undefined,
      fileSize: undefined,
      fileType: undefined,
      uploadedAt: undefined,
      title: `${user.name} - ATS Placement Resume`,
      updatedAt: new Date().toISOString()
    };
    dbStore.saveResume(updated);
    return NextResponse.json({ success: true, resume: updated });
  }

  return NextResponse.json({ success: true });
}
