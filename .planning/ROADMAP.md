# Roadmap: Gemini Resume Builder

## Phase 1: Foundation & Scaffolding
**Goal:** Establish a robust project foundation with a resizable split-pane UI, Zustand state management, and a responsive A4 preview scaling engine using Tailwind 4.

**Requirements:** [PHASE1-INIT, PHASE1-LAYOUT, PHASE1-STATE, PHASE1-PERSIST, PHASE1-SCALING, PHASE1-OVERFLOW]

**Plans:** 3 plans
- [x] 01-foundation-01-PLAN.md — Refine layout with cookie-based persistence and Tailwind 4 theme variables for A4 dimensions.
- [x] 01-foundation-02-PLAN.md — Implement Zustand 5 store with SSR-safe hydration and Zod schema validation.
- [x] 01-foundation-03-PLAN.md — Implement auto-scaling A4 preview using CSS transforms and Container Queries.

## Phase 2: PDF Parsing & Data Extraction
**Goal:** Implement AI-powered resume extraction from PDF files using Gemini and Vercel AI SDK, integrating it into the Zustand store.

**Requirements:** [PDF-IMPORT-UI, AI-EXTRACTION-SERVICE, STORE-INTEGRATION, DATA-REVIEW-UI]

**Plans:** 2 plans
- [x] 02-pdf-import-01-PLAN.md — Implement PDF upload UI and Server Action for AI-powered data extraction.
- [x] 02-pdf-import-02-PLAN.md — Integrate extraction pipeline with Zustand store and build Review UI.

## Phase 3: AI Enhancement & Tailoring
**Goal:** AI-driven resume optimization (Refine Section) and JD-based tailoring (Job Tailor) with streaming feedback.

**Requirements:** [AI-01, AI-02, AI-03, AI-04]

**Plans:** 2 plans
- [x] 03-ai-enhancement-01-PLAN.md — Implement "Refine Section" Server Action and UI (X-Y-Z formula, streaming).
- [x] 03-ai-enhancement-02-PLAN.md — Implement "Job Tailor" flow (JD input, multi-step alignment, suggestions).

## Phase 4: Dynamic Sections & Content Condensation
**Goal:** Upgrade the data architecture to support dynamic sections and implement the core "Condense to 1-Page" AI workflow.
**Requirements:** [DYN-SCHEMA, DRAFT-STATE, AI-CONDENSE, DYN-UI, MASTRA-INIT, MASTRA-FABRICATE]

**Plans:** 4 plans
- [x] 04-dynamic-sections-01-PLAN.md — Upgrade Zod schema/Zustand store for `customSections` and Master/Draft state. Update PDF extraction to grab all arbitrary sections.
- [x] 04-dynamic-sections-02-PLAN.md — Build the "Condense" AI flow and dynamic form UI to handle arbitrary sections.
- [x] 04-dynamic-sections-03-PLAN.md — Initialize Mastra, configure with Gemini 3 Flash, and set up base Mastra instance in src/mastra/index.ts.
- [x] 04-dynamic-sections-04-PLAN.md — Implement the "Resume Fabrication Workflow" in Mastra (Audit, Architect, Fabricate) and update UI.

## Phase 5: Visual Orchestration & Dynamic Templates
**Goal:** Transition from content fabrication to document design by having the AI choose and configure the visual layout.
**Requirements:** [DESIGN-SCHEMA, STYLIST-AGENT, MULTI-LAYOUT, SMART-INLINE]
**Plans:** 2 plans
- [ ] 05-visual-orchestration-01-PLAN.md — Add design settings to schema and implement the Stylist Agent in the Mastra workflow.
- [ ] 05-visual-orchestration-02-PLAN.md — Implement the dynamic Multi-Layout preview engine and smart inline list rendering.

## Phase 6: UI Editor & PDF Export
- [ ] Build a robust, sectioned resume editor on the LHS with React Hook Form + Zod.
- [ ] Integrate a PDF generation library (@react-pdf/renderer) for high-quality exports.
- [ ] Ensure RHS preview accurately reflects the PDF output.

## Phase 7: Persistence & Deployment
- [ ] Add user authentication (optional).
- [ ] Deploy to Vercel and perform E2E testing.
- [ ] Verify linting and formatting with Biome.
