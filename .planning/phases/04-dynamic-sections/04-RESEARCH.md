# Phase 4: Dynamic Sections & Agentic Resume Fabrication - Research

**Researched:** 2024-12-05 (Updated 2024-12-10 for Agentic Fabricator)
**Domain:** Dynamic Schemas, Multi-step Agentic Workflows, Semantic Compression, State Management
**Confidence:** HIGH

## Summary

The current "Condense" feature is evolved into an **Agentic Resume Fabricator**. Instead of a single-step summarization that blindly cuts text, we use a multi-step pipeline that:
1.  **Analyzes & Ranks Sections:** Assigns importance scores to entire sections based on role relevance.
2.  **Analyzes & Ranks Content:** Evaluates individual bullet points and items within sections for impact and "signal".
3.  **Fabricates Optimized Resume:** Reconstructs the resume from the ground up using **Semantic Compression** and **STAR-R** patterns to fit an A4 page while maximizing impact.

**Primary recommendation:** Use Vercel AI SDK's `generateText` with `output` schema for structured ranking steps and `createStreamableValue` from `@ai-sdk/rsc` to provide real-time progress updates to the UI.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^3.24 | Schema validation | Excellent for structured ranking output and TS integration. |
| Vercel AI SDK | ^6.0 | AI Orchestration | Standard for Next.js AI apps; supports `maxSteps` and structured output. |
| @ai-sdk/rsc | ^2.0 | Streamable Values | Essential for multi-step progress reporting from Server Actions. |
| Zustand | ^5.0 | State management | Handles `original` vs `draft` state for "Preview and Apply" workflow. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| Immer | ^11.1 | Immutable updates | Simplifies deep updates in complex resume schemas. |
| Lucide React | ^0.575 | UI Icons | Visual indicators for progress steps (Loading, Success, Warning). |

## Architecture Patterns

### Pattern: The Agentic Resume Fabricator (Multi-Step Workflow)
Instead of a single "condense" call, we use a deterministic chain of agents to ensure high-fidelity optimization.

1.  **Section Ranking Agent (Structured):**
    *   **Input:** Resume JSON + Job Description (optional).
    *   **Operation:** `generateText({ output: Output.object({ schema: SectionRankSchema }) })`.
    *   **Output:** Importance score (1-10) for each section.
2.  **Content Evaluation Agent (Structured):**
    *   **Input:** Resume Section Data + Ranking Context.
    *   **Operation:** For high-priority sections (e.g., Experience), evaluate each item/bullet point.
    *   **Output:** Importance score (1-10) and "Impact Factor" for each item.
3.  **Fabrication Agent (Generative):**
    *   **Input:** Original data + Rankings + Page Budget (overflow %).
    *   **Operation:** `generateText({ output: Output.object({ schema: ResumeSchema }) })`.
    *   **Constraint:** "Fabricate" the resume by rewriting for brevity and impact (Semantic Compression), not just deleting.

### Pattern: Progress-Aware State Management
To prevent the user from feeling "stuck" during a 10-20 second AI process, use **Streamable Values** to push step-by-step updates.

```typescript
// Server Action Flow
const progress = createStreamableValue({ status: "idle", step: 0 });
// ... Step 1: Ranking ...
progress.update({ status: "Ranking sections...", step: 1 });
// ... Step 2: Evaluating ...
progress.update({ status: "Evaluating experience impact...", step: 2 });
// ... Step 3: Fabricating ...
progress.update({ status: "Drafting optimized resume...", step: 3 });
progress.done({ status: "Complete", data: finalResume });
```

### Anti-Patterns to Avoid
- **"Blind Pruning":** Automatically deleting the last N bullet points to fit space. Use "Impact Ranking" instead.
- **Lost Context:** Not providing the job description to the ranker agent (if available).
- **Single-State Mutation:** Overwriting the user's `original` resume without a `draft` preview step.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| AI Step Progress | Custom EventSource/SSE | `createStreamableValue` | Handles streaming status, logs, and partial results natively in Next.js RSC. |
| Schema Extraction | Regex or manual parsing | `Output.object` | The standard way to get type-safe JSON from LLMs in Vercel AI SDK. |
| Budget Calculation | Simple char counts | `scaling.ts` logic | Character counts don't account for font sizes or layout-induced overflow. |

## Common Pitfalls

