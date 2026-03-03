# Phase 5: Visual Orchestration & Dynamic Templates - Research

**Researched:** 2026-03-03
**Domain:** Document Design & AI Stylist
**Confidence:** HIGH

## Summary
Phase 5 transitions the application from content fabrication (Phase 4) to visual orchestration. The core innovation is the "Stylist Agent" which analyzes the result of the Fabricator workflow and selects an optimal layout (Single Column, Two-Column, or Sidebar) based on "Career Density" (word count vs. experience duration). Technically, this is enabled by Tailwind 4's CSS-first grid system and a synchronized design schema.

## Architecture Patterns

### Recommended Design Schema
Extend the `ResumeSchema` in `src/schemas/resume.ts`:
```typescript
export const DesignSchema = z.object({
  template: z.enum(['classic', 'modern', 'sidebar']).default('classic'),
  theme: z.object({
    primaryColor: z.string().default('#000000'),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    lineHeight: z.enum(['tight', 'relaxed']).default('tight'),
  }),
  layout: z.object({
    mainSections: z.array(z.string()).describe("IDs of sections in the main column"),
    sidebarSections: z.array(z.string()).describe("IDs of sections in the sidebar"),
  }),
});
```

### The Stylist Agent
**Decision Logic:**
- **Low Density (<400 words):** Use 'Classic' (Single Column) with 'Relaxed' spacing.
- **High Density (>600 words):** Use 'Sidebar' to maximize vertical space.
- **Section Mapping:** Move "Skills", "Languages", "Certifications", and "Education" to the sidebar if using a two-column layout.

### Dynamic React Templates
Use a flexible grid system in the `PreviewPane` that responds to the `design` object.
- **Classic:** Single column, full width.
- **Sidebar:** `grid-cols-[2fr_1fr]` or `grid-cols-[1fr_2fr]`.

### Smart Inline Formatting
Automatically detect when to render a list (like Skills or Awards) as a horizontal line vs. vertical bullets to save space.
- Heuristic: If more than 4 items and average item length < 20 chars, use inline.

## Common Pitfalls
- **ATS Breakage:** Two-column layouts can confuse old parsers. Ensure the DOM order remains logical (Profile -> Experience -> Education) regardless of visual position.
- **Overflow:** Even with a Stylist, content might still overflow. The Stylist should attempt a "Compacted" theme if first-pass analysis suggests overflow.
