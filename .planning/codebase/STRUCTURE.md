# Codebase Structure

**Analysis Date:** 2025-05-15

## Directory Layout

```
resume-builder/
├── src/
│   ├── app/            # Next.js App Router (pages, actions, api)
│   ├── components/     # React components
│   │   ├── ai/         # AI-powered UI components (modals, buttons)
│   │   ├── editor/     # Resume editor forms and logic
│   │   ├── export/     # PDF export components
│   │   ├── layout/     # App layout components
│   │   └── preview/    # Resume preview and rendering
│   ├── db/             # Database schema and client
│   ├── hooks/          # Shared React hooks
│   ├── lib/            # Shared utilities and AI prompts
│   ├── mastra/         # Mastra AI agents and workflows
│   ├── schemas/        # Zod validation schemas
│   ├── store/          # Zustand state management
│   └── styles/         # Global CSS
└── public/             # Static assets
```

## Directory Purposes

**src/app:**
- Purpose: Contains the Next.js App Router structure.
- Contains: `page.tsx`, `layout.tsx`, and subdirectories for `actions` and `api`.
- Key files: `src/app/page.tsx`, `src/app/layout.tsx`.

**src/components:**
- Purpose: Reusable and page-specific React components.
- Contains: Feature-organized components.
- Key files: `src/components/ResumeBuilder.tsx`.

**src/components/layout:**
- Purpose: Application-level layout structures.
- Contains: `MainLayout.tsx`.
- Key files: `src/components/layout/MainLayout.tsx` (uses `react-resizable-panels`).

**src/components/editor:**
- Purpose: Resume editing interface.
- Contains: `ResumeEditor.tsx` and subfolder `forms/` for specific resume sections.

**src/components/ai:**
- Purpose: Components interacting with AI services.
- Contains: `JobTailorModal.tsx`, `RefineButton.tsx`.

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: Main entry point for the application.

**Configuration:**
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript configuration.
- `biome.jsonc`: Linting and formatting rules.

**Core Logic:**
- `src/store/useResumeStore.ts`: Central state management.
- `src/mastra/workflows/fabricator.ts`: AI resume generation workflow.

**Testing:**
- `src/app/actions/sync.test.ts`: Example action test.

## Naming Conventions

**Files:**
- PascalCase: `MainLayout.tsx`, `ResumeEditor.tsx` (Components)
- camelCase: `use-store.ts`, `sync.ts` (Hooks, Actions, Utils)

**Directories:**
- kebab-case: `resume-builder`, `node_modules`
- camelCase: `app/actions`, `components/ai`

## Where to Add New Code

**New Feature:**
- Primary code: `src/components/[feature-name]`
- Logic/State: `src/store/useResumeStore.ts` or a new hook.

**New Component/Module:**
- Implementation: `src/components/` (if it's a UI atom) or feature directory.

**Utilities:**
- Shared helpers: `src/lib/`

## Special Directories

**src/mastra:**
- Purpose: Mastra AI framework configuration, agents, and workflows.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2025-05-15*
