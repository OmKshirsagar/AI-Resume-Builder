import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ResumeBuilder } from "~/components/ResumeBuilder";
import { db } from "~/db";
import { resumes } from "~/db/schema";
import type { ResumeData } from "~/schemas/resume";

export default async function EditorPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const { userId } = await auth();

	if (!userId) {
		redirect("/");
	}

	const existing = await db.query.resumes.findFirst({
		where: and(eq(resumes.id, id), eq(resumes.userId, userId)),
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

	if (!existing) {
		redirect("/dashboard");
	}

	// Reconstitute ResumeData schema
	const initialData: ResumeData = {
		personalInfo: existing.personalInfo as ResumeData["personalInfo"],
		design: existing.design as ResumeData["design"],
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
			description: p.description as string[],
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
				description: item.description as string[],
			})),
		})),
	};

	return <ResumeBuilder initialData={initialData} resumeId={id} />;
}
