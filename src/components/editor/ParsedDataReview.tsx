"use client";

import type { ResumeData } from "~/schemas/resume";
import { Check, X, FileText, User, Briefcase, GraduationCap, Code, LayoutGrid } from "lucide-react";

interface ParsedDataReviewProps {
	data: ResumeData;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ParsedDataReview({ data, onConfirm, onCancel }: ParsedDataReviewProps) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
				{/* Header */}
				<header className="flex items-center justify-between border-b p-6 bg-slate-50">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-blue-100 p-2 text-blue-600">
							<FileText className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-bold text-xl text-slate-900">Review Extracted Data</h2>
							<p className="text-sm text-slate-500">AI has parsed your resume. Verify the details before applying.</p>
						</div>
					</div>
					<button onClick={onCancel} className="rounded-full p-2 hover:bg-slate-200 transition-colors">
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{/* Personal Info */}
					<section className="space-y-4">
						<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
							<User className="h-4 w-4" />
							Personal Information
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border p-4 bg-slate-50/50">
							<div>
								<span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</span>
								<p className="text-sm font-medium text-slate-900">{data.personalInfo.fullName || "—"}</p>
							</div>
							<div>
								<span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email</span>
								<p className="text-sm font-medium text-slate-900">{data.personalInfo.email || "—"}</p>
							</div>
							{data.personalInfo.summary && (
								<div className="md:col-span-2 mt-2">
									<span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Summary</span>
									<p className="text-sm text-slate-700 leading-relaxed italic">"{data.personalInfo.summary}"</p>
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
								<div key={idx} className="rounded-xl border p-4 hover:border-blue-200 transition-colors">
									<div className="flex justify-between items-start mb-2">
										<div>
											<p className="font-bold text-slate-900">{exp.position}</p>
											<p className="text-xs text-slate-600 font-medium">{exp.company}</p>
										</div>
										<span className="text-[10px] font-bold text-slate-400 uppercase">{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
									</div>
									<ul className="list-disc ml-4 space-y-1">
										{exp.description.slice(0, 2).map((bullet, bIdx) => (
											<li key={bIdx} className="text-xs text-slate-600 line-clamp-1">{bullet}</li>
										))}
										{exp.description.length > 2 && <li className="text-[10px] text-slate-400 italic">+{exp.description.length - 2} more bullets</li>}
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
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{data.customSections.map((section, idx) => (
									<div key={idx} className="rounded-xl border p-4 bg-indigo-50/30 border-indigo-100">
										<p className="font-bold text-indigo-900 text-xs uppercase mb-2">{section.title}</p>
										<div className="space-y-2">
											{section.items.map((item, iIdx) => (
												<div key={iIdx} className="text-xs text-indigo-800">
													• <span className="font-bold">{item.title}</span>
													{item.subtitle && <span className="opacity-70"> — {item.subtitle}</span>}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
						</section>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						{/* Education */}
						<section className="space-y-4">
							<div className="flex items-center gap-2 font-bold text-slate-800 text-sm uppercase tracking-wider">
								<GraduationCap className="h-4 w-4" />
								Education ({data.education.length})
							</div>
							<div className="space-y-2">
								{data.education.map((edu, idx) => (
									<div key={idx} className="rounded-xl border p-3">
										<p className="font-bold text-slate-900 text-xs">{edu.degree}</p>
										<p className="text-[10px] text-slate-500 uppercase">{edu.school}</p>
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
									<span key={idx} className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-600 uppercase">
										{skill.name}
									</span>
								))}
							</div>
						</section>
					</div>
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t p-6 bg-slate-50">
					<button
						onClick={onCancel}
						className="rounded-lg border bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
					>
						Discard Extraction
					</button>
					<button
						onClick={onConfirm}
						className="flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
					>
						<Check className="h-4 w-4" />
						Apply to Resume
					</button>
				</footer>
			</div>
		</div>
	);
}
