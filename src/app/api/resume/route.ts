import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  const user = getAuthenticatedUser();
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
            'Built responsive web applications with Next.js and RESTful API endpoints.',
            'Optimized SQL database query performance and implemented automated data validation.'
          ]
        }
      ],
      projects: [
        {
          title: 'Campus Growth & Placement Intelligence System (SGIP)',
          tech: 'Next.js, TypeScript, TailwindCSS',
          points: [
            'Architected full-stack campus management platform with AI mock interview evaluator.',
            'Implemented real-time proctored testing engine with tab-switch detection and camera presence monitoring.'
          ]
        }
      ],
      education: [
        {
          institution: 'V.S.B. Engineering College (Karur)',
          degree: `B.E. ${user.department || 'Computer Science and Engineering'}`,
          year: '2021 - 2025',
          cgpa: `${user.cgpa || 8.4} / 10.0`
        }
      ],
      certifications: ['AWS Certified Cloud Practitioner', 'LeetCode 300+ Problems Badge'],
      updatedAt: new Date().toISOString()
    };

    dbStore.saveResume(resume);
  }

  return NextResponse.json({ resume });
}

export async function POST(req: Request) {
  const user = getAuthenticatedUser();
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
