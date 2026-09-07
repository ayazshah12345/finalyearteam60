import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { calculateSGIPGrowthScore, calculatePlacementReadinessScore } from '@/lib/scoring';
import { dbStore } from '@/lib/db-store';

export async function GET() {
  const user = getAuthenticatedUser();

  if (user.role === 'STUDENT') {
    const growth = calculateSGIPGrowthScore(user.id);
    const readiness = calculatePlacementReadinessScore(user.id);
    return NextResponse.json({ growth, readiness, role: 'STUDENT' });
  }

  // Faculty / Placement Coordinator Overview Analytics
  const users = dbStore.getUsers().filter(u => u.role === 'STUDENT');
  const studentMetrics = users.map(st => {
    const growth = calculateSGIPGrowthScore(st.id);
    const readiness = calculatePlacementReadinessScore(st.id);
    return {
      studentId: st.id,
      name: st.name,
      rollNumber: st.rollNumber,
      department: st.department,
      cgpa: st.cgpa,
      backlogs: st.backlogs,
      growthScore: growth.overallScore,
      placementReadiness: readiness.overallReadiness,
      isAtRisk: st.backlogs! > 0 || growth.overallScore < 65 || readiness.overallReadiness < 60
    };
  });

  const atRiskStudents = studentMetrics.filter(s => s.isAtRisk);
  const topPerformers = [...studentMetrics].sort((a, b) => b.growthScore - a.growthScore).slice(0, 5);

  return NextResponse.json({
    role: user.role,
    totalStudents: studentMetrics.length,
    averageGrowthScore: Math.round(studentMetrics.reduce((a, s) => a + s.growthScore, 0) / (studentMetrics.length || 1)),
    averageReadinessScore: Math.round(studentMetrics.reduce((a, s) => a + s.placementReadiness, 0) / (studentMetrics.length || 1)),
    atRiskStudents,
    topPerformers,
    allStudents: studentMetrics
  });
}
