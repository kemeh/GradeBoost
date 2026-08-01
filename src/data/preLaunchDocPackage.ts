export interface DocItem {
  id: string;
  title: string;
  category: string;
  categoryId: 'product' | 'user' | 'admin' | 'dev' | 'mobile' | 'deployment' | 'security' | 'legal' | 'partner' | 'qa' | 'maintenance';
  audience: ('Users' | 'Administrators' | 'Developers' | 'Legal & Compliance' | 'Partners')[];
  lastUpdated: string;
  summary: string;
  content: string;
}

export interface DocCategory {
  id: 'product' | 'user' | 'admin' | 'dev' | 'mobile' | 'deployment' | 'security' | 'legal' | 'partner' | 'qa' | 'maintenance';
  name: string;
  iconName: string;
  description: string;
  itemCount: number;
}

export const DOC_CATEGORIES: DocCategory[] = [
  { id: 'product', name: '1. Product Documentation', iconName: 'FileText', description: 'PRD, platform overview, core modules, feature specifications & vision.', itemCount: 3 },
  { id: 'user', name: '2. User Guides & Manuals', iconName: 'Users', description: 'Comprehensive onboarding & usage guides for Students, Teachers & Institutions.', itemCount: 3 },
  { id: 'admin', name: '3. Administrator Manual', iconName: 'Shield', description: 'Operating procedures for users, curriculum, question banks, partners & i18n.', itemCount: 6 },
  { id: 'dev', name: '4. Developer Documentation', iconName: 'Code', description: 'Tech stack, system architecture, database schema (Firestore/SQL) & API specs.', itemCount: 4 },
  { id: 'mobile', name: '5. Mobile App Documentation', iconName: 'Smartphone', description: 'PWA/Android user guide, APK signing, build release & Play Store specs.', itemCount: 2 },
  { id: 'deployment', name: '6. Deployment Guide', iconName: 'Server', description: 'Cloud Run, domain setup, SSL, environment vars & production release checklist.', itemCount: 2 },
  { id: 'security', name: '7. Security & Compliance', iconName: 'Lock', description: 'Security policies, audit templates, incident response & disaster recovery plans.', itemCount: 4 },
  { id: 'legal', name: '8. Privacy & Legal Documents', iconName: 'Scale', description: 'Privacy Policy, Terms, Cookie Policy, Acceptable Use, Refund Policy & DPA.', itemCount: 7 },
  { id: 'partner', name: '9. Partnership Documents', iconName: 'Building2', description: 'Institutional partner agreement templates & onboarding guides for alliances.', itemCount: 2 },
  { id: 'qa', name: '10. Quality Assurance & Launch', iconName: 'CheckCircle2', description: 'Testing plans, bug report templates, and final pre-launch verification checklist.', itemCount: 3 },
  { id: 'maintenance', name: '11. Monitoring & Maintenance', iconName: 'Activity', description: 'System maintenance manuals, error logging, performance monitoring & patches.', itemCount: 2 }
];

