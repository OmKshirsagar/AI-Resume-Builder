# Project State: Gemini Resume Builder

## Context
- **Project Goal:** AI-powered resume builder/tailor.
- **Current Phase:** Phase 2 (PDF Parsing & Data Extraction).
- **Last Updated:** 2026-02-28.

## Completed Phases
- **Phase 1: Foundation (Scaffolding, State, Scaling)** - Finished 2026-02-28.

## Active Tasks
- [ ] Research and integrate PDF parsing library.
- [ ] Implement AI-powered extraction pipeline.
- [ ] Build the "Parsed Data" review UI.

## Key Decisions
- Use Next.js App Router for server-side PDF parsing and AI actions.
- **Split-Pane UI:** Standard 2-column layout (Editor LHS / Preview RHS).
- **Strict 1-Pager:** Enforce a single-page limit via CSS/JS scaling and AI-assisted content trimming.
- Use Gemini 1.5 Flash for extraction and 1.5 Pro for enhancement.
- Use LocalStorage for persistence.

## Blocks / Concerns
- PDF parsing accuracy for complex multi-column layouts.
- PDF generation fidelity (ensuring the exported PDF matches the web preview).
