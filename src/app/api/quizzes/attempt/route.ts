import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { authorizeRole } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const auth = await authorizeRole(['STUDENT'], req);
    if (!auth.authorized) return auth.errorResponse!;

    const body = await req.json();
    const { quizId, questionIds, answers, timeSpentSeconds, proctored, tabSwitchCount, terminated, terminationReason } = body;

    const allQuestions = dbStore.getQuestions();
    const quiz = dbStore.getQuizById(quizId);
    const quizTitle = quiz?.title || `SGIP Proctored Assessment (${quizId || 'Daily Test'})`;

    let quizQuestions: any[] = [];
    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      quizQuestions = allQuestions.filter(q => questionIds.includes(q.id));
    } else if (quiz && quiz.questionIds?.length > 0) {
      quizQuestions = allQuestions.filter(q => quiz.questionIds.includes(q.id));
    } else {
      // Fallback: match by questions supplied in answers object or first 10
      const answerKeys = Object.keys(answers || {});
      if (answerKeys.length > 0) {
        quizQuestions = allQuestions.filter(q => answerKeys.includes(q.id));
      } else {
        quizQuestions = allQuestions.slice(0, 10);
      }
    }

    let totalObtained = 0;
    let maxMarks = 0;

    quizQuestions.forEach(q => {
      const qMarks = q.marks || 4;
      maxMarks += qMarks;
      const studentAns = answers?.[q.id];
      if (studentAns === q.correctAnswer) {
        totalObtained += qMarks;
      } else if (studentAns && quiz?.negativeMarking) {
        totalObtained -= (q.negativeMarks || 0);
      }
    });

    const isTerminated = Boolean(terminated || (tabSwitchCount && tabSwitchCount >= 3));
    const finalScore = isTerminated ? 0 : Math.max(0, totalObtained);
    const percentage = isTerminated ? 0 : (maxMarks > 0 ? Math.round((finalScore / maxMarks) * 100) : 0);
    const passed = isTerminated ? false : (percentage >= 60);

    const attempt = {
      id: `qa_${Date.now()}`,
      quizId: quizId || 'daily_test_today',
      quizTitle,
      studentId: auth.user.id,
      studentName: auth.user.name,
      answers: answers || {},
      score: finalScore,
      totalMarks: maxMarks,
      percentage,
      passed,
      timeSpentSeconds: timeSpentSeconds || 600,
      startedAt: new Date(Date.now() - (timeSpentSeconds || 600) * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      proctored: proctored ?? true,
      tabSwitchCount: tabSwitchCount || 0,
      terminated: isTerminated,
      terminationReason: isTerminated ? (terminationReason || 'Terminated out of test due to 3+ proctoring tab-switch violations.') : undefined
    };

    dbStore.addQuizAttempt(attempt);

    // 1. Send Automatic Score Notification to Faculty Command Desk
    dbStore.addNotification({
      id: `notif_quiz_fac_${Date.now()}`,
      targetRole: 'FACULTY',
      title: isTerminated
        ? `🚨 Proctoring Violation: ${auth.user.name}`
        : `📝 Daily Test Submitted: ${auth.user.name} (${percentage}%)`,
      message: isTerminated
        ? `Student ${auth.user.name} (Roll: ${auth.user.rollNumber || 'N/A'}) was terminated for 3+ tab switches during "${quizTitle}". Score recorded: 0.`
        : `Student ${auth.user.name} (Roll: ${auth.user.rollNumber || 'N/A'}, ${auth.user.department}) completed "${quizTitle}". Score: ${finalScore}/${maxMarks} (${percentage}%). Status: ${passed ? 'PASSED ✅' : 'NEEDS IMPROVEMENT ⚠️'}. Integrity: ${tabSwitchCount === 0 ? '100% Clean 🛡️' : `${tabSwitchCount} tab switch(es) detected ⚠️`}.`,
      category: 'Quiz',
      read: false,
      createdAt: new Date().toISOString()
    });

    // 2. Send Automatic Notification to Placement Coordinator Desk
    dbStore.addNotification({
      id: `notif_quiz_coord_${Date.now()}`,
      targetRole: 'PLACEMENT_COORDINATOR',
      title: `📊 Test Score: ${auth.user.name} - ${percentage}%`,
      message: `${auth.user.name} (Roll: ${auth.user.rollNumber || 'N/A'}) scored ${finalScore}/${maxMarks} (${percentage}%) on "${quizTitle}". Status: ${passed ? 'PASSED' : 'NEEDS IMPROVEMENT'}.`,
      category: 'Placement',
      read: false,
      createdAt: new Date().toISOString()
    });

    // 3. Log Audit Trail
    dbStore.logAudit({
      id: `aud_proc_${Date.now()}`,
      userId: auth.user.id,
      userName: auth.user.name,
      role: auth.user.role,
      action: isTerminated ? 'PROCTORING_VIOLATION_TERMINATION' : 'TEST_COMPLETED',
      entity: 'QuizAttempt',
      entityId: attempt.id,
      timestamp: new Date().toISOString(),
      details: isTerminated
        ? `CRITICAL PROCTORING VIOLATION: Student ${auth.user.name} (Roll: ${auth.user.rollNumber || 'N/A'}, Dept: ${auth.user.department}) was TERMINATED out of test after ${tabSwitchCount} tab-switching violations.`
        : `Student ${auth.user.name} (Roll: ${auth.user.rollNumber || 'N/A'}) completed test "${quizTitle}" with score ${finalScore}/${maxMarks} (${percentage}%, ${passed ? 'Passed' : 'Failed'}).`
    });

    return NextResponse.json({ attempt, quizQuestions });
  } catch (err: any) {
    console.error('Quiz attempt submit error:', err);
    return NextResponse.json({ error: 'Failed to submit test attempt.' }, { status: 500 });
  }
}
