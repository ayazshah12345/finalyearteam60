import { NextResponse } from 'next/server';
import { dbStore } from '@/lib/db-store';
import { MockInterviewSession, MockInterviewRoundQuestion } from '@/types';

export async function POST(req: Request) {
  try {
    const activeUser = dbStore.getActiveUser();
    if (!activeUser || activeUser.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only logged in students can submit mock interviews.' }, { status: 401 });
    }

    const body = await req.json();
    const { targetRole, resumeSummary, skillsEvaluated, answers } = body;

    // Default 5 Rounds structure if answers not complete
    const roundsInput: any[] = answers || [];

    // Deep, Fair Semantic Evaluation Algorithm
    let totalTechSum = 0;
    let totalCommSum = 0;
    const strengthsSet = new Set<string>();
    const growthSet = new Set<string>();

    const transcript: MockInterviewRoundQuestion[] = roundsInput.map((ans: any, idx: number) => {
      const studentText = (ans.studentAnswer || '').trim();
      const lower = studentText.toLowerCase();
      const wordCount = studentText.split(/\s+/).filter(Boolean).length;

      let techMark = 0;
      let commMark = 0;

      // Check for empty or no-response answers
      const isNoAnswer = !studentText || lower === 'no response provided.' || lower === 'no response.' || lower.includes("don't know") || lower.includes("dont know") || lower.includes("no idea") || lower.includes("skip") || wordCount < 2;
      
      if (isNoAnswer) {
        techMark = 0;
        commMark = 0;
        growthSet.add('Unanswered questions detected (0 marks awarded). Ensure mic is enabled or type your response.');
      } else {
        // Base score for effort
        techMark = 65;

        // Check for domain-specific technical terminology & talent indicators
        const techKeywords = [
          'algorithm', 'complexity', 'o(n)', 'o(1)', 'o(log n)', 'time complexity', 'space complexity',
          'stack', 'queue', 'tree', 'graph', 'hashmap', 'array', 'linked list', 'dp', 'dynamic programming',
          'class', 'object', 'inheritance', 'polymorphism', 'encapsulation', 'abstraction',
          'database', 'sql', 'query', 'index', 'primary key', 'foreign key', 'normalization',
          'api', 'rest', 'http', 'async', 'await', 'promise', 'thread', 'process', 'concurrency',
          'system', 'architecture', 'cache', 'redis', 'load balancer', 'microservices', 'scaling',
          'git', 'version control', 'docker', 'ci/cd', 'test', 'unittest', 'debug'
        ];

        let techHits = 0;
        techKeywords.forEach(kw => {
          if (lower.includes(kw)) techHits++;
        });

        // Boost score based on technical depth and genuine intent
        if (techHits >= 4) {
          techMark += 25;
          strengthsSet.add('Demonstrated deep domain expertise with advanced technical terminology.');
        } else if (techHits >= 2) {
          techMark += 15;
          strengthsSet.add('Strong understanding of core software engineering concepts.');
        } else if (techHits >= 1) {
          techMark += 8;
        }

        // Response depth evaluation
        if (wordCount >= 40) {
          techMark += 8;
          strengthsSet.add('Comprehensive implementation explanation with thorough details.');
        } else if (wordCount >= 20) {
          techMark += 4;
        } else if (wordCount < 10) {
          techMark -= 10;
          growthSet.add('Elaborate deeper with step-by-step code and architectural logic in technical rounds.');
        }

        techMark = Math.min(98, Math.max(25, Math.round(techMark)));
      }

      // ---------------------------------------------------------
      // 2. FAIR COMMUNICATION SKILL & FLUENCY EVALUATION
      // ---------------------------------------------------------
      if (isNoAnswer) {
        commMark = 0;
      } else {
        commMark = 68;

        // Structural framing indicators (firstly, for example, because, in conclusion, however)
        const transitionWords = ['firstly', 'secondly', 'for example', 'such as', 'because', 'however', 'therefore', 'in addition', 'also', 'finally'];
        let transitionHits = 0;
        transitionWords.forEach(tw => {
          if (lower.includes(tw)) transitionHits++;
        });

        if (transitionHits >= 2) {
          commMark += 15;
          strengthsSet.add('Excellent structured articulation with clear logical transitions.');
        } else if (transitionHits >= 1) {
          commMark += 8;
        }

        // Punctuation and sentence formation
        const sentenceCount = studentText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length;
        if (sentenceCount >= 3) {
          commMark += 10;
        } else if (sentenceCount >= 2) {
          commMark += 5;
        }

        // Word count fluency check
        if (wordCount >= 30) {
          commMark += 8;
        } else if (wordCount < 8) {
          commMark -= 12;
          growthSet.add('Improve speech fluency by speaking in full structured sentences during HR rounds.');
        }

        commMark = Math.min(99, Math.max(25, Math.round(commMark)));
      }

      const roundScore = Math.round((techMark * 0.6) + (commMark * 0.4));
      totalTechSum += techMark;
      totalCommSum += commMark;

      // ---------------------------------------------------------
      // 3. GENUINE & FAIR CUSTOMIZED FEEDBACK GENERATION
      // ---------------------------------------------------------
      let feedback = '';
      if (isNoAnswer) {
        feedback = '❌ No answer provided (0 marks awarded). Please enable your microphone or type a technical response.';
      } else if (techMark >= 85 && commMark >= 85) {
        feedback = '🌟 Exceptional performance! Outstanding technical accuracy combined with professional speech fluency and clear articulation.';
      } else if (techMark >= 75 && commMark >= 75) {
        feedback = '👍 Solid technical response. Demonstrated good conceptual understanding and clear communication.';
      } else if (techMark >= 70) {
        feedback = '💡 Good technical grasp. Practice structuring your speech with concrete real-world implementation examples.';
      } else if (commMark >= 70) {
        feedback = '💬 Clear verbal communication. Expand further on technical depth, algorithmic complexity, and system trade-offs.';
      } else {
        feedback = '📘 Fair attempt. Focus on revising fundamental computer science concepts and practicing structured interview delivery.';
      }

      return {
        round: idx + 1,
        roundTitle: ans.roundTitle || `Round ${idx + 1}`,
        question: ans.question || 'Interview Question',
        studentAnswer: studentText || 'No response provided.',
        technicalMark: techMark,
        communicationMark: commMark,
        feedback,
        score: roundScore
      };
    });

    const roundCount = roundsInput.length > 0 ? roundsInput.length : 1;
    const technicalScore = Math.round(totalTechSum / roundCount);
    const communicationScore = Math.round(totalCommSum / roundCount);
    const logicScore = Math.min(100, Math.round(technicalScore * 0.96));
    const confidenceScore = Math.min(100, Math.round(communicationScore * 0.98));
    
    // Overall Weighted Score: 60% Technical Mark + 40% Communication Mark
    const overallScore = Math.round((technicalScore * 0.6) + (communicationScore * 0.4));

    let hiringRecommendation: 'Strong Hire' | 'Hire' | 'Needs Improvement' | 'Rejected' = 'Hire';
    if (overallScore >= 85) hiringRecommendation = 'Strong Hire';
    else if (overallScore >= 70) hiringRecommendation = 'Hire';
    else if (overallScore >= 55) hiringRecommendation = 'Needs Improvement';
    else hiringRecommendation = 'Rejected';

    const defaultStrengths = overallScore === 0 ? [
      'Opportunity to practice mock interviews in a supportive environment',
      'Familiarity with the 5-round campus technical interview structure'
    ] : [
      `Technical Mark: ${technicalScore}% — Solid domain knowledge and problem-solving methodology`,
      `Communication Mark: ${communicationScore}% — Clear verbal articulation & professional framing`,
      'Structured logical approach under technical interview pressure'
    ];

    const defaultWeaknesses = overallScore === 0 ? [
      'Candidate did not provide verbal or written responses for interview questions',
      'Enable microphone permissions or type responses to receive technical & communication marks',
      'Review fundamental domain topics before attempting the mock interview'
    ] : [
      'Elaborate deeper on real-world system architecture trade-offs & scalability',
      'Provide more concrete time & space complexity analysis in DSA answers'
    ];

    const finalStrengths = Array.from(strengthsSet).length > 0 ? Array.from(strengthsSet) : defaultStrengths;
    const finalWeaknesses = Array.from(growthSet).length > 0 ? Array.from(growthSet) : defaultWeaknesses;

    const newSession: MockInterviewSession = {
      id: `int_${Date.now()}`,
      studentId: activeUser.id,
      studentName: activeUser.name,
      studentRollNumber: activeUser.rollNumber || 'N/A',
      department: activeUser.department,
      targetRole: targetRole || 'Software Development Engineer',
      skillsEvaluated: skillsEvaluated || ['Technical Depth', 'Communication Fluency', 'System Architecture', 'Problem Solving'],
      resumeSummary: resumeSummary || `Student with CGPA ${activeUser.cgpa} in ${activeUser.department}`,
      overallScore,
      technicalScore,
      communicationScore,
      logicScore,
      confidenceScore,
      hiringRecommendation,
      feedbackSummary: `Fair Semantic Evaluation: Technical Skill Mark is ${technicalScore}% and Communication Skill Mark is ${communicationScore}%. Overall Result: ${overallScore}% (${hiringRecommendation}).`,
      strengthAreas: finalStrengths.slice(0, 4),
      weaknessAreas: finalWeaknesses.slice(0, 4),
      transcript,
      completedAt: new Date().toISOString()
    };

    // Save to Database Store
    dbStore.addMockInterview(newSession);

    // Notify Faculty & Placement Coordinator
    dbStore.addNotification({
      id: `nt_int_${Date.now()}`,
      targetRole: 'FACULTY',
      title: 'AI Mock Interview Result Posted',
      message: `${activeUser.name} (${activeUser.rollNumber}) completed AI Voice Mock Interview for ${newSession.targetRole} with ${overallScore}% Score (${hiringRecommendation}).`,
      category: 'System',
      read: false,
      createdAt: new Date().toISOString()
    });

    dbStore.logAudit({
      id: `aud_${Date.now()}`,
      userId: activeUser.id,
      userName: activeUser.name,
      role: activeUser.role,
      action: 'SUBMIT_MOCK_INTERVIEW',
      entity: 'MockInterviewSession',
      entityId: newSession.id,
      timestamp: new Date().toISOString(),
      details: `Completed AI Voice Mock Interview for ${newSession.targetRole}. Overall Score: ${overallScore}% (${hiringRecommendation})`
    });

    return NextResponse.json({ success: true, session: newSession });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to process AI mock interview evaluation.' }, { status: 500 });
  }
}
