# Phase 02: PDF Import & Data Extraction - Research

**Researched:** 2026-03-01
**Domain:** PDF Parsing & AI Data Extraction (Next.js App Router)
**Confidence:** HIGH

## Summary

This research identifies the most efficient and robust pipeline for converting raw resumes (PDF) into structured JSON data. The primary discovery is that **Gemini 1.5 (Flash/Pro) supports PDF files natively** as input. This significantly simplifies the architecture by allowing us to send the PDF file directly to the AI, bypassing traditional text-extraction libraries that often struggle with multi-column layouts and non-standard sections.

**Primary recommendation:** Use **Vercel AI SDK (`generateObject`)** with **Gemini 1.5 Flash** as the primary engine. Pass the PDF `Buffer` directly to the model to leverage its native layout understanding. Use **Zod** for schema validation and inline prompt engineering via `.describe()`.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `ai` | latest | Vercel AI SDK | Unified API for structured object generation |
| `@ai-sdk/google` | latest | Gemini Provider | Direct integration with Google's LLMs |
| `zod` | ^3.x | Schema Validation | Type-safe extraction and auto-prompting |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-pdftotext` | latest | Client-side parsing | Use if you need to show "Raw Text" to the user *before* AI processing without hitting server limits. |
| `pdfjs-dist` | latest | Advanced Parsing | Use if building complex PDF-to-DOM highlighting features (high complexity). |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `pdf-parse` | Gemini Native PDF | Gemini's native vision/layout engine handles multi-columns and tables far better than `pdf-parse` text streams. |
| `pdf-parse` | `react-pdftotext` | `react-pdftotext` runs on client, avoiding Vercel's 4.5MB Server Action payload limit for large files. |

**Installation:**
```bash
npm install ai @ai-sdk/google zod react-pdftotext
```

## Architecture Patterns

### Recommended Data Pipeline
1. **Upload:** User selects PDF in a Client Component.
2. **Transfer:** File sent to a Server Action as a `FormData` object.
3. **Extraction:** Server Action calls `generateObject` passing the PDF buffer directly to Gemini 1.5.
4. **Validation:** Zod ensures the output matches our `ResumeSchema`.
5. **Persistence:** Extracted JSON returned to client and stored in `localStorage` (per Phase 1 setup).

### Pattern 1: Native PDF Input (Direct to AI)
**What:** Sending the binary PDF data to the model instead of pre-parsed text.
**When to use:** Always for Gemini 1.5, as it preserves layout context (columns, headers).
**Example:**
```typescript
// Source: https://sdk.vercel.ai/providers/ai-sdk-providers/google-generative-ai
const { object } = await generateObject({
  model: google('gemini-1.5-flash'),
  schema: resumeSchema,
  messages: [
    {
      role: 'user',
      content: [
        { type: 'text', text: 'Extract structured data from this resume.' },
        { type: 'file', data: pdfBuffer, mimeType: 'application/pdf' },
      ],
    },
  ],
});
```

### Anti-Patterns to Avoid
- **Manual Text Cleaning:** Don't try to regex-clean PDF text before sending to AI; you lose structural cues.
- **Client-Side AI Keys:** Never call Gemini directly from the browser; always use a Server Action or API Route.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Column Detection | X/Y coordinate sorting | Gemini Native PDF | PDF text streams are often jumbled; Gemini's vision-based layout understanding is superior. |
| JSON Parsing | `JSON.parse(completion)` | `generateObject` | Handles retries, formatting errors, and schema validation automatically. |

## Common Pitfalls

### Pitfall 1: Vercel Payload Limits
**What goes wrong:** Uploading a large PDF (>4.5MB) to a Server Action fails.
**How to avoid:** Resumes are rarely >2MB, but if needed, use a Client-side parser (`react-pdftotext`) to send only text, OR upload to S3/Vercel Blob first and send the URL to the AI.

### Pitfall 2: Hallucination of Dates
**What goes wrong:** AI guesses "Present" as a specific date or formats "Jan 20" inconsistently.
**How to avoid:** Use Zod `.describe()` to instruct: `"Use 'Present' for current jobs or null if unknown."`

## Code Examples

### The "Prompt-Engineering" Zod Schema
```typescript
import { z } from 'zod';

export const resumeSchema = z.object({
  personalInfo: z.object({
    fullName: z.string().describe("The candidate's full legal name"),
    email: z.string().email(),
    phone: z.string().nullable().describe("Format: +1-XXX-XXX-XXXX"),
  }),
  experience: z.array(z.object({
    company: z.string(),
    role: z.string(),
    period: z.string().describe("e.g., 'Jan 2020 - Present'"),
    achievements: z.array(z.string()).describe("Bullet points of impact"),
  })),
  // ... other sections
});
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| PDF-01 | PDF text extraction | integration | `npm test tests/pdf-extraction.test.ts` |
| AI-01 | Schema-valid JSON output | integration | `npm test tests/ai-mapping.test.ts` |

## Sources

### Primary (HIGH confidence)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs) - `generateObject` and Google Provider details.
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs/multimodal) - Native PDF support details.

### Secondary (MEDIUM confidence)
- [Brave/Google Search] - Community feedback on `react-pdftotext` vs `pdf-parse`.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH (Gemini native PDF is the state-of-the-art)
- Pitfalls: MEDIUM

**Research date:** 2026-03-01
**Valid until:** 2026-04-01 (Fast-moving AI SDK space)
