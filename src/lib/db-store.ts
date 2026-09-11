import fs from 'fs';
import path from 'path';
import os from 'os';
import { prisma } from './prisma';
import {
  User,
  Course,
  Module,
  Lesson,
  LessonProgress,
  Assignment,
  Submission,
  Question,
  Quiz,
  QuizAttempt,
  DailyReport,
  CodingProfile,
  CodingProblem,
  CodingSubmission,
  PortfolioItem,
  ResumeData,
  Company,
  PlacementDrive,
  PlacementApplication,
  AIKnowledgeSource,
  Notification,
  AuditLog,
  MockInterviewSession,
  MalpracticeIncident
} from '../types';

import {
  SEED_USERS,
  SEED_COURSES,
  SEED_MODULES,
  SEED_LESSONS,
  SEED_LESSON_PROGRESS,
  SEED_ASSIGNMENTS,
  SEED_SUBMISSIONS,
  SEED_QUESTIONS,
  SEED_QUIZZES,
  SEED_QUIZ_ATTEMPTS,
  SEED_DAILY_REPORTS,
  SEED_CODING_PROFILES,
  SEED_CODING_PROBLEMS,
  SEED_CODING_SUBMISSIONS,
  SEED_PORTFOLIO_ITEMS,
  SEED_RESUME,
  SEED_COMPANIES,
  SEED_PLACEMENT_DRIVES,
  SEED_APPLICATIONS,
  SEED_KNOWLEDGE_SOURCES,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_MOCK_INTERVIEWS,
  SEED_MALPRACTICE_INCIDENTS
} from './seed-data';

interface DatabaseSchema {
  users: User[];
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  lessonProgress: LessonProgress[];
  assignments: Assignment[];
  submissions: Submission[];
  questions: Question[];
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  dailyReports: DailyReport[];
  codingProfiles: CodingProfile[];
  codingProblems: CodingProblem[];
  codingSubmissions: CodingSubmission[];
  portfolioItems: PortfolioItem[];
  resumes: Record<string, ResumeData>; // studentId -> ResumeData
  companies: Company[];
  placementDrives: PlacementDrive[];
  applications: PlacementApplication[];
  knowledgeSources: AIKnowledgeSource[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  mockInterviews: MockInterviewSession[];
  malpracticeIncidents: MalpracticeIncident[];
  lastMalpracticeNotedAt?: string;
  activeUserId: string; // Default active demo user
}

const IS_VERCEL = Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? os.tmpdir() : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sgip-db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const dbData = JSON.parse(raw);

        // Defensive initialization of array properties
        if (!Array.isArray(dbData.users)) dbData.users = [...SEED_USERS];
        if (!Array.isArray(dbData.courses)) dbData.courses = [...SEED_COURSES];
        if (!Array.isArray(dbData.modules)) dbData.modules = [...SEED_MODULES];
        if (!Array.isArray(dbData.lessons)) dbData.lessons = [...SEED_LESSONS];
        if (!Array.isArray(dbData.questions)) dbData.questions = [...SEED_QUESTIONS];
        if (!Array.isArray(dbData.quizzes)) dbData.quizzes = [...SEED_QUIZZES];
        if (!Array.isArray(dbData.quizAttempts)) dbData.quizAttempts = [...SEED_QUIZ_ATTEMPTS];
        if (!Array.isArray(dbData.placementDrives)) dbData.placementDrives = [...SEED_PLACEMENT_DRIVES];
        if (!Array.isArray(dbData.applications)) dbData.applications = [...SEED_APPLICATIONS];
        if (!Array.isArray(dbData.mockInterviews)) dbData.mockInterviews = [...SEED_MOCK_INTERVIEWS];
        if (!Array.isArray(dbData.notifications)) dbData.notifications = [...SEED_NOTIFICATIONS];
        if (!Array.isArray(dbData.auditLogs)) dbData.auditLogs = [...SEED_AUDIT_LOGS];
        if (!Array.isArray(dbData.codingProblems)) dbData.codingProblems = [...SEED_CODING_PROBLEMS];
        if (!Array.isArray(dbData.codingSubmissions)) dbData.codingSubmissions = [...SEED_CODING_SUBMISSIONS];
        if (!Array.isArray(dbData.malpracticeIncidents)) dbData.malpracticeIncidents = [...SEED_MALPRACTICE_INCIDENTS];
        if (!dbData.resumes) dbData.resumes = { [SEED_RESUME.studentId]: SEED_RESUME };

        // Auto-merge missing Coding Problems
        const existingProbIds = new Set(dbData.codingProblems.map((cp: CodingProblem) => cp.id));
        SEED_CODING_PROBLEMS.forEach(cp => {
          if (!existingProbIds.has(cp.id)) {
            dbData.codingProblems.push(cp);
          }
        });

