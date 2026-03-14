"use client";

import {
	Briefcase,
	Check,
	Code,
	FileText,
	GraduationCap,
	LayoutGrid,
	User,
	X,
} from "lucide-react";
import type { ResumeData } from "~/schemas/resume";

interface ParsedDataReviewProps {
	data: ResumeData;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ParsedDataReview({
	data,
	onConfirm,
	onCancel,
}: ParsedDataReviewProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="zoom-in-95 flex max-h-[90vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
				{/* Header */}
				<header className="flex items-center justify-between border-b bg-slate-50 p-6">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-blue-100 p-2 text-blue-600">
							<FileText className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-bold text-slate-900 text-xl">
								Review Extracted Data
							</h2>
							<p className="text-slate-500 text-sm">
								AI has parsed your resume. Verify the details before applying.
							</p>
						</div>
					</div>
					<button
						className="rounded-full p-2 transition-colors hover:bg-slate-200"
						onClick={onCancel}
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 space-y-8 overflow-y-auto p-6">
					{/* Personal Info */}
					<section className="space-y-4">
						<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
							<User className="h-4 w-4" />
							Personal Information
						</div>
						<div className="grid grid-cols-1 gap-4 rounded-xl border bg-slate-50/50 p-4 md:grid-cols-2">
							<div>
								<span className="mb-1 block font-bold text-[10px] text-slate-400 uppercase">
									Full Name
								</span>
								<p className="font-medium text-slate-900 text-sm">
									{data.personalInfo.fullName || "—"}
								</p>
							</div>
							<div>
								<span className="mb-1 block font-bold text-[10px] text-slate-400 uppercase">
									Email
								</span>
								<p className="font-medium text-slate-900 text-sm">
									{data.personalInfo.email || "—"}
								</p>
							</div>
							{data.personalInfo.summary && (
								<div className="mt-2 md:col-span-2">
									<span className="mb-1 block font-bold text-[10px] text-slate-400 uppercase">
										Summary
									</span>
									<p className="text-slate-700 text-sm italic leading-relaxed">
										"{data.personalInfo.summary}"
									</p>
								</div>
							)}
						</div>
					</section>

					{/* Experience */}
					<section className="space-y-4">
						<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
							<Briefcase className="h-4 w-4" />
							Work Experience ({data.experience.length})
						</div>
						<div className="space-y-3">
							{data.experience.map((exp, idx) => (
								<div
									className="rounded-xl border p-4 transition-colors hover:border-blue-200"
									key={idx}
								>
									<div className="mb-2 flex items-start justify-between">
										<div>
											<p className="font-bold text-slate-900">{exp.position}</p>
											<p className="font-medium text-slate-600 text-xs">
												{exp.company}
											</p>
										</div>
										<span className="font-bold text-[10px] text-slate-400 uppercase">
											{exp.startDate} - {exp.current ? "Present" : exp.endDate}
										</span>
									</div>
									<ul className="ml-4 list-disc space-y-1">
										{exp.description.slice(0, 2).map((bullet, bIdx) => (
											<li
												className="line-clamp-1 text-slate-600 text-xs"
												key={bIdx}
											>
												{bullet}
											</li>
										))}
										{exp.description.length > 2 && (
											<li className="text-[10px] text-slate-400 italic">
												+{exp.description.length - 2} more bullets
											</li>
										)}
									</ul>
								</div>
							))}
						</div>
					</section>

					{/* Custom Sections */}
					{data.customSections.length > 0 && (
						<section className="space-y-4">
							<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
								<LayoutGrid className="h-4 w-4" />
								Other Sections ({data.customSections.length})
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								{data.customSections.map((section, idx) => (
									<div
										className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
										key={idx}
									>
										<p className="mb-2 font-bold text-indigo-900 text-xs uppercase">
											{section.title}
										</p>
										<div className="space-y-2">
											{section.items.map((item, iIdx) => (
												<div className="text-indigo-800 text-xs" key={iIdx}>
													• <span className="font-bold">{item.title}</span>
													{item.subtitle && (
														<span className="opacity-70">
															{" "}
															— {item.subtitle}
														</span>
													)}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						{/* Education */}
						<section className="space-y-4">
							<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
								<GraduationCap className="h-4 w-4" />
								Education ({data.education.length})
							</div>
							<div className="space-y-2">
								{data.education.map((edu, idx) => (
									<div className="rounded-xl border p-3" key={idx}>
										<p className="font-bold text-slate-900 text-xs">
											{edu.degree}
										</p>
										<p className="text-[10px] text-slate-500 uppercase">
											{edu.school}
										</p>
									</div>
								))}
							</div>
						</section>

						{/* Skills */}
						<section className="space-y-4">
							<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
								<Code className="h-4 w-4" />
								Skills ({data.skills.length})
							</div>
							<div className="flex flex-wrap gap-2">
								{data.skills.map((skill, idx) => (
									<span
										className="rounded-md bg-slate-100 px-2 py-1 font-bold text-[10px] text-slate-600 uppercase"
										key={idx}
									>
										{skill.name}
									</span>
								))}
							</div>
						</section>
					</div>
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t bg-slate-50 p-6">
					<button
						className="rounded-lg border bg-white px-6 py-2.5 font-semibold text-slate-700 text-sm transition-all hover:bg-slate-50"
						onClick={onCancel}
					>
						Discard Extraction
					</button>
					<button
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 font-semibold text-sm text-white shadow-blue-500/20 shadow-lg transition-all hover:bg-blue-700 active:scale-95"
						onClick={onConfirm}
					>
						<Check className="h-4 w-4" />
						Apply to Resume
					</button>
				</footer>
			</div>
		</div>
	);
}
