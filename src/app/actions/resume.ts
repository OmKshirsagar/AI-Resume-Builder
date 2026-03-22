"use server";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "~/db";
import { resumes } from "~/db/schema";
import type { ResumeData } from "~/schemas/resume";

/**
 * Checks if a resume with the given file hash already exists for the current user.
 * Returns the full resume data if found, otherwise null.
 */
export async function checkExistingResume(fileHash: string) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	console.log(
		`🔍 Checking for existing resume with hash: ${fileHash.slice(0, 8)}...`,
	);

	const existing = await db.query.resumes.findFirst({
		where: and(eq(resumes.userId, userId), eq(resumes.fileHash, fileHash)),
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

	if (!existing) return null;

	console.log("✅ Duplicate resume found! Skipping AI extraction.");

	// Transform DB record back to ResumeData schema
	const resumeData: ResumeData = {
		personalInfo: existing.personalInfo as any,
		design: existing.design as any,
		experience: existing.experiences.map((exp) => ({
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
		education: existing.education.map((edu) => ({
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
		skills: existing.skills.map((s) => ({
			id: s.id,
			name: s.name,
			level: s.level || "",
		})),
		projects: existing.projects.map((p) => ({
			id: p.id,
			name: p.name,
			description: p.description as any,
			link: p.link || "",
			startDate: p.startDate || "",
			endDate: p.endDate || "",
		})),
		customSections: existing.customSections.map((cs) => ({
			id: cs.id,
			title: cs.title,
			items: cs.items.map((item) => ({
				id: item.id,
				title: item.title,
				subtitle: item.subtitle || "",
				date: item.date || "",
				description: item.description as any,
			})),
		})),
	};

	return resumeData;
}
