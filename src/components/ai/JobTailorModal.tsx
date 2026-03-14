"use client";

import { readStreamableValue } from "@ai-sdk/rsc";
import { clsx } from "clsx";
import {
	AlertCircle,
	Briefcase,
	Check,
	Loader2,
	MessageSquare,
	Wand2,
	X,
} from "lucide-react";
import { useState } from "react";
import { type TailorSuggestions, tailorResume } from "~/app/actions/tailor";
import type { Experience } from "~/schemas/resume";
import { useResumeStore } from "~/store/useResumeStore";

interface JobTailorModalProps {
	onClose: () => void;
}

export function JobTailorModal({ onClose }: JobTailorModalProps) {
	const {
		original: resumeData,
		updatePersonalInfo,
		updateExperience,
	} = useResumeStore();
	const [jobDescription, setJobDescription] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [suggestions, setSuggestions] =
		useState<Partial<TailorSuggestions> | null>(null);
	const [selectedChanges, setSelectedChanges] = useState<{
		summary: boolean;
		experience: Record<number, boolean>;
	}>({
		summary: true,
		experience: {},
	});

	const handleTailor = async () => {
		if (!jobDescription.trim()) return;

		setIsAnalyzing(true);
		setSuggestions(null);

		try {
			const { output } = await tailorResume(resumeData, jobDescription);

			for await (const partialObject of readStreamableValue(output)) {
				const obj = partialObject as any;
				if (obj) {
					setSuggestions(obj);
					// Initialize selection for new experience changes
					if (obj.experienceChanges) {
						setSelectedChanges((prev) => ({
							...prev,
							experience: (obj.experienceChanges as any[]).reduce<
								Record<number, boolean>
							>(
								(acc, _, idx) => ({
									...acc,
									[idx]: prev.experience[idx] ?? true,
								}),
								{},
							),
						}));
					}
				}
			}
		} catch (error) {
			console.error("Tailoring failed:", error);
		} finally {
			setIsAnalyzing(false);
		}
	};

	const handleApply = () => {
		if (!suggestions) return;

		// Apply summary if selected
		if (selectedChanges.summary && suggestions.summary) {
			updatePersonalInfo({ summary: suggestions.summary });
		}

		// Apply selected experience changes
		if (suggestions.experienceChanges) {
			suggestions.experienceChanges.forEach((change, idx) => {
				if (change && selectedChanges.experience[idx]) {
					const experienceEntry = resumeData.experience.find(
						(e: Experience) => e.id === change.experienceId,
					);
					if (experienceEntry) {
						const newDescription = [...experienceEntry.description];
						newDescription[change.bulletIndex] = change.newBullet;
						updateExperience(change.experienceId, {
							description: newDescription,
						});
					}
				}
			});
		}

		onClose();
	};

	const toggleExperience = (idx: number) => {
		setSelectedChanges((prev) => ({
			...prev,
			experience: {
				...prev.experience,
				[idx]: !prev.experience[idx],
			},
		}));
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
				{/* Header */}
				<header className="flex items-center justify-between border-b bg-slate-50 p-6">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
							<Wand2 className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-bold text-slate-900 text-xl">
								Tailor Resume for Job
							</h2>
							<p className="text-slate-500 text-sm">
								Align your experience with a specific job description.
							</p>
						</div>
					</div>
					<button
						className="rounded-full p-2 transition-colors hover:bg-slate-200"
						onClick={onClose}
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 space-y-8 overflow-y-auto p-6">
					{!suggestions && !isAnalyzing ? (
						<div className="space-y-4">
							<label className="block font-semibold text-slate-800 text-sm">
								Job Description
							</label>
							<textarea
								className="min-h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
								onChange={(e) => setJobDescription(e.target.value)}
								placeholder="Paste the job description here..."
								value={jobDescription}
							/>
							<div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4">
								<MessageSquare className="h-5 w-5 shrink-0 text-blue-600" />
								<p className="text-blue-800 text-xs leading-relaxed">
									AI will analyze the JD to find key requirements and suggest
									improvements to your summary and experience bullets using the
									X-Y-Z formula.
								</p>
							</div>
						</div>
					) : (
						<div className="fade-in animate-in space-y-8 duration-500">
							{/* Summary Suggestion */}
							{suggestions?.summary && (
								<section className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
											Professional Summary
										</h3>
										<button
											className={clsx(
												"flex items-center gap-1.5 rounded-full px-3 py-1 font-bold text-xs transition-all",
												selectedChanges.summary
													? "bg-green-100 text-green-700"
													: "bg-slate-100 text-slate-400",
											)}
											onClick={() =>
												setSelectedChanges((prev) => ({
													...prev,
													summary: !prev.summary,
												}))
											}
										>
											{selectedChanges.summary ? (
												<Check className="h-3 w-3" />
											) : (
												<X className="h-3 w-3" />
											)}
											{selectedChanges.summary ? "Included" : "Excluded"}
										</button>
									</div>
									<div className="space-y-3 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
										<div className="font-bold text-indigo-600 text-xs uppercase">
											Suggestion
										</div>
										<p className="text-slate-700 text-sm italic leading-relaxed">
											"{suggestions.summary}"
										</p>
									</div>
								</section>
							)}

							{/* Experience Changes */}
							<section className="space-y-4">
								<h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">
									Experience Enhancements
								</h3>
								<div className="space-y-6">
									{suggestions?.experienceChanges?.map((change, idx) => (
										<div
											className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:border-indigo-200"
											key={idx}
										>
											<div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
												<div className="flex items-center gap-2 font-bold text-[10px] text-slate-500 uppercase">
													<Briefcase className="h-3 w-3" />
													{
														resumeData.experience.find(
															(e: Experience) => e.id === change?.experienceId,
														)?.company
													}
												</div>
												<button
													className={clsx(
														"flex items-center gap-1 rounded px-2 py-0.5 font-bold text-[10px] uppercase transition-all",
														selectedChanges.experience[idx]
															? "bg-green-600 text-white"
															: "bg-slate-200 text-slate-500",
													)}
													onClick={() => toggleExperience(idx)}
												>
													{selectedChanges.experience[idx]
														? "Selected"
														: "Ignored"}
												</button>
											</div>
											<div className="space-y-4 p-4">
												<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
													<div className="space-y-1.5 opacity-50">
														<div className="font-bold text-[10px] text-slate-400 uppercase">
															Original
														</div>
														<p className="text-slate-600 text-xs">
															{change?.originalBullet}
														</p>
													</div>
													<div className="space-y-1.5">
														<div className="font-bold text-[10px] text-indigo-500 uppercase">
															AI Tailored
														</div>
														<p className="font-medium text-slate-900 text-xs leading-relaxed">
															{change?.newBullet}
														</p>
													</div>
												</div>
												{change?.reasoning && (
													<div className="flex gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-[10px] text-amber-800">
														<AlertCircle className="h-3 w-3 shrink-0" />
														<span>{change.reasoning}</span>
													</div>
												)}
											</div>
										</div>
									))}
									{isAnalyzing && (
										<div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-slate-100 border-dashed p-8">
											<Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
											<p className="animate-pulse font-medium text-slate-400 text-sm">
												Generating more suggestions...
											</p>
										</div>
									)}
								</div>
							</section>
						</div>
					)}
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t bg-slate-50 p-6">
					<div className="text-slate-400 text-xs italic">
						{isAnalyzing
							? "Analyzing Job Description..."
							: suggestions
								? "Review and apply changes"
								: "Ready to analyze"}
					</div>
					<div className="flex gap-3">
						<button
							className="rounded-lg border bg-white px-6 py-2.5 font-semibold text-slate-700 text-sm transition-all hover:bg-slate-50"
							onClick={onClose}
						>
							Cancel
						</button>
						{!suggestions ? (
							<button
								className="flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-2.5 font-semibold text-sm text-white shadow-indigo-500/20 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
								disabled={isAnalyzing || !jobDescription.trim()}
								onClick={handleTailor}
							>
								{isAnalyzing ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Wand2 className="h-4 w-4" />
								)}
								Analyze & Tailor
							</button>
						) : (
							<button
								className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-2.5 font-semibold text-sm text-white shadow-green-500/20 shadow-lg transition-all hover:bg-green-700 active:scale-95"
								disabled={isAnalyzing}
								onClick={handleApply}
							>
								<Check className="h-4 w-4" />
								Apply Selected Changes
							</button>
						)}
					</div>
				</footer>
			</div>
		</div>
	);
}
