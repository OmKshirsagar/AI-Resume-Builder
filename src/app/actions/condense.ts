"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "@ai-sdk/rsc";
import { generateObject, streamObject } from "ai";
import { z } from "zod";
import { env } from "~/env";
import {
	AGENT_ANALYSIS_PROMPT,
	AGENT_FABRICATION_PROMPT,
} from "~/lib/ai/prompts";
import { type ResumeData, ResumeSchema } from "~/schemas/resume";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function fabricateResume(resumeData: ResumeData) {
	// biome-ignore lint/suspicious/noExplicitAny: complex AI stream object
	const stream = createStreamableValue<any>();

	(async () => {
		try {
			// Step 1: Audit & Architect (Strategic Analysis)
			const { object: strategy } = await generateObject({
				model: google("gemma-3-27b-it"),
				schema: z.object({
					budget: z.record(z.string(), z.number()),
					inlineSections: z.array(z.string()),
					reasoning: z.string(),
				}),
				prompt: `
${AGENT_ANALYSIS_PROMPT}

### DATA
${JSON.stringify(resumeData)}
`,
			});

			stream.update({ status: "Architecting 1-page strategy..." });

			// Step 2: Fabricate (Semantic Reconstruction)
			const { partialObjectStream } = streamObject({
				model: google("gemma-3-27b-it"),
				schema: ResumeSchema,
				prompt: `
${AGENT_FABRICATION_PROMPT}

### STRATEGY
${strategy.reasoning}

### BULLET BUDGET
${JSON.stringify(strategy.budget)}

### DATA
${JSON.stringify(resumeData)}
`,
			});

			for await (const partial of partialObjectStream) {
				stream.update({ data: partial });
			}

			stream.done();
		} catch (error) {
			console.error("Fabrication error:", error);
			stream.error(
				error instanceof Error ? error.message : "Failed to fabricate resume",
			);
		}
	})().catch((err) => {
		console.error("Unhandled fabrication error:", err);
		stream.error("Internal Server Error");
	});

	return { progress: stream.value };
}
