# Roadmap: Gemini Resume Builder

## Phase 1: Foundation & Scaffolding
**Goal:** Establish a robust project foundation with a resizable split-pane UI, Zustand state management, and a responsive A4 preview scaling engine using Tailwind 4.

**Requirements:** [PHASE1-INIT, PHASE1-LAYOUT, PHASE1-STATE, PHASE1-PERSIST, PHASE1-SCALING, PHASE1-OVERFLOW]

**Plans:** 3 plans
- [x] 01-foundation-01-PLAN.md — Refine layout with cookie-based persistence and Tailwind 4 theme variables for A4 dimensions.
- [x] 01-foundation-02-PLAN.md — Implement Zustand 5 store with SSR-safe hydration and Zod schema validation.
- [x] 01-foundation-03-PLAN.md — Implement auto-scaling A4 preview using CSS transforms and Container Queries.

## Phase 2: PDF Parsing & Data Extraction
**Goal:** Implement AI-powered resume extraction from PDF files using Gemini 1.5 Flash and Vercel AI SDK, integrating it into the Zustand store.

**Requirements:** [PDF-IMPORT-UI, AI-EXTRACTION-SERVICE, STORE-INTEGRATION, DATA-REVIEW-UI]

**Plans:** 2 plans
- [ ] 02-pdf-import-01-PLAN.md — Implement PDF upload UI and Server Action for AI-powered data extraction.
- [ ] 02-pdf-import-02-PLAN.md — Integrate extraction pipeline with Zustand store and build Review UI.

## Phase 3: AI Enhancement & Tailoring
- [ ] Develop the "Refine Section" feature using Gemini via Vercel AI SDK.
- [ ] Implement the "Job Tailor" flow (Resume + Job Description -> Tailored Resume).
- [ ] Create a streaming UI for AI suggestions (leveraging React 19 Server Components/Actions where appropriate).

## Phase 4: UI Editor & PDF Export
- [ ] Build a robust, sectioned resume editor on the LHS with React Hook Form + Zod.
- [ ] Implement multiple 1-pager design templates for the RHS preview using Tailwind 4 and Container Queries.
- [ ] Ensure the RHS preview accurately reflects the 1-page PDF output.
- [ ] Integrate a PDF generation library (@react-pdf/renderer) for high-quality exports.

## Phase 5: Persistence & Deployment
- [ ] Add user authentication (optional, or local storage/session-based via Zustand).
- [ ] Ensure all data is saved and versions are manageable.
- [ ] Deploy to Vercel and perform E2E testing.
- [ ] Verify linting and formatting with Biome.
