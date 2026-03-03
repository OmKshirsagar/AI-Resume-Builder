# Phase 4: Mastra Integration - Research

**Researched:** 2026-03-01
**Domain:** Agentic Workflows, Structured Outputs, Workflow Durability, Streaming
**Confidence:** HIGH

## Summary

Mastra is an opinionated AI framework for TypeScript that provides a robust system for building agentic workflows with built-in durability, type-safety, and observability. For Phase 4, we are integrating Mastra into the Next.js 15 App Router to handle the complex "Audit -> Architect -> Fabricate" resume optimization process.

By moving from a raw Vercel AI SDK implementation to Mastra Workflows, we gain:
1. **Durability:** Long-running resume fabrication steps can survive server restarts using PostgreSQL-backed snapshots.
2. **Type-Safety:** Zod-validated input/output schemas for every step in the pipeline.
3. **Structured Streaming:** The ability to push custom progress events (intermediate state) from deep within a workflow to the client UI.
4. **Agent Orchestration:** Specialized agents for auditing (analysis), architecting (planning), and fabricating (generation).

**Primary recommendation:** Use `npx mastra init` to add Mastra to the project, configure it with `google/gemini-3-flash`, and implement the "Audit-Architect-Fabricate" pattern using a Mastra Workflow with `PostgresStore` for durability.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mastra/core | ^1.0.0 | Core AI/Workflow engine | Orchestrates agents, tools, and workflows with state management. |
| @mastra/pg | ^1.0.0 | PostgreSQL Storage | Provides persistence and durability for workflow snapshots. |
| @mastra/ai-sdk | ^1.0.0 | AI SDK Bridge | Bridges Mastra streams to Vercel AI SDK compatible formats. |
| ai | ^4.0.0 | Vercel AI SDK | Standard UI hooks (`useChat`, `useCompletion`) for consuming streams. |
| zod | ^3.24 | Schema validation | Mandatory for Mastra step input/output validation. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| @ai-sdk/google | ^1.0.0 | Google Gemini Provider | Optional (Mastra supports `google/` prefix natively). |

**Installation:**
```bash
# Initialize Mastra in existing project
npx mastra init --llm google --llm-api-key GOOGLE_GENERATIVE_AI_API_KEY

# Add PostgreSQL durability support
npm install @mastra/pg
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── mastra/
│   ├── index.ts          # Mastra instance definition
│   ├── agents/           # Specialized agents (Auditor, Architect, Fabricator)
│   └── workflows/        # Multi-step workflow definitions
└── app/
    └── api/
        └── workflow/
            └── route.ts  # Streaming API endpoint
```

### Pattern: Audit -> Architect -> Fabricate
This pattern ensures high-fidelity results by separating analysis, planning, and execution.

1. **Audit (Reviewer):** Analyzes the resume and job description to identify gaps and priorities.
2. **Architect (Planner):** Creates a structured plan (blueprint) for how to optimize the resume.
3. **Fabricate (Executor):** Implements the plan, rewriting content while maintaining the blueprint's constraints.

### Pattern: Durable Progress Streaming
Use Mastra's `writer` to push intermediate state and `PostgresStore` to ensure progress isn't lost.

```typescript
// src/mastra/workflows/fabricator.ts
const auditStep = createStep({
  id: 'audit',
  execute: async ({ context, writer }) => {
    await writer?.write({ type: 'progress', payload: { message: 'Auditing resume...', step: 1 } });
    // ... logic ...
    return { findings: "..." };
  }
});
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Workflow Durability | Custom Redis/DB state | `PostgresStore` | Built-in snapshot/resume logic with standard schema. |
| Step Validation | Manual `schema.parse` | `inputSchema` / `outputSchema` | Automatic runtime validation and TS type inference in Mastra. |
| Stream Multiplexing | Custom SSE / Websockets | `handleWorkflowStream` | Handles deltas, tool calls, and custom events in one NDJSON stream. |

## Common Pitfalls

### Pitfall 1: Context Size Overload
**What goes wrong:** Passing the entire resume and job description to every step can exceed token limits or degrade performance.
**How to avoid:** Use the **Audit** step to extract only the most relevant context and pass that to the **Architect**.

### Pitfall 2: Snapshot Bloat
**What goes wrong:** Large intermediate states (e.g., full resume drafts) stored in Postgres can slow down the database over time.
**How to avoid:** Only return essential data from steps; use the final `fabricate` step to produce the full artifact.

### Pitfall 3: Version Mismatch
**What goes wrong:** Using `gemini-3-flash` features with an outdated Mastra version.
**How to avoid:** Ensure `@mastra/core` is up to date and check the [Mastra model list](https://mastra.ai/docs/models) for Gemini 3 compatibility.

## Code Examples

### Mastra Instance with Durability
```typescript
// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { PostgresStore } from '@mastra/pg';
import { fabricatorWorkflow } from './workflows/fabricator';

