# Modern Tech Stack: Type Safety & UI (v2026)

## Tooling
- **Tailwind CSS 4:** Native CSS-first approach with high performance and streamlined configuration.
- **Zustand:** Lightweight, hook-based state management for the resume data.
- **Biome:** Fast, all-in-one tool for linting, formatting, and more.
- **React Hook Form:** Efficient form management with Zod validation via `@hookform/resolvers`.

## State Management Pattern
- Define a central Zustand store for the resume data.
- Use Zod schemas to validate the store's content and ensure type safety across the AI pipeline.
- Implement persistence using Zustand's `persist` middleware (for `localStorage`).

## Type Safety Pattern
- Define Zod schemas for `Resume`, `Experience`, `Education`, etc.
- Use these schemas for both UI validation (React Hook Form) and AI (Vercel AI SDK).
