# Phase 10: User Dashboard & LinkedIn Import - Research

**Researched:** 2026-03-23
**Domain:** User Dashboard, Resume Management, LinkedIn Data Ingestion
**Confidence:** HIGH

## Summary
Phase 10 focuses on the user-facing management of resumes and an onboarding path via LinkedIn PDF export. The existing database schema already supports master-version relationships through `parentId` and `isMaster` flags. The research confirms that LinkedIn's "Save to PDF" feature is the most reliable way to ingest profile data without complex scraping or API keys.

**Primary recommendation:** Use a "Master Resume" vs. "Job Variant" model where variants are lightweight copies linked to a master, and provide a 3-step guided UI for LinkedIn PDF ingestion.

## Standard Stack
- **UI Components:** Shadcn-like components using Tailwind 4 (Table, Card, Dialog, DropdownMenu, Tabs)
- **Database:** Drizzle ORM (already integrated)
- **Icons:** Lucide React (for list/grid toggles and action icons)

## Architecture Patterns

### Resume Versioning Strategy
- **Master Resume:** `isMaster: true`. Created via LinkedIn import, PDF upload, or scratch.
- **Job Variant:** `isMaster: false`, `parentId: masterId`. Created during the "Tailor" workflow.
- **Metadata Storage:** 
  - `lastUpdated`: Use `updatedAt` from DB.
  - `fileHash`: Already in schema to detect duplicate source uploads.
  - `tailoringCount`: Aggregate count of resumes where `parentId` matches the current ID.

### LinkedIn Guidance Flow
- **Step 1: Instructions.** "Go to your LinkedIn Profile -> Click 'More' -> 'Save to PDF'".
- **Step 2: Upload.** Standard file dropzone targeting the `extractResumeFromPDF` action.
- **Step 3: Validation.** Ensure the parser identifies the specific LinkedIn PDF format (handled by Gemini in existing `extract` logic).

## CRUD Actions

| Action | Logic |
|---------|-------|
| `listResumes` | Query `resumes` where `userId = current` and `parentId IS NULL` (to show masters first) or flat list with grouping. |
| `deleteResume` | Simple delete by ID. Schema `onDelete: "cascade"` handles all related experiences, skills, and bullets. |
| `renameResume` | Update `title` field in the `resumes` table. |

## Common Pitfalls
- **Loss of Data on Variant Delete:** Ensure users understand that deleting a Master resume will (via cascade) delete all tailored variants.
- **Mobile LinkedIn Export:** LinkedIn's "Save to PDF" is primarily a desktop feature. The UI should warn mobile users or provide a desktop-browser workaround instruction.

## Code Examples
```typescript
// Example listResumes with tailoring count
const result = await db.select({
  id: resumes.id,
  title: resumes.title,
  updatedAt: resumes.updatedAt,
  isMaster: resumes.isMaster,
  tailoringCount: sql<number>`(SELECT count(*) FROM resumes r2 WHERE r2.parent_id = ${resumes.id})`
}).from(resumes).where(eq(resumes.userId, userId));
```

## Sources
- Drizzle ORM Documentation (Relational Queries)
- LinkedIn Help (Exporting Profile to PDF)
- Existing `src/db/schema.ts` analysis.