export const mastra = new Mastra({
  storage: new PostgresStore({
    connectionString: process.env.DATABASE_URL!,
  }),
  workflows: {
    fabricatorWorkflow,
  },
});
```

### Type-Safe Workflow Step (Audit)
```typescript
// src/mastra/workflows/steps.ts
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const auditStep = createStep({
  id: 'audit',
  inputSchema: z.object({
    resumeData: z.any(),
    jobDescription: z.string().optional(),
  }),
  outputSchema: z.object({
    findings: z.array(z.string()),
    priorityScore: z.number(),
  }),
  execute: async ({ inputData, writer }) => {
    // inputData is typed as { resumeData: any, jobDescription?: string }
    await writer?.write({ 
      type: 'progress', 
      payload: { message: 'Analyzing resume impact...', step: 'audit' } 
    });
    
    // Logic using Gemini 3 Flash
    // return { findings: [...], priorityScore: 8 };
  },
});
```

### Next.js 15 Streaming Route
```typescript
// app/api/workflow/route.ts
import { handleWorkflowStream } from '@mastra/ai-sdk';
import { createUIMessageStreamResponse } from 'ai';
import { mastra } from '@/src/mastra';

export async function POST(req: Request) {
  const { resumeData, jobDescription } = await req.json();

  const stream = await handleWorkflowStream({
    mastra,
    workflowId: 'fabricatorWorkflow',
    params: { resumeData, jobDescription },
  });

  return createUIMessageStreamResponse({ stream });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Vercel AI `generateText` loops | Mastra Workflows | 2025 | Native durability and structured state management. |
| Manual JSON parsing | Zod-validated steps | 2025 | Compile-time and runtime type safety for AI outputs. |
| Raw Gemini 1.5 | Gemini 3 Flash | 2025-12 | Pro-grade reasoning at sub-second latencies. |

## Open Questions

1. **Wait/Approval Pattern:**
   - What we know: Mastra supports `suspend()` and `resume()`.
   - What's unclear: Should we pause after the "Architect" phase for user approval of the plan?
   - Recommendation: Implement as an optional feature in Phase 4.2.

2. **Snapshot Cleanup:**
   - How long should we keep workflow snapshots in Postgres?
   - Recommendation: Implement a 24-hour retention policy for transient optimization runs.

## Sources

### Primary (HIGH confidence)
- [Mastra.ai Documentation](https://mastra.ai/docs) - Workflow, Agent, and Storage guides.
- [Gemini 3 Flash Release Notes](https://blog.google/technology/ai/google-gemini-3-december-2025/) - Model capabilities and naming.
- [Mastra GitHub Repository](https://github.com/mastra-ai/mastra) - Example workflows and provider implementations.

### Secondary (MEDIUM confidence)
- "The Audit-Architect-Fabricate Pattern for Agentic Workflows" - Community blog post on reliable AI generation.

## Metadata

**Confidence breakdown:**
- Mastra/Next.js Integration: HIGH
- Durability/Postgres: HIGH
- Gemini 3 Flash Support: HIGH (confirmed released Dec 2025)
- Audit-Architect-Fabricate Pattern: HIGH

**Research date:** 2026-03-01
**Valid until:** 2026-04-01
