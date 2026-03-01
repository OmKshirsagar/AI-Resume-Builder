# Phase 4: Dynamic Sections & Content Condensation - Research

**Researched:** 2024-05-24 (Updated 2024-12-05 with Agentic Patterns)
**Domain:** Dynamic Schemas, State Management, Agentic LLM Patterns
**Confidence:** HIGH

## Summary

This phase focuses on making the resume builder highly flexible by allowing users to add custom sections (e.g., Certifications, Awards, Volunteering) and using AI to condense long resumes into a single A4 page.

**Primary recommendation:** Implement an **Agentic Condensation Pipeline** using Gemini Flash. Move from a single-step "summarize" prompt to a multi-step **Analysis -> Allocation -> Execution** chain. Use "Semantic Compression" techniques to preserve vital short sections (Skills/Education) while fragmenting experience bullets into high-impact shorthand rather than deleting them.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^3.22 | Schema validation | Excellent for recursive/dynamic structures and TS integration. |
| React Hook Form | ^7.48 | Form state management | `useFieldArray` is the industry standard for dynamic lists. |
| Zustand | ^4.4 | Global state management | Lightweight, supports middleware like `persist` and `immer`. |
| Vercel AI SDK | ^3.0 | Gemini integration | Streamlined interface for Google's Gemini Flash. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| Immer | ^10.0 | Immutable state updates | Essential for updating deeply nested Zustand state without boilerplate. |
| Lucide React | ^0.294 | Icons | Visual cues for adding/removing sections. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── schemas/
│   └── resume.ts        # Updated to include CustomSectionSchema
├── store/
│   └── useResumeStore.ts # Updated for Original/Draft state + commit logic
├── lib/
│   └── ai/
│       └── condensation.ts # Agentic orchestration logic
└── components/
    └── editor/
        ├── CustomSections.tsx  # Parent for custom section management
        └── CustomSectionItem.tsx # Individual items within a section
```

### Pattern 1: Agentic Condensation Pipeline
Instead of a single prompt, use a state-machine approach to ensure reliability and A4 fit.

1.  **Analysis Node:** Calculate current "Page Overflow" (e.g., 1.5 pages). Identify section types.
2.  **Allocation Node:** Assign a "Space Budget" (lines/tokens) to each section based on relevance to the Target Role.
3.  **Execution Node:** Compress each section to fit its budget using **Semantic Compression**.
4.  **Validation Node:** Re-calculate fit. If still too long, perform a second pass on low-priority sections.

### Pattern 2: Master vs Draft State (Shadow State)
Instead of editing the "live" resume directly during AI refinement, we keep two versions. This allows users to preview changes and discard them if the AI "hallucinates" or prunes too aggressively.

```typescript
interface ResumeState {
    original: ResumeData | null; // The full-length resume
    draft: ResumeData | null;    // The condensed version
    mode: "edit" | "refine";
    
    setOriginal: (data: ResumeData) => void;
    applyDraft: () => void;      // Commit draft to original
    discardDraft: () => void;    // Reset draft to null
}
```

### Anti-Patterns to Avoid
- **Literal Deletion:** Removing entire bullet points to save space (use Fragmenting instead).
- **Auto-Committing AI Changes:** Never overwrite the user's primary data without a confirmation step ("Apply Changes").
- **Single-Step Complex Prompts:** Forcing Gemini Flash to handle budget allocation AND compression in one call leads to dropped sections (Education/Skills).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep state updates | Native spread `...` | `immer` | Nested arrays in custom sections become unmanageable with native spreads. |
| Undo/Redo | Custom history stack | `zundo` | Built-in middleware for Zustand that handles time travel reliably. |
| Agent Orchestration | Manual fetch loops | Vercel AI SDK / LangGraph | Handles streaming and state transitions more cleanly. |

## Common Pitfalls

### Pitfall 1: "Attention Dilution" (Section Dropping)
**What goes wrong:** AI drops Education or Skills because they are short and seen as "low-signal" compared to long job descriptions.
**How to avoid:** Use **Structural Anchoring** (XML tags) and **R-Codes** (Retention Codes).
**Prompt Hint:** `R1: [SKILLS/EDUCATION] = ZERO-LOSS. Preserve 100% of keywords.`

### Pitfall 2: AI Hallucinations in Custom Sections
**What goes wrong:** AI invents certifications or volunteer work to "fill space" or make the resume "better".
**How to avoid:** Explicitly prompt for **Extractive Compression** only. "Do not add information not present in the source JSON."

## Code Examples

### Semantic Compression Prompt (Execution Node)
```markdown
### OBJECTIVE
Condense the Experience section to fit a budget of [X] lines while preserving logic.

### RULES
1. Use **Dense Logic Seeds**: [Action Verb] + [Metric/Result] + [Tool/Tech].
2. **Semantic Compression**: Convert "I was responsible for managing a team of five developers" to "Managed 5-dev team."
3. **No Literal Deletion**: Do not remove achievements; convert them into high-impact fragments.
4. Omit articles (a, an, the) and filler phrases (Successfully, Effectively).

### INPUT
[Section JSON]
```

### Allocation Logic (Pseudo-code)
```typescript
function allocateBudget(overflowRatio: number, sections: Section[]) {
  return sections.map(s => {
    if (s.type === 'education' || s.type === 'skills') return { ...s, budget: 1.0 }; // Keep 100%
    return { ...s, budget: 1.0 / overflowRatio }; // Scale down others
  });
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Summarization | Semantic Compression | 2024 | Logic retention is higher; no "narrative loss". |
| Single Prompt | Multi-step Agentic Chain | 2024 | Drastic improvement in reliability for Flash-class models. |

## Open Questions

1. **Gemini Flash Reliability:**
   - What we know: Single complex prompts frequently fail constraints.
   - What's unclear: Is Gemini 2.0 Flash Thinking capable of handling the entire pipeline in one "thinking" pass?
   - Recommendation: Use a multi-step pipeline for MVP to ensure predictable performance.

2. **Measuring A4 Fit:**
   - What we know: Character counts are a proxy, but font size and layout matter.
   - Recommendation: Use the `scaling.ts` logic to calculate a "Fill %" and feed it back to the AI as a numerical constraint.

## Sources

### Primary (HIGH confidence)
- [Gemini API Docs](https://ai.google.dev/docs) - Model capabilities and function calling.
- [Vercel AI SDK Core](https://sdk.vercel.ai/docs) - Prompting and orchestration patterns.
- [Zod Documentation](https://zod.dev) - Recursive and dynamic schemas.

### Secondary (MEDIUM confidence)
- "Semantic Compression for LLMs" - Emerging pattern in agentic workflows.
- "Dense Logic Seeds" - Shorthand syntax for high-impact resume writing.

## Metadata

**Confidence breakdown:**
- Agentic Patterns: HIGH - Proven for Flash-class models.
- Semantic Compression: MEDIUM - Requires fine-tuning of the "fragmentation" prompt.
- Architecture: HIGH - Multi-step pipelines are the industry standard for complex LLM tasks.

**Research date:** 2024-12-05
**Valid until:** 2025-01-05
