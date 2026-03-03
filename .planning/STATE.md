# Project State: Gemini Resume Builder

## Context
- **Project Goal:** AI-powered resume builder/tailor.
- **Current Phase:** Phase 4 (Dynamic Sections & Content Condensation).
- **Last Updated:** 2026-03-01.

## Completed Phases
- **Phase 1: Foundation (Scaffolding, State, Scaling)** - Finished 2026-02-28.
- **Phase 2: PDF Parsing & Data Extraction** - Finished 2026-02-28.
- **Phase 3: AI Enhancement & Tailoring** - Finished 2026-03-01.

## Active Tasks
- [x] Upgrade Zod schema for dynamic custom sections.
- [x] Implement dual-state (Master/Draft) in Zustand store.
- [x] Update PDF extraction for arbitrary sections.
- [x] Build Dynamic Section Editor UI.
- [x] Implement initial Gemini-based condensation action.
- [ ] Initialize Mastra for durable workflows (04-03).
- [ ] Implement Audit-Architect-Fabricate pattern in Mastra (04-04).

## Key Decisions
- Use Next.js App Router for server-side PDF parsing and AI actions.
- **Split-Pane UI:** Standard 2-column layout (Editor LHS / Preview RHS).
- **Strict 1-Pager:** Enforce a single-page limit via CSS/JS scaling and AI-assisted content trimming.
- **Mastra Integration:** Move complex AI workflows to Mastra for durability and better orchestration.
- **Gemini 3 Flash:** Primary model for fast, high-quality reasoning in workflows.

## Blocks / Concerns
- Workflow persistence: Requires PostgreSQL setup.
- Complexity of step-by-step progress streaming from Mastra to UI.
