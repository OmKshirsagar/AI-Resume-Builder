import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	DEFAULT_RESUME,
	type CustomSection,
	type CustomSectionItem,
	type Education,
	type Experience,
	type PersonalInformation,
	type Project,
	type ResumeData,
	type Skill,
} from "~/schemas/resume";

interface ResumeState {
	original: ResumeData;
	draft: ResumeData | null;

	// Global State Actions
	setOriginal: (data: ResumeData) => void;
	setDraft: (data: ResumeData | null) => void;
	applyDraft: () => void;
	discardDraft: () => void;
	resetResume: () => void;

	// Update Actions (targeting original)
	updatePersonalInfo: (info: Partial<PersonalInformation>) => void;

	addExperience: (experience: Experience) => void;
	updateExperience: (id: string, experience: Partial<Experience>) => void;
	removeExperience: (id: string) => void;

	addEducation: (education: Education) => void;
	updateEducation: (id: string, education: Partial<Education>) => void;
	removeEducation: (id: string) => void;

	addSkill: (skill: Skill) => void;
	updateSkill: (id: string, skill: Partial<Skill>) => void;
	removeSkill: (id: string) => void;

	addProject: (project: Project) => void;
	updateProject: (id: string, project: Partial<Project>) => void;
	removeProject: (id: string) => void;

	// Custom Section Actions
	setCustomSections: (sections: CustomSection[]) => void;
	addCustomSection: (section: CustomSection) => void;
	updateCustomSection: (id: string, section: Partial<CustomSection>) => void;
	removeCustomSection: (id: string) => void;

	addCustomSectionItem: (sectionId: string, item: CustomSectionItem) => void;
	updateCustomSectionItem: (
		sectionId: string,
		itemId: string,
		item: Partial<CustomSectionItem>,
	) => void;
	removeCustomSectionItem: (sectionId: string, itemId: string) => void;
}

export const useResumeStore = create<ResumeState>()(
	persist(
		immer((set) => ({
			original: DEFAULT_RESUME,
			draft: null,

			setOriginal: (data) =>
				set((state) => {
					state.original = data;
				}),

			setDraft: (data) =>
				set((state) => {
					state.draft = data;
				}),

			applyDraft: () =>
				set((state) => {
					if (state.draft) {
						state.original = state.draft;
						state.draft = null;
					}
				}),

			discardDraft: () =>
				set((state) => {
					state.draft = null;
				}),

			resetResume: () =>
				set((state) => {
					state.original = DEFAULT_RESUME;
					state.draft = null;
				}),

			updatePersonalInfo: (info) =>
				set((state) => {
					state.original.personalInfo = {
						...state.original.personalInfo,
						...info,
					};
				}),

			addExperience: (experience) =>
				set((state) => {
					state.original.experience.push(experience);
				}),

			updateExperience: (id, updatedExperience) =>
				set((state) => {
					const index = state.original.experience.findIndex((exp) => exp.id === id);
					if (index !== -1) {
						state.original.experience[index] = {
							...state.original.experience[index]!,
							...updatedExperience,
						};
					}
				}),

			removeExperience: (id) =>
				set((state) => {
					state.original.experience = state.original.experience.filter(
						(exp) => exp.id !== id,
					);
				}),

			addEducation: (education) =>
				set((state) => {
					state.original.education.push(education);
				}),

			updateEducation: (id, updatedEducation) =>
				set((state) => {
					const index = state.original.education.findIndex((edu) => edu.id === id);
					if (index !== -1) {
						state.original.education[index] = {
							...state.original.education[index]!,
							...updatedEducation,
						};
					}
				}),

			removeEducation: (id) =>
				set((state) => {
					state.original.education = state.original.education.filter(
						(edu) => edu.id !== id,
					);
				}),

			addSkill: (skill) =>
				set((state) => {
					state.original.skills.push(skill);
				}),

			updateSkill: (id, updatedSkill) =>
				set((state) => {
					const index = state.original.skills.findIndex((s) => s.id === id);
					if (index !== -1) {
						state.original.skills[index] = {
							...state.original.skills[index]!,
							...updatedSkill,
						};
					}
				}),

			removeSkill: (id) =>
				set((state) => {
					state.original.skills = state.original.skills.filter((s) => s.id !== id);
				}),

			addProject: (project) =>
				set((state) => {
					state.original.projects.push(project);
				}),

			updateProject: (id, updatedProject) =>
				set((state) => {
					const index = state.original.projects.findIndex((p) => p.id === id);
					if (index !== -1) {
						state.original.projects[index] = {
							...state.original.projects[index]!,
							...updatedProject,
						};
					}
				}),

			removeProject: (id) =>
				set((state) => {
					state.original.projects = state.original.projects.filter(
						(p) => p.id !== id,
					);
				}),

			// Custom Section Actions
			setCustomSections: (sections) =>
				set((state) => {
					state.original.customSections = sections;
				}),

			addCustomSection: (section) =>
				set((state) => {
					state.original.customSections.push(section);
				}),

			updateCustomSection: (id, updatedSection) =>
				set((state) => {
					const index = state.original.customSections.findIndex((s) => s.id === id);
					if (index !== -1) {
						state.original.customSections[index] = {
							...state.original.customSections[index]!,
							...updatedSection,
						};
					}
				}),

			removeCustomSection: (id) =>
				set((state) => {
					state.original.customSections = state.original.customSections.filter(
						(s) => s.id !== id,
					);
				}),

			addCustomSectionItem: (sectionId, item) =>
				set((state) => {
					const section = state.original.customSections.find(
						(s) => s.id === sectionId,
					);
					if (section) {
						section.items.push(item);
					}
				}),

			updateCustomSectionItem: (sectionId, itemId, updatedItem) =>
				set((state) => {
					const section = state.original.customSections.find(
						(s) => s.id === sectionId,
					);
					if (section) {
						const index = section.items.findIndex((i) => i.id === itemId);
						if (index !== -1) {
							section.items[index] = {
								...section.items[index]!,
								...updatedItem,
							};
						}
					}
				}),

			removeCustomSectionItem: (sectionId, itemId) =>
				set((state) => {
					const section = state.original.customSections.find(
						(s) => s.id === sectionId,
					);
					if (section) {
						section.items = section.items.filter((i) => i.id !== itemId);
					}
				}),
		})),
		{
			name: "resume-storage",
		},
	),
);
