"use server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import {
	bullets,
	customSectionItems,
	customSections,
	education,
	experiences,
	projects,
	resumes,
	skills,
	users,
} from "~/db/schema";
import type { ResumeData } from "~/schemas/resume";

/**
 * Synchronizes client-side ResumeData with the relational database.
 * This is an "Upsert" operation that handles the entire tree.
 */
export async function syncResumeData(data: ResumeData, resumeId: string) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	console.log(`🔄 Syncing resume ${resumeId} for user ${userId}...`);

	// 1. Ensure user exists in our DB (upsert)
	await db
		.insert(users)
		.values({
			id: userId,
			email: data.personalInfo.email,
			name: data.personalInfo.fullName,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: users.id,
			set: {
				email: data.personalInfo.email,
				name: data.personalInfo.fullName,
				updatedAt: new Date(),
			},
		});

	// 2. Upsert the Resume header
	await db
		.insert(resumes)
		.values({
			id: resumeId,
			userId,
			title: data.personalInfo.fullName || "Untitled Resume",
			personalInfo: data.personalInfo,
			design: data.design,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.onConflictDoUpdate({
			target: resumes.id,
			set: {
				personalInfo: data.personalInfo,
				design: data.design,
				updatedAt: new Date(),
			},
		});

	// 3. Sync Experiences (Delete and Re-insert for simplicity/consistency)
	await db.delete(experiences).where(eq(experiences.resumeId, resumeId));
	for (const [idx, exp] of data.experience.entries()) {
		await db.insert(experiences).values({
			id: exp.id,
			resumeId,
			company: exp.company,
			position: exp.position,
			client: exp.client,
			isClientWhitelabeled: exp.isClientWhitelabeled,
			location: exp.location,
			startDate: exp.startDate,
			endDate: exp.endDate,
			current: exp.current,
			order: idx,
		});

		// Insert bullets for this experience
		if (exp.description.length > 0) {
			await db.insert(bullets).values(
				exp.description.map((content, bIdx) => ({
					id: crypto.randomUUID(),
					experienceId: exp.id,
					content,
					order: bIdx,
				})),
			);
		}
	}

	// 4. Sync Education
	await db.delete(education).where(eq(education.resumeId, resumeId));
	if (data.education.length > 0) {
		await db.insert(education).values(
			data.education.map((edu, idx) => ({
				id: edu.id,
				resumeId,
				school: edu.school,
				degree: edu.degree,
				fieldOfStudy: edu.fieldOfStudy,
				location: edu.location,
				startDate: edu.startDate,
				endDate: edu.endDate,
				order: idx,
			})),
		);
	}

	// 5. Sync Skills
	await db.delete(skills).where(eq(skills.resumeId, resumeId));
	if (data.skills.length > 0) {
		await db.insert(skills).values(
			data.skills.map((s, idx) => ({
				id: s.id,
				resumeId,
				name: s.name,
				level: s.level,
				order: idx,
			})),
		);
	}

	// 6. Sync Projects
	await db.delete(projects).where(eq(projects.resumeId, resumeId));
	for (const [idx, p] of data.projects.entries()) {
		await db.insert(projects).values({
			id: p.id,
			resumeId,
			name: p.name,
			client: p.client,
			isClientWhitelabeled: p.isClientWhitelabeled,
			link: p.link,
			startDate: p.startDate,
			endDate: p.endDate,
			description: p.description,
			order: idx,
		});
	}

	// 7. Sync Custom Sections
	// First, find all current custom sections to delete their items
	const existingSections = await db.query.customSections.findMany({
		where: eq(customSections.resumeId, resumeId),
	});

	for (const section of existingSections) {
		await db
			.delete(customSectionItems)
			.where(eq(customSectionItems.sectionId, section.id));
	}
	await db.delete(customSections).where(eq(customSections.resumeId, resumeId));

	for (const [idx, cs] of data.customSections.entries()) {
		await db.insert(customSections).values({
			id: cs.id,
			resumeId,
			title: cs.title,
			order: idx,
		});

		if (cs.items.length > 0) {
			await db.insert(customSectionItems).values(
				cs.items.map((item, iIdx) => ({
					id: item.id,
					sectionId: cs.id,
					title: item.title,
					subtitle: item.subtitle,
					date: item.date,
					description: item.description,
					order: iIdx,
				})),
			);
		}
	}

	revalidatePath("/dashboard");
	return { success: true };
}
