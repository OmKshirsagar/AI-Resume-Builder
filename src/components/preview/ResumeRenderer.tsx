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
	if (!items || items.length === 0) return null;
	
	const totalLength = items.join("").length;
	const isShort = items.length > 2 && totalLength < 100;

	if (isShort) {
		return (
			<p className={clsx("text-xs leading-relaxed text-slate-700", className)}>
				{items.join(" • ")}
			</p>
		);
	}

	return (
		<ul className={clsx("list-disc ml-4 space-y-0.5", className)}>
			{items.map((item, idx) => (
				<li key={idx} className="text-xs leading-tight text-slate-800">
					{item}
				</li>
			))}
		</ul>
	);
}

export function ResumeRenderer({ data }: ResumeRendererProps) {
	const { personalInfo, experience = [], education = [], skills = [], projects = [], customSections = [], design } = data;

	const inlineSections = design?.layout?.inlineSections || [];
	const lineHeight = design?.theme?.lineHeight || "relaxed";

	const isInline = (id: string) => {
		return inlineSections.some(s => s.toLowerCase() === id.toLowerCase());
	};

	const renderSection = (id: string) => {
		switch (id) {
			case "experience":
				return experience.length > 0 && (
					<section key="experience" className="space-y-3">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-[10px] mb-2 pb-0.5">Experience</h2>
						<div className="space-y-4">
							{experience.map((exp) => (
								<div key={exp.id} className="space-y-1">
									<div className="flex justify-between font-bold text-sm text-slate-900">
										<span>{exp.company}</span>
										<span className="text-xs shrink-0 ml-4">{exp.startDate} — {exp.current ? "Present" : exp.endDate}</span>
									</div>
									<div className="flex justify-between italic text-xs text-slate-700 font-medium">
										<span>{exp.position}</span>
										<span>{exp.location}</span>
									</div>
									<SmartList items={exp.description} className={clsx(lineHeight === "tight" ? "leading-tight" : "leading-relaxed")} />
								</div>
							))}
						</div>
					</section>
				);
			case "education":
				return education.length > 0 && (
					<section key="education" className="space-y-1.5">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-[10px] mb-1.5 pb-0.5">Education</h2>
						{education.map((edu) => (
							<div key={edu.id} className="block mb-1.5">
								<div className="flex justify-between font-bold text-xs text-slate-900 gap-4">
									<span>{edu.school}</span>
									<span className="shrink-0 text-[10px]">{edu.endDate}</span>
								</div>
								<div className="italic text-[10px] text-slate-700">
									{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
								</div>
							</div>
						))}
					</section>
				);
			case "skills":
				return skills.length > 0 && (
					<section key="skills">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-[10px] mb-1.5 pb-0.5">Skills</h2>
						<div className="text-[10px] leading-snug text-slate-800">
							{skills.map(s => s.name).join(" • ")}
						</div>
					</section>
				);
			case "projects":
				return projects.length > 0 && (
					<section key="projects" className="space-y-1.5">
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-[10px] mb-1.5 pb-0.5">Projects</h2>
						{projects.map((p) => (
							<div key={p.id} className="space-y-0.5">
								<div className="flex justify-between font-bold text-xs text-slate-900">
									<span>{p.name}</span>
									<span className="text-[10px]">{p.endDate}</span>
								</div>
								<SmartList items={p.description} className={clsx(lineHeight === "tight" ? "leading-tight" : "leading-relaxed")} />
							</div>
						))}
					</section>
				);
			default:
				const customSection = customSections.find(s => s.id === id || s.title.toLowerCase() === id.toLowerCase());
				if (customSection) {
					const useInline = isInline(id) || isInline(customSection.title);
					
					return (
						<section key={customSection.id} className="space-y-1.5">
							<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-[10px] mb-1.5 pb-0.5">{customSection.title}</h2>
							{useInline ? (
								<p className="text-[10px] text-slate-800 leading-snug">
									{customSection.items.map(item => {
										return [item.title, item.subtitle, item.date].filter(Boolean).join(", ");
									}).join(" • ")}
								</p>
							) : (
								<div className="space-y-2">
									{customSection.items.map((item) => (
										<div key={item.id} className="space-y-0.5">
											<div className="flex justify-between font-bold text-xs text-slate-900">
												<span>{item.title}</span>
												<span className="text-[10px] shrink-0 ml-2">{item.date}</span>
											</div>
											{item.subtitle && <div className="italic text-[10px] text-slate-700">{item.subtitle}</div>}
											<SmartList items={item.description} className={clsx(lineHeight === "tight" ? "leading-tight" : "leading-relaxed")} />
										</div>
									))}
								</div>
							)}
						</section>
					);
				}
				return null;
		}
	};

	const template = design?.template || "classic";
	const isSidebar = template === "sidebar";
	const fontSize = design?.theme?.fontSize || "medium";
	
	const mainSections = design?.layout?.mainSections || [];
	const sidebarSections = design?.layout?.sidebarSections || [];

	const allPossibleSections = [
		"experience", 
		"education", 
		"skills", 
		"projects", 
		...customSections.map(s => s.id)
	];

	const mappedSections = new Set([...mainSections, ...sidebarSections]);
	const unmappedSections = allPossibleSections.filter(id => !mappedSections.has(id));

	const finalMain = mainSections.length > 0 ? [...mainSections, ...unmappedSections] : allPossibleSections;
	const finalSidebar = sidebarSections;

	return (
		<div className={clsx(
			"flex flex-col gap-4 p-10 text-slate-900 h-full w-full bg-white font-sans",
			fontSize === "small" ? "text-[11px]" : fontSize === "large" ? "text-base" : "text-sm",
			lineHeight === "tight" ? "leading-tight" : "leading-relaxed"
		)}>
			{/* Header */}
			<div className="flex flex-col items-center gap-0.5 text-center pb-2 border-b border-slate-100">
				<h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 leading-none mb-1">
					{personalInfo?.fullName || "Your Name"}
				</h1>
				<div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
					{personalInfo?.email && <span>{personalInfo.email}</span>}
					{personalInfo?.phone && (
						<>
							<span className="opacity-20">|</span>
							<span>{personalInfo.phone}</span>
						</>
					)}
					{personalInfo?.location && (
						<>
							<span className="opacity-20">|</span>
							<span>{personalInfo.location}</span>
						</>
					)}
				</div>
			</div>

			{/* Summary */}
			{personalInfo?.summary && (
				<section>
					<p className="text-[11px] leading-normal text-center italic px-12 text-slate-700 font-medium">
						{personalInfo.summary}
					</p>
				</section>
			)}

			{/* Layout Engine */}
			<div className={clsx(
				"grid gap-8 flex-1 items-start",
				isSidebar ? "grid-cols-[1.8fr_1fr]" : "grid-cols-1"
			)}>
				<div className="space-y-6">
					{finalMain.map(id => renderSection(id))}
				</div>

				{isSidebar && (
					<div className="space-y-6 border-l border-slate-100 pl-8 h-full min-h-[600px]">
						{finalSidebar.map(id => renderSection(id))}
					</div>
				)}
			</div>
		</div>
	);
}
