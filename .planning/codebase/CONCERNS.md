# Codebase Concerns

**Analysis Date:** 2026-03-01

## Tech Debt

**Empty Component Scaffolding:**
- Issue: Directories for `editor`, `layout`, and `preview` are present but contain no implementation files. `src/app/page.tsx` is still the boilerplate template.
- Files: `src/components/editor/`, `src/components/layout/`, `src/components/preview/`, `src/app/page.tsx`
- Impact: Project is currently just a shell with no functional UI components.
- Fix approach: Implement the base layout and core components (Split-pane UI, Editor forms, Preview area).

**Missing Global State Management:**
- Issue: `zustand` is listed in `package.json` but no store has been implemented to handle the complex resume data model.
- Files: `src/store/` (Missing)
- Impact: No way to sync data between the Editor and Preview components.
- Fix approach: Create a robust Zustand store with Zod-validated resume schemas.

## Known Bugs

**No functional code detected:**
- Symptoms: App displays "Create T3 App" boilerplate.
- Files: `src/app/page.tsx`
- Trigger: Running `npm run dev` and visiting localhost.
- Workaround: None; requires implementation of the project features.

## Security Considerations

**PII in LocalStorage:**
- Risk: Requirements specify "LocalStorage for persistence". Resumes contain highly sensitive Personal Identifiable Information (PII) like phone numbers, addresses, and email. Storing this unencrypted in LocalStorage on shared devices is a security risk.
- Files: `src/store/` (Planned implementation)
- Current mitigation: None.
- Recommendations: Add a clear "Clear Data" button and warn users about shared device usage. Consider optional encryption for stored data.

## Performance Bottlenecks

**Real-time PDF Preview:**
- Problem: Rendering a high-fidelity PDF preview on every keystroke in the editor could lead to UI lag.
- Files: `src/components/preview/` (Planned)
- Cause: Complex layout calculations and potential re-renders of the preview engine.
- Improvement path: Use debouncing for preview updates and consider offloading heavy rendering tasks to Web Workers.

## Fragile Areas

**PDF Parsing Accuracy:**
- Files: `src/lib/pdf-parser.ts` (Planned)
- Why fragile: PDF is a visual format, not a structural one. Extracting semantic data (work history, skills) accurately from arbitrary layouts is highly error-prone.
- Safe modification: Implement a "Review & Edit" step after parsing to allow users to correct AI extraction errors.
- Test coverage: Gaps (None)

**One-Page Enforcement:**
- Files: `src/components/preview/` (Planned)
- Why fragile: Dynamically scaling or trimming content to fit exactly one page is difficult across different browser engines and zoom levels.
- Safe modification: Use a standard PDF rendering library (like `@react-pdf/renderer`) that handles pagination/overflow predictably.

## Scaling Limits

**Browser Memory Limits:**
- Current capacity: Dependent on browser.
- Limit: Large PDFs or complex AI-generated content could exceed LocalStorage limits (typically 5MB-10MB).
- Scaling path: Move to IndexedDB for larger data storage or transition to a lightweight backend.

## Dependencies at Risk

**Gemini API Rate Limits:**
- Risk: Heavy usage of Gemini 1.5 Pro for resume enhancement could hit API rate limits or incur high costs.
- Impact: Users may experience "Service Unavailable" errors during peak times.
- Migration plan: Implement fallback to Gemini 1.5 Flash for simpler tasks and optimize prompts to reduce token usage.

## Missing Critical Features

**PDF Generation & Export:**
- Problem: No library for generating high-quality PDFs is currently installed or configured.
- Blocks: Users cannot export their resumes.

**AI Integration Layer:**
- Problem: Vercel AI SDK and Google Gemini configuration are missing from the codebase.
- Blocks: All AI features (Enhancement, XYZ Builder, ATS Scoring).

## Test Coverage Gaps

**Total Absence of Testing:**
- What's not tested: Everything. No testing framework is installed.
- Files: All.
- Risk: Regressions in resume data handling or UI rendering will go unnoticed.
- Priority: High. Need to install Vitest and Playwright immediately.

---

*Concerns audit: 2026-03-01*
