# Implementation Plan — SGIP (Student Growth Intelligence Platform)

SGIP is an AI-powered learning intelligence and placement-readiness platform built exclusively for Engineering Colleges. It connects the complete student growth journey:
**Learn → Practice → Assess → Analyze → Identify Gaps → AI Recommend → Improve → Become Placement Ready**

This plan outlines the architecture, database schema, security/RBAC engine, full UI/UX design system, core feature modules, RAG AI subsystem, CSV quiz importer, resume builder, placement eligibility engine, and end-to-end user workflows for SGIP.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions:**
> 1. **Tech Stack:** Next.js 15 (App Router, TypeScript, Tailwind CSS), Lucide Icons, Framer Motion, Recharts, SQLite via Prisma / libsqlite3 for full persistent data storage, local RAG vector embedding engine (Cosine similarity over chunked text), and client-side PDF/Resume generator.
> 2. **3 Strict Business Roles:** `STUDENT`, `FACULTY`, `PLACEMENT COORDINATOR`. No additional roles will be created; permissions and department scopes will be enforced server-side.
> 3. **Interactive Demo Role Switcher:** A unobtrusive top header bar allows instantaneous switching between test persona accounts (e.g. Student *Aarav Sharma*, Faculty *Dr. Ramesh Verma*, Placement Coordinator *Prof. Sunita Rao*) so all 3 roles and the entire Golden Journey can be seamlessly tested without manual re-login.
> 4. **AI & RAG Subsystem:** RAG engine processes uploaded course materials/notes/PDFs into chunks, computes vector embeddings, and performs context retrieval with source citations. If no local key is set, a smart mock LLM generator fallback delivers accurate grounded responses based on retrieved context.

---

## Proposed Architecture & File Structure

```
c:/Users/syed ayaz shah/OneDrive/Desktop/team 60/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── api/                    # Server-side REST & Authorization APIs
│   │   │   ├── auth/               # Login, signup, me, logout, demo-switch
│   │   │   ├── courses/            # Course, module, lesson & resource APIs
│   │   │   ├── assignments/        # Assignment creation, submission & grading APIs
│   │   │   ├── quizzes/            # Quiz creation, question bank, CSV import, attempts
│   │   │   ├── daily-reports/      # Daily report submission & faculty review
│   │   │   ├── coding/             # Coding profile & platform activity tracker
│   │   │   ├── portfolio/          # Portfolio auto-sync & visibility settings
│   │   │   ├── resume/             # Resume versioning, templates & AI enhancements
│   │   │   ├── placement/          # Drives, companies, eligibility engine, applications, interviews, offers
│   │   │   ├── analytics/          # SGIP Growth Score & Placement Readiness score calculators
│   │   │   ├── ai/                 # RAG chat, document chunking & vector search
│   │   │   ├── notifications/      # In-app notification management
│   │   │   ├── search/             # Role-filtered global search API
│   │   │   └── audit/              # Security audit log trail
│   │   ├── (auth)/                 # Auth routes (login, signup, forgot-password)
│   │   ├── (dashboard)/            # Authenticated App Shell layout & pages
│   │   │   ├── dashboard/          # Role-specific main dashboards
│   │   │   ├── courses/            # Course catalog, detail & interactive lesson view
│   │   │   ├── assignments/        # Student submissions & Faculty grading view
│   │   │   ├── quizzes/            # Quiz take page, result page, Faculty quiz/question manager & CSV upload
│   │   │   ├── daily-reports/      # Student daily log & Faculty review panel
│   │   │   ├── coding/             # DSA/Coding Tracker dashboard
│   │   │   ├── portfolio/          # Student showcase portfolio
│   │   │   ├── resume/             # Interactive ATS / Professional Resume builder
│   │   │   ├── placement/          # Placement drives, eligibility engine checker, applications, interviews, offers
│   │   │   ├── analytics/          # Growth Score & At-Risk student drill-downs
│   │   │   ├── ai-assistant/       # RAG Learning Assistant & Faculty Knowledge Base Manager
│   │   │   ├── announcements/      # News, events, workshops & placement alerts
│   │   │   └── profile/            # User settings & notifications preferences
│   ├── components/
│   │   ├── ui/                     # Premium UI components (buttons, modals, badges, cards, tabs, inputs, tables)
│   │   ├── shell/                  # Sidebar, TopNav, DemoRoleSwitcher, NotificationDrawer, SearchModal
│   │   ├── dashboard/              # Student/Faculty/Placement cards & charts
│   │   ├── courses/                # Lesson player, resource list, progress trackers
│   │   ├── assignments/            # Submission dropzone, grading modal, code editor preview
│   │   ├── quizzes/                # Timer component, question cards, CSV validation error previewer
│   │   ├── placement/              # Eligibility decision summary, application status pipeline
│   │   ├── resume/                 # ATS & Modern templates, live previewer, PDF exporter
│   │   ├── ai/                     # Chat interface, context source pill badge, knowledge uploader
│   │   └── analytics/              # Recharts score breakdown radar/bar charts
│   ├── lib/
│   │   ├── auth.ts                 # Role-based auth, JWT/Session validation, server guard
│   │   ├── db.ts                   # SQLite / Prisma persistent database client
│   │   ├── scoring.ts              # SGIP Growth Score & Placement Readiness score algorithms
│   │   ├── eligibility.ts          # Placement Eligibility Rule Evaluation Engine
│   │   ├── csv-parser.ts           # CSV/XLSX question bank parser & validation pipeline
│   │   ├── rag-engine.ts           # Text chunking, vector embedding, cosine search & RAG query context builder
│   │   └── seed-data.ts            # Realistic engineering college seed dataset
│   └── types/                      # TypeScript definitions for all schemas & APIs
```

