import { create } from "zustand";
import { persist } from "zustand/middleware";
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
		(set) => ({
			original: DEFAULT_RESUME,
			draft: null,

			setOriginal: (data) =>
				set((state) => ({
					...state,
					original: data,
				})),

			setDraft: (data) =>
				set((state) => ({
					...state,
					draft: data,
				})),

			applyDraft: () =>
				set((state) => {
					if (state.draft) {
						return {
							...state,
							original: state.draft,
							draft: null,
						};
					}
					return state;
				}),

			discardDraft: () =>
				set((state) => ({
					...state,
					draft: null,
				})),

			resetResume: () =>
				set({
					original: DEFAULT_RESUME,
					draft: null,
				}),

			updatePersonalInfo: (info) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						personalInfo: {
							...state.original.personalInfo,
							...info,
						},
					},
				})),

			addExperience: (experience) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						experience: [...state.original.experience, experience],
					},
				})),

			updateExperience: (id, updatedExperience) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						experience: state.original.experience.map((exp) =>
							exp.id === id ? { ...exp, ...updatedExperience } : exp,
						),
					},
				})),

			removeExperience: (id) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						experience: state.original.experience.filter((exp) => exp.id !== id),
					},
				})),

			addEducation: (education) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						education: [...state.original.education, education],
					},
				})),

			updateEducation: (id, updatedEducation) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						education: state.original.education.map((edu) =>
							edu.id === id ? { ...edu, ...updatedEducation } : edu,
						),
					},
				})),

			removeEducation: (id) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						education: state.original.education.filter((edu) => edu.id !== id),
					},
				})),

			addSkill: (skill) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						skills: [...state.original.skills, skill],
					},
				})),

			updateSkill: (id, updatedSkill) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						skills: state.original.skills.map((s) =>
							s.id === id ? { ...s, ...updatedSkill } : s,
						),
					},
				})),

			removeSkill: (id) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						skills: state.original.skills.filter((s) => s.id !== id),
					},
				})),

			addProject: (project) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						projects: [...state.original.projects, project],
					},
				})),

			updateProject: (id, updatedProject) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						projects: state.original.projects.map((p) =>
							p.id === id ? { ...p, ...updatedProject } : p,
						),
					},
				})),

			removeProject: (id) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						projects: state.original.projects.filter((p) => p.id !== id),
					},
				})),

			setCustomSections: (sections) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: sections,
					},
				})),

			addCustomSection: (section) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: [...state.original.customSections, section],
					},
				})),

			updateCustomSection: (id, updatedSection) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: state.original.customSections.map((s) =>
							s.id === id ? { ...s, ...updatedSection } : s,
						),
					},
				})),

			removeCustomSection: (id) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: state.original.customSections.filter(
							(s) => s.id !== id,
						),
					},
				})),

			addCustomSectionItem: (sectionId, item) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: state.original.customSections.map((s) =>
							s.id === sectionId ? { ...s, items: [...s.items, item] } : s,
						),
					},
				})),

			updateCustomSectionItem: (sectionId, itemId, updatedItem) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: state.original.customSections.map((s) =>
							s.id === sectionId
								? {
										...s,
										items: s.items.map((i) =>
											i.id === itemId ? { ...i, ...updatedItem } : i,
										),
									}
								: s,
						),
					},
				})),

			removeCustomSectionItem: (sectionId, itemId) =>
				set((state) => ({
					...state,
					original: {
						...state.original,
						customSections: state.original.customSections.map((s) =>
							s.id === sectionId
								? {
										...s,
										items: s.items.filter((i) => i.id !== itemId),
									}
								: s,
						),
					},
				})),
		}),
		{
			name: "resume-storage",
		},
	),
);
