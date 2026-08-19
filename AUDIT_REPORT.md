# EDULPHA — PHASE 2 PLATFORM AUDIT REPORT & PRODUCTION ROADMAP
**Prepared by:** Senior Full-Stack Architect, Security Lead & Database Auditor
**Date:** August 2026

---

## 1. Executive Summary
Edulpha is a high-fidelity, dual-language (English/French) professional and academic training platform designed for Higher National Diploma (HND) and Brevet de Technicien Supérieur (BTS) specialities. This audit was executed systematically to discover vulnerabilities, evaluate database structural performance, inspect server architecture compliance, and map out the remaining implementation path for full productionization.

The overall code quality is exceptionally high. However, we have discovered several critical and high-priority concerns that require remediation before the final production rollout.

---

## 2. Architecture & Tech Stack Discovery Map
### 2.1 Backend Architecture (`server.ts`)
- **Runtime Environment:** Node.js Express server hosted in a Cloud Run container.
- **Port Binding:** Strictly bound to Port `3000` (conforming with system-level container requirements).
- **Security Middlewares:**
  - `helmet`: Custom security headers configured to match iframe sandbox environments (e.g., `frameguard: false` and `contentSecurityPolicy: false`).
  - `compression`: Reduces network payload sizes dynamically.
  - `express-rate-limit`: Active on different limits (`apiLimiter`, `authLimiter`, `aiLimiter`, `paymentLimiter`) to prevent brute force and DDoS.
- **Upload Ingress API:** Handles files up to 50MB using a robust 3-stage fallback flow:
  1. Primary: Cloud-based Google Cloud Storage / Firebase Admin Storage.
  2. Secondary: Saved locally to `/uploads` on the server disk.
  3. Tertiary: Firestore database byte strings inside `system_uploads` metadata.

### 2.2 Client-Side Framework (React + Vite)
- **State Management:** React Context (e.g., `AuthContext`, `LanguageContext`, `SettingsContext`).
- **Styles:** Modern utility-first Tailwind CSS.
- **Animations:** Highly fluid and layout-optimized transition dynamics driven by `motion` (imported from `motion/react`).
- **Iconography:** Strictly standard SVG vector icons imported from `lucide-react`. No custom raw SVGs.

---

## 3. Security Vulnerability Analysis & Findings

### 🛑 CRITICAL: Wildcard Access to Verification Codes (`firestore.rules`)
- **Location:** `firestore.rules`, lines 80-82:
  ```javascript
  match /phone_verifications/{verificationId} {
    allow read, create, update: if true;
  }
  ```
- **Vulnerability:** Allowing any unauthenticated client to `read` any phone verification code exposes one-time passwords (OTPs) and SMS codes during registration, login, or password resets. 
- **Risk Level:** **CRITICAL**. An attacker could monitor this collection to bypass OTP verifications or hijack accounts.
- **Remediation:** Remove public `read` and restrict permissions to server-side Admin SDK operations, or enforce `create`-only validation checks bound to session limits.

### ⚠️ HIGH: Client-Side Role Setting During Creation (`firestore.rules` & `AuthContext.tsx`)
- **Location:** `firestore.rules` lines 85-88 & `AuthContext.tsx` lines 150-160:
  ```javascript
  allow create: if (isAuthenticated() && isOwner(userId)) || isAdmin();
  ```
- **Vulnerability:** While updating user roles is guarded, a newly registering student can include a custom `role` parameter (such as `'admin'` or `'teacher'`) in their initial document payload during creation.
- **Risk Level:** **HIGH**. Anyone registering on the client can potentially upgrade their credentials to an administrator role.
- **Remediation:** Enforce server-side authorization checks on all user creations, or restrict user creation payloads via Firestore schema checks to ensure `role` defaults strictly to `'student'`.

---

## 4. Performance & Bottleneck Analysis

