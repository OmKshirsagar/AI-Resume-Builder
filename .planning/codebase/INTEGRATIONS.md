# Integrations: Gemini Resume Builder

## AI Providers
- **Google AI Studio (Gemini)**: 
    - `gemini-3-flash-preview`: Used for fast, high-volume extraction and audit tasks.
    - `gemma-3-27b-it`: Primary model for the Fabrication workflow due to superior reasoning and semantic merging capabilities.
- **Vercel AI SDK**: Core library for streaming completions and handling structured object generation.

## Agentic Infrastructure
- **Mastra**: 
    - Used for multi-step agentic workflows.
    - Configured with `LibSQLStore` using `:memory:` for ephemeral session management.
    - Implements the 4-step `fabricatorWorkflow`.

## Frontend Core
- **Next.js 15 (App Router)**: Framework for server-side rendering and API routes.
- **Tailwind CSS 4**: Next-generation utility-first CSS framework for all UI styling.
- **Zustand 5**: Global state management with browser-based persistence.
- **React Hook Form**: Handles complex, multi-section resume editing with Zod validation.

## Document Services
- **@react-pdf/renderer**: Client-side PDF generation engine.
- **react-pdf-tailwind**: Bridging library to maintain stylistic parity between web and PDF.
- **file-saver**: Reliable cross-browser blob downloading.

## Environment & Tooling
- **T3 Env**: Type-safe environment variable validation.
- **Biome**: Unified tool for ultra-fast linting and formatting.
- **Vitest**: Unit testing framework.
