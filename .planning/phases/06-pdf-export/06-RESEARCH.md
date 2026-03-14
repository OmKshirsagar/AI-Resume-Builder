# Phase 06: UI Editor & PDF Export - Research

**Researched:** 2025-05-24
**Domain:** UI Forms (React Hook Form + Zod) & PDF Generation (@react-pdf/renderer)
**Confidence:** HIGH

## Summary

This phase focuses on transforming the manual resume editor into a robust, validated system using React Hook Form and Zod, and implementing high-quality PDF exports using `@react-pdf/renderer`. The research identifies that a **Single Large Form** approach with `FormProvider` is superior for maintaining data integrity across sections (Experience, Education, etc.) while `react-pdf-tailwind` and `file-saver` are key for achieving visual parity and reliable downloads.

**Primary recommendation:** Use a single `useForm` instance at the top level of the editor to ensure unified validation, but isolate re-renders using `Controller` and `useWatch`. For PDF generation, use the `pdf().toBlob()` method on-demand to maintain UI performance.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react-hook-form` | ^7.71.2 | Form state management | Uncontrolled inputs, minimal re-renders, deep nested support. |
| `@hookform/resolvers` | ^3.9.0 | Schema validation bridge | Connects RHF to Zod schemas seamlessly. |
| `@react-pdf/renderer` | ^3.4.4 | PDF Generation | Industry standard for React-based PDF creation via primitives. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-pdf-tailwind` | ^2.3.0 | Style synchronization | To use Tailwind classes within `react-pdf` components. |
| `file-saver` | ^2.0.5 | Reliable downloads | Handles blob-to-file saving across different browsers/OS. |
| `lucide-react` | Latest | UI Icons | Standardized icon set for the editor. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-pdf` | `jspdf` + `html2canvas` | Pixel-perfect but produces non-searchable images/bloated files; poor ATS parsability. |
| `react-pdf` | Puppeteer (Server-side) | 1:1 CSS support but requires server-side infrastructure and is slower. |
| Multiple Forms | Zustand direct bind | Harder to implement complex cross-field validation (e.g. startDate < endDate). |

**Installation:**
```bash
npm install @react-pdf/renderer react-pdf-tailwind file-saver
npm install -D @types/file-saver
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── editor/
│   │   ├── forms/
│   │   │   ├── PersonalInfoForm.tsx
│   │   │   ├── ExperienceForm.tsx
│   │   │   └── ...
│   │   └── ResumeEditor.tsx     # Main FormProvider wrapper
│   └── export/
│       ├── PDFDocument.tsx      # Entry point for react-pdf
│       ├── PDFLayouts.tsx       # Classic vs Sidebar logic
│       └── DownloadButton.tsx   # Blob generation logic
```

### Pattern 1: Single Form with Debounced Zustand Sync
**What:** Use a single `useForm` instance for the entire resume. Sync changes to the global Zustand store (which drives the RHS preview) using a debounced watcher.
**When to use:** When you need the preview to stay in sync with the form without triggering high-frequency re-renders on every keystroke.
**Example:**
```typescript
// src/components/editor/ResumeEditor.tsx
const methods = useForm<ResumeData>({
  resolver: zodResolver(ResumeSchema),
  defaultValues: originalData,
  mode: "onChange"
});

// Watch and sync to Zustand
const watchedData = methods.watch();
useEffect(() => {
  const timer = setTimeout(() => {
    setDraft(watchedData);
  }, 400); // 400ms debounce
  return () => clearTimeout(timer);
}, [watchedData, setDraft]);
```

### Pattern 2: Primitive Mapping with `react-pdf-tailwind`
**What:** Create a `PDFRenderer` that maps JSON data to `@react-pdf/renderer` primitives (`View`, `Text`) while using Tailwind classes for styling.
**When to use:** To ensure the PDF output matches the Tailwind-based web preview.
**Example:**
```typescript
import { createTw } from "react-pdf-tailwind";
const tw = createTw({
  theme: {
    extend: {
      colors: { primary: "#3b82f6" }
    }
  }
});

