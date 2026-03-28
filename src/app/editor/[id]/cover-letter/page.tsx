import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DraftingLab } from "~/components/cover-letter/DraftingLab";
import { db } from "~/db";
import { resumes } from "~/db/schema";
import type { ResumeData } from "~/schemas/resume";

export default async function CoverLetterPage({
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

	return (
		<div className="flex min-h-screen flex-col bg-slate-50">
			<header className="border-b bg-white px-6 py-4">
				<div className="mx-auto flex max-w-7xl items-center justify-between">
					<div className="flex items-center gap-4">
						<Link
							className="inline-flex items-center gap-1 font-medium text-slate-600 text-sm hover:text-slate-900"
							href={`/editor/${id}`}
						>
							<ChevronLeft className="h-4 w-4" />
							Back to Editor
						</Link>
						<h1 className="font-semibold text-slate-900 text-xl">
							Cover Letter Drafting Lab
						</h1>
					</div>
				</div>
			</header>

			<main className="flex-1 overflow-hidden">
				<div className="mx-auto h-full max-w-7xl p-6">
					<DraftingLab resumeData={initialData} resumeId={id} />
				</div>
			</main>
		</div>
	);
}
