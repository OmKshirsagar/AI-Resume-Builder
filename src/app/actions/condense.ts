"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, streamObject } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { env } from "~/env";
import { 
	AGENT_ANALYSIS_PROMPT, 
	AGENT_FABRICATION_PROMPT 
} from "~/lib/ai/prompts";
import { ResumeSchema, type ResumeData } from "~/schemas/resume";
import { z } from "zod";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function fabricateResume(resumeData: ResumeData) {
	const stream = createStreamableValue<any>();

	(async () => {
		try {
			// Step 1: Combined Audit & Budget (using 2.5 Flash for speed)
			stream.update({ status: "Analyzing career themes & impact..." });
			const { object: strategy } = await generateObject({
				model: google("gemini-2.5-flash"),
				system: AGENT_ANALYSIS_PROMPT,
				messages: [{ role: "user", content: JSON.stringify(resumeData) }],
				schema: z.object({
					audit: z.string().describe("Internal reasoning for the strategy"),
					budget: z.record(z.string(), z.number().describe("Bullet count allocated to this entry ID"))
				}),
			});

			// Step 2: Fabrication (using 3 Flash Preview for best reasoning)
			stream.update({ status: "Redesigning resume for high-density impact..." });
			const { partialObjectStream } = streamObject({
				model: google("gemini-3-flash-preview"),
				system: AGENT_FABRICATION_PROMPT,
				messages: [
					{ 
						role: "user", 
						content: `Master Resume: ${JSON.stringify(resumeData)}\n\nCondensation Strategy: ${JSON.stringify(strategy)}` 
					}
				],
				schema: ResumeSchema,
			});

			for await (const partialObject of partialObjectStream) {
				stream.update({ data: partialObject });
			}

			stream.done();
		} catch (error) {
			console.error("Fabrication error:", error);
			stream.error(error instanceof Error ? error.message : "Failed to fabricate resume");
		}
	})().catch((err) => {
		console.error("Unhandled fabrication error:", err);
		stream.error("Internal Server Error");
	});

	return { progress: stream.value };
}