const PDFSection = ({ title, children }) => (
  <View style={tw("mb-4 border-b border-black")}>
    <Text style={tw("text-[10pt] font-bold uppercase")}>{title}</Text>
    {children}
  </View>
);
```

### Anti-Patterns to Avoid
- **Hand-Rolling PDF Tables:** Don't try to build complex tables with `View` and `Text` if a simple Flexbox layout works; `react-pdf` supports `flex-direction: row`.
- **Global `onChange` on every key:** Don't update the global store *synchronously* on every keystroke if the preview is complex (like the A4 scaling engine), as it will cause typing lag. Use debouncing.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Blob Downloading | `window.URL.createObjectURL` | `file-saver` | Handles revoked URLs, iOS Safari issues, and large file limits. |
| Tailored Styling | Custom StyleSheet CSS | `react-pdf-tailwind` | Maintains single source of truth for design tokens (colors, spacing). |
| Nested Arrays | Manual `map` + `index` | `useFieldArray` (RHF) | Handles ID tracking, appending, and moving items without losing focus. |

## Common Pitfalls

### Pitfall 1: Font Registration
**What goes wrong:** Custom fonts (e.g., Inter, Roboto) used in Tailwind won't show up in the PDF.
**Why it happens:** `@react-pdf/renderer` does not have access to system fonts or CSS-loaded fonts.
**How to avoid:** Explicitly register fonts using `Font.register()` with absolute URLs to `.ttf` files in the `/public` folder.

### Pitfall 2: `react-pdf` Primitive Limitations
**What goes wrong:** Errors like "Invalid property 'display: grid' passed to View".
**Why it happens:** `react-pdf` only supports a subset of CSS Flexbox. It does NOT support CSS Grid, Transitions, or complex pseudo-selectors.
**How to avoid:** Stick to `flex`, `margin`, `padding`, `border`, and `font-size`. Use `flex-row` instead of `grid-cols-2`.

### Pitfall 3: PDF Generation Blocking UI
**What goes wrong:** The browser freezes for 1-2 seconds when the user clicks "Download".
**Why it happens:** PDF generation is CPU intensive and runs on the main thread.
**How to avoid:** Use a loading spinner and `pdf().toBlob()`. For very large documents, consider a Web Worker.

## Code Examples

### On-Demand PDF Download
```typescript
// Source: Official @react-pdf/renderer docs + Best Practices
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";

const handleDownload = async (data: ResumeData) => {
  setIsLoading(true);
  try {
    const doc = <MyPDFDocument data={data} />;
    const asBlob = await pdf(doc).toBlob();
    saveAs(asBlob, `${data.personalInfo.fullName}_Resume.pdf`);
  } finally {
    setIsLoading(false);
  }
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `PDFDownloadLink` | `pdf().toBlob()` on click | 2023 | Improved initial page load and UI responsiveness. |
| `StyleSheet.create` | `react-pdf-tailwind` | 2024 | Easier style sync with modern web apps. |

## Open Questions

1. **How to handle page breaks for long experiences?**
   - What we know: `react-pdf` has a `break` prop and `wrap={false}`.
   - What's unclear: How to ensure a bullet point list doesn't split across pages in an ugly way.
   - Recommendation: Use `wrap={false}` on the container `View` of a single Experience item to keep it on one page if it fits.

2. **Image sizes in PDFs?**
   - What we know: High-res images bloat PDF size.
   - Recommendation: Provide a utility to downscale/compress images before they are added to the resume JSON.

## Sources

### Primary (HIGH confidence)
- [Official @react-pdf/renderer Docs](https://react-pdf.org/) - API primitives and font registration.
- [React Hook Form Documentation](https://react-hook-form.com/docs/useformcontext) - FormProvider and performance patterns.
- [react-pdf-tailwind GitHub](https://github.com/aanckar/react-pdf-tailwind) - Implementation details for Tailwind sync.

### Secondary (MEDIUM confidence)
- [File-saver NPM](https://www.npmjs.com/package/file-saver) - Cross-browser blob handling.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Industry standard choices.
- Architecture: HIGH - Proven RHF patterns.
- Pitfalls: MEDIUM - Page breaks in PDFs are notoriously tricky.

**Research date:** 2025-05-24
**Valid until:** 2025-06-24
