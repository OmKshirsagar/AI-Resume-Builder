"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamObject } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { z } from "zod";
import { env } from "~/env";
import { JOB_TAILOR_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import type { ResumeData } from "~/schemas/resume";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const SuggestionsSchema = z.object({
	summary: z.string().describe("The suggested professional summary aligned with the JD"),
	experienceChanges: z.array(z.object({
		experienceId: z.string().describe("The unique ID of the experience entry from the resume"),
		bulletIndex: z.number().describe("The 0-based index of the bullet point within the experience entry"),
		originalBullet: z.string().describe("The original bullet text"),
		newBullet: z.string().describe("The suggested tailored bullet text"),
		reasoning: z.string().describe("Brief explanation of why this change improves alignment with the JD")
	})).describe("Suggested changes for individual experience bullets")
});

export type TailorSuggestions = z.infer<typeof SuggestionsSchema>;

export async function tailorResume(resumeData: ResumeData, jobDescription: string) {
	// Using any here because streamObject's PartialObject type is highly recursive 
	// and difficult to cast to a simple Partial<T> without deep utility types.
	const stream = createStreamableValue<any>();

	(async () => {
		try {
			const { partialObjectStream } = streamObject({
				model: google("gemini-2.5-flash"),
				system: JOB_TAILOR_SYSTEM_PROMPT,
				schema: SuggestionsSchema,
				messages: [
					{
						role: "user",
						content: `Job Description:
${jobDescription}

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}
`,
					},
				],
			});

			for await (const partialObject of partialObjectStream) {
				stream.update(partialObject);
			}

			stream.done();
		} catch (error) {
			console.error("Tailoring error:", error);
			stream.error(error);
		}
	})().catch((error) => {
		console.error("Unhandled tailoring error:", error);
		stream.error(error);
	});

	return { output: stream.value };
}