export const PRE_LAUNCH_DOCUMENTS: DocItem[] = [
  // ==========================================
  // 1. PRODUCT DOCUMENTATION
  // ==========================================
  {
    id: 'prd-master',
    title: 'Product Requirements Document (PRD)',
    category: '1. Product Documentation',
    categoryId: 'product',
    audience: ['Developers', 'Administrators', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Master product requirements defining vision, objectives, supported education systems, and target user journeys.',
    content: `
# Product Requirements Document (PRD)

## 1. Platform Vision & Objectives
Edulpha is a next-generation, AI-assisted multi-curriculum Learning & Examination Platform built to bridge the educational gap in bilingual and regional secondary education environments (specifically Anglo-Saxon GCE O/A Levels, French Sub-system Baccalauréat/Probatoire, and international curricula).

### Primary Objectives:
1. **Curriculum Alignment:** Provide 100% official past paper & mock exam coverage for GCE Board & Ministry of Secondary Education (MINESEC) curricula.
2. **AI-Powered Learning Support:** Deliver real-time diagnostic evaluation, step-by-step problem resolution, and adaptive daily drills powered by Google Gemini AI models.
3. **Multi-System Agility:** Seamlessly switch between English (Anglo-Saxon system) and French (French Sub-system) with single-click translation and specialized terminology mapping.
4. **Institutional Partnership Integration:** Enable education boards, telecom partners, and school networks to manage co-branded learning hubs, scholarship allocations, and official verified resources.

---

## 2. Target Users & User Personas
- **Secondary Students (Forms 1-5, Lower/Upper Sixth, Troisième, Seconde, Première, Terminale):** Seeking exam prep, instant question explanations, interactive drills, and peer duel battles.
- **Teachers & Tutors:** Seeking paper generation tools, class analytics, assignment tracking, and question bank contributions.
- **School Administrators:** Requiring student cohort performance dashboards, institution management, and attendance/progress reports.
- **Platform Admins & Editors:** Overseeing curriculum structures, question bank verification, multi-language localization, and partner alliances.

---

## 3. Supported Education Systems & Curricula Hierarchy
1. **Cameroon Anglo-Saxon Sub-System:**
   - GCE Ordinary Level (Arts & Science Specialties)
   - GCE Advanced Level (Arts, Commercial, & Science Streams)
2. **Cameroon French Sub-System:**
   - Probatoire (Séries A, C, D, TI, ESG)
   - Baccalauréat (Séries A, C, D, TI, ESG)
3. **Future Extensible Curricula:**
   - WASSCE / WAEC (West African Senior School Certificate)
   - Cambridge International IGCSE / AS & A Level

---

## 4. Product Roadmap & Strategic Milestones
- **Phase 1 (Completed - Pre-Launch):** Core Question Bank (15,000+ items), Multi-Language i18n Engine, AI Diagnostic Engine, Duel Battles, Admin & Partner Portal, PWA/Mobile distribution.
- **Phase 2 (Post-Launch Q3 2026):** Offline Question Cache for low-bandwidth zones, USSD/SMS Drill Integration with Telecom Partners (MTN/Orange).
- **Phase 3 (Q4 2026):** Live Virtual Classrooms, AI Oral Exam Simulator, and University Entrance Exam Modules.
`
  },
  {
    id: 'product-overview',
    title: 'Product Overview & Architecture Ecosystem',
    category: '1. Product Documentation',
    categoryId: 'product',
    audience: ['Users', 'Administrators', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'High-level description of core modules, user roles, web & mobile ecosystem, and competitive advantages.',
    content: `
# Product Overview & Ecosystem Architecture

## 1. System Ecosystem
Edulpha operates as an integrated multi-platform ecosystem comprising:
- **Responsive Web Application (Vite + React + Tailwind CSS):** Desktop & tablet optimized learning portal.
- **Mobile Progressive Web App (PWA) & Android Build:** Native-like mobile experience with biometric quick login, push notifications, and offline reading.
- **Express + Node.js API Gateway:** Secure proxy handling authentication, Gemini AI interactions, payment webhooks, and data caching.
- **Firebase Cloud Infrastructure (Firestore & Auth):** Real-time persistent state, security rules, and user role validation.

## 2. Core Operational Modules
1. **Dynamic Practice & Diagnostic Module:** Adaptive practice sessions by subject, chapter, paper, and topic with instant AI explanations.
2. **Real-Time Timed Examination Engine:** Simulated GCE/Baccalauréat conditions with automated grading, marksheet generation, and diagnostic feedback.
3. **AI Tutor & Instant Solver:** Integrated Gemini 2.5 Flash assistant with OCR diagram handling, step-by-step guidance, and hint progression.
4. **Interactive Learning Challenges & Duel Battles:** Multiplayer quiz duels, daily drill streaks, and leaderboard gamification.
5. **Partner & Institutional Management Hub:** Showcase verified partners (Ministries, GCE Board, Telecoms, Universities) with dedicated portal access and analytics.
6. **Multi-Language Studio:** Dynamic bilingual (English/French) translation engine with context-aware educational dictionaries.
`
  },
  {
    id: 'feature-specifications',
    title: 'Comprehensive Feature Specifications',
    category: '1. Product Documentation',
    categoryId: 'product',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Detailed technical and operational functional specifications for all core platform features.',
    content: `
# Platform Feature Specifications

### 1. Authentication & Security Module
- **Supported Login Methods:** Email/Password, Firebase Anonymous (Guest Mode), Google OAuth (optional).
- **Role-Based Access Control (RBAC):** Roles include \`student\`, \`teacher\`, \`admin\`, \`partner_manager\`.
- **Security Features:** JWT verification, Cloud Run header sanitization, anti-bruteforce protection, and automatic session revocation upon password reset.

### 2. Curriculum Management Engine
- **Hierarchy:** System -> Category -> Level -> Stream/Specialty -> Subject -> Paper (Paper 1 MCQ, Paper 2 Structured/Essay, Paper 3 Practical).
- **Dynamic Field Mapping:** Supports customizable grading scales (GCE A-F, French 0-20 scale) and coefficient weightings per subject.

### 3. Examination & Diagnostic Engine
- **Session Rules:** Fixed duration timer, question navigator grid, flag-for-review state, auto-submission upon timer expiry.
- **Post-Exam Analytics:** Strengths/Weaknesses radar, topic mastery percentage, speed per question analysis, and AI-recommended study plan.

### 4. Partner & Institutional Portal
- **Features:** Verified partner badging, landing page marquee banner, custom landing page sections, tier classification (Ministry, Examination Board, Telecom, University, EdTech Alliance).
`
  },

  // ==========================================
  // 2. USER DOCUMENTATION
  // ==========================================
  {
    id: 'student-user-guide',
    title: 'Student User Guide & Manual',
    category: '2. User Guides & Manuals',
    categoryId: 'user',
    audience: ['Users'],
    lastUpdated: '2026-08-01',
    summary: 'Step-by-step instructions for students from registration to exam taking, AI practice, and progress tracking.',
    content: `
# Student User Guide

Welcome to **Edulpha**! This guide will walk you through setting up your student profile and achieving top exam performance.

---

## 🔑 1. Getting Started: Account & Profile Setup
1. **Registration:**
   - Visit [edulpha.com](https://edulpha.com) or open the Edulpha Mobile App.
   - Click **Get Started** / **Sign Up**. Enter your full name, email, and password.
   - Check your email inbox to verify your email address.
2. **Choosing Your Education System & Specialty:**
   - Go to **Profile Settings**.
   - Select your **Education System** (e.g., *Cameroon GCE Board* or *French Sub-System MINESEC*).
   - Select your **Level** (e.g., *Advanced Level* or *Terminale*) and **Specialty/Stream** (e.g., *Sciences - S1 / S2* or *Série C / D*).
   - This selection customizes your subjects, past papers, and daily drill recommendations!

---

## 📚 2. Practicing Past Papers & Using AI Tutor
1. Navigate to **Practice** from the top menu or dashboard.
2. Select your desired subject (e.g., *Mathematics*, *Physics*, *Biology*, *Economics*).
3. Choose between:
   - **Topic-by-Topic Practice:** Target specific weak topics (e.g., *Calculus*, *Genetics*).
   - **Full Past Papers (2010 - 2025):** Practice official Paper 1 MCQs or Paper 2 questions.
4. **Asking the AI Tutor:**
   - If stuck on a question, click **Ask AI Tutor**.
   - The AI will provide step-by-step hints without revealing the full answer immediately, helping you learn the concepts.

---

## ⏱️ 3. Taking Timed Mock Exams
1. Navigate to **Exams Portal**.
2. Select an active Mock Exam or past national exam paper.
3. Click **Start Exam**. Ensure you have a stable internet connection.
4. Use the **Question Navigation Grid** on the right side to jump between questions or flag questions for later review.
5. Submit your exam before the timer expires or let the auto-submit feature lock in your answers when time runs out.
6. Immediately view your **Detailed Marksheet**, percentage score, and AI diagnostic feedback.

---

## 🏆 4. Daily Drills, Duel Battles & Leaderboards
- **Daily Drills:** Complete 5 quick daily questions every morning to maintain your learning streak!
- **Duel Battles:** Challenge classmates or random peers to 1-on-1 real-time quiz duels.
- **Leaderboard:** Earn XP for correct answers and climb your school, regional, and national leaderboards!
`
  },
  {
    id: 'teacher-user-guide',
    title: 'Teacher & Tutor User Guide',
    category: '2. User Guides & Manuals',
    categoryId: 'user',
    audience: ['Users', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Guide for teachers to monitor student performance, generate test papers, and assign custom practice sets.',
    content: `
# Teacher & Tutor User Guide

The Edulpha Teacher Portal empowers educators to track student progress, generate customized exam papers, and analyze class performance.

---

## 👨‍🏫 1. Class & Student Performance Analytics
1. Navigate to **/teacher** or click **Teacher Portal** in the navigation bar.
2. View your **Class Roster** and individual student completion metrics.
3. Access the **Diagnostic Matrix** to see which specific syllabus topics (e.g., *Organic Chemistry - Reaction Mechanisms*) are causing students to lose marks.

---

## 📝 2. Automated Test Paper Generator
1. Go to **Paper Generator**.
2. Select target curriculum, subject, and difficulty level.
3. Specify question counts (e.g., 30 MCQs + 4 Essay Questions).
4. Click **Generate Paper & Marking Scheme**.
5. Export as a high-resolution PDF or assign directly to your enrolled students' dashboards.
`
  },
  {
    id: 'institution-user-guide',
    title: 'School & Institution Management Guide',
    category: '2. User Guides & Manuals',
    categoryId: 'user',
    audience: ['Users', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Guide for school principals, department heads, and education officers to manage multi-class analytics.',
    content: `
# School & Institution Management Guide

Institutional accounts allow schools, colleges, and regional education offices to monitor multi-class performance and co-manage curriculum goals.

### Key Capabilities:
- **School Dashboard:** Real-time metrics showing student active hours, average exam scores, and target completion percentages.
- **Bulk Student Enrolment:** Upload CSV manifests of student rosters to instantly provision accounts.
- **Institutional Branding:** Access custom co-branded dashboards featuring school logos and partner badges.
`
  },

  // ==========================================
  // 3. ADMINISTRATOR DOCUMENTATION
  // ==========================================
  {
    id: 'admin-user-management',
    title: 'Admin Operating Manual: User Management & RBAC',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Procedures for managing user accounts, assigning admin/teacher permissions, and enforcing security policies.',
    content: `
# Admin Manual: User Management & Security Roles

## 1. Accessing User Management
System administrators can manage all registered accounts via the **Admin Console** at \`/admin\` under the **User Management** tab.

## 2. Managing User Roles & Permissions
- **Student:** Default role. Access to practice, exams, challenges, and public forums.
- **Teacher:** Granted access to Paper Generator, Class Analytics, Question Bank Contribution, and LMS Content creation.
- **Admin:** Full read/write access to Firestore collections, Partner Portal, System Settings, i18n Studio, and User Management.

### Modifying User Roles:
1. Locate the target user via email/name search in \`/admin\`.
2. Click **Edit User Role**.
3. Select new role (\`student\` | \`teacher\` | \`admin\`).
4. Click **Save Role**. Role updates take effect immediately via Firestore claims.
`
  },
  {
    id: 'admin-curriculum-management',
    title: 'Admin Operating Manual: Dynamic Curriculum Management',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Comprehensive instructions for building and updating systems, categories, levels, streams, and subjects.',
    content: `
# Admin Manual: Dynamic Curriculum Management

Edulpha's curriculum tree is fully dynamic. Admins can create new educational systems without touching source code.

## 1. Curriculum Tree Hierarchy
\`\`\`
Education System (e.g., GCE Board)
  └── Category (e.g., Ordinary Level)
       └── Stream / Specialty (e.g., Science)
            └── Subject (e.g., Physics 0580)
                 └── Papers (Paper 1 MCQ, Paper 2 Theory)
                      └── Syllabus Topics / Chapters
\`\`\`

## 2. Adding a New Subject
1. Open \`/admin\` and navigate to the **Curriculum Studio** tab.
2. Select target Education System and Level.
3. Click **+ Add New Subject**.
4. Enter Subject Code (e.g., \`PHY570\`), Name in English (*Physics*), Name in French (*Physique*), Icon, and Description.
5. Configure Examination Rules (Paper 1 time limit, Paper 2 negative marking rules, total pass mark).
6. Click **Publish Subject**.
`
  },
  {
    id: 'admin-question-bank-management',
    title: 'Admin Operating Manual: Question Bank & Bulk Import',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Instructions for creating, editing, tags management, and bulk importing questions via CSV/JSON.',
    content: `
# Admin Manual: Question Bank & Bulk Import

## 1. Question Structure
Each question item in Edulpha supports:
- **Question Text (Bilingual):** En & Fr text with LaTeX formula support (e.g., \`$\\int_0^1 x^2 dx$\`).
- **Media Attachments:** Diagram image URLs for physics/biology questions.
- **Option Set:** 4 distinct choices with designated correct option key.
- **Step-by-Step AI Explanation:** Clear breakdown of how the correct answer is derived.
- **Taxonomy Tags:** Year (e.g., 2024), Exam Type (GCE June, Mock, Diagnostic), Difficulty (Easy, Medium, Hard, Expert).

## 2. Bulk CSV/JSON Import Procedure
1. Go to \`/admin/bulk-import\`.
2. Download the standardized CSV template (\`edulpha_questions_import_template.csv\`).
3. Fill out question data ensuring column headers match (\`subjectId\`, \`paperId\`, \`questionEn\`, \`optionAEn\`, \`correctOptionKey\`, \`explanationEn\`).
4. Upload CSV to the validator. Correct any syntax errors flagged by the pre-parser.
5. Click **Commit Batch to Question Bank**.
`
  },
  {
    id: 'admin-partner-management',
    title: 'Admin Operating Manual: Partner & Alliance Management',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Guidelines for adding, featuring, and categorizing institutional partners on the landing page and portals.',
    content: `
# Admin Manual: Partner & Institutional Alliance Management

## 1. Overview
The Partner Management system displays official alliances (Ministries of Education, GCE Boards, Telecom Operators, Universities, Tech Providers) on the landing page and within student dashboards.

## 2. Partner Categories
- **Government & Ministries:** MINESEC, Ministry of Higher Education.
- **Examination Boards:** Cameroon GCE Board, Office du Baccalauréat du Cameroun (OBC).
- **Telecom & Connectivity:** MTN Cameroon, Orange Cameroun, CAMTEL.
- **Global AI & Infrastructure:** Google Cloud / Google AI Studio.

## 3. Adding a Partner
1. Go to \`/admin\` -> **Partners & Alliances** tab.
2. Click **+ Add New Partner**.
3. Enter Partner Name (EN & FR), Category, Logo URL, Partnership Type (*Official*, *Sponsor*, *Curriculum Provider*), and Description.
4. Toggle **Featured** if the partner logo should appear in the primary marquee banner.
5. Click **Save Partner**. Changes update Firestore instantly with safe local storage fallback.
`
  },
  {
    id: 'admin-translation-management',
    title: 'Admin Operating Manual: i18n & Translation Studio',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Procedures for updating bilingual dictionaries, managing translation keys, and reviewing missing strings.',
    content: `
# Admin Manual: i18n & Multi-Language Studio

Edulpha natively supports English and French. The **Translation Studio** in \`/admin\` allows live editing of application dictionary strings.

### Operations:
- **Searching Keys:** Search by key name (e.g., \`nav.curriculum\`) or value substring.
- **Live Updating:** Edit French or English text and click **Save String**.
- **Missing String Detection:** Automatically highlights UI elements lacking localized text.
`
  },
  {
    id: 'admin-system-settings',
    title: 'Admin Operating Manual: System Settings & Platform Config',
    category: '3. Administrator Manual',
    categoryId: 'admin',
    audience: ['Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Configuration parameters for platform global defaults, maintenance modes, and security toggles.',
    content: `
# Admin Manual: System Settings & Platform Configuration

### Configurable System Flags:
- **Platform Maintenance Mode:** Temporarily restricts student logins while showing a friendly maintenance banner.
- **AI Tutor Throttle Limit:** Sets daily AI request quotas per subscription tier (Free: 25 requests/day, Paid: Unlimited).
- **Default System:** Sets default initial system for new visitors (e.g., GCE Board vs. MINESEC French).
`
  },

  // ==========================================
  // 4. DEVELOPER DOCUMENTATION
  // ==========================================
  {
    id: 'dev-readme',
    title: 'Developer README & Getting Started Guide',
    category: '4. Developer Documentation',
    categoryId: 'dev',
    audience: ['Developers'],
    lastUpdated: '2026-08-01',
    summary: 'Technical setup guide, local installation instructions, scripts, and code layout for developers.',
    content: `
# Edulpha Platform - Developer README

## 🚀 Tech Stack Overview
- **Frontend Framework:** React 18+ with TypeScript, Vite build tool.
- **Styling & UI:** Tailwind CSS v4, Lucide React icons, Motion (Framer Motion derivative).
- **Backend API Server:** Express 4/5 running on Node 20+, bundled via Esbuild into CommonJS (\`dist/server.cjs\`).
- **Database & Auth:** Firebase Firestore (Cloud Database) + Firebase Authentication.
- **AI Infrastructure:** Google GenAI SDK (\`@google/genai\`) connecting server-side to Gemini models.

---

## 💻 Local Development Setup

### 1. Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### 2. Environment Variables (.env)
Create a \`.env\` file in the root directory:
\`\`\`env
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d
\`\`\`

### 3. Installation & Local Run
\`\`\`bash
# Install dependencies
npm install

# Start development server (Port 3000)
npm run dev
\`\`\`

### 4. Code Verification & Build
\`\`\`bash
# Run TypeScript compilation check
npm run lint

# Build full-stack production bundle
npm run build

# Test production server locally
npm start
\`\`\`
`
  },
  {
    id: 'dev-architecture',
    title: 'System Architecture Document',
    category: '4. Developer Documentation',
    categoryId: 'dev',
    audience: ['Developers'],
    lastUpdated: '2026-08-01',
    summary: 'Full architectural diagram and specifications for frontend SPA, Express proxy server, Firestore DB, and Gemini AI.',
    content: `
# System Architecture Document

## 1. High-Level System Architecture Diagram

\`\`\`
  [ Client Tier: Web SPA / Mobile PWA ]
                │
                ├── HTTPS / Port 3000 (Nginx Proxy)
                ▼
  [ Express + Vite Server Layer (dist/server.cjs) ]
        │                       │
        ├── (Server Proxy)      ├── (Database Operations)
        ▼                       ▼
  [ Google Gemini API ]    [ Firebase Firestore DB & Auth ]
\`\`\`

## 2. Component Design Principles
- **API Key Security Rule:** All Gemini AI calls are routed exclusively through server-side Express endpoints (\`/api/chat\`, \`/api/explain\`, \`/api/diagnostic\`). No raw AI secret keys are exposed to client bundles.
- **Optimistic Storage Fallback:** All critical data queries attempt Firestore DB first. If offline or unauthenticated, the application gracefully degrades to cached \`localStorage\` datasets ensuring uninterrupted offline practice.
- **Lazy Component Loading:** All non-critical routes (\`/admin\`, \`/practice\`, \`/analytics\`, \`/challenges\`) are lazily loaded via React \`Suspense\` and \`lazy()\` to guarantee sub-second initial page load times.
`
  },
  {
    id: 'dev-database-schema',
    title: 'Database Schema & Entity Relationship Documentation',
    category: '4. Developer Documentation',
    categoryId: 'dev',
    audience: ['Developers'],
    lastUpdated: '2026-08-01',
    summary: 'Firestore collection schemas, security rules, indexes, and document relationship specs.',
    content: `
# Database Schema & Data Models

## 1. Firestore Collections Overview

### Collection: \`users\`
Document ID: \`uid\` (Firebase Auth UID)
\`\`\`typescript
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  educationSystemId: string;
  levelId: string;
  specialtyId: string;
  paymentStatus: 'free' | 'paid';
  paymentExpiryDate?: string;
  xp: number;
  streakDays: number;
  createdAt: string;
  updatedAt: string;
}
\`\`\`

### Collection: \`questions\`
Document ID: \`questionId\`
\`\`\`typescript
interface QuestionDocument {
  id: string;
  subjectId: string;
  paperId: string;
  questionEn: string;
  questionFr: string;
  optionAEn: string;
  optionAFr: string;
  optionBEn: string;
  optionBFr: string;
  optionCEn: string;
  optionCFr: string;
  optionDEn: string;
  optionDFr: string;
  correctOptionKey: 'A' | 'B' | 'C' | 'D';
  explanationEn: string;
  explanationFr: string;
  imageUrl?: string;
  year: number;
  difficulty: 'easy' | 'medium' | 'hard';
}
\`\`\`

### Collection: \`partners\` & \`partner_categories\`
Document ID: \`partnerId\`
\`\`\`typescript
interface PartnerDocument {
  id: string;
  categoryId: string;
  nameEn: string;
  nameFr: string;
  logoUrl: string;
  partnershipType: string;
  featured: boolean;
  displayStatus: 'active' | 'inactive';
  displayOrder: number;
  shortDescEn: string;
  shortDescFr: string;
  fullDescEn?: string;
  fullDescFr?: string;
  socialLinks: { website?: string; twitter?: string; linkedin?: string; email?: string };
}
\`\`\`
`
  },
  {
    id: 'dev-api-docs',
    title: 'API Endpoints & Integration Documentation',
    category: '4. Developer Documentation',
    categoryId: 'dev',
    audience: ['Developers'],
    lastUpdated: '2026-08-01',
    summary: 'Detailed specifications for backend API endpoints, payload formats, error codes, and headers.',
    content: `
# API Documentation Specification

All endpoints are relative to the server host on Port 3000.

---

## 1. Health Check Endpoint
- **URL:** \`/api/health\`
- **Method:** \`GET\`
- **Response:**
\`\`\`json
{
  "status": "ok",
  "timestamp": "2026-08-01T07:00:00.000Z",
  "environment": "production"
}
\`\`\`

---

## 2. Gemini AI Assistant Proxy
- **URL:** \`/api/ai/tutor\`
- **Method:** \`POST\`
- **Headers:** \`Content-Type: application/json\`
- **Request Body:**
\`\`\`json
{
  "prompt": "Explain the concept of differentiation in calculus for a GCE A-Level student.",
  "subject": "Mathematics",
  "language": "en"
}
\`\`\`
- **Response:**
\`\`\`json
{
  "success": true,
  "response": "Differentiation is the process of finding the derivative or rate of change of a function...",
  "tokensUsed": 142
}
\`\`\`

---

## 3. Error Codes & Handling
- \`400 Bad Request\`: Missing mandatory parameters.
- \`401 Unauthorized\`: Missing or invalid session token.
- \`403 Forbidden\`: Role permissions check failed.
- \`500 Internal Server Error\`: Handled by global exception wrapper with masked diagnostic message.
`
  },

  // ==========================================
  // 5. MOBILE APPLICATION DOCUMENTATION
  // ==========================================
  {
    id: 'mobile-user-guide',
    title: 'Mobile App User & Installation Manual',
    category: '5. Mobile App Documentation',
    categoryId: 'mobile',
    audience: ['Users'],
    lastUpdated: '2026-08-01',
    summary: 'Mobile PWA and Android installation, offline mode usage, and push notification setup.',
    content: `
# Mobile Application User Guide

Edulpha is fully optimized for mobile devices as both a Progressive Web App (PWA) and an Android APK.

### 📱 Installing the PWA (iOS & Android):
1. Open Chrome or Safari on your mobile device and go to **edulpha.com**.
2. Tap the browser menu (or Share button on Safari).
3. Select **Add to Home Screen**.
4. Launch Edulpha directly from your home screen icon with fullscreen display and quick biometric access.

### 📶 Offline Mode Capabilities:
- Downloaded practice sets and past papers remain accessible even without an active mobile data connection!
- Your drill scores automatically sync to the server when connection is restored.
`
  },
  {
    id: 'mobile-release-docs',
    title: 'Mobile Release & Build Documentation',
    category: '5. Mobile App Documentation',
    categoryId: 'mobile',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Step-by-step guide for generating signed Android APKs/AABs and preparing Google Play Store releases.',
    content: `
# Mobile App Release & APK Build Guide

## 1. Android Capacitor / TWA Packaging Process
1. Verify web build outputs in \`dist/\` using \`npm run build\`.
2. Sync Capacitor / Android assets:
   \`\`\`bash
   npx cap sync android
   \`\`\`
3. Open Android Studio project in \`/android\`.

## 2. Keystore Signing & Production AAB Generation
- Keystore Alias: \`edulpha_prod_key\`
- Build Target: Android App Bundle (\`.aab\`) for Play Console upload.
- Target SDK: 34 (Android 14+ compatible).
`
  },

  // ==========================================
  // 6. DEPLOYMENT DOCUMENTATION
  // ==========================================
  {
    id: 'deployment-guide',
    title: 'Production Deployment Guide',
    category: '6. Deployment Guide',
    categoryId: 'deployment',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Infrastructure deployment guide for Cloud Run container hosting, domain SSL, and environment vars.',
    content: `
# Production Deployment Guide (Cloud Run Container Engine)

## 1. Overview
The Edulpha production stack deploys to Google Cloud Run as a stateless containerized Node application running behind Nginx on Port 3000.

## 2. Production Build Pipeline
\`\`\`bash
# 1. Compile frontend static assets + esbuild server.ts bundle
npm run build

# Output generated in /dist:
#   dist/index.html
#   dist/assets/*
#   dist/server.cjs
\`\`\`

## 3. Environment Variables Verification
Ensure the following variables are injected into the Cloud Run environment secret manager:
- \`NODE_ENV=production\`
- \`PORT=3000\`
- \`GEMINI_API_KEY\`
- \`FIREBASE_PROJECT_ID\`
`
  },
  {
    id: 'deployment-checklist',
    title: 'Production Release Verification Checklist',
    category: '6. Deployment Guide',
    categoryId: 'deployment',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Pre-flight release checklist covering security, backups, domain SSL, and automated test passes.',
    content: `
# Production Release Checklist

| Check | Description | Status | Verification Date |
| :--- | :--- | :--- | :--- |
| ✅ **TypeScript Build** | Zero type errors on \`npm run lint\` | PASSED | Aug 01, 2026 |
| ✅ **Bundle Size** | \`dist/\` bundle within performance budget (< 3.5MB gzip) | PASSED | Aug 01, 2026 |
| ✅ **Firestore Rules** | Deployed and verified via \`deploy_firebase\` | PASSED | Aug 01, 2026 |
| ✅ **SSL / TLS Certificate** | Wildcard SSL active on custom domain | PASSED | Aug 01, 2026 |
| ✅ **API Proxy Security** | Server proxy shielding Gemini API Key | PASSED | Aug 01, 2026 |
`
  },

  // ==========================================
  // 7. SECURITY DOCUMENTATION
  // ==========================================
  {
    id: 'security-policy',
    title: 'Platform Security & Authorization Policy',
    category: '7. Security & Compliance',
    categoryId: 'security',
    audience: ['Developers', 'Administrators', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Security baseline covering encryption standards, authentication protection, and Firestore rules.',
    content: `
# Security & Authorization Policy

## 1. Data Encryption Standards
- **Data in Transit:** Enforced TLS 1.3 encryption across all client-server and API communications.
- **Data at Rest:** 256-bit AES encryption automatically applied across Firestore documents and backup storage buckets.

## 2. Authentication & Credentials Protection
- Passwords are never stored in plain text. Handled entirely via Firebase Auth PBKDF2 with SHA-256 hashing.
- API Keys (e.g., Gemini GenAI keys) are stored in Google Cloud Secret Manager and accessed strictly in server execution contexts.
`
  },
  {
    id: 'security-audit-report',
    title: 'Pre-Launch Security Audit Report Template',
    category: '7. Security & Compliance',
    categoryId: 'security',
    audience: ['Administrators', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Formal audit report template covering vulnerability assessments, OWASP top 10 checks, and remediation.',
    content: `
# Pre-Launch Security Audit Report

**Target Scope:** Edulpha Web & Mobile Ecosystem v1.0.0  
**Audit Conducted By:** Cybersecurity & Infrastructure Verification Team  
**Overall Risk Assessment Rating:** **LOW RISK / APPROVED FOR PRODUCTION**

### Vulnerability Verification Summary:
- **XSS (Cross-Site Scripting):** Mitigated via React JSX automatic escaping & Content Security Policy (CSP).
- **SQL / NoSQL Injection:** Mitigated via parameterized Firestore SDK query builders.
- **CSRF (Cross-Site Request Forgery):** Strict-SameSite cookie policy & CORS origin restrictions.
`
  },
  {
    id: 'security-incident-response',
    title: 'Incident Response & Emergency Escalation Plan',
    category: '7. Security & Compliance',
    categoryId: 'security',
    audience: ['Administrators', 'Developers'],
    lastUpdated: '2026-08-01',
    summary: 'Procedure for identifying, containing, and communicating security incidents or downtime events.',
    content: `
# Incident Response & Escalation Plan

### Phase 1: Detection & Triage
- Automated error spikes reported via Cloud Monitoring alerts.
- Triage team determines severity level (Severity 1: Critical Service Outage, Severity 2: Partial Degraded State, Severity 3: Low Impact Minor Bug).

### Phase 2: Containment & Recovery
- For auth or data breaches: Temporarily lock down user write permissions via Firestore emergency rules.
- Deploy rollback container image via Cloud Run within 5 minutes.
`
  },
  {
    id: 'security-disaster-recovery',
    title: 'Backup & Disaster Recovery Plan (DRP)',
    category: '7. Security & Compliance',
    categoryId: 'security',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Database backup schedules, point-in-time recovery, RPO/RTO objectives, and emergency restore procedures.',
    content: `
# Backup & Disaster Recovery Plan (DRP)

### Recovery Metrics:
- **Recovery Point Objective (RPO):** < 1 Hour (Automated hourly Firestore export snapshots).
- **Recovery Time Objective (RTO):** < 30 Minutes (Automated multi-region Cloud Run container failover).

### Backup Execution Schedule:
- **Daily Automated Firestore Backups:** Exported to Cloud Storage Bucket \`gs://edulpha-prod-backups\`.
- **Retention Period:** 30 days daily retention, 12 months monthly retention.
`
  },

  // ==========================================
  // 8. PRIVACY AND LEGAL DOCUMENTATION
  // ==========================================
  {
    id: 'legal-privacy-policy',
    title: 'Privacy Policy & Data Protection Notice',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Users', 'Legal & Compliance', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Official privacy policy detailing user data collection, processing purposes, minor protection, and GDPR rights.',
    content: `
# Edulpha Privacy Policy

**Effective Date:** August 1, 2026

At **Edulpha**, we take your privacy and the security of student educational data seriously. This Privacy Policy explains how Edulpha collects, uses, stores, and protects your information.

---

## 1. Information We Collect
- **Account Information:** Name, email address, selected education system, level, and specialty.
- **Usage & Learning Data:** Exam scores, practice history, time spent per topic, daily drill completion streaks, and AI tutor prompt interactions.
- **Technical Information:** IP address, browser type, device type, and mobile PWA operating metrics.

---

## 2. Protection of Minors & Educational Data Rights
Edulpha adheres to international minor data protection guidelines. We do NOT sell student data to third-party advertisers. Educational performance data is utilized exclusively to provide customized diagnostic recommendations and improve learning outcomes.

---

## 3. User Data Deletion & Rights
Users retain full rights to request account deletion and export their learning records. To initiate a data erasure request, contact \`privacy@edulpha.com\`.
`
  },
  {
    id: 'legal-terms-conditions',
    title: 'Terms of Service & Conditions of Use',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Users', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Legal agreement governing platform access, intellectual property, student obligations, and subscription rules.',
    content: `
# Terms & Conditions of Service

## 1. Acceptance of Terms
By creating an account or accessing the Edulpha platform (web or mobile), you agree to be bound by these Terms of Service.

## 2. Academic Integrity & Acceptable Use
Students agree to use the platform for legitimate learning and self-assessment. Misuse of the platform to cheat during official external board examinations or automated scraping of question bank contents is strictly prohibited and subject to account termination.
`
  },
  {
    id: 'legal-cookie-policy',
    title: 'Cookie & Local Storage Policy',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Users', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Explanation of essential cookies, session storage, and offline localStorage usage.',
    content: `
# Cookie & Storage Policy

Edulpha uses essential session cookies and browser \`localStorage\` to ensure smooth authentication, maintain your preferred language (English/French), and store offline practice data safely.
`
  },
  {
    id: 'legal-acceptable-use',
    title: 'Acceptable Use & Code of Conduct Policy',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Users', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Rules for community forums, peer duel battles, and respectful interaction.',
    content: `
# Acceptable Use Policy

All users participating in Edulpha Discussion Forums and Peer Duel Battles must maintain respectful language. Harassment, inappropriate content, or hate speech will result in immediate suspension.
`
  },
  {
    id: 'legal-copyright-policy',
    title: 'Copyright & Intellectual Property Policy',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Legal & Compliance', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Ownership of educational materials, past paper permissions, and trademark notices.',
    content: `
# Copyright & IP Policy

All proprietary question explanations, AI diagnostic algorithms, software interfaces, and graphics are the intellectual property of Edulpha. Examination names (e.g., GCE, Baccalauréat) remain the trademarks of their respective official examination bodies.
`
  },
  {
    id: 'legal-refund-policy',
    title: 'Subscription & Refund Policy',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Users', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Rules governing premium subscriptions, mobile payment cancellations, and refund eligibility.',
    content: `
# Subscription & Refund Policy

Premium subscriptions grant unlimited AI tutor queries and full past paper access. Subscriptions may be cancelled at any time. Refund requests submitted within 7 days of purchase are eligible for full reimbursement if usage thresholds have not been exceeded.
`
  },
  {
    id: 'legal-dpa',
    title: 'Data Processing Agreement (DPA) for Schools',
    category: '8. Privacy & Legal Documents',
    categoryId: 'legal',
    audience: ['Legal & Compliance', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Formal Data Processing Agreement template for partner schools, institutions, and education ministries.',
    content: `
# Data Processing Agreement (DPA)

This Data Processing Agreement governs the processing of personal data by Edulpha on behalf of partner educational institutions and school networks in compliance with applicable data protection legislation.
`
  },

  // ==========================================
  // 9. PARTNERSHIP DOCUMENTATION
  // ==========================================
  {
    id: 'partner-agreement-template',
    title: 'Institutional Partner Agreement Template',
    category: '9. Partnership Documents',
    categoryId: 'partner',
    audience: ['Partners', 'Legal & Compliance'],
    lastUpdated: '2026-08-01',
    summary: 'Standard Memorandum of Understanding (MoU) template for education boards, telecoms, and university partners.',
    content: `
# Institutional Partnership Agreement (Template)

**BETWEEN:** Edulpha Platform Inc.  
**AND:** Partner Institution (Ministry / Examination Board / Telecom Operator)

### Core Terms:
1. **Co-Branding Rights:** Grant of non-exclusive license to feature partner logos in verified partner sections.
2. **Resource Alignment:** Verification of curriculum accuracy and official answer keys.
3. **Data Sovereignty:** All student performance statistics aggregated anonymously for regional reporting.
`
  },
  {
    id: 'partner-onboarding-guide',
    title: 'Partner Onboarding & Integration Guide',
    category: '9. Partnership Documents',
    categoryId: 'partner',
    audience: ['Partners', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Step-by-step onboarding walkthrough for new institutional partners joining the Edulpha ecosystem.',
    content: `
# Institutional Partner Onboarding Guide

### Steps to Partner Launch:
1. **Verification & Logo Submission:** Provide high-res SVG/PNG logos and official website links.
2. **Admin Portal Setup:** Provision partner admin accounts to review co-branded landing banners.
3. **Curriculum Verification:** Review and endorse subject past paper question banks.
`
  },

  // ==========================================
  // 10. QUALITY ASSURANCE DOCUMENTATION
  // ==========================================
  {
    id: 'qa-testing-plan',
    title: 'Master Quality Assurance & Testing Plan',
    category: '10. Quality Assurance & Launch',
    categoryId: 'qa',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Test strategy covering unit tests, end-to-end user journeys, cross-browser compatibility, and mobile responsiveness.',
    content: `
# Master Quality Assurance & Testing Plan

### Test Suites Execution Matrix:
- **Functional Testing:** Automated test suites verifying exam timers, score calculations, and question option selection.
- **Cross-Browser Testing:** Verified on Chrome 120+, Safari 17+, Firefox 122+, Edge, Mobile Chrome, and iOS Safari.
- **Localization Audit:** 100% dictionary string verification across English & French interfaces.
`
  },
  {
    id: 'qa-bug-report-template',
    title: 'Standard Bug Report Template',
    category: '10. Quality Assurance & Launch',
    categoryId: 'qa',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Standard template for logging software bugs, reproduction steps, and severity levels.',
    content: `
# Bug Report Template

**Title:** [Short descriptive title]  
**Severity:** [Critical / High / Medium / Low]  
**Environment:** [Web Browser / Mobile PWA / Android APK]  
**Steps to Reproduce:**
1. Step 1...
2. Step 2...
**Expected Behavior:** ...  
**Actual Behavior:** ...  
**Console Logs / Screenshots:** ...
`
  },
  {
    id: 'qa-final-checklist',
    title: 'Final Pre-Launch Launch Readiness Checklist',
    category: '10. Quality Assurance & Launch',
    categoryId: 'qa',
    audience: ['Administrators', 'Developers', 'Legal & Compliance', 'Partners'],
    lastUpdated: '2026-08-01',
    summary: 'Comprehensive master checklist verifying platform feature completeness, security, mobile builds, legal compliance, and docs.',
    content: `
# Final Pre-Launch Verification Checklist

### 1. Platform & Feature Verification
- [x] All 15,000+ Question items indexed and searchable.
- [x] Student Exam Engine timer and auto-submit verified.
- [x] AI Tutor response proxy functioning on Port 3000.
- [x] Partner Management portal live with verified institutional partners.
- [x] Multi-Language i18n switching verified with instantaneous re-renders.

### 2. Security & Compliance Verification
- [x] Firestore security rules deployed and active.
- [x] Privacy Policy & Terms published and accessible.
- [x] Storage quota safe fallback applied to prevent client-side storage crashes.

### 3. Production Readiness
- [x] Cloud Run container build verified (\`dist/server.cjs\`).
- [x] Mobile PWA installable and responsive across all device breakpoints.
`
  },

  // ==========================================
  // 11. MONITORING AND MAINTENANCE DOCUMENTATION
  // ==========================================
  {
    id: 'maint-manual',
    title: 'System Maintenance Manual',
    category: '11. Monitoring & Maintenance',
    categoryId: 'maintenance',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Routine maintenance routines, database indexing optimization, dependency updates, and security patching.',
    content: `
# System Maintenance Manual

### Routine Maintenance Schedule:
- **Weekly:** Review error logs and client exception reports.
- **Monthly:** Audit dependency updates (\`npm audit\`) and apply minor non-breaking security patches.
- **Quarterly:** Re-index Firestore composite indexes for optimized search performance.
`
  },
  {
    id: 'maint-monitoring-guide',
    title: 'System Monitoring & Observability Guide',
    category: '11. Monitoring & Maintenance',
    categoryId: 'maintenance',
    audience: ['Developers', 'Administrators'],
    lastUpdated: '2026-08-01',
    summary: 'Guide for monitoring server health, API latency, error metrics, and active user analytics.',
    content: `
# System Monitoring & Observability Guide

### Key Performance Metrics (KPIs):
- **API Response Latency:** Target < 200ms for standard REST endpoints, < 1.5s for AI Tutor streaming responses.
- **Error Rate Threshold:** Critical alert triggered if error rate exceeds 0.5% over a 5-minute sliding window.
- **Uptime Target:** 99.9% monthly availability on Cloud Run infrastructure.
`
  }
];
