# Requirements: Gemini Resume Builder

## Functional Requirements
- **Recruiter Review Mode:** A "Simulate Scan" button that provides feedback from a recruiter's perspective (Impact, Clarity, Title Relevance).
- **ATS Scoring Engine:** Real-time feedback on formatting issues (e.g., "Multi-column detected," "Non-standard header").
- **Guided X-Y-Z Input:** UI prompts that help users quantify their bullet points.
- **Split-Pane Layout:** A responsive 2-column layout (Inputs on LHS, Preview on RHS).
- **One-Page Enforcement:** Logic to ensure content always fits on a single page via content trimming and scaling.
- **Single-Column ATS Templates:** Templates strictly following 2025 readability standards.
- **PDF Extraction:** Accurate semantic parsing of uploaded resumes.

## Technical Requirements
- **Framework:** Next.js 14+ (App Router).
- **Language:** TypeScript (strict mode).
- **Styling:** Tailwind CSS + Radix UI (via Shadcn).
- **Persistence:** Browser-based (LocalStorage or IndexedDB) for no-backend storage.
- **AI:** Vercel AI SDK (with Gemini 1.5 models).
- **Validation:** Zod schemas for resume data and AI prompts.
- **Deployment:** Vercel.

## Success Criteria
- User can go from "Old PDF" to "Tailored New Resume" in under 2 minutes.
- Extracted data is >90% accurate for standard resume layouts.
- Exported PDF is visually professional and ATS-parsable.
