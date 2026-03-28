"use server";

import { createStreamableValue } from "@ai-sdk/rsc";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { coverLetters, resumes } from "~/db/schema";
import { mastra } from "~/mastra";
import type { ResumeData } from "~/schemas/resume";

/**
 * Generates a cover letter using the Mastra workflow.
 * Streams progress events and the final content.
 */
export async function generateCoverLetter(
	resumeId: string,
	jobDescription: string,
	params: {
		companyName?: string;
		tone?: string;
		length?: "short" | "medium" | "long";
	},
) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	// 1. Fetch Resume Data
	const resume = await db.query.resumes.findFirst({
		where: and(eq(resumes.id, resumeId), eq(resumes.userId, userId)),
		with: {
			experiences: {
				with: {
					bullets: true,
				},
			},
			education: true,
			skills: true,
			projects: true,
			customSections: {
				with: {
					items: true,
				},
			},
		},
	});

	if (!resume) throw new Error("Resume not found");

	// 2. Transform DB record back to ResumeData schema
	const resumeData: ResumeData = {
		personalInfo: resume.personalInfo as ResumeData["personalInfo"],
		design: resume.design as ResumeData["design"],
		experience: resume.experiences.map((exp) => ({
			id: exp.id,
			company: exp.company,
			position: exp.position,
			location: exp.location || "",
			startDate: exp.startDate || "",
			endDate: exp.endDate || "",
			current: exp.current,
			description: exp.bullets
				.sort((a, b) => a.order - b.order)
				.map((b) => b.content),
		})),
		education: resume.education.map((edu) => ({
			id: edu.id,
			school: edu.school,
			degree: edu.degree || "",
			fieldOfStudy: edu.fieldOfStudy || "",
			location: edu.location || "",
			startDate: edu.startDate || "",
			endDate: edu.endDate || "",
			current: false,
			description: [],
		})),
		skills: resume.skills.map((s) => ({
			id: s.id,
			name: s.name,
			level: s.level || "",
		})),
		projects: resume.projects.map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description as string[],
			link: p.link || "",
			startDate: p.startDate || "",
			endDate: p.endDate || "",
		})),
		customSections: resume.customSections.map((cs) => ({
			id: cs.id,
			title: cs.title,
			items: cs.items.map((item) => ({
				id: item.id,
				title: item.title,
				subtitle: item.subtitle || "",
				date: item.date || "",
				description: item.description as string[],
			})),
		})),
	};

	// 3. Run Mastra Workflow with streaming
	// biome-ignore lint/suspicious/noExplicitAny: complex AI stream object
	const stream = createStreamableValue<any>();

	(async () => {
		try {
			const workflow = mastra.getWorkflow("coverLetterWorkflow");
			if (!workflow)
				throw new Error("Workflow 'coverLetterWorkflow' not found");

			const run = await workflow.createRun();

			const { fullStream } = run.stream({
				inputData: {
					resumeData,
					jobDescription,
					companyName: params.companyName,
					tone: params.tone,
					length: params.length,
				},
			});

			for await (const event of fullStream) {
				// biome-ignore lint/suspicious/noExplicitAny: complex workflow payload
				const stepId = (event.payload as any)?.id;

				if (event.type === "workflow-step-start") {
					const messages: Record<string, string> = {
						"analyze-jd": "Analyzing Job Description...",
						"match-experience": "Matching experience to requirements...",
						"write-draft": "Drafting cover letter...",
					};

					if (stepId && messages[stepId]) {
						stream.update({ status: messages[stepId], stepId });
					}
				}

				if (event.type === "workflow-step-result") {
					if (stepId === "write-draft") {
						// biome-ignore lint/suspicious/noExplicitAny: complex workflow output
						const output = (event.payload as any).output;
						stream.update({ status: "DONE", data: output });
					}
				}
			}

			stream.done();
		} catch (error) {
			console.error("❌ Cover letter generation error:", error);
			stream.error(
				error instanceof Error ? error.message : "Generation failed",
			);
		}
	})().catch((err) => {
		console.error("❌ Unhandled generation error:", err);
		stream.error("Internal Server Error");
	});

	return { output: stream.value };
}

/**
 * Persists a generated cover letter to the database.
 */
export async function saveCoverLetter(data: {
	id?: string;
	resumeId: string;
	jobDescription: string;
	content: string;
	companyName?: string;
	tone: string;
	length: string;
}) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	const finalId = data.id || crypto.randomUUID();

	await db
		.insert(coverLetters)
		.values({
			id: finalId,
			userId,
			resumeId: data.resumeId,
			jobDescription: data.jobDescription,
			content: data.content,
			companyName: data.companyName,
			tone: data.tone,
			length: data.length,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: coverLetters.id,
			set: {
				content: data.content,
				jobDescription: data.jobDescription,
				companyName: data.companyName,
				tone: data.tone,
				length: data.length,
				updatedAt: new Date(),
			},
		});

	revalidatePath("/dashboard");
	return { success: true, id: finalId };
}

/**
 * Fetches all cover letters linked to a specific resume.
 */
export async function listCoverLetters(resumeId: string) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	return db.query.coverLetters.findMany({
		where: and(
			eq(coverLetters.resumeId, resumeId),
			eq(coverLetters.userId, userId),
		),
		orderBy: desc(coverLetters.createdAt),
	});
}
