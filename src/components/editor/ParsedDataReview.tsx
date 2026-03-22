"use client";

import { Check, X } from "lucide-react";
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
		<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-300">
			<div className="zoom-in-95 flex max-h-[90vh] w-full max-w-5xl animate-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-300">
				{/* Header */}
				<header className="flex items-center justify-between border-b bg-slate-50/50 p-6">
					<div className="flex items-center gap-4">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-blue-200 shadow-xl">
							<Check className="h-6 w-6" />
						</div>
						<div>
							<h2 className="font-bold text-slate-900 text-xl tracking-tight">
								Review Extracted Data
							</h2>
							<p className="font-medium text-slate-500 text-xs uppercase tracking-wider">
								Verify the information AI found in your resume
							</p>
						</div>
					</div>
					<button
						className="rounded-full p-2 transition-colors hover:bg-slate-200"
						onClick={onCancel}
						type="button"
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{/* Left Column: Personal & Experience */}
						<div className="space-y-8">
							<section>
								<div className="mb-4 flex items-center gap-2 border-b pb-2">
									<h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
										Personal Information
									</h3>
								</div>
								<div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4">
									<div>
										<p className="font-bold text-[10px] text-slate-400 uppercase">
											Full Name
										</p>
										<p className="font-semibold text-slate-700 text-sm">
											{data.personalInfo.fullName}
										</p>
									</div>
									<div>
										<p className="font-bold text-[10px] text-slate-400 uppercase">
											Email
										</p>
										<p className="font-semibold text-slate-700 text-sm">
											{data.personalInfo.email}
										</p>
									</div>
								</div>
							</section>

							<section>
								<div className="mb-4 flex items-center gap-2 border-b pb-2">
									<h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
										Experience
									</h3>
									<span className="rounded-full bg-slate-100 px-2 py-0.5 font-bold text-[10px] text-slate-500">
										{data.experience.length} Entries
									</span>
								</div>
								<div className="space-y-3">
									{data.experience.map((exp) => (
										<div
											className="rounded-xl border p-4 transition-colors hover:border-blue-200"
											key={exp.id || exp.company + exp.position}
										>
											<div className="mb-2 flex items-start justify-between">
												<div>
													<p className="font-bold text-slate-900 text-sm">
														{exp.company}
													</p>
													<p className="font-medium text-slate-500 text-xs">
														{exp.position}
													</p>
												</div>
												<span className="rounded-lg bg-slate-50 px-2 py-1 font-bold text-[10px] text-slate-400 uppercase">
													{exp.startDate} -{" "}
													{exp.current ? "Present" : exp.endDate}
												</span>
											</div>
											<div className="mb-2">
												<p className="text-slate-400 text-xs italic">
													{exp.location}
												</p>
											</div>
											<ul className="ml-4 list-disc space-y-1">
												{exp.description.slice(0, 2).map((bullet, bIdx) => (
													<li
														className="line-clamp-1 text-slate-600 text-xs"
														// biome-ignore lint/suspicious/noArrayIndexKey: using hash for stability
														key={`${exp.id || exp.company}-bullet-${bIdx}-${bullet.slice(0, 5)}`}
													>
														{bullet}
													</li>
												))}
											</ul>
										</div>
									))}
								</div>
							</section>
						</div>

						{/* Right Column: Custom, Education, Skills */}
						<div className="space-y-8">
							{data.customSections.length > 0 && (
								<section>
									<div className="mb-4 flex items-center gap-2 border-b pb-2">
										<h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
											Custom Sections
										</h3>
									</div>
									<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
										{data.customSections.map((section) => (
											<div
												className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4"
												key={section.id || section.title}
											>
												<p className="mb-2 font-bold text-indigo-900 text-xs uppercase">
													{section.title}
												</p>
												<div className="space-y-2">
													{section.items.map((item, iIdx) => (
														<div
															className="text-indigo-800 text-xs"
															// biome-ignore lint/suspicious/noArrayIndexKey: using index for grouping
															key={item.id || `${section.title}-item-${iIdx}`}
														>
															• <span className="font-bold">{item.title}</span>
															{item.subtitle && (
																<span className="opacity-60">
																	{" "}
																	| {item.subtitle}
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

							<section>
								<div className="mb-4 flex items-center gap-2 border-b pb-2">
									<h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
										Education
									</h3>
								</div>
								<div className="space-y-2">
									{data.education.map((edu) => (
										<div
											className="rounded-xl border p-3"
											key={edu.id || edu.school + edu.degree}
										>
											<p className="font-bold text-slate-900 text-xs">
												{edu.degree}
											</p>
											<p className="text-slate-500 text-xs">{edu.school}</p>
										</div>
									))}
								</div>
							</section>

							<section>
								<div className="mb-4 flex items-center gap-2 border-b pb-2">
									<h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
										Skills Extracted
									</h3>
								</div>
								<div className="flex flex-wrap gap-2">
									{data.skills.map((skill) => (
										<span
											className="rounded-md bg-slate-100 px-2 py-1 font-bold text-[10px] text-slate-600 uppercase"
											key={skill.id || skill.name}
										>
											{skill.name}
										</span>
									))}
								</div>
							</section>
						</div>
					</div>
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t bg-slate-50 p-6">
					<button
						className="rounded-lg border bg-white px-6 py-2.5 font-semibold text-slate-700 text-sm transition-all hover:bg-slate-50"
						onClick={onCancel}
						type="button"
					>
						Discard Extraction
					</button>
					<button
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 font-semibold text-sm text-white shadow-blue-500/20 shadow-lg transition-all hover:bg-blue-700 active:scale-95"
						onClick={onConfirm}
						type="button"
					>
						<Check className="h-4 w-4" />
						Apply to Resume
					</button>
				</footer>
			</div>
		</div>
	);
}
