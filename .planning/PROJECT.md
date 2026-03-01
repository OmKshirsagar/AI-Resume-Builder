# Project: Gemini-Powered Resume Builder

## Overview
A web application that leverages Gemini models to help users build, enhance, and customize their resumes. It allows users to upload existing PDF resumes, add or refine sections using AI, and tailor their resumes for specific job roles and titles.

## Core Features
- **Split-Pane UI:** Left-hand side for user input and details; right-hand side for real-time document visualization.
- **Recruiter-Centric AI:** Gemini acts as a "Senior Technical Recruiter" to provide feedback on "The 10-Second Scan" and "ATS Compatibility."
- **Strictly One-Page & Single-Column:** Enforce layouts optimized for 2026 AI-driven talent intelligence systems.
- **X-Y-Z Achievement Builder:** Guided input for quantifying impact (Accomplished X, measured by Y, by doing Z).
- **PDF Parsing & Semantic Extraction:** Accurate data extraction using LLM-based parsing.
- **Multi-Template Design:** ATS-optimized, single-column templates.

## Tech Stack
- **Framework:** Next.js 15 (App Router) with TypeScript & Turbopack.
- **Styling:** Tailwind CSS 4.
- **State Management:** Zustand for global resume state.
- **Forms:** React Hook Form + Zod for schema-first validation.
- **AI Integration:** Vercel AI SDK with Google Gemini API.
- **Tooling:** Biome for linting and formatting.
- **Environment:** @t3-oss/env-nextjs for type-safe environment variables.

