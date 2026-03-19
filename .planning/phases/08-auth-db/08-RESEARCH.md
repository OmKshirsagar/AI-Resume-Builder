# Phase 08: Authentication & Cloud Database - Research

**Researched:** 2026-03-19
**Domain:** Authentication (Clerk), Database (Turso), ORM (Drizzle)
**Confidence:** HIGH

## Summary

This phase transforms the local-only utility into a multi-tenant SaaS. We will use **Clerk** (v6) for authentication, which is fully compatible with Next.js 15 and React 19. For the database, **Turso (LibSQL)** provides a globally distributed SQLite experience that pairs perfectly with **Drizzle ORM**.

The core challenge is transitioning from a "single JSON document" (local) to a relational "Bullet Bank" (cloud). We recommend a **Relational Schema** for experience and bullets to support future features like bullet-level analytics and versioning, while using **JSON columns** for flatter configurations like design and personal info.

**Primary recommendation:** Use Clerk's async middleware for route protection and a Webhook (via Svix) to sync user records to Turso. Implement a client-side "Migration Observer" to move existing localStorage resumes to the cloud on the first sign-in.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@clerk/nextjs` | ^6.0.0 | Auth & User Mgmt | Native Next.js 15 support, async `auth()` helpers. |
| `drizzle-orm` | ^0.33.0 | SQL ORM | Type-safe, lightweight, excellent SQLite/LibSQL support. |
| `@libsql/client` | ^0.10.0 | Turso Client | Native driver for Turso's distributed SQLite. |
| `svix` | ^1.24.0 | Webhook Verification | Clerk's recommended tool for verifying webhook signatures. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| `drizzle-kit` | ^0.24.0 | Migrations & Studio | Generating SQL migrations and viewing data locally. |

**Installation:**
```bash
npm install @clerk/nextjs drizzle-orm @libsql/client svix
npm install -D drizzle-kit
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/route.ts  # Webhook handler
│   ├── (auth)/                 # Auth route group
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
├── components/
│   └── auth/
│       └── SyncObserver.tsx    # Handles localStorage -> DB migration
├── db/
│   ├── schema.ts               # Drizzle schema definitions
│   └── index.ts                # DB client initialization
└── lib/
    └── auth/
        └── metadata.ts         # Helpers for Clerk metadata sync
```

### Pattern 1: Clerk Middleware (Next.js 15 Async)
In Next.js 15, the `auth()` helper is asynchronous. Middleware must be configured to handle this.

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect(); // Async call for Next.js 15
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
```

### Pattern 2: Relational "Bullet Bank" Schema
Instead of storing the entire resume as one JSON blob, we break out the items that require individual manipulation.

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // Clerk ID
  email: text("email").notNull(),
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  personalInfo: text("personal_info", { mode: "json" }), // JSON for flat data
  design: text("design", { mode: "json" }),             // JSON for configuration
  isMaster: integer("is_master", { mode: "boolean" }).default(false),
});

export const experiences = sqliteTable("experiences", {
  id: text("id").primaryKey(),
  resumeId: text("resume_id").references(() => resumes.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  order: real("order").notNull(), // Use floats for easier reordering
});

export const bullets = sqliteTable("bullets", {
  id: text("id").primaryKey(),
  experienceId: text("experience_id").references(() => experiences.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  order: real("order").notNull(),
  impactScore: integer("impact_score"), // Phase 11 support
});
```

### Anti-Patterns to Avoid
- **Client-side DB Access:** Never expose Turso credentials to the client. Use Server Actions or API routes.
- **Polling for Auth Sync:** Don't poll for user creation. Use Clerk Webhooks for reliable "Source of Truth" synchronization.
- **Storing Large Blobs:** Avoid storing PDF files in the database. Use Turso for metadata and (future) S3/R2 for actual files if needed.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Webhook Verification | Custom crypto check | `svix` | Prevents replay attacks and header spoofing. |
| Auth UI | Custom Login/Signup | `@clerk/nextjs` | Handles MFA, SSO, and session management securely. |
| Schema Migrations | Manual SQL files | `drizzle-kit` | Generates safe migrations from TypeScript schema. |
| Reordering Logic | Array index shifting | `real` (Floats) | Allows `(1 + 2) / 2 = 1.5` insertion without updating other rows. |

