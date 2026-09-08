import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  let resume = dbStore.getResume(user.id);

  if (!resume) {
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
      updatedAt: new Date().toISOString()
    };

    dbStore.saveResume(resume);
  }

  return NextResponse.json({ resume });
}

export async function POST(req: Request) {
  const user = await getAuthenticatedUser(req);
  const body = await req.json();

  const resumeData = {
    id: body.id || `res_${Date.now()}`,
    studentId: user.id,
    title: body.title || 'Master Tech Resume',
    template: body.template || 'ATS Resume',
    summary: body.summary || '',
    skills: body.skills || [],
    experience: body.experience || [],
    projects: body.projects || [],
    education: body.education || [],
    certifications: body.certifications || [],
    updatedAt: new Date().toISOString()
  };

  dbStore.saveResume(resumeData);
  return NextResponse.json({ resume: resumeData });
}
