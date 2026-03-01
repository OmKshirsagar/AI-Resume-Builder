# Roadmap: Gemini Resume Builder

## Phase 1: Foundation & Scaffolding
**Goal:** Establish a robust project foundation with a resizable split-pane UI, state management, and a responsive A4 preview scaling engine.

**Requirements:** [PHASE1-INIT, PHASE1-LAYOUT, PHASE1-TEST-SETUP, PHASE1-STATE, PHASE1-PERSIST, PHASE1-SCALING, PHASE1-OVERFLOW]

**Plans:** 3 plans
- [ ] 01-foundation-01-PLAN.md — Initialize Next.js project with Tailwind, Shadcn, and Vitest, and implement the main resizable split-pane layout.
- [ ] 01-foundation-02-PLAN.md — Implement resume state management using React Context and Zod for schema validation, with LocalStorage persistence.
- [ ] 01-foundation-03-PLAN.md — Create the "One-Page" preview container with scaling logic (transform: scale) and overflow detection.

## Phase 2: PDF Parsing & Data Extraction
- [ ] Integrate a PDF parsing library.
- [ ] Create a "Resume" Zod schema.
- [ ] Implement an AI-powered extraction pipeline (PDF -> Text -> JSON).
- [ ] Implement LocalStorage persistence for resume data.
- [ ] Build the initial "Parsed Data" review UI.

## Phase 3: AI Enhancement & Tailoring
- [ ] Develop the "Refine Section" feature using Gemini.
- [ ] Implement the "Job Tailor" flow (Resume + Job Description -> Tailored Resume).
- [ ] Create a streaming UI for AI suggestions.

## Phase 4: UI Editor & PDF Export
- [ ] Build a robust, sectioned resume editor on the LHS.
- [ ] Implement multiple 1-pager design templates for the RHS preview.
- [ ] Ensure the RHS preview accurately reflects the 1-page PDF output.
- [ ] Integrate a PDF generation library for high-quality exports.

## Phase 5: Persistence & Deployment
- [ ] Add user authentication (optional, or local storage/session-based).
- [ ] Ensure all data is saved and versions are manageable.
- [ ] Deploy to Vercel and perform E2E testing.
