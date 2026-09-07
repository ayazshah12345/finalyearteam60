import { dbStore } from './db-store';
import { GrowthScoreBreakdown, PlacementReadinessBreakdown } from '../types';

export function calculateSGIPGrowthScore(studentId: string): GrowthScoreBreakdown {
  const user = dbStore.getUserById(studentId);
  const dailyReports = dbStore.getDailyReports().filter(r => r.studentId === studentId);
  const codingProfile = dbStore.getCodingProfile(studentId);
  const submissions = dbStore.getSubmissions().filter(s => s.studentId === studentId && s.status === 'Graded');
  const quizAttempts = dbStore.getQuizAttemptsByStudent(studentId);
  const portfolioItems = dbStore.getPortfolioItems(studentId);

  // 1. Learning Score (0-100) based on completed lessons & study hours
  const totalStudyHours = dailyReports.reduce((acc, r) => acc + r.studyHours, 0);
  const learningScore = Math.min(100, Math.round(totalStudyHours * 15 + (user?.cgpa || 7) * 5));

  // 2. Coding Score (0-100) based on total solved & streak
  const solved = codingProfile?.totalSolved || 0;
  const streak = codingProfile?.streakDays || 0;
  const codingScore = Math.min(100, Math.round((solved / 350) * 80 + (streak / 14) * 20));

  // 3. Assessment Score (0-100) based on quiz percentages
  let assessmentScore = 70;
  if (quizAttempts.length > 0) {
    const avgPercentage = quizAttempts.reduce((acc, q) => acc + q.percentage, 0) / quizAttempts.length;
    assessmentScore = Math.round(avgPercentage);
  }

  // 4. Assignment Score (0-100) based on graded assignment marks
  let assignmentScore = 75;
  if (submissions.length > 0) {
    const avgMarks = submissions.reduce((acc, s) => acc + (s.marksObtained || 0), 0) / submissions.length;
    assignmentScore = Math.round(avgMarks);
  }

  // 5. Consistency Score (0-100) based on daily report count & streak
  const consistencyScore = Math.min(100, Math.round(dailyReports.length * 20 + streak * 3));

  // 6. Portfolio Score (0-100) based on project count & certificates
  const portfolioScore = Math.min(100, Math.round(portfolioItems.length * 25 + 30));

  // Weighted overall calculation
  const overallScore = Math.round(
    learningScore * 0.20 +
    codingScore * 0.25 +
    assessmentScore * 0.15 +
    assignmentScore * 0.15 +
    consistencyScore * 0.15 +
    portfolioScore * 0.10
  );

  const recommendations: string[] = [];
  if (codingScore < 75) recommendations.push('Practice 5 Medium DSA problems on LeetCode this week.');
  if (assessmentScore < 80) recommendations.push('Review SQL & Tree algorithms to raise Quiz average.');
  if (consistencyScore < 80) recommendations.push('Submit daily study reports consistently to build learning momentum.');
  if (portfolioScore < 80) recommendations.push('Publish a full-stack project or complete a course certification.');

  return {
    overallScore,
    learningScore,
    codingScore,
    assessmentScore,
    assignmentScore,
    consistencyScore,
    portfolioScore,
    recommendations: recommendations.length > 0 ? recommendations : ['Maintain high momentum! You are in the top 10% percentile.'],
    updatedAt: new Date().toISOString()
  };
}

export function calculatePlacementReadinessScore(studentId: string): PlacementReadinessBreakdown {
  const growth = calculateSGIPGrowthScore(studentId);
  const user = dbStore.getUserById(studentId);
  const resume = dbStore.getResume(studentId);

  const cgpa = user?.cgpa || 7.0;
  const backlogs = user?.backlogs || 0;

  const academicScore = Math.max(0, Math.min(100, Math.round((cgpa / 10) * 100 - backlogs * 15)));
  const technicalScore = Math.round(growth.learningScore * 0.5 + growth.assignmentScore * 0.5);
  const codingScore = growth.codingScore;
  const aptitudeScore = growth.assessmentScore;
  const portfolioScore = growth.portfolioScore;
  const resumeScore = resume ? 88 : 50;
  const interviewScore = Math.round((technicalScore + codingScore + aptitudeScore) / 3);

  const overallReadiness = Math.round(
    academicScore * 0.20 +
    technicalScore * 0.20 +
    codingScore * 0.20 +
    aptitudeScore * 0.15 +
    portfolioScore * 0.10 +
    resumeScore * 0.10 +
    interviewScore * 0.05
  );

  const recommendations: string[] = [];
  if (codingScore < 75) recommendations.push('Solve 10 Medium Graph & DP problems.');
  if (aptitudeScore < 75) recommendations.push('Attempt 3 timed Aptitude practice tests.');
  if (backlogs > 0) recommendations.push('Clear active backlogs to unlock Tier-1 placement drives.');

  return {
    overallReadiness,
    technicalScore,
    codingScore,
    academicScore,
    aptitudeScore,
    portfolioScore,
    resumeScore,
    interviewScore,
    recommendations: recommendations.length > 0 ? recommendations : ['You satisfy all criteria for Tier-1 Product Companies!']
  };
}