### Pitfall 1: "The 10-Score Trap"
**What goes wrong:** AI ranks everything as "10" (Critical) because it's afraid to lose information.
**How to avoid:** Use a **Relative Ranking** prompt. "You MUST assign at least one section a score of 5 or lower." or "Rank sections in order of descending importance."

### Pitfall 2: Fragmenting Narrative
**What goes wrong:** By ranking bullets individually, the AI might keep a "Result" bullet but remove the "Action" bullet that explains it.
**How to avoid:** Group related bullets into "Impact Units" and rank the unit as a whole.

## Code Examples

### Agentic Fabrication Server Action
```typescript
"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { createStreamableValue } from "ai/rsc";
import { z } from "zod";
import { ResumeSchema, type ResumeData } from "~/schemas/resume";

const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY });

export async function fabricateResume(resumeData: ResumeData, jobDescription?: string) {
  const stream = createStreamableValue({ status: "Starting fabrication...", step: 0 });

  (async () => {
    try {
      // Step 1: Section Ranking
      stream.update({ status: "Ranking sections...", step: 1 });
      const { output: sectionRanks } = await generateText({
        model: google("gemini-1.5-flash"),
        output: Output.object({
          schema: z.object({
            ranks: z.array(z.object({ sectionId: z.string(), score: z.number().min(1).max(10) }))
          }),
        }),
        prompt: `Rank these sections by relevance to: ${jobDescription || "Standard Best Practices"}\n${JSON.stringify(resumeData.experience)}`,
      });

      // Step 2: Content Ranking (Example: Experience Bullets)
      stream.update({ status: "Evaluating experience impact...", step: 2 });
      // ... similar generateText call for bullet-level ranking ...

      // Step 3: Fabrication
      stream.update({ status: "Drafting optimized resume...", step: 3 });
      const { output: optimizedResume } = await generateText({
        model: google("gemini-1.5-pro"), // Use a "Pro" model for final fabrication for higher logic fidelity
        output: Output.object({ schema: ResumeSchema }),
        prompt: `Fabricate a new, highly-optimized resume using these rankings: ${JSON.stringify(sectionRanks)}...`,
      });

      stream.done({ status: "Completed", step: 4, data: optimizedResume });
    } catch (error) {
      stream.error(error);
    }
  })();

  return { progress: stream.value };
}
```

### Consuming Progress in UI
```tsx
"use client";

import { useStreamableValue } from "ai/rsc";
import { fabricateResume } from "./actions";

export function FabricateButton({ resumeData }) {
  const [progress, setProgress] = useState(null);
  const [currentStatus] = useStreamableValue(progress);

  const handleFabricate = async () => {
    const { progress: stream } = await fabricateResume(resumeData);
    setProgress(stream);
  };

  return (
    <div>
      <button onClick={handleFabricate}>Optimize Resume</button>
      {currentStatus && (
        <div className="status-overlay">
          <p>{currentStatus.status}</p>
          <div className="progress-bar" style={{ width: `${(currentStatus.step / 4) * 100}%` }} />
        </div>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multi-prompt Loop | `maxSteps` + Tools | 2024 | Easier to let the model decide when it's done optimizing. |
| Object Parsing | `Output.object` | 2024 | Type-safety for intermediate agent results. |

## Open Questions

1.  **Fabrication Model Choice:**
    *   What we know: Flash is fast for ranking; Pro is better for "Fabrication".
    *   What's unclear: Is the latency of Gemini Pro acceptable for a live UI?
    *   Recommendation: Benchmarking with "Thinking" models for the final step.

2.  **Recursive Ranking:**
    *   Should we rank subsections of custom sections too?
    *   Recommendation: Focus on Experience and Projects first as they have the highest "noise-to-signal" ratio.

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK v6 Docs](https://sdk.vercel.ai/docs) - `Output.object` and Agentic patterns.
- [@ai-sdk/rsc Documentation](https://sdk.vercel.ai/docs/advanced/rsc) - `createStreamableValue` patterns.

### Secondary (MEDIUM confidence)
- "STAR-R for LLMs" - Emerging pattern for achievement-oriented rewriting.

## Metadata

**Confidence breakdown:**
- Multi-step Pipeline: HIGH - Proven approach for reliable complex outputs.
- Progress Streaming: HIGH - Standard Next.js AI pattern.
- Ranking Accuracy: MEDIUM - Heavily dependent on prompt quality and job description presence.

**Research date:** 2024-12-10
**Valid until:** 2025-01-15
