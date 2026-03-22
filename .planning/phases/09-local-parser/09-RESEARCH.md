# Phase 9: Local PDF Parser Upgrade - Research

**Researched:** 2026-03-22
**Domain:** PDF Text Extraction & Layout Reassembly
**Confidence:** HIGH

## Summary
This phase upgrades the resume extraction pipeline from a "black-box" PDF upload (Gemini's native PDF support) to a coordinate-aware local parser using `pdf2json`. This allows for better handling of multi-column layouts, reduces AI token costs by sending structured text, and enables client-side file deduplication.

**Primary recommendation:** Use `pdf2json` in a Next.js Server Action with a "Group-by-X, Sort-by-Y" algorithm to reconstruct logical reading order.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `pdf2json` | 4.0.2+ | PDF Parsing | Zero-dependency, lightweight, provides X/Y coordinates for all text blocks. |
| Web Crypto API | Native | File Hashing | Standard browser API for secure, fast SHA-256 hashing. |

### Configuration
To use `pdf2json` in Next.js, update `next.config.js`:
```javascript
experimental: {
  serverExternalPackages: ['pdf2json'],
}
```

## Architecture Patterns

### Recommended Layout Reassembly Algorithm
Standard PDF parsers read top-to-bottom across the whole page, which breaks sidebars. The "Layout Reassembly" algorithm fixes this:

1. **Extraction**: Parse PDF to get a flat list of text objects with `{x, y, text}`.
2. **Grouping (Columns)**: Sort blocks by `X`. Iterate and group blocks where `abs(x1 - x2) < tolerance` (Tolerance ≈ 2.0 units).
3. **Sorting (Reading Order)**:
   - Sort column groups by `X` (Left to Right).
   - Within each group, sort blocks by `Y` (Top to Bottom).
4. **Assembly**: Join text from each sorted column with double-newlines to signal section breaks to the AI.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF Parsing | Custom Byte Parser | `pdf2json` | PDF spec is complex (streams, encodings, fonts). |
| Hashing | Custom JS Hash | `crypto.subtle` | Native implementation is significantly faster and more secure. |

## Common Pitfalls

### Pitfall 1: Coordinate Units
**What goes wrong:** Assuming coordinates are in pixels or points.
**Why it happens:** `pdf2json` uses "Page Units" (1/16th of an inch).
**How to avoid:** Use a relative tolerance (2.0) rather than fixed pixel values.

### Pitfall 2: URI Encoding
**What goes wrong:** Extracted text looks like "Hello%20World".
**Why it happens:** Older versions of `pdf2json` URI-encoded text.
**How to avoid:** Use `decodeURIComponent()` if using version < 4.0.0; latest versions (4.x) typically return raw strings.

## Sources
- `pdf2json` Official Docs (GitHub)
- MDN Web Crypto API (SubtleCrypto.digest)
- Next.js Documentation (serverExternalPackages)
