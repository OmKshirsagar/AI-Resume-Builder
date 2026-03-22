"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createStreamableValue } from "@ai-sdk/rsc";
import { streamObject } from "ai";
import { z } from "zod";
import { env } from "~/env";
import { JOB_TAILOR_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import type { ResumeData } from "~/schemas/resume";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const SuggestionsSchema = z.object({
	summary: z.string().optional(),
	experienceChanges: z.array(
		z.object({
			experienceIndex: z.number(),
			newBullets: z.array(z.string()),
		}),
	),
});

export type TailorSuggestions = z.infer<typeof SuggestionsSchema>;

export async function tailorResume(
	resumeData: ResumeData,
	jobDescription: string,
) {
	// Using any here because streamObject's PartialObject type is highly recursive
	// and difficult to cast to a simple Partial<T> without deep utility types.
	// biome-ignore lint/suspicious/noExplicitAny: complex AI stream object
	const stream = createStreamableValue<any>();

	(async () => {
		try {
			const { partialObjectStream } = streamObject({
				model: google("gemini-3-flash-preview-0814"),
				system: JOB_TAILOR_SYSTEM_PROMPT,
				schema: SuggestionsSchema,
				prompt: `
        RESUME: ${JSON.stringify(resumeData)}
        JOB DESCRIPTION: ${jobDescription}
      `,
			});

			for await (const partial of partialObjectStream) {
				stream.update(partial);
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
