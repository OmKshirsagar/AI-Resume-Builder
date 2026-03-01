"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { env } from "~/env";
import { CONDENSE_RESUME_SYSTEM_PROMPT } from "~/lib/ai/prompts";
import { ResumeSchema, type ResumeData } from "~/schemas/resume";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function condenseResume(resumeData: ResumeData) {
	try {
		const { output } = await generateText({
			model: google("gemini-3-flash"),
			system: CONDENSE_RESUME_SYSTEM_PROMPT,
			messages: [
				{
					role: "user",
					content: `Here is my current multi-page resume data in JSON format. Please condense it into a high-impact 1-page version following the guidelines.

${JSON.stringify(resumeData, null, 2)}`,
				},
			],
			output: Output.object({
				schema: ResumeSchema,
			}),
		});

		return { success: true, data: output };
	} catch (error) {
		console.error("Condensation error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to condense resume",
		};
	}
}
