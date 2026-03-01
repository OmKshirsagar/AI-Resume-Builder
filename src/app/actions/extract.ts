"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import { z } from "zod";
import { env } from "~/env";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Define a schema for extraction without IDs
const ExtractionPersonalInformationSchema = z.object({
	fullName: z.string().describe("The person's full name"),
	email: z.string().email().describe("The person's email address"),
	phone: z.string().optional().describe("Phone number, if available"),
	location: z.string().optional().describe("City and State/Country"),
	summary: z.string().optional().describe("A brief professional summary or about me section"),
});

const ExtractionExperienceSchema = z.object({
	company: z.string().describe("Company name"),
	position: z.string().describe("Job title"),
	location: z.string().optional().describe("Office location"),
	startDate: z.string().describe("Start date (e.g., 'Jan 2020')"),
	endDate: z.string().optional().describe("End date or 'Present'"),
	current: z.boolean().describe("Is this the current role?"),
	description: z.array(z.string()).describe("List of accomplishments and responsibilities"),
});

const ExtractionEducationSchema = z.object({
	school: z.string().describe("University or school name"),
	degree: z.string().describe("Degree name (e.g., 'Bachelor of Science')"),
	fieldOfStudy: z.string().optional().describe("Major or field of study"),
	location: z.string().optional().describe("School location"),
	startDate: z.string().optional().describe("Start date"),
	endDate: z.string().optional().describe("Graduation date (e.g., 'May 2022')"),
});

const ExtractionSkillSchema = z.object({
	name: z.string().describe("Skill name (e.g., 'TypeScript')"),
	level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
	category: z.string().optional().describe("Skill category (e.g., 'Languages')"),
});

const ExtractionProjectSchema = z.object({
	name: z.string().describe("Project name"),
	description: z.string().describe("Brief project description"),
	link: z.string().optional().describe("Project URL"),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
});

const ExtractionResumeSchema = z.object({
	personalInfo: ExtractionPersonalInformationSchema,
	experience: z.array(ExtractionExperienceSchema),
	education: z.array(ExtractionEducationSchema),
	skills: z.array(ExtractionSkillSchema),
	projects: z.array(ExtractionProjectSchema),
});

export async function extractResumeFromPDF(formData: FormData) {
	try {
		const file = formData.get("file") as File;
		if (!file) {
			return { success: false, error: "No file uploaded" };
		}

		const buffer = await file.arrayBuffer();

		const { output } = await generateText({
			model: google("gemini-3-flash"),
			system: "You are an expert resume parser. Extract the information from the provided PDF resume accurately into the structured format. If a piece of information is missing, omit it or use an empty array/null where appropriate.",
			messages: [
				{
					role: "user",
					content: [
						{
							type: "text",
							text: "Extract the structured data from this resume PDF.",
						},
						{
							type: "file",
							data: buffer,
							mediaType: "application/pdf",
						},
					],
				},
			],
			output: Output.object({
				schema: ExtractionResumeSchema,
			}),
		});

		return { success: true, data: output };
	} catch (error) {
		console.error("Extraction error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to extract data",
		};
	}
}
