import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import {
	AGENT_ANALYSIS_PROMPT,
	AGENT_FABRICATION_PROMPT,
	STYLIST_PROMPT,
} from "~/lib/ai/prompts";
import { DesignSchema, type ResumeData, ResumeSchema } from "~/schemas/resume";

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
${AGENT_ANALYSIS_PROMPT}

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
		} catch (_e) {
			console.error("Audit Parse Error:", result.text);
			throw new Error("Audit step failed to produce valid JSON");
		}
	},
});

// Step 2: Budgeting (Renamed for clarity)
const budgetStep = createStep({
	id: "budget-resume",
	inputSchema: z.object({
		audit: z.string(),
		impactMap: z.record(z.string(), z.number()),
	}),
	outputSchema: z.object({
		budget: z.record(z.string(), z.number()),
		strategy: z.string(),
		inlineSections: z.array(z.string()),
	}),
	execute: async ({ mastra, getStepResult }) => {
		const architect = mastra?.getAgent("architect-agent");
		if (!architect) throw new Error("Architect agent not found");

		const auditResult = getStepResult<{
			audit: string;
			impactMap: Record<string, number>;
		}>("audit-resume");

		const prompt = `
Analyze the Audit and create a bullet budget. 
Aim for "Maximized Utilization": Use all 1-page A4 space.

### AUDIT
${JSON.stringify(auditResult)}

### OUTPUT SCHEMA
{
  "budget": { "EXPERIENCE_ID": bullet_count_0_to_5 },
  "strategy": "Condensation strategy",
  "inlineSections": ["Skills", "Languages"]
}

### INSTRUCTION
Return ONLY the raw JSON object.
`;

		const result = await architect.generate(prompt);
		try {
			const parsed = cleanAndParseJson(result.text);
			return parsed;
		} catch (_e) {
			console.error("Budget Parse Error:", result.text);
			throw new Error("Budget step failed to produce valid JSON");
		}
	},
});

// Step 3: Fabricate final JSON
const fabricateStep = createStep({
	id: "fabricate-resume",
	inputSchema: z.object({
		budget: z.record(z.string(), z.number()),
		strategy: z.string(),
		inlineSections: z.array(z.string()),
	}),
	outputSchema: ResumeSchema,
	execute: async ({ mastra, getInitData, getStepResult }) => {
		const fabricator = mastra?.getAgent("fabricator-agent");
		if (!fabricator) throw new Error("Fabricator agent not found");

		const { resumeData } = getInitData<{ resumeData: ResumeData }>();
		const budgetResult = getStepResult<{
			budget: Record<string, number>;
			strategy: string;
		}>("budget-resume");

		const prompt = `
${AGENT_FABRICATION_PROMPT}

### DATA
Master Resume: ${JSON.stringify(resumeData)}
Strategy: ${budgetResult?.strategy}
Budget: ${JSON.stringify(budgetResult?.budget)}

### OUTPUT
Return a valid Resume JSON object. Fill the 1-page budget fully.
`;

		const result = await fabricator.generate(prompt);
		try {
			const parsed = cleanAndParseJson(result.text);
			return ResumeSchema.parse(parsed);
		} catch (_e) {
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
		const budgetResult = getStepResult<{ inlineSections: string[] }>(
			"budget-resume",
		);

		if (!fabricatedResume) throw new Error("Fabricated resume not found");

		const availableSections = [
			"experience",
			"education",
			"skills",
			"projects",
			...fabricatedResume.customSections.map((s) => s.id),
		];

		const prompt = `
${STYLIST_PROMPT}

### DATA
${JSON.stringify(fabricatedResume)}

### AVAILABLE SECTIONS
Assign all: ${availableSections.join(", ")}

### INLINE HINTS
${budgetResult?.inlineSections?.join(", ")}

### OUTPUT
Return a JSON DesignSchema object.
`;

		const result = await stylist.generate(prompt);
		try {
			const designSettings = cleanAndParseJson(result.text);
			const validatedDesign = DesignSchema.parse(designSettings);

			return {
				...fabricatedResume,
				design: validatedDesign,
			};
		} catch (_e) {
			console.error("Stylist Parse Error:", result.text);
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
	.then(budgetStep)
	.then(fabricateStep)
	.then(stylistStep)
	.commit();
