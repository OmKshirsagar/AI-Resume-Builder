"use server";

import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "~/db";
import { resumes } from "~/db/schema";

/**
 * Lists all resumes for the current user.
 * Includes a tailoringCount which is the number of resumes that have this resume as their parent.
 */
export async function listResumes() {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	// Subquery to count children (tailored versions) for each resume
	const tailoringCountSubquery = db
		.select({
			parentId: resumes.parentId,
			count: sql<number>`count(*)`.as("count"),
		})
		.from(resumes)
		.where(sql`${resumes.parentId} IS NOT NULL`)
		.groupBy(resumes.parentId)
		.as("tc");

	const result = await db
		.select({
			id: resumes.id,
			title: resumes.title,
			isMaster: resumes.isMaster,
			updatedAt: resumes.updatedAt,
			createdAt: resumes.createdAt,
			tailoringCount: sql<number>`COALESCE(${tailoringCountSubquery.count}, 0)`,
		})
		.from(resumes)
		.leftJoin(
			tailoringCountSubquery,
			eq(resumes.id, tailoringCountSubquery.parentId),
		)
		.where(eq(resumes.userId, userId))
		.orderBy(desc(resumes.updatedAt));

	return result;
}

/**
 * Deletes a resume by ID.
 * Drizzle handles cascade deletes for associated records (experiences, etc.)
 */
export async function deleteResume(id: string) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	await db
		.delete(resumes)
		.where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

	revalidatePath("/dashboard");
}

/**
 * Renames a resume.
 */
export async function renameResume(id: string, newTitle: string) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	await db
		.update(resumes)
		.set({ title: newTitle, updatedAt: new Date() })
		.where(and(eq(resumes.id, id), eq(resumes.userId, userId)));

	revalidatePath("/dashboard");
}
