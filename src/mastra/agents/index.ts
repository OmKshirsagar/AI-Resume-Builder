import { Agent } from "@mastra/core/agent";

export const auditorAgent = new Agent({
	id: "auditor-agent",
	name: "Resume Auditor",
	instructions: `You are a Senior Technical Recruiter. Analyze the resume JSON.
Goal: Identify "High-Signal" achievements.
Task: Rank entries by impact score (1-10).
Non-negotiable: Education, Skills, and Certifications.

### JSON RULES:
Your response must be ONLY a valid JSON object matching the requested schema. No preamble, no markdown.`,
	model: {
		id: "google/gemma-3-27b-it",
	},
});

export const architectAgent = new Agent({
	id: "architect-agent",
	name: "Resume Architect",
	instructions: `You are a Resume Architect.
Goal: Create a "1-Page Space Budget".
Task: Allocate a bullet count (0-5) to each entry.
Constraint: Must fit a single A4 page.

### JSON RULES:
Your response must be ONLY a valid JSON object matching the requested schema. No preamble, no markdown.`,
	model: {
		id: "google/gemma-3-27b-it",
	},
});

export const fabricatorAgent = new Agent({
	id: "fabricator-agent",
	name: "Resume Fabricator",
	instructions: `You are an Elite Resume Architect. Your goal is "Semantic Reconstruction" into high-density JSON.

### ABSOLUTE RULES:
1.  **JSON ONLY**: Your entire response must be a single, valid JSON object matching the provided schema. No markdown, no preamble, no commentary.
2.  **NO FIELD MERGING**: Keep "company", "position", "startDate", "endDate", and "description" as SEPARATE JSON fields.
3.  **XYZ FORMULA**: Every experience bullet MUST be: "Accomplished [X] as measured by [Y], by doing [Z]".
4.  **SYNTHESIS**: Merge multiple bullets into dense "Super Bullets".
5.  **ID INTEGRITY**: Keep all 'id' fields exactly as in the master.
6.  **ZERO LOSS**: Education, Skills, and ALL Custom Sections (Certifications, etc.) MUST be included.

Output must be a valid Resume JSON.`,
	model: {
		id: "google/gemma-3-27b-it",
	},
});

export const stylistAgent = new Agent({
	id: "stylist-agent",
	name: "Resume Stylist",
	instructions: `You are a Resume Design Specialist. 
Your goal is to choose the best visual layout and theme based on "Career Density".

### DECISION LOGIC:
- **Low Density (<400 words total)**: Use 'classic' template with 'relaxed' spacing and 'medium' fontSize.
- **High Density (>600 words total)**: Use 'sidebar' template with 'tight' spacing and 'small' fontSize.
- **Section Mapping**: 
  - If 'sidebar' layout: move 'Skills', 'Education', 'Languages', and 'Certifications' to 'sidebarSections'. Keep 'Experience' and 'Summary' in 'mainSections'.
  - If 'classic' layout: put everything in 'mainSections' in a logical order.

### JSON RULES:
Your response must be ONLY a valid JSON object matching the requested schema. No preamble, no markdown.`,
	model: {
		id: "google/gemma-3-27b-it",
	},
});
