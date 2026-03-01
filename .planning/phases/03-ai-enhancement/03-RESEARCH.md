# Phase 03: AI Enhancement & Tailoring - Research

**Researched:** 2026-03-01
**Domain:** AI-driven resume optimization and job tailoring
**Confidence:** HIGH

## Summary

This research identifies the most effective implementation patterns for enhancing resumes using Gemini 3 Flash and the Vercel AI SDK. It focuses on the X-Y-Z formula for impact and a multi-step flow for job tailoring.

## Phase Requirements
| ID | Description | Research Support |
|----|-------------|-----------------|
| AI-01 | Refine Section (X-Y-Z formula) | Few-shot prompting with metric placeholders. |
| AI-02 | Job Tailor flow | Multi-step agentic architecture (JD Extraction -> Gap Analysis -> Rewrite). |
| AI-03 | Streaming UI | React 19 `createStreamableValue` + `readStreamableValue`. |
| AI-04 | Schema Consistency | Unified Zod schema with `.describe()` annotations. |

## Model Selection: Gemini 3 Flash
- Optimized for high-frequency workflows and following complex instructions.
- State-of-the-art agentic performance.
- ID: `gemini-3-flash`

## Architecture Patterns

### Refine Section (X-Y-Z Formula)
- **Goal:** "Accomplished [X] as measured by [Y], by doing [Z]".
- **Prompt:** Provide examples of weak vs strong bullets.
- **Metric Handling:** Instruct Gemini to use `[METRIC]` if quantitative data is missing from the original source to prevent hallucinations.

### Job Tailor Flow
1. **JD Keyword Extraction:** Parse the raw Job Description into core competencies.
2. **Resume Alignment:** Identify matching experience and potential gaps.
3. **Strategic Rewrite:** Update Summary and high-impact Experience bullets to align with the JD while maintaining factual integrity.

### Streaming UI
- Use `streamText` (or `streamObject` if appropriate for the schema) with the `output` setting.
- Pipe server-side stream to client via `createStreamableValue`.

## Potential Pitfalls
- **Hallucination:** Ensure strict "Fact-Check" pass in the prompt.
- **Context Length:** Large resumes + long JDs can hit limits (though less likely with Gemini 3 Flash).
- **Latency:** Complex tailoring flows should provide immediate streaming feedback.
