import { z } from "zod";

export const PersonalInformationSchema = z.object({
	fullName: z.string().min(1, "Full name is required"),
	email: z.string().email("Invalid email address").or(z.literal("")),
	phone: z.string().optional().or(z.literal("")),
	location: z.string().optional().or(z.literal("")),
	website: z.string().url("Invalid URL").optional().or(z.literal("")),
	linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
	github: z.string().url("Invalid URL").optional().or(z.literal("")),
	summary: z.string().optional().or(z.literal("")),
});

export const ExperienceSchema = z.object({
	id: z.string(),
	company: z.string().min(1, "Company name is required"),
	position: z.string().min(1, "Position is required"),
	location: z.string().optional().or(z.literal("")),
	startDate: z.string().optional().or(z.literal("")),
	endDate: z.string().optional().or(z.literal("")),
	current: z.boolean().default(false),
	description: z.array(z.string()).default([]),
});

export const EducationSchema = z.object({
	id: z.string(),
	school: z.string().min(1, "School name is required"),
	degree: z.string().min(1, "Degree is required"),
	fieldOfStudy: z.string().optional().or(z.literal("")),
	location: z.string().optional().or(z.literal("")),
	startDate: z.string().optional().or(z.literal("")),
	endDate: z.string().optional().or(z.literal("")),
	current: z.boolean().default(false),
	description: z.array(z.string()).default([]),
});

export const SkillSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Skill name is required"),
	level: z
		.enum(["Beginner", "Intermediate", "Advanced", "Expert"])
		.optional()
		.or(z.literal("")),
});

export const ProjectSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Project name is required"),
	description: z.array(z.string()).default([]),
	link: z.string().url("Invalid URL").optional().or(z.literal("")),
	startDate: z.string().optional().or(z.literal("")),
	endDate: z.string().optional().or(z.literal("")),
});

export const CustomSectionItemSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Title is required"),
	subtitle: z.string().optional().or(z.literal("")),
	date: z.string().optional().or(z.literal("")),
	description: z.array(z.string()).default([]),
});

export const CustomSectionSchema = z.object({
	id: z.string(),
	title: z.string().min(1, "Section title is required"),
	items: z.array(CustomSectionItemSchema).default([]),
});

export const ResumeSchema = z.object({
	personalInfo: PersonalInformationSchema,
	experience: z.array(ExperienceSchema).default([]),
	education: z.array(EducationSchema).default([]),
	skills: z.array(SkillSchema).default([]),
	projects: z.array(ProjectSchema).default([]),
	customSections: z.array(CustomSectionSchema).default([]),
});

export type PersonalInformation = z.infer<typeof PersonalInformationSchema>;
export type Experience = z.infer<typeof ExperienceSchema>;
export type Education = z.infer<typeof EducationSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type CustomSectionItem = z.infer<typeof CustomSectionItemSchema>;
export type CustomSection = z.infer<typeof CustomSectionSchema>;
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
};
