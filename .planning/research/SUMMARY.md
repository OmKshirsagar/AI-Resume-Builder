# Research Summary: Resume Builder Pro Upgrade

**Domain:** Resume Builder SaaS
**Researched:** February 2025
**Overall confidence:** HIGH

## Executive Summary

Milestone 2 ("Pro Upgrade") focuses on transforming the application from a stateless client-side tool into a cloud-integrated platform. The key pillars are **User Authentication**, **Version Management**, **AI-Driven Tailoring**, and **Professional PDF Generation**.

Research indicates that a "Master vs. Tailored" relational database model is the industry standard for advanced resume builders. This allows users to maintain a comprehensive career library while generating job-specific documents. Integration with **Turso (LibSQL)** and **Clerk** provides a high-performance, edge-ready persistence layer that can scale from shared databases to physical "database-per-user" isolation for high-privacy tiers.

AI features should move beyond simple completion into structured **Mastra workflows**. This includes a multi-agent "Synthesis" pattern for cover letters and a tiered keyword matching system for **ATS Scoring**.

## Key Findings

**Stack:** Clerk (Auth) + Turso/LibSQL (DB) + Drizzle ORM + Mastra (Workflows).
**Architecture:** Parent-Child resume schema with junction tables for "atomic" content selection.
**Critical pitfall:** Treating resumes as static JSON files instead of relational "Bullet Banks" makes tailoring UX difficult to scale.

## Implications for Roadmap

Based on research, suggested phase structure for Milestone 2:

1.  **Persistence Layer (Cloud Foundation)** - Replace local storage with Clerk + Turso.
2.  **Resume Library (Master/Tailored)** - Implement relational schema to support multiple versions.
3.  **Mastra AI Optimization** - Implement multi-step workflows for scoring and tailoring.
4.  **Template Engine & Export** - Modularize `@react-pdf` and implement 4 distinct layout patterns.

**Phase ordering rationale:**
Cloud persistence is the prerequisite for all Pro features. Versioning must exist before AI can "tailor" them. Template modularity is the final visual layer.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Clerk + Turso is a well-documented and modern edge stack. |
| Features | HIGH | Table stakes (Auth/Cloud) and Differentiators (ATS/Tailoring) are clear. |
| Architecture | MEDIUM | Junction table approach is solid but adds query complexity. |
| Pitfalls | HIGH | Identified common issues with PDF parsing and keyword stuffing. |

## Gaps to Address
- **Offline Sync:** Need to investigate how to handle "Drafts" when a user is offline (likely IndexedDB + Sync).
- **Payment Integration:** Stripe integration for "Pro" billing (to be researched if added to scope).
