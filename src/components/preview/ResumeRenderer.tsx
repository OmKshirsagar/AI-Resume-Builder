"use client";

import { clsx } from "clsx";
import type { ResumeData } from "~/schemas/resume";

interface ResumeRendererProps {
	data: ResumeData;
}

/**
 * Smart inline formatter:
 * If a list of strings is short enough, render as a horizontal line.
 */
function SmartList({
	items,
	className,
}: {
	items: string[];
	className?: string;
}) {
	if (!items || items.length === 0) return null;

	const totalLength = items.join("").length;
	const isShort = items.length > 2 && totalLength < 100;

	if (isShort) {
		return (
			<p className={clsx("text-slate-700 text-xs leading-relaxed", className)}>
				{items.join(" • ")}
			</p>
		);
	}

	return (
		<ul className={clsx("ml-4 list-disc space-y-0.5", className)}>
			{items.map((item, idx) => (
				<li
					className="text-slate-800 text-xs leading-tight"
					// biome-ignore lint/suspicious/noArrayIndexKey: using content snippet for stability
					key={`${item.slice(0, 10)}-${idx}`}
				>
					{item}
				</li>
			))}
		</ul>
	);
}

export function ResumeRenderer({ data }: ResumeRendererProps) {
	const {
		personalInfo,
		experience = [],
		education = [],
		skills = [],
		projects = [],
		customSections = [],
		design,
	} = data;

	const inlineSections = design?.layout?.inlineSections || [];
	const lineHeight = design?.theme?.lineHeight || "relaxed";

	const isInline = (id: string) => {
		return inlineSections.some((s) => s.toLowerCase() === id.toLowerCase());
	};

	const renderSection = (id: string) => {
		switch (id) {
			case "experience":
				return (
					experience.length > 0 && (
						<section className="space-y-3" key="experience">
							<h2 className="mb-2 border-slate-900 border-b pb-0.5 font-bold text-[10px] uppercase tracking-wider">
								Experience
							</h2>
							<div className="space-y-4">
								{experience.map((exp) => (
									<div className="space-y-1" key={exp.id}>
										<div className="flex justify-between font-bold text-slate-900 text-sm">
											<span>{exp.company}</span>
											<span className="ml-4 shrink-0 text-xs">
												{exp.startDate} —{" "}
												{exp.current ? "Present" : exp.endDate}
											</span>
										</div>
										<div className="flex justify-between font-medium text-slate-700 text-xs italic">
											<span>{exp.position}</span>
											<span>{exp.location}</span>
										</div>
										<SmartList
											className={clsx(
												lineHeight === "tight"
													? "leading-tight"
													: "leading-relaxed",
											)}
											items={exp.description}
										/>
									</div>
								))}
							</div>
						</section>
					)
				);
			case "education":
				return (
					education.length > 0 && (
						<section className="space-y-1.5" key="education">
							<h2 className="mb-1.5 border-slate-900 border-b pb-0.5 font-bold text-[10px] uppercase tracking-wider">
								Education
							</h2>
							{education.map((edu) => (
								<div className="mb-1.5 block" key={edu.id}>
									<div className="flex justify-between gap-4 font-bold text-slate-900 text-xs">
										<span>{edu.school}</span>
										<span className="shrink-0 text-[10px]">{edu.endDate}</span>
									</div>
									<div className="text-[10px] text-slate-700 italic">
										{edu.degree}
										{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
									</div>
								</div>
							))}
						</section>
					)
				);
			case "skills":
				return (
					skills.length > 0 && (
						<section key="skills">
							<h2 className="mb-1.5 border-slate-900 border-b pb-0.5 font-bold text-[10px] uppercase tracking-wider">
								Skills
							</h2>
							<div className="text-[10px] text-slate-800 leading-snug">
								{skills.map((s) => s.name).join(" • ")}
							</div>
						</section>
					)
				);
			case "projects":
				return (
					projects.length > 0 && (
						<section className="space-y-1.5" key="projects">
							<h2 className="mb-1.5 border-slate-900 border-b pb-0.5 font-bold text-[10px] uppercase tracking-wider">
								Projects
							</h2>
							{projects.map((p) => (
								<div className="space-y-0.5" key={p.id}>
									<div className="flex justify-between font-bold text-slate-900 text-xs">
										<span>{p.name}</span>
										<span className="text-[10px]">{p.endDate}</span>
									</div>
									<SmartList
										className={clsx(
											lineHeight === "tight"
												? "leading-tight"
												: "leading-relaxed",
										)}
										items={p.description}
									/>
								</div>
							))}
						</section>
					)
				);
			default: {
				const customSection = customSections.find(
					(s) => s.id === id || s.title.toLowerCase() === id.toLowerCase(),
				);
				if (customSection) {
					const useInline = isInline(id) || isInline(customSection.title);

					return (
						<section className="space-y-1.5" key={customSection.id}>
							<h2 className="mb-1.5 border-slate-900 border-b pb-0.5 font-bold text-[10px] uppercase tracking-wider">
								{customSection.title}
							</h2>
							{useInline ? (
								<p className="text-[10px] text-slate-800 leading-snug">
									{customSection.items
										.map((item) => {
											return [item.title, item.subtitle, item.date]
												.filter(Boolean)
												.join(", ");
										})
										.join(" • ")}
								</p>
							) : (
								<div className="space-y-2">
									{customSection.items.map((item) => (
										<div className="space-y-0.5" key={item.id}>
											<div className="flex justify-between font-bold text-slate-900 text-xs">
												<span>{item.title}</span>
												<span className="ml-2 shrink-0 text-[10px]">
													{item.date}
												</span>
											</div>
											{item.subtitle && (
												<div className="text-[10px] text-slate-700 italic">
													{item.subtitle}
												</div>
											)}
											<SmartList
												className={clsx(
													lineHeight === "tight"
														? "leading-tight"
														: "leading-relaxed",
												)}
												items={item.description}
											/>
										</div>
									))}
								</div>
							)}
						</section>
					);
				}
				return null;
			}
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
		...customSections.map((s) => s.id),
	];

	const mappedSections = new Set([...mainSections, ...sidebarSections]);
	const unmappedSections = allPossibleSections.filter(
		(id) => !mappedSections.has(id),
	);

	const finalMain =
		mainSections.length > 0
			? [...mainSections, ...unmappedSections]
			: allPossibleSections;
	const finalSidebar = sidebarSections;

	return (
		<div
			className={clsx(
				"flex h-full w-full flex-col gap-4 bg-white p-10 font-sans text-slate-900",
				fontSize === "small"
					? "text-[11px]"
					: fontSize === "large"
						? "text-base"
						: "text-sm",
				lineHeight === "tight" ? "leading-tight" : "leading-relaxed",
			)}
		>
			{/* Header */}
			<div className="flex flex-col items-center gap-0.5 border-slate-100 border-b pb-2 text-center">
				<h1 className="mb-1 font-black text-3xl text-slate-900 uppercase leading-none tracking-tighter">
					{personalInfo?.fullName || "Your Name"}
				</h1>
				<div className="flex flex-wrap justify-center gap-x-4 gap-y-0.5 font-bold text-[10px] text-slate-600 uppercase tracking-widest">
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
					<p className="px-12 text-center font-medium text-[11px] text-slate-700 italic leading-normal">
						{personalInfo.summary}
					</p>
				</section>
			)}

			{/* Layout Engine */}
			<div
				className={clsx(
					"grid flex-1 items-start gap-8",
					isSidebar ? "grid-cols-[1.8fr_1fr]" : "grid-cols-1",
				)}
			>
				<div className="space-y-6">
					{finalMain.map((id) => renderSection(id))}
				</div>

				{isSidebar && (
					<div className="h-full min-h-[600px] space-y-6 border-slate-100 border-l pl-8">
						{finalSidebar.map((id) => renderSection(id))}
					</div>
				)}
			</div>
		</div>
	);
}
