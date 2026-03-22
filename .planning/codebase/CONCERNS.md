# Codebase Concerns

**Analysis Date:** 2025-05-15

## Tech Debt

**Lack of Standard UI Library:**
- Issue: Standard components like `Button`, `Input`, `Dialog/Modal`, `Dropdown` are implemented ad-hoc with raw Tailwind classes in each feature.
- Files: `src/components/ai/JobTailorModal.tsx`, `src/components/editor/forms/PersonalInfoForm.tsx`, etc.
- Impact: Increased maintenance, inconsistent UI across features, code duplication.
- Fix approach: Integrate a UI library like `shadcn/ui` or create a `src/components/ui/` directory for shared atomic components.

**Manual Form Field Registration:**
- Issue: `PersonalInfoForm.tsx` and others use `register` manually on raw `input` tags.
- Files: `src/components/editor/forms/PersonalInfoForm.tsx`
- Impact: Verbose code, lack of standard styling for error states, missing accessibility features.
- Fix approach: Create a reusable `FormField` wrapper or use `shadcn/ui` form patterns.

## Known Bugs

**External Data Sync Loop:**
- Symptoms: Local form changes might be overwritten by external store updates if not handled carefully.
- Files: `src/components/editor/ResumeEditor.tsx`
- Current mitigation: Uses `lastSyncedDataRef` and `JSON.stringify` to prevent sync loops.

## Security Considerations

**API Webhook Secret Handling:**
- Risk: Verification of webhooks requires secrets.
- Files: `src/app/api/webhooks/clerk/route.ts`
- Current mitigation: Uses environment variables.

## Performance Bottlenecks

**Deep Form Watching:**
- Problem: `ResumeEditor.tsx` watches the entire `ResumeData` object.
- Files: `src/components/editor/ResumeEditor.tsx`
- Cause: `react-hook-form` `watch()` on a large object.
- Improvement path: Optimize by watching only specific fields where necessary or use `useWatch` at the field level.

## Fragile Areas

**PDF Generation Rendering:**
- Files: `src/components/export/PDFDocument.tsx`
- Why fragile: `@react-pdf/renderer` has a different layout engine than web CSS.
- Safe modification: Test exports frequently after making layout changes.

## Test Coverage Gaps

**UI Components:**
- What's not tested: Complex interactions in `JobTailorModal.tsx` and `ResumeEditor.tsx`.
- Priority: Medium.

---

*Concerns audit: 2025-05-15*
