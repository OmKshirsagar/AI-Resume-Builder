# Phase 4: Dynamic Sections & Content Condensation - Research

**Researched:** 2024-05-24
**Domain:** Dynamic Schemas, State Management, AI Prompting
**Confidence:** HIGH

## Summary

This phase focuses on making the resume builder highly flexible by allowing users to add custom sections (e.g., Certifications, Awards, Volunteering) and using AI to condense long resumes into a single A4 page.

**Primary recommendation:** Use a nested `useFieldArray` pattern in React Hook Form for custom sections, manage "Master vs Draft" state in Zustand using dual-key storage with explicit `commit`/`rollback` actions, and utilize a "selective pruning" prompt for Gemini 3 Flash to achieve A4-compatible JSON condensation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | ^3.22 | Schema validation | Excellent for recursive/dynamic structures and TS integration. |
| React Hook Form | ^7.48 | Form state management | `useFieldArray` is the industry standard for dynamic lists. |
| Zustand | ^4.4 | Global state management | Lightweight, supports middleware like `persist` and `immer`. |
| Vercel AI SDK | ^3.0 | Gemini integration | Streamlined interface for Google's Gemini 3 Flash. |

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
└── components/
    └── editor/
        ├── CustomSections.tsx  # Parent for custom section management
        └── CustomSectionItem.tsx # Individual items within a section
```

### Pattern 1: Dynamic Zod Catch-all
By defining a generic item structure, we can support any type of content while keeping the UI and AI prompts predictable.

```typescript
// src/schemas/resume.ts
export const CustomSectionItemSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional().or(z.literal("")),
    date: z.string().optional().or(z.literal("")),
    description: z.array(z.string()).default([]),
});

export const CustomSectionSchema = z.object({
    id: z.string(),
    title: z.string().min(1, "Section title is required"), // e.g., "Certifications"
    items: z.array(CustomSectionItemSchema).default([]),
});

// Added to ResumeSchema
export const ResumeSchema = z.object({
    // ... existing fields
    customSections: z.array(CustomSectionSchema).default([]),
});
```

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
- **Hardcoded Section Keys:** Don't create `certifications`, `awards`, etc., as top-level keys. This makes the UI and AI logic brittle.
- **Auto-Committing AI Changes:** Never overwrite the user's primary data without a confirmation step ("Apply Changes").

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Deep state updates | Native spread `...` | `immer` | Nested arrays in custom sections become unmanageable with native spreads. |
| Undo/Redo | Custom history stack | `zundo` | Built-in middleware for Zustand that handles time travel reliably. |
| PDF Layout calculation | DOM measurement | CSS `@page` + A4 scaling | Use the existing scaling logic in `src/lib/scaling.ts` rather than custom JS height checks. |

## Common Pitfalls

### Pitfall 1: Nested `useFieldArray` Complexity
**What goes wrong:** Field names become misaligned (e.g., `customSections.0.items.1.title`).
**Why it happens:** Passing the wrong index or failing to pass the `control` object from the parent form.
**How to avoid:** Always pass `control` to child components and use the `name` prop correctly in nested `useFieldArray` hooks: `name: `customSections.${sectionIndex}.items``.

### Pitfall 2: AI Over-Pruning
**What goes wrong:** AI removes a critical job because it's 3 years old but highly relevant.
**How to avoid:** Explicitly instruct the AI in the prompt to "prioritize relevance to [Target Role]" and keep the 3 most recent items detailed.

## Code Examples

### Dynamic Form UI (React Hook Form)
```tsx
const CustomSectionFields = ({ control, register }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "customSections"
    });

    return (
        <div>
            {fields.map((field, index) => (
                <div key={field.id}>
                    <input {...register(`customSections.${index}.title`)} placeholder="Section Title" />
                    <CustomItemsField sectionIndex={index} control={control} register={register} />
                    <button onClick={() => remove(index)}>Remove Section</button>
                </div>
            ))}
            <button onClick={() => append({ title: "New Section", items: [] })}>Add Section</button>
        </div>
    );
};
```

### AI Condensation Prompt
```markdown
You are a resume expert. Condense the provided JSON resume to fit one A4 page.
1. KEEP the 3 most recent roles detailed.
2. REDUCE roles older than 5 years to Title and Company only.
3. LIMIT bullet points to 3 high-impact items per role.
4. CONSOLIDATE skills into a single comma-separated list.
5. RETURN the result in the EXACT same JSON schema.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Fixed schemas | Dynamic Zod Arrays | 2023+ | Users can create any resume type (Academic, Creative). |
| Direct state edit | Shadow/Draft State | Standard | Safer UX; allows AI "previews" before commit. |

## Open Questions

1. **How to measure "A4 fit" in real-time?**
   - What we know: We have a scaling logic in `src/lib/scaling.ts`.
   - What's unclear: Can we reliably tell the AI "you are 20% over budget"?
   - Recommendation: Use a character-count heuristic or a multi-pass approach if the first condensation is still too long.

2. **Should custom sections support different "types"?** (e.g., List vs. Grid)
   - What we know: Current generic schema supports "title/subtitle/date/description".
   - What's unclear: Do users want a "Skills" style grid for custom sections?
   - Recommendation: Keep it simple (list-based) for MVP.

## Sources

### Primary (HIGH confidence)
- [Zod Documentation](https://zod.dev) - Recursive and dynamic schemas.
- [React Hook Form useFieldArray](https://react-hook-form.com/docs/usefieldarray) - Official implementation guide.
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction) - State management patterns.

### Secondary (MEDIUM confidence)
- [Gemini API Documentation](https://ai.google.dev/docs) - Model capabilities for JSON.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries are mature and well-integrated.
- Architecture: HIGH - Shadow state and nested field arrays are proven patterns.
- Pitfalls: MEDIUM - AI pruning is non-deterministic and requires prompt tuning.

**Research date:** 2024-05-24
**Valid until:** 2024-06-24
