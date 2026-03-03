"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import { env } from "~/env";
import { REFINE_SYSTEM_PROMPT } from "~/lib/ai/prompts";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function refineText(text: string) {
	const stream = createStreamableValue("");

	(async () => {
		const { textStream } = streamText({
			model: google("gemini-3-flash-preview"),
			system: REFINE_SYSTEM_PROMPT,
			messages: [
				{
					role: "user",
					content: `Refine the following text for a resume:
"${text}"`,
				},
			],
		});

		for await (const delta of textStream) {
			stream.update(delta);
		}

		stream.done();
	})().catch((error) => {
		console.error("Refinement error:", error);
		stream.error(error);
	});

	return { output: stream.value };
}
