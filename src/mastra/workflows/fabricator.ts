import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { ResumeSchema, DesignSchema, type ResumeData } from "~/schemas/resume";

const cleanAndParseJson = (text: string) => {
	const clean = text
		.replace(/^```json\n?/, "")
		.replace(/\n?```$/, "")
		.trim();
	return JSON.parse(clean);
};

// Step 1: Audit for Impact
const auditStep = createStep({
	id: "audit-resume",
	inputSchema: z.object({
		resumeData: ResumeSchema,
	}),
	outputSchema: z.object({
		audit: z.string(),
		impactMap: z.record(z.string(), z.number()),
	}),
	execute: async ({ mastra, getInitData }) => {
		const auditor = mastra?.getAgent("auditor-agent");
		if (!auditor) throw new Error("Auditor agent not found");

		const { resumeData } = getInitData<{ resumeData: ResumeData }>();

		const prompt = `
Analyze the impact of each item in this resume.

### DATA
${JSON.stringify(resumeData)}

### OUTPUT SCHEMA
{
  "audit": "High-level reasoning string",
  "impactMap": { "ITEM_ID": score_number_1_to_10 }
}

### INSTRUCTION
Return ONLY the raw JSON object. No preamble.
`;

		const result = await auditor.generate(prompt);
		try {
			const parsed = cleanAndParseJson(result.text);
			return parsed;
		} catch (e) {
			console.error("Audit Parse Error:", result.text);
			throw new Error("Audit step failed to produce valid JSON");
		}
	},
});

// Step 2: Architect Space Budget
const architectStep = createStep({
	id: "architect-layout",
	inputSchema: z.object({
		audit: z.string(),
		impactMap: z.record(z.string(), z.number()),
	}),
	outputSchema: z.object({
		budget: z.record(z.string(), z.number()),
		strategy: z.string(),
	}),
	execute: async ({ mastra, getStepResult }) => {
		const architect = mastra?.getAgent("architect-agent");
		if (!architect) throw new Error("Architect agent not found");

		const auditResult = getStepResult<{
			audit: string;
			impactMap: Record<string, number>;
		}>("audit-resume");

		if (!auditResult) throw new Error("Audit result not found");

		const prompt = `
Create a space budget (bullet counts) for a 1-page resume based on this audit.

### AUDIT
${JSON.stringify(auditResult)}

### OUTPUT SCHEMA
{
  "budget": { "EXPERIENCE_ID": number_of_bullets_0_to_5 },
  "strategy": "Merging strategy string"
}

### INSTRUCTION
Return ONLY the raw JSON object. No preamble.
`;

		const result = await architect.generate(prompt);
		try {
			const parsed = cleanAndParseJson(result.text);
			return parsed;
		} catch (e) {
			console.error("Architect Parse Error:", result.text);
			throw new Error("Architect step failed to produce valid JSON");
		}
	},
});

// Step 3: Fabricate final JSON
const fabricateStep = createStep({
	id: "fabricate-resume",
	inputSchema: z.object({
		budget: z.record(z.string(), z.number()),
		strategy: z.string(),
	}),
	outputSchema: ResumeSchema,
	execute: async ({ mastra, getInitData, getStepResult }) => {
		const fabricator = mastra?.getAgent("fabricator-agent");
		if (!fabricator) throw new Error("Fabricator agent not found");

		const { resumeData } = getInitData<{ resumeData: ResumeData }>();
		const architectResult = getStepResult<{
			budget: Record<string, number>;
			strategy: string;
		}>("architect-layout");

		if (!architectResult) throw new Error("Architect result not found");

		const prompt = `
Semantically reconstruct this resume into a high-density 1-page version.

### DATA
Master Resume: ${JSON.stringify(resumeData)}
Strategy: ${architectResult.strategy}
Budget: ${JSON.stringify(architectResult.budget)}

### RULES
1. EVERY bullet must be X-Y-Z formula: "Accomplished [X] as measured by [Y], by doing [Z]".
2. Merge multiple bullets into dense "Super Bullets".
3. Keep ALL Education, Skills, and Custom Sections.
4. NO meta-talk in JSON values.
5. NO field merging. Keep keys separate.

### OUTPUT
Return a valid Resume JSON object matching the input structure. NO preamble.
`;

		const result = await fabricator.generate(prompt);
		try {
			const parsed = cleanAndParseJson(result.text);
			return ResumeSchema.parse(parsed);
		} catch (e) {
			console.error("Fabricator Parse Error:", result.text);
			throw new Error("Fabricator step failed to produce valid JSON");
		}
	},
});

// Step 4: Stylist Orchestration
const stylistStep = createStep({
	id: "stylist-orchestration",
	inputSchema: ResumeSchema,
	outputSchema: ResumeSchema,
	execute: async ({ mastra, getStepResult }) => {
		const stylist = mastra?.getAgent("stylist-agent");
		if (!stylist) throw new Error("Stylist agent not found");

		const fabricatedResume = getStepResult<ResumeData>("fabricate-resume");
		if (!fabricatedResume) throw new Error("Fabricated resume not found");

		const prompt = `
Choose the optimal design layout and theme for this resume.

### RESUME DATA
${JSON.stringify(fabricatedResume)}

### OUTPUT SCHEMA (DesignSchema)
{
  "template": "classic" | "modern" | "sidebar",
  "theme": {
    "primaryColor": "hex_string",
    "fontSize": "small" | "medium" | "large",
    "lineHeight": "tight" | "relaxed"
  },
  "layout": {
    "mainSections": ["experience", "education", "..."],
    "sidebarSections": ["skills", "..."]
  }
}

### INSTRUCTION
Return ONLY the raw JSON object for the design settings.
`;

		const result = await stylist.generate(prompt);
		try {
			const designSettings = cleanAndParseJson(result.text);
			const validatedDesign = DesignSchema.parse(designSettings);
			
			return {
				...fabricatedResume,
				design: validatedDesign
			};
		} catch (e) {
			console.error("Stylist Parse Error:", result.text);
			// Fallback to default design if stylist fails
			return fabricatedResume;
		}
	},
});

export const fabricatorWorkflow = createWorkflow({
	id: "fabricator-workflow",
	inputSchema: z.object({
		resumeData: ResumeSchema,
	}),
	outputSchema: ResumeSchema,
})
	.then(auditStep)
	.then(architectStep)
	.then(fabricateStep)
	.then(stylistStep)
	.commit();
