# Domain Pitfalls: Milestone 2 - Pro Upgrade

**Domain:** Resume Builder SaaS
**Researched:** February 2025

## Critical Pitfalls

### Pitfall 1: Keyword Stuffing (Detection)
**What goes wrong:** Users (or AI) may try to "game" the ATS by adding invisible text or repeating keywords 100 times.
**Prevention:** Implement "Penalty Flags" in the scoring system. Detect hidden text or excessive keyword density (over 10 mentions of a single skill).

### Pitfall 2: Broken PDF Parsers
**What goes wrong:** Using tables, columns, or graphics in `@react-pdf` that look great but break common ATS parsers (like Workday).
**Prevention:** Use a "Machine-Readable Preview" mode. Test templates with standard parsers (e.g., `pdf-parse`) and ensure the text flows logically top-to-bottom.

### Pitfall 3: Database Schema Rigidity
**What goes wrong:** Hard-coding sections (Experience, Education). If a user wants a "Volunteering" or "Certifications" section, the DB schema breaks.
**Prevention:** Use a "Section" model with `type` and `content_id` to allow dynamic sections.

## Moderate Pitfalls

### Pitfall 1: Clerk Sync Latency
**What goes wrong:** User signs up, redirected to dashboard, but `user.created` webhook hasn't finished provisioning the Turso DB.
**Prevention:** Use a "Just-in-Time" (JIT) provisioning pattern in the layout component or show a "Setting up..." loader.

### Pitfall 2: AI Cost Management
**What goes wrong:** Every "Keystroke" or "Tailor" action triggers a $0.05 LLM call, quickly eating up Pro margins.
**Prevention:** Use `gpt-4o-mini` for extraction/matching. Only use `gpt-4o` for the final "Writer" agent. Cache common JD analyses.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Cloud Foundation | Clerk-Turso data sync issues. | Use a shared Turso DB for MVP to avoid "DB-per-user" complexity early. |
| Master Resume | Circular references in junction tables. | Strict schema validation with Zod. |
| ATS Scoring | Over-optimization of scores. | Clearly state that scores are "estimated" and focus on readability. |

## Sources
- [Common ATS Myths (Jobscan)](https://www.jobscan.co/blog/ats-myths/)
- [Turso Webhook Best Practices](https://turso.tech/docs)
- [React PDF Issues (Github)](https://github.com/diegomura/react-pdf/issues)
