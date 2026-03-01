# Architecture

**Analysis Date:** 2025-05-14

## Pattern Overview

**Overall:** Next.js 15 App Router Architecture

**Key Characteristics:**
- **Server-First Components:** Next.js App Router defaults to Server Components, enabling better performance by reducing client-side JavaScript.
- **Modern React:** Leverages React 19 features and standard modern hooks.
- **Client-Side State Management:** Uses Zustand for global state that needs to be accessed across multiple components (likely for resume state).
- **Zod-Powered Validation:** Uses Zod for environment variable validation and likely for resume data schema validation.

## Layers

**UI Layer (src/app and src/components):**
- Purpose: Handles the presentation and user interaction.
- Location: `src/app` (pages/layouts) and `src/components` (reusable UI)
- Contains: React components, hooks, styles.
- Depends on: Zustand stores, Zod schemas, React Hook Form.

**State Management Layer (Zustand):**
- Purpose: Centralized store for the application's global state (e.g., resume data).
- Location: Not yet created (typically `src/store/` or `src/lib/store.ts`)
- Contains: Zustand store definitions and actions.
- Used by: UI components for reactive state updates.

**Environment Layer (src/env.js):**
- Purpose: Type-safe environment variable management.
- Location: `src/env.js`
- Contains: Zod schemas for server and client environment variables.
- Used by: Entire application to access validated environment variables.

## Data Flow

**Current State Management (Projected):**

1. User interacts with UI components (e.g., `src/components/editor`).
2. Components update the global store (Zustand).
3. The store propagates changes back to reactive components (e.g., `src/components/preview`).
4. Forms handle local validation via React Hook Form and Zod.

**State Management:**
- Zustand for persistent application state.
- React Hook Form for local component/form state.

## Key Abstractions

**Environment Configuration:**
- Purpose: Ensures all required environment variables are present and correctly typed at build and run time.
- Examples: `src/env.js`
- Pattern: @t3-oss/env-nextjs

## Entry Points

**Root Page:**
- Location: `src/app/page.tsx`
- Triggers: HTTP GET request to `/`.
- Responsibilities: Main application entry point UI.

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every page request.
- Responsibilities: Base HTML structure, global styles import, and provider wrapping.

## Error Handling

**Strategy:** Default Next.js 15 error handling.

**Patterns:**
- **Zod Validation:** Fails early and loudly if environment variables are incorrect or data doesn't match expected schemas.

## Cross-Cutting Concerns

**Logging:** Not detected (standard console.log).
**Validation:** Zod-based schema validation (`src/env.js`).
**Authentication:** Not yet implemented (Next-auth/Auth.js is standard for this stack).

---

*Architecture analysis: 2025-05-14*
