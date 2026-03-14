# Phase 7: Persistence & Deployment - Research

**Researched:** 2025-03-14
**Domain:** DevOps, Performance, Persistence
**Confidence:** HIGH

## Summary

Phase 7 focuses on moving the Resume Builder from a local development environment to a production-ready state on Vercel. This involves configuring Next.js 15 and Mastra to handle serverless constraints (specifically timeouts for long-running AI workflows), ensuring secure environment variable management, and optimizing the build for performance.

**Primary recommendation:** Use Vercel Serverless Functions with an extended `maxDuration` (60s+) for Mastra workflows, and transition from `:memory:` to a remote Turso (LibSQL) database for persistent storage.

<user_constraints>
## User Constraints (from CONTEXT.md)

*Note: No CONTEXT.md found for Phase 7. Research based on Roadmap and technical requirements.*

### Locked Decisions
- **Framework:** Next.js 15 (App Router).
- **AI Orchestration:** Mastra.
- **Deployment Platform:** Vercel.
- **Linting/Formatting:** Biome.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH | Persistence/Auth (if needed) | Recommended Turso/LibSQL for state persistence across sessions. |
| DEPLOY | Vercel Deployment | Configured `maxDuration` and `serverExternalPackages` for Mastra. |
| PERFORMANCE | Performance Sweep | Next.js 15 optimizations, Turbopack, and Bundle Analysis. |
| FINAL-CHECK | Launch Readiness | Comprehensive checklist for production deployment. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vercel | N/A | Hosting/Deployment | Native support for Next.js 15 features. |
| Turso (LibSQL) | ^1.6.2 | Remote Persistence | Mastra's recommended storage for serverless environments. |
| @next/bundle-analyzer | Latest | Build Optimization | Standard tool for identifying large dependencies. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| @t3-oss/env-nextjs | ^0.12.0 | Env Validation | Already in project; ensures keys are present at build/runtime. |

## Architecture Patterns

### Serverless Workflow Handling
Mastra workflows can be long-running. Vercel's default timeout is 15s (Hobby) or 300s (Pro).
**Recommendation:**
- Export `maxDuration` in routes using Mastra.
- Use **Streaming** (`toDataStreamResponse`) to keep connections alive and prevent intermediate timeouts.

### Database Strategy
Vercel functions are ephemeral. The current `:memory:` LibSQL configuration in `src/mastra/index.ts` will reset on every invocation.
**Required Change:**
```typescript
// src/mastra/index.ts
export const mastra = new Mastra({
  storage: new LibSQLStore({
    id: "resume-builder-prod",
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  }),
  // ...
});
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Env Validation | Manual `process.env` checks | T3 Env | Type-safety and build-time validation. |
| Font Loading | Custom @font-face | `next/font` | Zero Layout Shift (CLS) and automatic subsetting. |
| Image Optimization | Manual compression | `next/image` | Automatic WebP/AVIF and resizing. |

## Common Pitfalls

### Pitfall 1: Serverless Timeout (504 Gateway Timeout)
**What goes wrong:** AI generation takes 20s, but Vercel kills the function at 15s.
**How to avoid:** Set `export const maxDuration = 60;` in the specific API route or Server Action.

### Pitfall 2: Ephemeral Filesystem
**What goes wrong:** Storing PDFs or local SQLite files in `/tmp` or root. They disappear.
**How to avoid:** Use external storage (Turso for data, S3/Vercel Blob for files if needed).

### Pitfall 3: Large Client Bundles
**What goes wrong:** Including `@mastra/core` or `lucide-react` without tree-shaking, leading to slow LCP.
**How to avoid:** Ensure Mastra is in `serverExternalPackages` and use Lucide's modular imports.

## Code Examples

### Vercel Config for Next.js 15 + Mastra
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@mastra/core", "@mastra/libsql"],
  // Optional: Enable Bundle Analyzer
};
export default nextConfig;
```

### Route-Level Timeout
```typescript
// src/app/api/workflow/fabricate/route.ts
export const maxDuration = 60; // 60 seconds

export async function POST(req: Request) {
  // workflow logic
}
```

## Biome Project-Wide Clean
Recommended command for final sweep:
```bash
# Safe fix (lint + format)
npm run check:write

# Complete fix (includes unsafe transformations)
npm run check:unsafe
```

## Deployment Checklist
1. [ ] **Environment Variables:** Set `GOOGLE_GENERATIVE_AI_API_KEY` in Vercel Dashboard.
2. [ ] **Persistence:** Provision Turso DB and set `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN`.
3. [ ] **Timeouts:** Verify `maxDuration` is set on all AI-heavy routes.
4. [ ] **Build Check:** Run `npm run build` locally to ensure no TS or Lint errors.
5. [ ] **Bundle Analysis:** Run analyzer to check for accidental large client-side imports.
6. [ ] **Next.js 15 Fonts:** Ensure `next/font` is used for all typography.

## Validation Architecture (Nyquist)
*Workflow validation enabled in config.*

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | vitest.config.ts |
| Quick run command | `npm run test` |

### Wave 0 Gaps
- [ ] Integration test for production environment variables (mocking T3 Env).
- [ ] Smoke test for Vercel route configuration (checking `maxDuration` exports via static analysis).

## Sources
- Mastra Documentation (Vercel Deployment)
- Next.js 15 Release Notes (Async APIs, Turbopack)
- Biome CLI Reference
- T3 Env Documentation
