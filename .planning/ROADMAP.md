# Roadmap: Gemini Resume Builder

## Milestone 1: Core Utility (v1.0.0) ✅
**Status:** COMPLETE

- **Phase 1: Foundation & Scaffolding** ✅
- **Phase 2: PDF Parsing & Data Extraction** ✅
- **Phase 3: AI Enhancement & Tailoring** ✅
- **Phase 4: Content Condensation (Mastra)** ✅
- **Phase 5: Visual Orchestration & Templates** ✅
- **Phase 6: UI Editor & PDF Export** ✅
- **Phase 7: Persistence & Deployment** ✅

---

## Milestone 2: The Pro SaaS Upgrade 🚀
**Goal:** Transform the utility into a full SaaS product with user accounts, document versioning, and advanced AI analytics.

### Phase 8: Authentication & Cloud Database ✅
- [x] Integrate **Clerk** for user authentication.
- [x] Provision **Turso (LibSQL)** and **Drizzle ORM**.
- [x] Migrate from `localStorage` to cloud-sync based on User ID.
- [x] Implement multi-tenant data isolation.

### Phase 9: Local PDF Parser Upgrade ✅
- [x] Install and integrate `pdf2json` for coordinate-aware extraction.
- [x] Implement a **Layout Reassembly** algorithm to reconstruct columns/sidebars.
- [x] Refactor the extraction pipeline to send structured text to Gemini (Cost Saving).
- [x] Implement SHA-256 file hashing and instant deduplication lookup.

### Phase 10: User Dashboard & LinkedIn Import (NEXT)
- [ ] Build a User Dashboard to manage multiple resumes.
- [ ] Implement the **LinkedIn-to-PDF** import guidance flow.
- [ ] Support "Master" vs "Tailored" resume versioning.

### Phase 11: AI Cover Letter Generator
**Goal:** Implement a dedicated AI workflow and UI for generating cover letters based on a resume and a job description.
**Plans:** 2 plans
- [ ] 11-01-PLAN.md — Backend, Database & Mastra Workflow.
- [ ] 11-02-PLAN.md — Drafting Lab UI & PDF Export.

**Requirements:** [PHASE-11-BACKEND, PHASE-11-WORKFLOW, PHASE-11-UI, PHASE-11-EXPORT]

### Phase 12: ATS Scoring & Semantic Analytics
- [ ] Implement AI-driven keyword extraction and industry benchmarking.
- [ ] Create an "Optimization Panel" with real-time "Score Boost" suggestions.

### Phase 13: Pro Template Gallery
- [ ] Implement "Executive," "Creative," and "Minimal" PDF themes.
- [ ] Use Atomic Design patterns for modular @react-pdf components.

### Phase 14: UI/UX Rehaul & Polish
- [ ] **Account UI**: Fix account icon placement and navigation header.
- [ ] **Animations**: Implement smoother Framer Motion transitions between editor sections.
- [ ] **Themes**: Add Dark Mode support for the editor interface.