## Common Pitfalls

### Pitfall 1: LocalStorage Sync Race Conditions
**What goes wrong:** User logs in, `SyncObserver` triggers, but the user is redirected away before the sync finishes, or it triggers twice.
**How to avoid:** Use a `useRef` to track if sync has started, and show a global "Syncing your data..." overlay during the process. Ensure the server action is idempotent (upsert).

### Pitfall 2: Async Auth in Next.js 15
**What goes wrong:** Calling `auth()` in a Server Component without `await`.
**How to avoid:** v6 of `@clerk/nextjs` makes `auth()` async. Always `const { userId } = await auth();`.

### Pitfall 3: Turso Connection Limits
**What goes wrong:** Creating a new DB connection on every request in a serverless environment.
**How to avoid:** Use a global singleton for the Drizzle/LibSQL client to reuse connections across invocations.

## Code Examples

### Migration Strategy (localStorage -> DB)
```typescript
// src/components/auth/SyncObserver.tsx
"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { syncResumesAction } from "@/app/actions/sync";

export function SyncObserver() {
  const { user, isLoaded } = useUser();
  const syncStarted = useRef(false);

  useEffect(() => {
    if (isLoaded && user && !syncStarted.current) {
      const localData = localStorage.getItem("resume-storage"); // Check your zustand key
      if (localData) {
        syncStarted.current = true;
        const data = JSON.parse(localData);
        syncResumesAction(data).then(() => {
           // Success: Clear local or mark as migrated
        });
      }
    }
  }, [user, isLoaded]);

  return null;
}
```

### User Metadata Sync (Clerk -> DB)
```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix';
import { db } from '@/db';
import { users } from '@/db/schema';

export async function POST(req: Request) {
  const payload = await req.json();
  // ... verify with svix ...
  
  const { id, email_addresses } = payload.data;
  if (payload.type === 'user.created') {
    await db.insert(users).values({
      id,
      email: email_addresses[0].email_address,
    }).onConflictDoUpdate({ 
      target: users.id, 
      set: { email: email_addresses[0].email_address } 
    });
  }
  return new Response('OK', { status: 200 });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Middleware `withClerkMiddleware` | `clerkMiddleware` (v5+) | 2024 | More flexible, standard Next.js middleware pattern. |
| Synchronous `auth()` | Asynchronous `await auth()` | Next.js 15 | Aligns with React 19 and Next.js 15 request APIs. |
| LocalStorage-only | Hybrid Cloud-Sync | SaaS shift | User data persists across devices, enables Pro features. |

## Open Questions

1. **Reordering precision:** Should we use `lexical` (strings) or `real` (floats) for bullet reordering? 
   - *Recommendation:* Floats are easier for small lists like resume bullets (max 10-20 per experience).
2. **Conflict Resolution:** What if the user has different data in two different browsers before logging in?
   - *Recommendation:* Prompt the user or take the most recently updated.

## Sources

### Primary (HIGH confidence)
- `clerk-nextjs-v6` - Official Clerk migration guide for Next.js 15.
- `drizzle-orm-docs` - LibSQL/Turso integration details.
- `turso-distributed-sqlite` - Official documentation on LibSQL client and Turso platform.

### Secondary (MEDIUM confidence)
- Community blogs on "Bullet Bank" relational design.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Clerk v6 and Drizzle are well-established.
- Architecture: HIGH - Syncing guest data to auth data is a standard SaaS pattern.
- Pitfalls: MEDIUM - Next.js 15 nuances are still evolving but documented.

**Research date:** 2026-03-19
**Valid until:** 2026-05-19
