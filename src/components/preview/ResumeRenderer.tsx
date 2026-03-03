"use client";

import { clsx } from "clsx";
import type { ResumeData, CustomSection, Experience, Education, Skill, Project } from "~/schemas/resume";

interface ResumeRendererProps {
	data: ResumeData;
}

/**
 * Smart inline formatter: 
 * If a list of strings is short enough, render as a horizontal line.
 */
function SmartList({ items, className }: { items: string[], className?: string }) {
	const totalLength = items.join("").length;
	const isShort = items.length > 2 && totalLength < 100;

	if (isShort) {
		return (
			<p className={clsx("text-xs leading-relaxed", className)}>
				{items.join(" • ")}
			</p>
		);
	}

	return (
		<ul className={clsx("list-disc ml-4 space-y-1", className)}>
			{items.map((item, idx) => (
				<li key={idx} className="text-xs leading-relaxed">
					{item}
				</li>
			))}
		</ul>
	);
}

export function ResumeRenderer({ data }: ResumeRendererProps) {
	const { personalInfo, experience, education, skills, projects, customSections, design } = data;

	const renderSection = (id: string) => {
		switch (id) {
			case "experience":
				return experience.length > 0 && (
					<section key="experience" className="space-y-4">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3">Experience</h2>
						<div className="space-y-5">
							{experience.map((exp) => (
								<div key={exp.id}>
									<div className="flex justify-between font-bold text-sm">
										<span>{exp.company}</span>
										<span>{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
									</div>
									<div className="flex justify-between italic text-sm mb-1 text-slate-700 font-medium">
										<span>{exp.position}</span>
										<span>{exp.location}</span>
									</div>
									<SmartList items={exp.description} />
								</div>
							))}
						</div>
					</section>
				);
			case "education":
				return education.length > 0 && (
					<section key="education" className="space-y-3">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3">Education</h2>
						{education.map((edu) => (
							<div key={edu.id}>
								<div className="flex justify-between font-bold text-sm">
									<span>{edu.school}</span>
									<span>{edu.endDate}</span>
								</div>
								<div className="flex justify-between italic text-sm text-slate-700 font-medium">
									<span>{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}</span>
									<span>{edu.location}</span>
								</div>
							</div>
						))}
					</section>
				);
			case "skills":
				return skills.length > 0 && (
					<section key="skills">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-2">Skills</h2>
						<div className="text-xs leading-relaxed">
							{skills.map(s => s.name).join(" • ")}
						</div>
					</section>
				);
			case "projects":
				return projects.length > 0 && (
					<section key="projects" className="space-y-3">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-2">Projects</h2>
						{projects.map((p) => (
							<div key={p.id}>
								<div className="flex justify-between font-bold text-sm">
									<span>{p.name}</span>
									<span>{p.endDate}</span>
								</div>
								<SmartList items={p.description} />
							</div>
						))}
					</section>
				);
			default:
				// Check custom sections
				const customSection = customSections.find(s => s.id === id || s.title.toLowerCase() === id.toLowerCase());
				if (customSection) {
					return (
						<section key={customSection.id} className="space-y-3">
							<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3">{customSection.title}</h2>
							{customSection.items.map((item) => (
								<div key={item.id}>
									<div className="flex justify-between font-bold text-sm">
										<span>{item.title}</span>
										{item.date && <span>{item.date}</span>}
									</div>
									{item.subtitle && <div className="italic text-xs text-slate-700">{item.subtitle}</div>}
									<SmartList items={item.description} />
								</div>
							))}
						</section>
					);
				}
				return null;
		}
	};

	const isSidebar = design.template === "sidebar";

	return (
		<div className={clsx(
			"flex flex-col gap-6 p-8 text-slate-900 h-full",
			design.theme.fontSize === "small" ? "text-[11px]" : design.theme.fontSize === "large" ? "text-base" : "text-sm"
		)}>
			{/* Header */}
			<div className="flex flex-col items-center gap-1 text-center border-b pb-4 border-slate-200">
				<h1 className="text-2xl font-bold uppercase tracking-tight">
					{personalInfo.fullName || "Your Name"}
				</h1>
				<div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-slate-600">
					{personalInfo.email && <span>{personalInfo.email}</span>}
					{personalInfo.phone && <span>{personalInfo.phone}</span>}
					{personalInfo.location && <span>{personalInfo.location}</span>}
				</div>
			</div>

			{/* Summary */}
			{personalInfo.summary && (
				<section>
					<p className="text-sm leading-relaxed text-center italic px-4">
						{personalInfo.summary}
					</p>
				</section>
			)}

			{/* Main Content Area */}
			<div className={clsx(
				"grid gap-8",
				isSidebar ? "grid-cols-[2fr_1fr]" : "grid-cols-1"
			)}>
				<div className="space-y-8">
					{(design.layout.mainSections.length > 0 ? design.layout.mainSections : ["experience", "education", "projects"])
						.map(id => renderSection(id))}
				</div>

				{isSidebar && (
					<div className="space-y-8 border-l pl-8 border-slate-100">
						{(design.layout.sidebarSections.length > 0 ? design.layout.sidebarSections : ["skills"])
							.map(id => renderSection(id))}
					</div>
				)}
			</div>
		</div>
	);
}