        // Auto-merge missing Placement Quizzes
        const existingQuizIds = new Set(dbData.quizzes.map((qz: Quiz) => qz.id));
        SEED_QUIZZES.forEach(qz => {
          if (!existingQuizIds.has(qz.id)) {
            dbData.quizzes.push(qz);
          }
        });

        return dbData;
      }
    } catch (e) {
      console.warn('Failed to load JSON database, falling back to seed data:', e);
    }

    const defaultData: DatabaseSchema = {
      users: [...SEED_USERS],
      courses: [...SEED_COURSES],
      modules: [...SEED_MODULES],
      lessons: [...SEED_LESSONS],
      lessonProgress: [...SEED_LESSON_PROGRESS],
      assignments: [...SEED_ASSIGNMENTS],
      submissions: [...SEED_SUBMISSIONS],
      questions: [...SEED_QUESTIONS],
      quizzes: [...SEED_QUIZZES],
      quizAttempts: [...SEED_QUIZ_ATTEMPTS],
      dailyReports: [...SEED_DAILY_REPORTS],
      codingProfiles: [...SEED_CODING_PROFILES],
      codingProblems: [...SEED_CODING_PROBLEMS],
      codingSubmissions: [...SEED_CODING_SUBMISSIONS],
      portfolioItems: [...SEED_PORTFOLIO_ITEMS],
      resumes: { [SEED_RESUME.studentId]: SEED_RESUME },
      companies: [...SEED_COMPANIES],
      placementDrives: [...SEED_PLACEMENT_DRIVES],
      applications: [...SEED_APPLICATIONS],
      knowledgeSources: [...SEED_KNOWLEDGE_SOURCES],
      notifications: [...SEED_NOTIFICATIONS],
      auditLogs: [...SEED_AUDIT_LOGS],
      mockInterviews: [...SEED_MOCK_INTERVIEWS],
      malpracticeIncidents: [...SEED_MALPRACTICE_INCIDENTS],
      activeUserId: SEED_USERS[0].id, // Aarav Sharma (STUDENT)
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');

      if (!IS_VERCEL) {
        const localDataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(localDataDir)) fs.mkdirSync(localDataDir, { recursive: true });
        fs.writeFileSync(path.join(localDataDir, 'sgip-db.json'), JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
      }
    } catch (e) {
      console.warn('Failed to write JSON database:', e);
    }
  }

  // Active Session / Role Switcher
  public getActiveUser(): User {
    if (this.data.activeUserId) {
      const user = this.data.users.find(u => u.id === this.data.activeUserId);
      if (user) return user;
    }
    // Fallback to registered student
    const student = this.data.users.find(u => u.role === 'STUDENT');
    if (student) return student;
    if (this.data.users && this.data.users.length > 0) return this.data.users[0];
    return SEED_USERS[0];
  }

  public setActiveUser(userId: string): User | undefined {
    const user = this.data.users.find(u => u.id === userId);
    if (user) {
      this.data.activeUserId = userId;
      this.saveData();
    }
    return user;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User) {
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  public updateUser(userId: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === userId);
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.saveData();
      return this.data.users[idx];
    }
    return undefined;
  }

  // Courses, Modules, Lessons & Progress
  public getCourses(): Course[] {
    return this.data.courses;
  }

  public getCourseById(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  public addCourse(course: Course) {
    this.data.courses.unshift(course);
    this.saveData();
    return course;
  }

  public getModulesByCourse(courseId: string): Module[] {
    return this.data.modules.filter(m => m.courseId === courseId).sort((a, b) => a.order - b.order);
  }

  public addModule(module: Module) {
    this.data.modules.push(module);
    this.saveData();
    return module;
  }

  public getLessonsByCourse(courseId: string): Lesson[] {
    return this.data.lessons.filter(l => l.courseId === courseId).sort((a, b) => a.order - b.order);
  }

  public getLessonById(id: string): Lesson | undefined {
    return this.data.lessons.find(l => l.id === id);
  }

  public addLesson(lesson: Lesson) {
    this.data.lessons.push(lesson);
    this.saveData();
    return lesson;
  }

  public getLessonProgress(userId: string, lessonId: string): LessonProgress | undefined {
    return this.data.lessonProgress.find(p => p.userId === userId && p.lessonId === lessonId);
  }

  public markLessonComplete(userId: string, courseId: string, lessonId: string) {
    let prog = this.getLessonProgress(userId, lessonId);
    if (prog) {
      prog.completed = true;
      prog.completedAt = new Date().toISOString();
    } else {
      prog = {
        id: `prog_${Date.now()}`,
        userId,
        courseId,
        lessonId,
        completed: true,
        timeSpentSeconds: 1800,
        lastAccessedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      this.data.lessonProgress.push(prog);
    }
    this.saveData();
    return prog;
  }

  // Assignments & Submissions
  public getAssignments(): Assignment[] {
    return this.data.assignments;
  }

  public getAssignmentById(id: string): Assignment | undefined {
    return this.data.assignments.find(a => a.id === id);
  }

  public addAssignment(assignment: Assignment) {
    this.data.assignments.unshift(assignment);
    this.saveData();
    return assignment;
  }

  public getSubmissions(): Submission[] {
    return this.data.submissions;
  }

  public getSubmissionsByAssignment(assignmentId: string): Submission[] {
    return this.data.submissions.filter(s => s.assignmentId === assignmentId);
  }

  public getStudentSubmission(assignmentId: string, studentId: string): Submission | undefined {
    return this.data.submissions.find(s => s.assignmentId === assignmentId && s.studentId === studentId);
  }

  public addOrUpdateSubmission(sub: Submission) {
    const idx = this.data.submissions.findIndex(s => s.id === sub.id || (s.assignmentId === sub.assignmentId && s.studentId === sub.studentId));
    if (idx >= 0) {
      this.data.submissions[idx] = sub;
    } else {
      this.data.submissions.unshift(sub);
    }
    this.saveData();
    return sub;
  }

  // Question Bank & Quizzes
  public getQuestions(): Question[] {
    return this.data.questions;
  }

  public addQuestionsBulk(newQuestions: Question[]) {
    this.data.questions.push(...newQuestions);
    this.saveData();
    return newQuestions;
  }

  public getQuizzes(): Quiz[] {
    return this.data.quizzes;
  }

  public getQuizById(id: string): Quiz | undefined {
    return this.data.quizzes.find(q => q.id === id);
  }

  public addQuiz(quiz: Quiz) {
    this.data.quizzes.unshift(quiz);
    this.saveData();
    return quiz;
  }

  public deleteQuiz(id: string) {
    this.data.quizzes = this.data.quizzes.filter(q => q.id !== id);
    this.saveData();
    return true;
  }

  public addQuizAttempt(attempt: QuizAttempt) {
    this.data.quizAttempts.unshift(attempt);
    this.saveData();
    return attempt;
  }

  public getQuizAttemptsByStudent(studentId: string): QuizAttempt[] {
    return this.data.quizAttempts.filter(qa => qa.studentId === studentId);
  }

  public getAllQuizAttempts(): QuizAttempt[] {
    return this.data.quizAttempts;
  }

  // Daily Reports
  public getDailyReports(): DailyReport[] {
    return this.data.dailyReports;
  }

  public addDailyReport(report: DailyReport) {
    this.data.dailyReports.unshift(report);
    this.saveData();
    return report;
  }

  public reviewDailyReport(id: string, facultyComment: string, reviewerName: string) {
    const report = this.data.dailyReports.find(r => r.id === id);
    if (report) {
      report.facultyComment = facultyComment;
      report.reviewedBy = reviewerName;
      report.status = 'Reviewed';
      this.saveData();
    }
    return report;
  }

  // Coding Profiles & LeetCode Practice
  public getCodingProfile(studentId: string): CodingProfile | undefined {
    return this.data.codingProfiles.find(cp => cp.studentId === studentId);
  }

  public getAllCodingProfiles(): CodingProfile[] {
    return this.data.codingProfiles || [];
  }

  public updateCodingProfile(cp: CodingProfile) {
    const idx = this.data.codingProfiles.findIndex(item => item.studentId === cp.studentId);
    if (idx >= 0) {
      this.data.codingProfiles[idx] = cp;
    } else {
      this.data.codingProfiles.push(cp);
    }
    this.saveData();
    return cp;
  }

  public getCodingProblems(): CodingProblem[] {
    return this.data.codingProblems || [];
  }

  public getCodingProblemBySlug(slug: string): CodingProblem | undefined {
    return (this.data.codingProblems || []).find(p => p.slug === slug || p.id === slug);
  }

  public getCodingSubmissions(studentId?: string): CodingSubmission[] {
    if (studentId) {
      return (this.data.codingSubmissions || []).filter(s => s.studentId === studentId);
    }
    return this.data.codingSubmissions || [];
  }

  public addCodingSubmission(sub: CodingSubmission) {
    if (!this.data.codingSubmissions) this.data.codingSubmissions = [];
    this.data.codingSubmissions.unshift(sub);
    this.saveData();
    return sub;
  }

  // Portfolios & Resumes
  public getPortfolioItems(studentId: string): PortfolioItem[] {
    return this.data.portfolioItems.filter(p => p.studentId === studentId);
  }

  public addPortfolioItem(item: PortfolioItem) {
    this.data.portfolioItems.unshift(item);
    this.saveData();
    return item;
  }

  public getResume(studentId: string): ResumeData | undefined {
    return this.data.resumes[studentId] || (studentId === SEED_RESUME.studentId ? SEED_RESUME : undefined);
  }

  public saveResume(resume: ResumeData) {
    this.data.resumes[resume.studentId] = resume;
    this.saveData();
    return resume;
  }

  // Placement Companies, Drives & Applications
  public getCompanies(): Company[] {
    return this.data.companies;
  }

  public addCompany(company: Company) {
    this.data.companies.unshift(company);
    this.saveData();
    return company;
  }

  public getPlacementDrives(): PlacementDrive[] {
    return this.data.placementDrives;
  }

  public getPlacementDriveById(id: string): PlacementDrive | undefined {
    return this.data.placementDrives.find(d => d.id === id);
  }

  public addPlacementDrive(drive: PlacementDrive) {
    this.data.placementDrives.unshift(drive);
    this.saveData();
    return drive;
  }

  public getApplications(): PlacementApplication[] {
    return this.data.applications;
  }

  public getApplicationsByStudent(studentId: string): PlacementApplication[] {
    return this.data.applications.filter(a => a.studentId === studentId);
  }

  public addOrUpdateApplication(app: PlacementApplication) {
    const idx = this.data.applications.findIndex(a => a.id === app.id);
    if (idx >= 0) {
      this.data.applications[idx] = app;
    } else {
      this.data.applications.unshift(app);
    }
    this.saveData();
    return app;
  }

  // Knowledge Sources (RAG)
  public getKnowledgeSources(): AIKnowledgeSource[] {
    return this.data.knowledgeSources;
  }

  public addKnowledgeSource(source: AIKnowledgeSource) {
    this.data.knowledgeSources.unshift(source);
    this.saveData();
    return source;
  }

  // Notifications
  public getNotifications(userOrRole?: { userId?: string; role?: string }): Notification[] {
    return this.data.notifications.filter(n => {
      if (userOrRole?.userId && n.targetUserId === userOrRole.userId) return true;
      if (userOrRole?.role && n.targetRole === userOrRole.role) return true;
      return !n.targetUserId && !n.targetRole;
    });
  }

  public addNotification(notification: Notification) {
    this.data.notifications.unshift(notification);
    this.saveData();
    return notification;
  }

  public markNotificationRead(id: string) {
    const n = this.data.notifications.find(item => item.id === id);
    if (n) {
      n.read = true;
      this.saveData();
    }
    return n;
  }

  // Audit Logs
  public getAuditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public logAudit(log: AuditLog) {
    this.data.auditLogs.unshift(log);
    this.saveData();
    return log;
  }

  // AI Mock Interviews
  public getMockInterviews(): MockInterviewSession[] {
    return this.data.mockInterviews || [];
  }

  public getMockInterviewsByStudent(studentId: string): MockInterviewSession[] {
    return (this.data.mockInterviews || []).filter(mi => mi.studentId === studentId);
  }

  public addMockInterview(session: MockInterviewSession) {
    if (!this.data.mockInterviews) this.data.mockInterviews = [];
    this.data.mockInterviews.unshift(session);
    this.saveData();
    return session;
  }

  // Malpractice Incident Tracking
  public getMalpracticeIncidents(): MalpracticeIncident[] {
    return this.data.malpracticeIncidents || [];
  }

  public getUnnotedMalpracticeCount(): number {
    const list = this.data.malpracticeIncidents || [];
    const lastNoted = this.data.lastMalpracticeNotedAt;
    if (!lastNoted) {
      return list.filter((i) => !i.noted).length;
    }
    const lastNotedTime = new Date(lastNoted).getTime();
    return list.filter((i) => !i.noted && new Date(i.timestamp).getTime() > lastNotedTime).length;
  }

  public markAllMalpracticeNoted(): void {
    const now = new Date().toISOString();
    this.data.lastMalpracticeNotedAt = now;
    if (Array.isArray(this.data.malpracticeIncidents)) {
      this.data.malpracticeIncidents.forEach((i) => {
        i.noted = true;
      });
    }
    this.saveData();
  }

  public getLastMalpracticeNotedAt(): string | null {
    return this.data.lastMalpracticeNotedAt || null;
  }

  public addMalpracticeIncident(incident: MalpracticeIncident): MalpracticeIncident {
    if (!this.data.malpracticeIncidents) this.data.malpracticeIncidents = [];
    incident.noted = false;
    this.data.malpracticeIncidents.unshift(incident);
    this.saveData();
    return incident;
  }

  public updateMalpracticeIncidentStatus(
    idOrIds: string | string[],
    status: 'REPORTED' | 'WARNING_ISSUED' | 'DISMISSED'
  ): boolean {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    let changed = false;
    (this.data.malpracticeIncidents || []).forEach((i) => {
      if (ids.includes(i.id)) {
        i.status = status;
        changed = true;
      }
    });
    if (changed) {
      this.saveData();
      return true;
    }
    return false;
  }
}

export const dbStore = new DatabaseStore();
