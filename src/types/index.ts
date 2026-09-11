export type Role = 'STUDENT' | 'FACULTY' | 'PLACEMENT_COORDINATOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string; // e.g. 'Computer Science & Engineering', 'AI & Data Science', 'Electronics & Communication'
  batch?: string;      // e.g. '2022-2026'
  semester?: number;   // e.g. 6
  rollNumber?: string; // e.g. '21CS104'
  avatarUrl?: string;
  cgpa?: number;       // e.g. 8.4
  backlogs?: number;   // e.g. 0
  bio?: string;
  password?: string;
  skills?: string[];
  xp?: number;
  level?: number;
  streak?: number;
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'Department Subjects' | 'Programming' | 'Web Development' | 'AI & ML' | 'Cloud Computing' | 'Aptitude' | 'Soft Skills' | 'Placement Preparation';
  instructorId: string;
  instructorName: string;
  department: string;
  durationHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  coverImage: string;
  published: boolean;
  learningObjectives: string[];
  skillsGained: string[];
  createdAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  videoUrl?: string;
  pdfUrl?: string;
  pptUrl?: string;
  notesContent?: string;
  codeSnippet?: string;
  order: number;
  createdAt: string;
}

export interface LessonProgress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  timeSpentSeconds: number;
  lastAccessedAt: string;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  instructions: string;
  totalMarks: number;
  dueDate: string;
  submissionType: 'PDF' | 'ZIP' | 'Code' | 'GitHub Repository';
  published: boolean;
  createdBy: string;
  createdAt: string;
}

export type SubmissionStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Returned' | 'Needs Changes' | 'Graded' | 'Approved' | 'Closed';

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  department: string;
  contentUrl?: string;
  codeText?: string;
  submissionType: string;
  status: SubmissionStatus;
  marksObtained?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subject: string;
  topic: string;
  explanation: string;
  marks: number;
  negativeMarks: number;
  timeLimitSeconds?: number;
  tags?: string[];
  imported?: boolean;
}

export interface Quiz {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingScore: number;
  negativeMarking: boolean;
  randomizeQuestions: boolean;
  questionIds: string[];
  published: boolean;
  createdBy: string;
  createdAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  startedAt: string;
  completedAt: string;
  proctored?: boolean;
  tabSwitchCount?: number;
  terminated?: boolean;
  terminationReason?: string;
}

export interface DailyReport {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  date: string;
  studyHours: number;
  topicsLearned: string[];
  completedTasks: string[];
  codingProblemsSolved: number;
  reflection: string;
  tomorrowPlan: string;
  facultyComment?: string;
  reviewedBy?: string;
  status: 'Pending' | 'Reviewed';
  createdAt: string;
}

export interface CodingProfile {
  id: string;
  studentId: string;
  leetcodeUsername?: string;
  hackerrankUsername?: string;
  codechefUsername?: string;
  codeforcesUsername?: string;
  geeksforgeeksUsername?: string;
  totalSolved: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  contestRating: number;
  streakDays: number;
  verificationStatus: 'Imported / Verified' | 'Manual Entry';
  lastUpdated: string;
  leetcodeAvatar?: string;
  ranking?: number;
  acceptanceRate?: number;
  contributionPoints?: number;
}

export interface CodingTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topics: string[];
  description: string;
  constraints: string[];
  starterCode: Record<string, string>; // language -> code template
  sampleCases: CodingTestCase[];
  createdAt: string;
}

export interface CodingSubmission {
  id: string;
  studentId: string;
  studentName: string;
  problemId: string;
  problemTitle: string;
  language: string;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error';
  testCasesPassed: number;
  totalTestCases: number;
  executionTimeMs: number;
  submittedAt: string;
}

export interface PortfolioItem {
  id: string;
  studentId: string;
  type: 'PROJECT' | 'CERTIFICATE' | 'ACHIEVEMENT' | 'INTERNSHIP';
  title: string;
  description: string;
  date: string;
  tags: string[];
  linkUrl?: string;
  autoSynced: boolean;
  publicVisible: boolean;
}

