# PDF Parsing in Next.js (App Router)

## Libraries to Consider
- **pdf-parse:** Lightweight, works in Node.js. Good for simple text extraction.
- **pdfjs-dist:** More robust, used by Firefox's PDF viewer. Can run on client and server.
- **react-pdf:** Primarily for rendering, but can be used for parsing.

## Recommendation
- For server-side parsing (API Routes), **pdf-parse** is often easiest for pure text extraction.
- If we need more layout awareness, **pdfjs-dist** is better but heavier.

## Edge Compatibility
- Many PDF libraries use Node.js `fs` or other APIs not available in Vercel Edge functions. We should plan to run parsing in a standard Serverless Function (Node.js runtime).
