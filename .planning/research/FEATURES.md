# Feature Landscape: Milestone 2 - Pro Upgrade

**Domain:** Resume Builder SaaS
**Researched:** February 2025

## Table Stakes (Expected Features)

Features users expect in a professional resume builder.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **User Accounts** | Saving progress across devices. | Low | Use Clerk for rapid implementation. |
| **Multi-Resume Storage** | Applying for different roles. | Medium | Requires relational schema. |
| **ATS-Friendly PDF** | Higher chance of job success. | Medium | Use standard fonts and clean layouts. |
| **Cloud Auto-Save** | Preventing data loss. | Low | Use Next.js Server Actions with Turso. |

## Differentiators (Value Props)

Features that set this product apart from simple templates.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Master vs. Tailored** | Maintain one library, generate many versions. | High | Junction table/override system. |
| **AI Cover Letter** | Generates letters based on the specific resume version. | Medium | Mastra workflow integration. |
| **Live ATS Scoring** | Real-time feedback on keyword matching. | Medium | NLP-based comparison logic. |
| **"Score Boost" AI** | Contextual suggestions to improve the resume. | Medium | AI-guided coaching. |

## Anti-Features (Avoid)

Features that add bloat without value.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Social Logins ONLY** | Some users prefer standard email/password for professional tools. | Provide both (Clerk makes this easy). |
| **Over-designed Layouts** | Complex graphics break ATS parsers. | Use modular, "clean-pro" layouts. |
| **Built-in Job Board** | Huge scope creep; doesn't add core value. | Focus on being a better "Generator". |

## Feature Dependencies

```
User Accounts → Cloud Persistence
Cloud Persistence → Multi-Resume Versioning
Multi-Resume Versioning → AI Tailoring (Tailoring needs a source version)
AI Tailoring → Cover Letter Generator (Matching needs tailored resume data)
```

## MVP Recommendation (Milestone 2)

Prioritize:
1.  **Cloud Persistence & Auth:** Essential for "Pro" identity.
2.  **Master/Tailored Logic:** Core "Pro" productivity feature.
3.  **ATS Scoring:** Tangible value for the user's job search.

Defer: **Custom Domain Hosting** (Keep it simple with PDF downloads first).

## Sources
- [Jobscan Product Analysis](https://www.jobscan.co/)
- [FlowCV Feature Set](https://flowcv.com/)
- [Reactive Resume Open Source](https://github.com/AmruthPillai/Reactive-Resume)