### ⚡ Slow Login / Sign-In Issues
- **Problem:** Users have reported lag during authorization cycles.
- **Root Causes Identified:**
  1. **Synchronous Local Checking:** The check for deleted accounts (`deletedUsers` and `deletedUsersByEmail`) in `AuthContext.tsx` is executed sequentially during the state transition inside `onAuthStateChanged`. This adds round-trips to the database on every auth update.
  2. **Cache Synchronization:** Multi-step user lookup and background logging of audit events occur within blocking callback scopes.
- **Remediation:** Parallellize lookup promises (`Promise.all`) or execute audit logs and background writes asynchronously without blocking the user interface rendering process.

---

## 5. HND/BTS Module Discovery & Integration Audit
Edulpha’s interactive accounting practice engine is implemented in `/src/pages/AccountingPracticalLab.tsx`.

### 5.1 Accounting Practice Engine Features
- **Strict Double-Entry Bookkeeping:** Forces balanced debits and credits on every journal entry before allowing Ledger posting.
- **CAMEROON/SYSCOHADA Standard Compliance:** Uses SYSCOHADA account codes (e.g., `1010 Capital Social`, `4110 Clients`, `5210 Banque`).
- **Sub-Simulators Included:**
  - Payroll calculation and social security tax (CNPS employee rate) estimation.
  - Interactive bank reconciliation with Cash Book comparisons.
  - Multi-line draft transactions and trial balance worksheets.

### 5.2 Academic Enrollment Systems
- `/src/components/HNDEnrollmentModal.tsx` and `/src/services/hndService.ts` provide a robust academic selection architecture:
  - Faculty (Schools) -> Academic Departments -> specialties -> curriculum courses.
  - Dynamic profile registration under academic type `HND_BTS`.

---

## 6. Detailed Implementation Roadmap (Phases 3 - 37)

The roadmap is structured into 5 critical execution tracks:

### Track 1: Security Hardening (Phases 3 - 10)
- **Phase 3:** Lock down `/phone_verifications` to write-only for unauthenticated clients, prohibiting broad reads.
- **Phase 4:** Harden `/users` and `/user_profiles` collections to prevent client-side role privilege escalation.
- **Phase 5:** Implement rate limits and input sanitizers on server-side feedback collection endpoints.

### Track 2: Performance Optimization (Phases 11 - 18)
- **Phase 11:** Optimize `AuthContext.tsx` user lifecycle using `Promise.all` for background audits and deletion checks.
- **Phase 12:** Implement Service Worker asset caching for larger resources (such as PDF guides and practical videos).
- **Phase 13:** Debounce dynamic search bar filters in the student dashboard and GCE Exam Engine.

### Track 3: Complete HND/BTS Productionization (Phases 19 - 28)
- **Phase 19:** Embed the dynamic HND enrollment modal directly within the onboarding wizard for users registering as `HND_BTS`.
- **Phase 20:** Integrate SYSCOHADA practical exercises with the main Student Dashboard's weekly challenges.
- **Phase 21:** Connect Accounting Practical Lab balance results with simulated Firestore database persistence to save student companies.
- **Phase 22:** Ensure full bilingual support (English/French) for all HND curriculum names and instructions.

### Track 4: General Platform Clean-Up & Audits (Phases 29 - 34)
- **Phase 29:** Audit and resolve any remaining console warnings regarding missing keys, hooks dependencies, or unhandled promise rejections.
- **Phase 30:** Clean up redundant files or duplicate helper interfaces.
- **Phase 31:** mathematically calculate and normalize nested border-radii across all visual card layouts.

### Track 5: Verification & Production Release (Phases 35 - 37)
- **Phase 35:** Run complete build checks (`npm run build`) and linter validations to guarantee zero TypeScript compilation warnings.
- **Phase 36:** Conduct end-to-end user experience testing for all customer types (students, teachers, administrators).
- **Phase 37:** Securely deploy final rules and finalize the container release.

---
*End of Report.*
