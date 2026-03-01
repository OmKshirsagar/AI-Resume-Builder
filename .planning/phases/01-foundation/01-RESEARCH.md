# Phase 01: Foundation & Scaffolding - Research

**Researched:** 2025-05-10
**Domain:** Next.js 15, Tailwind CSS 4, State Management, Split-Pane Layout, Document Scaling
**Confidence:** HIGH

## Summary

This phase focuses on establishing a modern, high-performance foundation for the Resume Builder. We are utilizing the latest stable versions of Next.js (15), Tailwind CSS (4), and Zustand (5). The core architectural challenge is implementing a resizable split-pane layout that persists user preferences without SSR flicker and a pixel-perfect A4 resume preview that scales fluidly to fit its container.

**Primary recommendation:** Use Next.js 15 with Turbopack for development, Tailwind 4's CSS-first configuration, and Zustand 5 with manual hydration to ensure SSR compatibility. For the A4 preview, use CSS transforms and container queries for robust scaling.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Framework | App Router stability, React 19 support, and Turbopack performance. |
| Tailwind CSS | 4.0 | Styling | CSS-first approach, zero-config content detection, and massive performance gains. |
| Zustand | 5.0 | State Management | Lightweight, high performance, and excellent React 19 integration. |
| Biome | 1.9+ | Lint/Format | Fast, single-tool replacement for ESLint/Prettier with built-in Tailwind sorting. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| react-resizable-panels | 2.x | Split Layout | Industry standard for accessible, resizable UI panes. |
| @react-pdf/renderer | 3.x | PDF Generation | Essential for generating true text-layer PDFs that are ATS-friendly. |
| lucide-react | latest | Icons | Tree-shakeable, consistent icon set. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Biome | ESLint + Prettier | Familiarity vs. Speed; Biome is ~20x faster and simplifies config. |
| Zustand | Redux Toolkit | Redux is overkill for browser-only persistence; Zustand is more concise. |
| react-pdf | Puppeteer | Puppeteer is pixel-perfect but requires a server/Lambda; react-pdf is client-side. |

**Installation:**
```bash
npm install zustand react-resizable-panels lucide-react
npm install --save-dev @biomejs/biome tailwindcss @tailwindcss/postcss
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/               # Next.js App Router (Pages & Layouts)
├── components/
│   ├── layout/        # Shell, Split-panes, Navigation
│   ├── editor/        # Resume input forms
│   ├── preview/       # A4 Document preview & scaling
│   └── ui/            # Shadcn/Radix primitives
├── store/             # Zustand stores
├── hooks/             # Custom hooks (e.g., use-store.ts for hydration)
├── styles/            # globals.css (Tailwind 4 config)
└── lib/               # Utilities (A4 scaling, PDF logic)
```

### Pattern 1: SSR-Safe Zustand Persistence
**What:** Delaying store access until client-side mount to avoid hydration mismatches.
**When to use:** Any store using the `persist` middleware.
**Example:**
```typescript
// hooks/use-store.ts
import { useState, useEffect } from 'react';

export const useStore = <T, F>(
  store: (callback: (state: T) => unknown) => unknown,
  callback: (state: T) => F
) => {
  const result = store(callback) as F;
  const [data, setData] = useState<F>();

  useEffect(() => {
    setData(result);
  }, [result]);

  return data;
};
```

### Anti-Patterns to Avoid
- **Media Queries for Preview:** Don't use `@media` for elements inside the resume. Use **Container Queries** so they respond to the scaled container size, not the browser window.
- **Client-only Layout:** Don't render the split-pane only on the client. Use **Cookies** to pass the layout to the server to prevent the "layout jump" on load.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Split Panes | Custom Draggable | react-resizable-panels | Handles edge cases, accessibility (ARIA), and touch support. |
| PDF Layout | html2canvas + jsPDF | @react-pdf/renderer | html2canvas creates images; @react-pdf creates searchable text for ATS. |
| Linting Rules | Custom ESLint | Biome (Recommended) | Pre-configured for React/Next.js and drastically faster. |

## Common Pitfalls

### Pitfall 1: Tailwind 4 Config
**What goes wrong:** Attempting to use `tailwind.config.js`.
**Why it happens:** Legacy habits from v3.
**How to avoid:** Use the CSS-first approach. Define variables in `@theme` block in `globals.css`.
**Warning signs:** Custom colors/spacing not working despite being in a JS config file.

### Pitfall 2: A4 Scaling "Blur"
**What goes wrong:** Text looks blurry when scaled down.
**Why it happens:** Using `zoom` or non-integer scaling without hardware acceleration.
**How to avoid:** Use `transform: scale()` with `transform-origin: top center` and ensure `will-change: transform` is used during active resizing.

## Code Examples

### A4 Scaling Logic
```typescript
// lib/scaling.ts
export const getA4Scale = (containerWidth: number, padding = 40) => {
  const A4_WIDTH_MM = 210;
  const MM_TO_PX = 3.7795275591; // Standard 96 DPI
  const targetWidth = A4_WIDTH_MM * MM_TO_PX;
  
  return Math.min((containerWidth - padding) / targetWidth, 1);
};
```

### Tailwind 4 CSS Configuration
```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-primary: #3b82f6;
  --font-sans: "Inter", ui-sans-serif, system-ui;
  
  /* A4 Constants for use in CSS */
  --a4-width: 210mm;
  --a4-height: 297mm;
}

.resume-page {
  width: var(--a4-width);
  height: var(--a4-height);
  container-type: inline-size;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` | `@theme` in CSS | 2025 (v4.0) | Faster build, CSS-native variables. |
| `next dev` | `next dev --turbo` | 2024 (v15.0) | Up to 90% faster hot-reloading. |
| Media Queries | Container Queries | 2023+ (Modern Browsers) | Component-level responsiveness. |

## Open Questions

1. **Turbopack Production Stability**
   - What we know: Stable for dev, Beta for prod in 15.4+.
   - What's unclear: Edge case performance for very large component trees.
   - Recommendation: Use Webpack for initial production builds if any issues arise, but stick to Turbo for dev.

2. **React 19 Server Actions vs. Browser-only Persistence**
   - What we know: We are using browser-only persistence (Zustand).
   - What's unclear: If we need server-side resume parsing later, how to bridge Zustand state to Server Actions.
   - Recommendation: Keep state structure serializable for easy passing to Server Actions in Phase 2.

## Sources

### Primary (HIGH confidence)
- Next.js 15 Official Release Notes - Turbopack and Async Cookies.
- Tailwind CSS 4.0 Blog - CSS-first configuration patterns.
- Zustand 5.0 Documentation - Persistence and Hydration guide.

### Secondary (MEDIUM confidence)
- `react-resizable-panels` GitHub Examples - Persistence via cookies.
- Web articles on "ATS-friendly PDF generation 2025" - @react-pdf/renderer recommendation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Current 2025 ecosystem standards.
- Architecture: HIGH - Proven patterns for Next.js 15 and Zustand.
- Pitfalls: MEDIUM - Tailwind 4 is relatively new, community patterns still evolving.

**Research date:** 2025-05-10
**Valid until:** 2025-06-10
