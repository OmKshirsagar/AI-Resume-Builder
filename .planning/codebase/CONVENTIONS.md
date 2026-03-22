# Coding Conventions

**Analysis Date:** 2025-05-15

## Naming Patterns

**Files:**
- Standard Next.js App Router conventions: `page.tsx`, `layout.tsx`, `route.ts`.
- Components: PascalCase: `MainLayout.tsx`, `ResumeEditor.tsx`.
- Hooks/Utils/Actions: camelCase: `use-store.ts`, `sync.ts`.

**Functions:**
- React components: PascalCase.
- Helper functions: camelCase.

**Types:**
- Interfaces/Types: PascalCase.

## Code Style

**Formatting:**
- Tool: **Biome** (`biome.jsonc`)
- Key settings: `organizeImports: "on"`, `useSortedAttributes: "on"`.
- Rule: Run `npm run check:write` before committing.

**Linting:**
- Tool: **Biome**
- Key rules: `recommended: true`, custom sorting for tailwind classes via `useSortedClasses` on functions `["clsx", "cva", "cn"]`.

## Import Organization

**Order:**
1. Next.js/React standard imports.
2. Third-party library imports.
3. Internal app imports (`~/...`).
4. Style imports.

**Path Aliases:**
- `~/*` maps to `./src/*` (configured in `tsconfig.json`).

## UI Component Design

**Current Pattern:**
- Use raw Tailwind classes on HTML elements.
- Components are feature-grouped in `src/components/[feature]/`.
- No global UI atom library is present.

**Form Design:**
- Use `react-hook-form` with `zodResolver`.
- Register inputs manually or via helper: `<input {...register("field")} className="..." />`.
- Use `FormProvider` in parent components to share form state.

## Error Handling

**Patterns:**
- Use `try/catch` blocks in Server Actions and AI streams.
- Log errors to console in development.
- For UI feedback, use local state (e.g., `isError`, `errorMsg`).

## State Management

**Zustand:**
- Use `useResumeStore.ts` for global application state (the resume data).
- Update store via setter functions: `updatePersonalInfo`, `updateExperience`.

---

*Convention analysis: 2025-05-15*
