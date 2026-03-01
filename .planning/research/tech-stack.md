# Modern Tech Stack: Type Safety & UI

## Tooling
- **Shadcn UI:** Components are copied into `components/ui`. Requires `lucide-react`.
- **TanStack Query:** Use for client-side state management of resume data and job descriptions.
- **Drizzle ORM:** Schema-first approach. Use `drizzle-kit` for migrations.
- **Vercel Postgres:** Seamlessly integrates with Next.js and Vercel deployment.

## Type Safety Pattern
- Define Zod schemas for `Resume`, `Experience`, `Education`, etc.
- Use these schemas for both database (Drizzle) and AI (Vercel AI SDK) to ensure end-to-end consistency.
