"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "~/db";
import { resumes, experiences, bullets, education, skills, projects, customSections, customSectionItems } from "~/db/schema";
import { type ResumeData } from "~/schemas/resume";
import { eq } from "drizzle-orm";

export async function syncResumeData(data: ResumeData) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	// Check if user already has a master resume
	const existingMaster = await db.query.resumes.findFirst({
		where: eq(resumes.userId, userId),
	});

	if (existingMaster) {
		return { status: "already_synced" };
	}

	// perform a deep insert into the cloud database
	const resumeId = crypto.randomUUID();

	await db.insert(resumes).values({
		id: resumeId,
		userId,
		title: "My Master Resume",
		isMaster: true,
		personalInfo: data.personalInfo,
		design: data.design,
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	// Experience & Bullets
	for (const exp of data.experience || []) {
		const expId = crypto.randomUUID();
		await db.insert(experiences).values({
			id: expId,
			resumeId,
			company: exp.company,
			position: exp.position,
			location: exp.location,
			startDate: exp.startDate,
			endDate: exp.endDate,
			current: exp.current,
		});

		for (let i = 0; i < (exp.description?.length || 0); i++) {
			await db.insert(bullets).values({
				id: crypto.randomUUID(),
				experienceId: expId,
				content: exp.description[i],
				order: i,
			});
		}
	}

	// Education
	for (const edu of data.education || []) {
		await db.insert(education).values({
			id: crypto.randomUUID(),
			resumeId,
			school: edu.school,
			degree: edu.degree,
			fieldOfStudy: edu.fieldOfStudy,
			location: edu.location,
			startDate: edu.startDate,
			endDate: edu.endDate,
		});
	}

	// Skills
	for (const skill of data.skills || []) {
		await db.insert(skills).values({
			id: crypto.randomUUID(),
			resumeId,
			name: skill.name,
			level: skill.level,
		});
	}

	// Projects
	for (const p of data.projects || []) {
		await db.insert(projects).values({
			id: crypto.randomUUID(),
			resumeId,
			name: p.name,
			link: p.link,
			startDate: p.startDate,
			endDate: p.endDate,
			description: p.description,
		});
	}

	// Custom Sections
	for (const section of data.customSections || []) {
		const sId = crypto.randomUUID();
		await db.insert(customSections).values({
			id: sId,
			resumeId,
			title: section.title,
		});

		for (const item of section.items || []) {
			await db.insert(customSectionItems).values({
				id: crypto.randomUUID(),
				sectionId: sId,
				title: item.title,
				subtitle: item.subtitle,
				date: item.date,
				description: item.description,
			});
		}
	}

	return { status: "migrated", resumeId };
}
