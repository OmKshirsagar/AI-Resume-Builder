import { z } from "zod";

/**
 * AI-friendly Resume Schemas.
 * We avoid .or(z.literal("")) because Gemini's structured output
 * doesn't support empty literals in unions well.
 * Instead, we use .default("") or simply z.string().
 */

export const PersonalInformationSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().default(""),
	phone: z.string().default(""),
	location: z.string().default(""),
	website: z.string().default(""),
	linkedin: z.string().default(""),
	github: z.string().default(""),
	summary: z.string().default(""),
});

export const ExperienceSchema = z.object({
	id: z.string(),
	company: z.string().min(1, "Company name is required"),
	position: z.string().min(1, "Position is required"),
	location: z.string().default(""),
	startDate: z.string().default(""),
	endDate: z.string().default(""),
	current: z.boolean().default(false),
	description: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
	id: z.string(),
	school: z.string().min(1, "School name is required"),
	degree: z.string().min(1, "Degree is required"),
	fieldOfStudy: z.string().default(""),
	location: z.string().default(""),
	startDate: z.string().default(""),
	endDate: z.string().default(""),
	current: z.boolean().default(false),
	description: z.array(z.string()).default([]),
});

export const SkillSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Skill name is required"),
	level: z.string().default(""),
});

export const ProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Project name is required"),
	description: z.array(z.string()).default([]),
	link: z.string().default(""),
	startDate: z.string().default(""),
	endDate: z.string().default(""),
});

export const CustomSectionItemSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required"),
	subtitle: z.string().default(""),
	date: z.string().default(""),
	description: z.array(z.string()).default([]),
});

export const CustomSectionSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Section title is required"),
	items: z.array(CustomSectionItemSchema).default([]),
});

export const DesignSchema = z.object({
	template: z.enum(["classic", "modern", "sidebar"]).default("classic"),
	theme: z.object({
		primaryColor: z.string().default("#000000"),
		fontSize: z.enum(["small", "medium", "large"]).default("medium"),
		lineHeight: z.enum(["tight", "relaxed"]).default("relaxed"),
	}).default({
		primaryColor: "#000000",
		fontSize: "medium",
		lineHeight: "relaxed",
	}),
	layout: z.object({
		mainSections: z.array(z.string()).default([]),
		sidebarSections: z.array(z.string()).default([]),
	}).default({
		mainSections: ["experience", "education", "projects"],
		sidebarSections: ["skills"],
	}),
});

export const ResumeSchema = z.object({
	personalInfo: PersonalInformationSchema,
	experience: z.array(ExperienceSchema).default([]),
	education: z.array(EducationSchema).default([]),
	skills: z.array(SkillSchema).default([]),
	projects: z.array(ProjectSchema).default([]),
	customSections: z.array(CustomSectionSchema).default([]),
	design: DesignSchema.default({
		template: "classic",
		theme: {
			primaryColor: "#000000",
			fontSize: "medium",
			lineHeight: "relaxed",
		},
		layout: {
			mainSections: ["experience", "education", "projects"],
			sidebarSections: ["skills"],
		},
	}),
});

export type PersonalInformation = z.infer<typeof PersonalInformationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CustomSectionItem = z.infer<typeof CustomSectionItemSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
export type Design = z.infer<typeof DesignSchema>;
export type ResumeData = z.infer<typeof ResumeSchema>;

export const DEFAULT_RESUME: ResumeData = {
	personalInfo: {
		fullName: "",
		email: "",
		phone: "",
		location: "",
		website: "",
		linkedin: "",
		github: "",
		summary: "",
	},
	experience: [],
	education: [],
	skills: [],
	projects: [],
	customSections: [],
	design: {
		template: "classic",
		theme: {
			primaryColor: "#000000",
			fontSize: "medium",
			lineHeight: "relaxed",
		},
		layout: {
			mainSections: ["experience", "education", "projects"],
			sidebarSections: ["skills"],
		},
	},
};
