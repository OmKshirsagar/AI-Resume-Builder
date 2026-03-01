# Codebase Structure

**Analysis Date:** 2025-05-14

## Directory Layout

```
resume-builder/
├── public/             # Static assets
├── src/
│   ├── app/           # Next.js App Router (pages and layouts)
│   ├── components/    # Reusable UI components
│   │   ├── editor/    # Resume editor specific components
│   │   ├── layout/    # Shared layout components (Header, Footer, etc.)
│   │   └── preview/   # Resume preview specific components
│   ├── styles/        # Global styles and Tailwind configuration
│   └── env.js         # Environment variable validation schema
├── biome.jsonc        # Biome linting and formatting configuration
├── next.config.js     # Next.js configuration
├── package.json       # Project dependencies and scripts
├── postcss.config.js  # PostCSS configuration
├── tailwind.config.js # Tailwind CSS configuration (merged into CSS in v4)
└── tsconfig.json      # TypeScript configuration
```

## Directory Purposes

**src/app:**
- Purpose: Contains the application's routes and layouts using Next.js App Router.
- Contains: `layout.tsx`, `page.tsx`, and potential future route segments.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`

**src/components:**
- Purpose: Modular UI components categorized by their functional area.
- Contains: Subdirectories for different feature areas.
- Key files: Not detected (currently empty directories)

**src/components/editor:**
- Purpose: Components specifically for the resume builder's editing interface.
- Contains: TBD (e.g., Form sections, Input fields)

**src/components/layout:**
- Purpose: Shared structural components like navigation and footers.
- Contains: TBD

**src/components/preview:**
- Purpose: Components for rendering the resume preview.
- Contains: TBD (e.g., PDF viewer, Resume templates)

**src/styles:**
- Purpose: Global styles and CSS modules.
- Contains: `globals.css`
- Key files: `src/styles/globals.css`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx`: The main landing page / entry point for the application.
- `src/app/layout.tsx`: The root layout for all pages.

**Configuration:**
- `package.json`: Project manifest and dependencies.
- `biome.jsonc`: Linting and formatting rules.
- `src/env.js`: Environment variable definitions and validation.
- `next.config.js`: Next.js specific settings.

**Core Logic:**
- `src/app/page.tsx`: Initial page implementation.

**Testing:**
- Not detected. No test files or configuration found yet.

## Naming Conventions

**Files:**
- React Components: PascalCase (e.g., `ResumeEditor.tsx`) - *Projected convention*
- Next.js Routes: kebab-case (e.g., `resume-builder/page.tsx`) - *Standard Next.js*
- Logic/Utils: camelCase (e.g., `validateResume.ts`) - *Projected convention*

**Directories:**
- Feature directories: kebab-case (e.g., `resume-builder`)
- Component categories: kebab-case (e.g., `form-elements`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/app/[feature-name]/page.tsx`
- Feature-specific components: `src/components/[feature-name]/`
- Tests: TBD (Standard pattern is usually co-located `.test.ts` or in a `__tests__` directory)

**New Component/Module:**
- Implementation: `src/components/[category]/[ComponentName].tsx`

**Utilities:**
- Shared helpers: `src/lib/` or `src/utils/` (To be created)

## Special Directories

**public/:**
- Purpose: Static assets like images and fonts accessible via the root URL.
- Generated: No
- Committed: Yes

**.next/:**
- Purpose: Next.js build output and cache.
- Generated: Yes
- Committed: No

---

*Structure analysis: 2025-05-14*
