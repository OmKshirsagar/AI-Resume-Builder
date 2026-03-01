# Phase 1 Plan: Foundation & Scaffolding

## Goal
Establish a modern Next.js project structure featuring a high-fidelity split-pane UI (Editor/Preview) and a strictly one-page A4 resume container with dynamic scaling and overflow detection.

## 1. Project Initialization
- [ ] Scaffold Next.js 14+ app (App Router, TS, Tailwind).
- [ ] Install core dependencies: `lucide-react`, `react-resizable-panels`, `zod`, `react-hook-form`, `@hookform/resolvers`, `clsx`, `tailwind-merge`.
- [ ] Set up testing environment with `vitest` and `@testing-library/react`.
- [ ] Initialize Shadcn UI and install base components (Button, Input, Textarea, Card, ScrollArea, Accordion).

## 2. Layout & Scaffolding
- [ ] Implement `SplitPaneLayout` using `react-resizable-panels`.
  - LHS: Scrollable editor panel.
  - RHS: Fixed/Scaled preview panel.
- [ ] Ensure layout responsiveness (stacked view on small screens).
- [ ] Add a basic Top Navigation for template switching and export actions.
- [ ] Write Vitest component tests verifying the split-pane layout renders correctly using `@testing-library/react`.

## 3. Resume State & Schema
- [ ] Define `ResumeSchema` (Zod) for full type-safety.
- [ ] Implement `useResumePersistence` hook for syncing data to `localStorage`.
- [ ] Implement `ResumeContext` and `ResumeProvider` for global state management. **Crucially, call `useResumePersistence` inside `ResumeProvider` to auto-save state changes.**
- [ ] Write tests ensuring invalid resume data is rejected and valid data parses correctly.

## 4. One-Page Preview (The "Paper" Container)
- [ ] Create `A4Page` component with fixed physical dimensions (210mm x 297mm).
- [ ] Implement `useScaleToFit` hook to calculate the scaling factor based on the RHS panel width.
- [ ] Implement `usePageOverflow` hook using `ResizeObserver` to detect content exceeding 297mm.
- [ ] Add a visual "Page Limit" warning to the preview UI.
- [ ] Write Vitest unit tests for `useScaleToFit` and `usePageOverflow` hooks to ensure mathematical and logical correctness.

## 5. Basic Editor (LHS)
- [ ] Create a "Personal Info" section with live updates.
- [ ] Create a "Work Experience" section with dynamic add/remove/reorder capabilities.
- [ ] Connect form inputs to the global `ResumeContext`.

## 6. Verification
- [ ] **Automated Testing:** Run `vitest run` to confirm all layout, scaling, and state hooks pass.
- [ ] **Observability:** Verify that editor inputs instantly update the preview pane.
- [ ] **Dynamic Scaling:** Verify the preview automatically shrinks or grows dynamically when resized to ensure the entire A4 page is always visible.
- [ ] **Persistence:** Verify refreshing the page keeps all entered data.
