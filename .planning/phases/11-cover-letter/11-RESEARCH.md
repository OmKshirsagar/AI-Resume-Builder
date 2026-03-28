# Phase 11: AI Cover Letter Generator - Research

**Researched:** 2026-03-24
**Domain:** Cover Letter Synthesis, AI Workflows, PDF Export
**Confidence:** HIGH

## Summary
Phase 11 introduces a second major AI feature: automated Cover Letter generation. Unlike the "Tailor" feature which modifies existing bullets, this is a generative task. Research confirms that using a multi-step Mastra workflow provides the best results by first analyzing the Job Description (JD) for "Pain Points" and then matching them to "Proof Points" in the user's resume.

## Standard Stack
- **AI Orchestration:** Mastra (Workflows & Agents).
- **UI:** React (Next.js 15), Lucide icons, Tailwind 4.
- **Persistence:** Drizzle ORM + SQLite (new table required).
- **Export:** @react-pdf (shared styling with resumes).

## Architecture Patterns

### 1. Mastra Synthesis Workflow
- **Step 1: Strategist Agent (Analysis)**. Inputs: JD. Output: List of 3-5 core requirements and desired candidate tone.
- **Step 2: Matchmaker Agent (Selection)**. Inputs: ResumeData + Analysis. Output: Selected experiences and skills that best address the analysis.
- **Step 3: Writer Agent (Drafting)**. Inputs: Proof Points + Tone + Length. Output: Markdown-formatted cover letter text.

### 2. Database Schema Update
A new table `cover_letters` is needed:
- `id`: primaryKey.
- `userId`: references `users.id`.
- `resumeId`: references `resumes.id` (links to the specific version used).
- `jobDescription`: text (store the input JD).
- `content`: text (generated markdown).
- `metadata`: json (store tone, length, company name).

### 3. UI/UX: The "Drafting Lab"
- **Layout:** Side-by-side or tabbed view.
- **Left Pane:** JD Input + Tone/Length selectors.
- **Right Pane:** Live preview of the letter.
- **Actions:** "Re-generate", "Edit Manually", "Download PDF".

## Common Pitfalls
- **Generic Output:** If the prompt is too broad, the letter sounds like boilerplate. *Solution:* Use "Chain of Density" prompting or step-by-step reasoning in the Mastra workflow.
- **Formatting:** Markdown needs careful handling when converting to PDF via @react-pdf.

## Sources
- Mastra Documentation (Parallel Steps)
- existing `src/mastra/workflows/fabricator.ts` logic.
- @react-pdf Business Letter templates.
