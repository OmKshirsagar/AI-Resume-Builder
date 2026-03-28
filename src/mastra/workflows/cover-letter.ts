import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";
import { type ResumeData, ResumeSchema } from "~/schemas/resume";

const cleanAndParseJson = (text: string) => {
	const clean = text
		.replace(/^```json\n?/, "")
		.replace(/\n?```$/, "")
		.trim();
	return JSON.parse(clean);
};

// Step 1: Analyze JD
const analyzeJDStep = createStep({
	id: "analyze-jd",
	inputSchema: z.object({
		jobDescription: z.string(),
	}),
	outputSchema: z.object({
		requirements: z.array(z.string()),
		technicalSkills: z.array(z.string()),
		culture: z.string(),
		tone: z.string(),
	}),
	execute: async ({ mastra, getInitData }) => {
		const analyzer = mastra?.getAgent("jd-analyzer-agent");
		if (!analyzer) throw new Error("JD Analyzer agent not found");

		const { jobDescription } = getInitData<{ jobDescription: string }>();

		const prompt = `
Analyze the following Job Description:

### JOB DESCRIPTION
${jobDescription}

### INSTRUCTION
Extract requirements, technical skills, culture, and suggested tone.
Return ONLY the raw JSON object.
`;

		const result = await analyzer.generate(prompt);
		try {
			return cleanAndParseJson(result.text);
		} catch (_e) {
			console.error("JD Analysis Parse Error:", result.text);
			throw new Error("JD Analysis step failed to produce valid JSON");
		}
	},
});

// Step 2: Match Experience
const matchExperienceStep = createStep({
	id: "match-experience",
	inputSchema: z.object({
		requirements: z.array(z.string()),
		technicalSkills: z.array(z.string()),
		culture: z.string(),
		tone: z.string(),
	}),
	outputSchema: z.object({
		matches: z.array(
			z.object({
				requirement: z.string(),
				achievement: z.string(),
				reason: z.string(),
			}),
		),
		overallStrategy: z.string(),
	}),
	execute: async ({ mastra, getInitData, getStepResult }) => {
		const matcher = mastra?.getAgent("experience-matcher-agent");
		if (!matcher) throw new Error("Experience Matcher agent not found");

		const { resumeData } = getInitData<{ resumeData: ResumeData }>();
		const jdAnalysis = getStepResult<{ requirements: string[] }>("analyze-jd");

		const prompt = `
Match the candidate's experience to the job requirements.

### RESUME DATA
${JSON.stringify(resumeData)}

### JOB REQUIREMENTS
${JSON.stringify(jdAnalysis?.requirements)}

### INSTRUCTION
Identify the best matches and define an overall strategy.
Return ONLY the raw JSON object.
`;

		const result = await matcher.generate(prompt);
		try {
			return cleanAndParseJson(result.text);
		} catch (_e) {
			console.error("Experience Matching Parse Error:", result.text);
			throw new Error("Experience Matching step failed to produce valid JSON");
		}
	},
});

// Step 3: Write Draft
const writeDraftStep = createStep({
	id: "write-draft",
	inputSchema: z.object({
		matches: z.array(
			z.object({
				requirement: z.string(),
				achievement: z.string(),
				reason: z.string(),
			}),
		),
		overallStrategy: z.string(),
	}),
	outputSchema: z.object({
		content: z.string(),
	}),
	execute: async ({ mastra, getInitData, getStepResult }) => {
		const writer = mastra?.getAgent("cover-letter-writer-agent");
		if (!writer) throw new Error("Cover Letter Writer agent not found");

		const { tone, length, companyName } = getInitData<{
			tone?: string;
			length?: string;
			companyName?: string;
		}>();
		const jdAnalysis = getStepResult<{ culture: string; tone: string }>(
			"analyze-jd",
		);
		const matches = getStepResult<{
			matches: Array<{ requirement: string; achievement: string }>;
			overallStrategy: string;
		}>("match-experience");

		const prompt = `
Write a cover letter based on the following analysis and matches.

### TARGET COMPANY
${companyName || "the company"}

### JD ANALYSIS
Culture: ${jdAnalysis?.culture}
Suggested Tone: ${jdAnalysis?.tone}

### MATCHED EXPERIENCE
Strategy: ${matches?.overallStrategy}
Matches: ${JSON.stringify(matches?.matches)}

### USER PREFERENCES
Requested Tone: ${tone || "Professional"}
Target Length: ${length || "medium"}

### INSTRUCTION
Write a compelling cover letter in Markdown. 
Focus on the matched experience and stay grounded in the provided data.
Variety: Be creative with phrasing and storytelling while staying grounded in the proof points.
`;

		const result = await writer.generate(prompt);
		return {
			content: result.text,
		};
	},
});

export const coverLetterWorkflow = createWorkflow({
	id: "cover-letter-workflow",
	inputSchema: z.object({
		resumeData: ResumeSchema,
		jobDescription: z.string(),
		companyName: z.string().optional(),
		tone: z.string().optional(),
		length: z.enum(["short", "medium", "long"]).optional(),
	}),
	outputSchema: z.object({
		content: z.string(),
	}),
})
	.then(analyzeJDStep)
	.then(matchExperienceStep)
	.then(writeDraftStep)
	.commit();
