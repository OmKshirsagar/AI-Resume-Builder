# Technology Stack (Milestone 2 - Pro Upgrade)

**Project:** Resume Builder
**Researched:** February 2025

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Next.js | 15.x | Application Framework | App Router, Server Actions, Middleware. |
| Clerk | Latest | Authentication | Best-in-class user management, webhooks, and session handling. |

### Database & Persistence
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Turso (LibSQL) | Latest | Database | Edge-compatible SQLite, branching, multi-db schemas. |
| Drizzle ORM | Latest | ORM | Type-safe SQL, lightweight, excellent SQLite support. |

### AI & Workflows
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Mastra AI | Latest | Workflow Engine | Orchestrating multi-agent steps (extraction, tailoring, matching). |
| OpenAI SDK | Latest | LLM Access | Industry standard for reliable generation. |

### PDF & Styling
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| @react-pdf/renderer | 3.x+ | PDF Generation | Flexible, server/client compatible, styleable with CSS-like API. |
| Tailwind CSS | 3.x+ | Web UI Styling | Rapid development and consistent styling. |

### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `natural` | Latest | NLP Tasks | For basic TF-IDF scoring without LLM overhead. |
| `zod` | Latest | Validation | Type-safe schema validation for AI outputs and forms. |
| `lucide-react` | Latest | Icons | Consistent UI iconography. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Database | Turso | Supabase | Turso's SQLite model is faster for the "database-per-user" pattern. |
| Auth | Clerk | NextAuth | NextAuth requires more manual DB setup and doesn't offer as much out-of-the-box user management UI. |
| PDF | react-pdf | Puppeteer | Puppeteer is heavy and expensive for serverless environments. |

## Installation

```bash
# Core Dependencies
npm install @clerk/nextjs @libsql/client drizzle-orm mastra @react-pdf/renderer zod natural

# Dev Dependencies
npm install -D drizzle-kit
```

## Sources
- [Clerk Docs](https://clerk.com/docs)
- [Turso Docs](https://turso.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Mastra Docs](https://mastra.ai/docs)