export interface ResumeData {
  id: string;
  studentId: string;
  title: string;
  template: 'ATS Resume' | 'Professional Resume';
  summary: string;
  skills: { category: string; list: string[] }[];
  experience: { company: string; role: string; period: string; points: string[] }[];
  projects: { title: string; tech: string; githubUrl?: string; points: string[] }[];
  education: { institution: string; degree: string; year: string; cgpa: string }[];
  certifications: string[];
  updatedAt: string;
  isCustomUpload?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
  atsScore?: number;
}

export interface Company {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  location: string;
  industry: string;
  about: string;
}

export interface EligibilityRules {
  minCgpa: number;
  maxBacklogs: number;
  allowedDepartments: string[];
  graduationYear: string;
  requiredSkills: string[];
  minCourseCompletionPercent?: number;
}

export interface PlacementDrive {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl: string;
  roleTitle: string;
  jobDescription: string;
  packageLPA: number;
  location: string;
  driveDate: string;
  deadlineDate: string;
  eligibility: EligibilityRules;
  published: boolean;
  createdAt: string;
}

export type ApplicationStatus = 'Applied' | 'Eligible' | 'Aptitude Round' | 'Technical Interview' | 'HR Round' | 'Offered' | 'Rejected';

export interface PlacementApplication {
  id: string;
  driveId: string;
  companyName: string;
  roleTitle: string;
  packageLPA: number;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  department: string;
  cgpaSnapshot: number;
  backlogsSnapshot: number;
  isEligible: boolean;
  eligibilityReasons: string[];
  status: ApplicationStatus;
  appliedAt: string;
  interviewSchedule?: string;
  offerLetterUrl?: string;
}

export interface AIKnowledgeSource {
  id: string;
  title: string;
  sourceType: 'PDF' | 'PPT' | 'Notes' | 'Course Material';
  department: string;
  courseTitle?: string;
  uploadedBy: string;
  chunkCount: number;
  content: string;
  chunks: { id: string; text: string; embedding?: number[] }[];
  createdAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; chunkText: string }[];
  timestamp: string;
}

export interface Notification {
  id: string;
  targetRole?: Role;
  targetUserId?: string;
  title: string;
  message: string;
  category: 'Assignment' | 'Quiz' | 'Placement' | 'Daily Report' | 'System';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  details?: string;
}

export interface GrowthScoreBreakdown {
  overallScore: number;
  learningScore: number;
  codingScore: number;
  assessmentScore: number;
  assignmentScore: number;
  consistencyScore: number;
  portfolioScore: number;
  recommendations: string[];
  updatedAt: string;
}

export interface PlacementReadinessBreakdown {
  overallReadiness: number;
  technicalScore: number;
  codingScore: number;
  academicScore: number;
  aptitudeScore: number;
  portfolioScore: number;
  resumeScore: number;
  interviewScore: number;
  recommendations: string[];
}

export interface MockInterviewRoundQuestion {
  round: number;
  roundTitle: string;
  question: string;
  studentAnswer: string;
  feedback: string;
  score: number; // 0-100
  technicalMark?: number; // 0-100
  communicationMark?: number; // 0-100
}

export interface MockInterviewSession {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  department: string;
  targetRole: string;
  skillsEvaluated: string[];
  resumeSummary: string;
  overallScore: number; // 0-100
  technicalScore: number;
  communicationScore: number;
  logicScore: number;
  confidenceScore: number;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Needs Improvement' | 'Rejected';
  feedbackSummary: string;
  strengthAreas: string[];
  weaknessAreas: string[];
  transcript: MockInterviewRoundQuestion[];
  completedAt: string;
}

export type MalpracticeCategory = 'TEST_SESSION' | 'VIDEO_TAMPERING';
export type MalpracticeSeverity = 'HIGH' | 'MEDIUM' | 'WARNING';

export interface MalpracticeIncident {
  id: string;
  studentId: string;
  studentName: string;
  studentRollNumber?: string;
  studentDepartment?: string;
  studentAvatarUrl?: string;
  category: MalpracticeCategory;
  type: string;
  title: string;
  description: string;
  severity: MalpracticeSeverity;
  contextTitle?: string;
  contextId?: string;
  timestamp: string;
  status: 'REPORTED' | 'WARNING_ISSUED' | 'DISMISSED';
  details?: Record<string, any>;
}
