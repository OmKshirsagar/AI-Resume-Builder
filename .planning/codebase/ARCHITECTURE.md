# Architecture

**Analysis Date:** 2025-05-15

## Pattern Overview

**Overall:** Component-Based Next.js Architecture with Centralized State.

**Key Characteristics:**
- **Centralized Store:** `Zustand` for resume data state management (`src/store/useResumeStore.ts`).
- **Feature-based Components:** Organized by domain (AI, Editor, Export, Preview).
- **AI Integration:** Using `Mastra` and `AI SDK` for workflows and streaming responses.

## Layers

**UI Layer:**
- Purpose: Render components and handle user interaction.
- Location: `src/components/`
- Contains: React components, hooks.
- Depends on: Zustand store, AI actions.

**Action/Workflow Layer:**
- Purpose: Handle business logic and AI processing.
- Location: `src/app/actions/`, `src/mastra/workflows/`
- Contains: Next.js Server Actions, Mastra workflows.
- Depends on: Mastra SDK, Drizzle (indirectly via db layer).

**Data Layer:**
- Purpose: Persistence and schema definitions.
- Location: `src/db/`, `src/schemas/`
- Contains: Drizzle schema, Turso/libSQL client, Zod schemas.

## Data Flow

**Resume Update Flow:**

1. User types in form (`src/components/editor/forms/`).
2. `react-hook-form` tracks local changes in `ResumeEditor.tsx`.
3. debounced sync triggers `onSync` callback.
4. `ResumeBuilder.tsx` receives `onSync` and updates the Zustand store (`useResumeStore.ts`).
5. `PreviewPane.tsx` and `ResumeRenderer.tsx` re-render based on store changes.

**State Management:**
- Primary application state (resume data) is stored in `Zustand`.
- Form state is managed locally by `react-hook-form` for performance and sync with the store via debouncing.

## Key Abstractions

**Main Layout (Resizable):**
- Purpose: Provides a split-pane interface for editing and previewing.
- Examples: `src/components/layout/MainLayout.tsx`
- Pattern: Uses `react-resizable-panels` (`PanelGroup`, `Panel`, `PanelResizeHandle`) for a desktop-like experience.

**Resume Schema:**
- Purpose: Shared Zod schema for validation across frontend and backend.
- Examples: `src/schemas/resume.ts`

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: URL visit.
- Responsibilities: Fetches data, initializes `ResumeBuilder`.

## Error Handling

**Strategy:** Mostly component-level handling with `try/catch` in actions and local state for error feedback.

## Cross-Cutting Concerns

**Logging:** Standard `console.log` for development debugging.
**Validation:** `Zod` for schema validation (`src/schemas/resume.ts`).
**Authentication:** `Clerk` integration (`src/middleware.ts`, `src/app/api/webhooks/clerk/`).

---

*Architecture analysis: 2025-05-15*
