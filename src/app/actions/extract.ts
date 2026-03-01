"use server";

import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { env } from "@/env";

// Define a schema for extraction without IDs
const ExtractionPersonalInformationSchema = z.object({
  fullName: z.string().describe("The person's full name"),
  email: z.string().email().or(z.literal("")).describe("The person's email address"),
  phone: z.string().optional().or(z.literal("")).describe("The person's phone number"),
  location: z.string().optional().or(z.literal("")).describe("City and State/Country"),
  website: z.string().optional().or(z.literal("")).describe("Personal website or portfolio URL"),
  linkedin: z.string().optional().or(z.literal("")).describe("LinkedIn profile URL"),
  github: z.string().optional().or(z.literal("")).describe("GitHub profile URL"),
  summary: z.string().optional().or(z.literal("")).describe("Professional summary or objective"),
});

const ExtractionExperienceSchema = z.object({
  company: z.string().describe("Name of the company"),
  position: z.string().describe("Job title"),
  location: z.string().optional().or(z.literal("")).describe("City and State/Country"),
  startDate: z.string().optional().or(z.literal("")).describe("Start date (e.g., Jan 2020)"),
  endDate: z.string().optional().or(z.literal("")).describe("End date (e.g., Present or Dec 2023)"),
  current: z.boolean().describe("Whether this is the current role"),
  description: z.array(z.string()).describe("List of responsibilities and achievements"),
});

const ExtractionEducationSchema = z.object({
  school: z.string().describe("Name of the school/university"),
  degree: z.string().describe("Degree name (e.g., B.S.)"),
  fieldOfStudy: z.string().optional().or(z.literal("")).describe("Major or field of study"),
  location: z.string().optional().or(z.literal("")).describe("City and State/Country"),
  startDate: z.string().optional().or(z.literal("")).describe("Start date"),
  endDate: z.string().optional().or(z.literal("")).describe("End date"),
  current: z.boolean().describe("Whether the person is currently studying here"),
  description: z.array(z.string()).describe("Key courses, honors, or activities"),
});

const ExtractionSkillSchema = z.object({
  name: z.string().describe("Name of the skill"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional().or(z.literal("")).describe("Proficiency level"),
});

const ExtractionProjectSchema = z.object({
  name: z.string().describe("Project name"),
  description: z.array(z.string()).describe("Description of the project and its results"),
  link: z.string().optional().or(z.literal("")).describe("Project URL"),
  startDate: z.string().optional().or(z.literal("")).describe("Start date"),
  endDate: z.string().optional().or(z.literal("")).describe("End date"),
});

const ExtractionSchema = z.object({
  personalInfo: ExtractionPersonalInformationSchema,
  experience: z.array(ExtractionExperienceSchema),
  education: z.array(ExtractionEducationSchema),
  skills: z.array(ExtractionSkillSchema),
  projects: z.array(ExtractionProjectSchema),
});

export type ExtractionResult = {
  success: true;
  data: z.infer<typeof ExtractionSchema>;
} | {
  success: false;
  error: string;
};

export async function extractResumeFromPDF(formData: FormData): Promise<ExtractionResult> {
  const file = formData.get("file") as File;

  if (!file) {
    return { success: false, error: "No file uploaded" };
  }

  if (file.type !== "application/pdf") {
    return { success: false, error: "Only PDF files are supported" };
  }

  // Check file size (limit to 4MB)
  if (file.size > 4 * 1024 * 1024) {
    return { success: false, error: "File size exceeds 4MB limit" };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { object } = await generateObject({
      model: google("gemini-1.5-flash", {
        apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
      }),
      schema: ExtractionSchema,
      prompt: "Extract resume data from the attached PDF. Ensure all dates and fields are captured accurately. For arrays like description, extract bullet points as separate strings.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "file",
              data: buffer,
              mimeType: "application/pdf",
            },
          ],
        },
      ],
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("Extraction error:", error);
    return { success: false, error: "Failed to extract data from PDF. Please try again." };
  }
}
