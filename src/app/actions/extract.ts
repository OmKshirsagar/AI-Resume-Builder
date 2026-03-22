"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { env } from "~/env";
import { parsePDF } from "~/lib/pdf-parser";

const google = createGoogleGenerativeAI({
	apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Define a schema for extraction without IDs
const ExtractionPersonalInformationSchema = z.object({
	fullName: z.string().describe("The person's full name"),
	email: z.string().email().describe("The person's email address"),
	phone: z.string().default("").describe("Phone number, if available"),
	location: z.string().default("").describe("City and State/Country"),
	summary: z
		.string()
		.default("")
		.describe("A brief professional summary or about me section"),
});

const ExtractionExperienceSchema = z.object({
	company: z.string().describe("Company name"),
	position: z.string().describe("Job title"),
	location: z.string().default("").describe("Office location"),
	startDate: z.string().default("").describe("Start date (e.g., 'Jan 2020')"),
	endDate: z.string().default("").describe("End date or 'Present'"),
	current: z.boolean().describe("Is this the current role?"),
	description: z
		.array(z.string())
		.describe("List of accomplishments and responsibilities"),
});

const ExtractionEducationSchema = z.object({
	school: z.string().describe("University or school name"),
	degree: z.string().describe("Degree name (e.g., 'Bachelor of Science')"),
	fieldOfStudy: z.string().default("").describe("Major or field of study"),
	location: z.string().default("").describe("School location"),
	startDate: z.string().default("").describe("Start date"),
	endDate: z
		.string()
		.default("")
		.describe("Graduation date (e.g., 'May 2022')"),
});

const ExtractionSkillSchema = z.object({
	name: z.string().describe("Skill name (e.g., 'TypeScript')"),
	level: z.string().default("").describe("Skill level or proficiency"),
	category: z
		.string()
		.default("")
		.describe("Skill category (e.g., 'Languages')"),
});

const ExtractionProjectSchema = z.object({
	name: z.string().describe("Project name"),
	description: z.string().describe("Brief project description"),
	link: z.string().default("").describe("Project URL"),
	startDate: z.string().default(""),
	endDate: z.string().default(""),
});

const ExtractionCustomSectionItemSchema = z.object({
	title: z
		.string()
		.describe("The item title (e.g., 'AWS Certified Solutions Architect')"),
	subtitle: z
		.string()
		.default("")
		.describe("Secondary detail (e.g., 'Amazon Web Services')"),
	date: z.string().default("").describe("Date or date range"),
	description: z
		.array(z.string())
		.describe("List of details or accomplishments for this item"),
});

const ExtractionCustomSectionSchema = z.object({
	title: z
		.string()
		.describe(
			"The section title (e.g., 'Certifications', 'Languages', 'Awards')",
		),
	items: z.array(ExtractionCustomSectionItemSchema),
});

const ExtractionResumeSchema = z.object({
	personalInfo: ExtractionPersonalInformationSchema,
	experience: z.array(ExtractionExperienceSchema),
	education: z.array(ExtractionEducationSchema),
	skills: z.array(ExtractionSkillSchema),
	projects: z.array(ExtractionProjectSchema),
	customSections: z
		.array(ExtractionCustomSectionSchema)
		.describe(
			"Capture any other sections like Certifications, Languages, Awards, Volunteering, etc.",
		),
});

export async function extractResumeFromPDF(
	formData: FormData,
	fileHash?: string,
) {
	try {
		const file = formData.get("file") as File;
		if (!file) {
			return { success: false, error: "No file uploaded" };
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		// Step 1: Extract structured text locally (saves AI tokens and preserves layout)
		console.log("📄 Parsing PDF locally with coordinate-aware extraction...");
		const extractedText = await parsePDF(buffer);

		// Step 2: Use Gemini to map the structured text to our JSON schema
		console.log("🤖 Mapping text to Resume schema with Gemini...");
		const { object } = await generateObject({
			model: google("gemini-3-flash-preview"),
			schema: ExtractionResumeSchema,
			system: `You are an expert resume parser. 
      You will receive text extracted from a PDF. 
      The text has been pre-processed to maintain logical column and reading order.
      
      Your task: Extract the information accurately into the structured format. 
      Identify sections that do not fit into Experience, Education, Skills, or Projects (e.g., Certifications, Awards, Volunteering, Languages, Publications) and map them to the 'customSections' array. 
      Each custom section should have a clear title reflecting its content. 
      If a piece of information is missing, omit it or use an empty array/null where appropriate.`,
			prompt: `EXTRACTED TEXT:\n\n${extractedText}`,
		});

		// Attach the fileHash if provided so the client can save it
		return {
			success: true,
			data: object,
			fileHash,
		};
	} catch (error) {
		console.error("Extraction error:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Failed to extract data",
		};
	}
}
