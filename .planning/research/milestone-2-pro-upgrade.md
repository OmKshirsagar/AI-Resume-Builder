# Research: Milestone 2 - Pro Upgrade

**Domain:** Resume Builder SaaS
**Researched:** February 2025
**Overall confidence:** HIGH

## 1. User Authentication & Cloud Persistence (Clerk + Turso)

For a "Pro" upgrade, data ownership and privacy are key differentiators. 

### Recommended Pattern: Multi-Tenant LibSQL (Turso)
Turso's architecture allows for two main approaches to user data:

1.  **Shared Database (Logical Isolation):**
    *   Single Turso database with `user_id` columns.
    *   Easy to manage migrations.
    *   Requires strict application-level filtering or Drizzle RLS.
2.  **Database-per-User (Physical Isolation):**
    *   Use Turso's **Multi-DB Schemas**. A "Parent" schema defines the structure, and each user gets a "Child" database.
    *   **Pros:** True data ownership. Users can download their `.sqlite` file. Deleting a user = dropping their DB (GDPR compliance).
    *   **Cons:** Higher complexity in provisioning.

**Recommendation:** Use a **Shared Database** with a robust RLS-like pattern in Drizzle for the Pro Upgrade, but architect the schema to be "portable" to a per-user model later if scaling for high-privacy enterprise clients.

### Integration Steps
*   **Identity:** Clerk handles authentication. Store `clerk_id` as the primary key for the `users` table in Turso.
*   **Webhooks:** Use Clerk Webhooks (`user.created`) to provision initial user records or dedicated databases in Turso.
*   **Data Sync:** Store resume JSON or structured relational data in Turso. Use Drizzle ORM for type-safety.

---

## 2. Multiple Resume Versions: Master vs. Tailored

Managing "Master" (the library of all experiences) vs. "Tailored" (job-specific versions) requires a relational approach.

### Database Architecture (Relational)
*   **`resumes` table:** Metadata for each version (title, `is_master: boolean`, `parent_id`).
*   **`experiences` / `education` / `skills` tables:** The "Source of Truth" records.
*   **`resume_content` (Junction Table):**
    *   `resume_id` (FK)
    *   `content_type` (Enum: experience, skill, etc.)
    *   `content_id` (UUID)
    *   `display_order` (Int)
    *   `content_override` (Text - for slightly reworded bullets for specific jobs)

### UI/UX Patterns
*   **The Library View:** A "Master Resume" dashboard where users input everything.
*   **The Tailoring Flow:** User selects "Tailor for Job", enters Job Description (JD). The system clones the Master (or creates references) and allows the user to "toggle" which bullet points appear.

---

## 3. AI Cover Letter Generator (Mastra Workflows)

Generating a cover letter shouldn't be a single prompt. It requires a multi-step workflow.

### Mastra Workflow Pattern: "The Synthesis"
1.  **Step 1 (Extraction):** Agent parses the JD to identify "Core Requirements" and "Company Values".
2.  **Step 2 (Matching):** Agent compares requirements against the user's Master Resume to find the 3 best "Hooks" (relevant achievements).
3.  **Step 3 (Drafting):** Agent synthesizes the hooks into a professional letter with a specific "Voice" (Creative, Executive, etc.).
4.  **Step 4 (Polish):** A separate agent checks for tone consistency and grammar.

**Separate Workflow?** Yes. The Cover Letter should be a separate Mastra workflow from the Resume Tailor workflow, but they should share the same "Extraction" agents.

---

## 4. ATS Scoring System

ATS scoring is about **keyword alignment** and **formatting readability**.

### Scoring Components
*   **Keyword Match (40%):** Frequency of hard skills (tools, languages) found in the JD.
*   **Semantic Similarity (30%):** Contextual match (e.g., "Python Developer" matches "Backend Engineer").
*   **Hierarchy Weighting (20%):** Keywords in Job Titles and Summaries count more than in bullet points.
*   **Formatting Check (10%):** Detection of tables, non-standard headers, or complex graphics that might break parsers.

### Implementation
*   **Tech:** Use `natural` (Node.js) for TF-IDF scoring or an LLM step in Mastra to calculate a "Contextual Score".
*   **Score Boost Suggestions:** "We noticed 'Kubernetes' is mentioned 3 times in the JD but missing from your resume. Consider adding it to your Skills section."

---

## 5. Expanded Template Gallery (@react-pdf/renderer)

Modular templates allow users to switch styles without losing data.

### 3-4 Professional Layout Patterns
1.  **The Executive (Classic):** 2-column (30/70 split). Sidebar for contact/skills. Dense, high-information density.
2.  **The Minimalist (Modern):** Single column. Generous whitespace. Centered header. Focus on typography.
3.  **The Creative (Asymmetric):** Bold accent colors. Left-aligned headers. Modern sans-serif fonts (e.g., Inter).
4.  **The Academic (Traditional):** Single column. Times New Roman-style serif fonts. Focus on publications and education.

### Modular Implementation (Atomic Design)
*   **Atoms:** `Text`, `Heading`, `Divider`, `SkillBadge`.
*   **Molecules:** `ExperienceItem` (Title, Dates, Bullets), `ContactSection`.
*   **Organisms:** `Sidebar`, `MainContentBody`.
*   **Templates:** Wrapper components that define the grid/flex layout (e.g., `TwoColumnLayout`).

---

## Roadmap Implications

1.  **Phase 1: Foundation Upgrade.** Implement Turso + Clerk + Drizzle. Migration of existing data.
2.  **Phase 2: Master Resume & Versioning.** Update UI to support multiple resumes and the "Library" concept.
3.  **Phase 3: ATS & AI Tailoring.** Integrate Mastra workflows for scoring and tailoring.
4.  **Phase 4: Cover Letter & PDF Gallery.** Add the generator and the modular layout system.

## Sources
- [Turso Multi-DB Documentation](https://turso.tech/docs)
- [Clerk Webhook Guides](https://clerk.com/docs/integrations/webhooks)
- [Mastra AI Workflow Examples](https://mastra.ai/docs)
- [ATS Benchmark Research (Jobscan/Teal)](https://www.jobscan.co/)