---

## Detailed Component & Feature Design

### 1. Database Schema & Entities
* **Users & Profiles:** ID, Name, Email, PasswordHash, Role (`STUDENT`, `FACULTY`, `PLACEMENT_COORDINATOR`), Department, Semester, Batch, CGPA, Backlogs, Avatar, CreatedAt.
* **Courses, Modules, Lessons & Resources:** Title, Description, Instructor, Duration, VideoUrl, PDFUrl, CodeSnippet, Content, Status.
* **Enrollments & Lesson Progress:** UserID, LessonID, Completed, TimeSpent, CompletedAt.
* **Assignments & Submissions:** Assignment details, SubmissionType (PDF/ZIP/Code/GitHub), SubmissionStatus (`Submitted`, `Under Review`, `Graded`, `Approved`, `Returned`), Grade, Feedback.
* **Question Bank & Quizzes:** Question text, Options A-D, CorrectAnswer, Subject, Topic, Difficulty, Explanation, Marks, NegativeMarks; Quiz details, Attempts, Answers, Auto-score.
* **Daily Reports:** StudyHours, TopicsLearned, TasksCompleted, ProblemsSolved, Reflection, TomorrowPlan, FacultyComment, Status (`Pending`, `Reviewed`).
* **Coding Profiles:** LeetCode, HackerRank, CodeChef, Codeforces stats (Easy/Medium/Hard breakdown, streak, verified vs manual status).
* **Portfolios & Certificates:** Projects, Certifications, Skills, Auto-synced course completions, Public visibility toggles.
* **Resumes:** Version name, Template (`ATS`, `Professional`), Summary, Work experience, Projects, Skills, Education, Achievements, PDF download configuration.
* **Placement Companies & Drives:** Company info, Role title, Package (LPA), Location, Eligibility criteria JSON (Min CGPA, Max backlogs, Depts, Required skills), Deadline.
* **Applications & Selection Rounds:** Drive ID, Student ID, Snapshot Eligibility status, Current Round (`Applied`, `Aptitude`, `Technical Interview`, `HR Interview`, `Offered`, `Rejected`), Interview Schedule date/link.
* **AI Knowledge Sources & RAG Embeddings:** Document title, Source type, Content chunks, Vector embeddings, User visibility scope.
* **Growth & Readiness Scores:** Calculated SGIP Growth Score (0-100), Placement Readiness Score (0-100), metric breakdowns (Technical, Coding, Academics, Aptitude, Portfolio, Consistency), AI actionable recommendations.
* **Notifications & Audit Logs:** Title, Message, Category, TargetRole/User, ReadStatus, Audit log action history.

---

## Verification Plan

### Automated Verification
1. **TypeScript Build & Lint Check:** Run `npm run build` to verify no compilation errors.
2. **API Endpoint Verification:** Ensure all endpoints return properly structured responses and validate role permissions.
3. **Database Integrity:** Test database initialization and query handlers with seed data.

### Manual Verification & Golden User Journey Walkthrough
1. **Student Journey:**
   - Log in as Student (*Aarav Sharma*).
   - View Dashboard metrics (Growth Score: 88, Placement Readiness: 82%, Streak: 12 days).
   - Open Python & Data Structures Course -> Watch Recursion Lesson -> Click "Ask AI" for lesson explanation.
   - Complete lesson -> Submit Assignment -> Take Quiz with auto-grading -> Log Daily Report.
   - View updated Portfolio with auto-added course certificate & view ATS Resume Preview.
   - Check Placement Drives -> Test Eligibility Engine (Satisfies 7.5 CGPA, no backlogs) -> Apply for Drive.
2. **Faculty Journey:**
   - Switch to Faculty (*Dr. Ramesh Verma*).
   - View Faculty Dashboard -> Check At-Risk Students list (*Student B flagged for low learning hours*).
   - Grade Student Assignment & add feedback.
   - Review and comment on Student's Daily Report.
   - Open Quiz Manager -> Launch Question Bank CSV Import Wizard -> Validate row errors (missing option C, duplicate question) -> Import valid rows.
   - Upload new lecture PDF into RAG Knowledge Base.
3. **Placement Coordinator Journey:**
   - Switch to Placement Coordinator (*Prof. Sunita Rao*).
   - Create new Placement Drive for *Google / Microsoft* with eligibility criteria (CGPA >= 7.5, Python, DSA).
   - View eligible vs ineligible student breakdown with detailed evaluation logs.
   - Advance student application status from *Applied* to *Technical Interview* to *Offered*.
   - View Placement Analytics dashboard (Department-wise placement %, package distribution).

---
