# AI Integration: Vercel AI SDK + Google Gemini

## Setup
- **Provider:** `@ai-sdk/google`
- **Models:** `gemini-1.5-flash` (fast, cheap, good for parsing/extraction) or `gemini-1.5-pro` (more reasoning, better for creative writing/enhancement).

## Key Patterns
- **Object Generation:** Use `generateObject` with Zod schemas to extract structured data from parsed resume text.
- **Streaming UI:** Use `streamText` for real-time resume enhancement suggestions.
- **Server Actions:** Highly recommended with Next.js App Router for initiating AI requests from the UI.
