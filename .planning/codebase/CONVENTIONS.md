# Coding Conventions

**Analysis Date:** 2026-03-01

## Naming Patterns

**Files:**
- Standard Next.js App Router conventions (`page.tsx`, `layout.tsx`).
- Components follow PascalCase (`MainLayout.tsx`).

## Code Style

**Formatting:**
- Tool: Biome (`biome.jsonc`)
- Key settings: `organizeImports: "on"`, `useSortedAttributes: "on"`

**Linting:**
- Tool: Biome
- Key rules: `recommended: true`, custom sorting for tailwind classes via `useSortedClasses` on functions `["clsx", "cva", "cn"]`.

## Import Organization

**Path Aliases:**
- `~/*` maps to `./src/*` (configured in `tsconfig.json`). Biome automatically handles import organization.

## Configuration & Environment

**Environment Variables:**
- Validated via `@t3-oss/env-nextjs` and `zod` in `src/env.js`.
