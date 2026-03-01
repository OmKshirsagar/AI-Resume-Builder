"use client";

import type { ResumeData } from "~/schemas/resume";
import { Check, X, AlertCircle, Briefcase, GraduationCap, Code, FileText } from "lucide-react";

interface ParsedDataReviewProps {
	data: ResumeData;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ParsedDataReview({ data, onConfirm, onCancel }: ParsedDataReviewProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
				{/* Header */}
				<header className="flex items-center justify-between border-b p-6 bg-slate-50">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-blue-100 p-2">
							<FileText className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h2 className="font-bold text-xl text-slate-900">Review Extracted Data</h2>
							<p className="text-sm text-slate-500">We've parsed your resume. Please verify the details before applying.</p>
						</div>
					</div>
					<button 
						onClick={onCancel}
						className="rounded-full p-2 hover:bg-slate-200 transition-colors"
						aria-label="Close"
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{/* Personal Info */}
					<section className="space-y-4">
						<div className="flex items-center gap-2 border-b pb-2">
							<div className="h-2 w-2 rounded-full bg-blue-500" />
							<h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Personal Information</h3>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
							<div>
								<span className="block font-medium text-slate-500 text-[10px] uppercase">Full Name</span>
								<p className="text-slate-900">{data.personalInfo.fullName || "—"}</p>
							</div>
							<div>
								<span className="block font-medium text-slate-500 text-[10px] uppercase">Email</span>
								<p className="text-slate-900">{data.personalInfo.email || "—"}</p>
							</div>
							<div>
								<span className="block font-medium text-slate-500 text-[10px] uppercase">Phone</span>
								<p className="text-slate-900">{data.personalInfo.phone || "—"}</p>
							</div>
							<div>
								<span className="block font-medium text-slate-500 text-[10px] uppercase">Location</span>
								<p className="text-slate-900">{data.personalInfo.location || "—"}</p>
							</div>
						</div>
						{data.personalInfo.summary && (
							<div className="mt-2">
								<span className="block font-medium text-slate-500 text-[10px] uppercase">Professional Summary</span>
								<p className="text-slate-700 text-sm italic">"{data.personalInfo.summary}"</p>
							</div>
						)}
					</section>

					{/* Experience */}
					{data.experience.length > 0 && (
						<section className="space-y-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Briefcase className="h-4 w-4 text-slate-500" />
								<h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Experience</h3>
							</div>
							<div className="space-y-4">
								{data.experience.map((exp) => (
									<div key={exp.id} className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">
										<div className="flex justify-between items-start">
											<div>
												<p className="font-bold text-slate-900">{exp.position}</p>
												<p className="text-sm font-medium text-slate-600">{exp.company}</p>
											</div>
											<div className="text-right text-[10px] font-medium text-slate-500 uppercase">
												{exp.startDate} — {exp.current ? "Present" : exp.endDate}
											</div>
										</div>
										{exp.description.length > 0 && (
											<ul className="mt-2 list-disc list-inside space-y-1">
												{exp.description.slice(0, 2).map((item, idx) => (
													<li key={idx} className="text-xs text-slate-600 line-clamp-1">{item}</li>
												))}
												{exp.description.length > 2 && (
													<li className="text-xs text-slate-400">... and {exp.description.length - 2} more points</li>
												)}
											</ul>
										)}
									</div>
								))}
							</div>
						</section>
					)}

					{/* Education */}
					{data.education.length > 0 && (
						<section className="space-y-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<GraduationCap className="h-4 w-4 text-slate-500" />
								<h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Education</h3>
							</div>
							<div className="space-y-3">
								{data.education.map((edu) => (
									<div key={edu.id} className="flex justify-between items-start p-2">
										<div>
											<p className="font-bold text-slate-900 text-sm">{edu.degree}</p>
											<p className="text-xs text-slate-600">{edu.school}</p>
										</div>
										<div className="text-[10px] font-medium text-slate-500 uppercase">
											{edu.endDate}
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					{/* Skills */}
					{data.skills.length > 0 && (
						<section className="space-y-4">
							<div className="flex items-center gap-2 border-b pb-2">
								<Code className="h-4 w-4 text-slate-500" />
								<h3 className="font-semibold text-slate-800 uppercase tracking-wider text-xs">Skills</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{data.skills.map((skill) => (
									<span key={skill.id} className="rounded bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 border border-blue-100">
										{skill.name}
										{skill.level && <span className="ml-1 opacity-60">({skill.level})</span>}
									</span>
								))}
							</div>
						</section>
					)}

					<div className="rounded-xl bg-amber-50 p-4 flex gap-3 border border-amber-100">
						<AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
						<p className="text-xs text-amber-800">
							<strong>Note:</strong> Applying this data will <strong>overwrite</strong> your current resume content. This action cannot be undone.
						</p>
					</div>
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-end gap-3 border-t p-6 bg-slate-50">
					<button
						onClick={onCancel}
						className="rounded-lg border bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
					>
						<Check className="h-4 w-4" />
						Apply Extracted Data
					</button>
				</footer>
			</div>
		</div>
	);
}
