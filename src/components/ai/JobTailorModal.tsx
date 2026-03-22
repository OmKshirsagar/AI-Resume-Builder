"use client";

import { readStreamableValue } from "@ai-sdk/rsc";
import {
	AlertCircle,
	ArrowRight,
	BrainCircuit,
	Check,
	CheckCircle2,
	ChevronRight,
	Loader2,
	Sparkles,
	Wand2,
	X,
} from "lucide-react";
import { useState } from "react";
import { type TailorSuggestions, tailorResume } from "~/app/actions/tailor";
import { useResumeStore } from "~/store/useResumeStore";

interface JobTailorModalProps {
	onClose: () => void;
}

export function JobTailorModal({ onClose }: JobTailorModalProps) {
	const { original, updatePersonalInfo, updateExperience } = useResumeStore();
	const [jobDescription, setJobDescription] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [suggestions, setSuggestions] = useState<TailorSuggestions | null>(
		null,
	);
	const [appliedChanges, setAppliedChanges] = useState<{
		summary: boolean;
		experience: Record<number, boolean>;
	}>({
		summary: false,
		experience: {},
	});

	// Tracks which suggestions the user wants to apply
	const [selectedChanges, setSelectedChanges] = useState<{
		summary: boolean;
		experience: Record<number, boolean>;
	}>({
		summary: true,
		experience: {},
	});

	const handleAnalyze = async () => {
		if (!jobDescription.trim()) return;

		setIsAnalyzing(true);
		try {
			const { output } = await tailorResume(original, jobDescription);

			for await (const partialObject of readStreamableValue(output)) {
				// biome-ignore lint/suspicious/noExplicitAny: complex AI stream object
				const obj = partialObject as any;
				if (obj) {
					setSuggestions(obj);
					// Initialize selection state for new experiences
					if (obj.experienceChanges) {
						setSelectedChanges((prev) => ({
							...prev,
							// biome-ignore lint/suspicious/noExplicitAny: complex AI stream object
							experience: (obj.experienceChanges as any[]).reduce<
								Record<number, boolean>
							>(
								(acc, _, idx) => {
									acc[idx] = true;
									return acc;
								},
								{ ...prev.experience },
							),
						}));
					}
				}
			}
		} catch (error) {
			console.error(error);
			alert("Failed to analyze JD. Please try again.");
		} finally {
			setIsAnalyzing(false);
		}
	};

	const applySelected = () => {
		if (!suggestions) return;

		// 1. Apply Summary
		if (selectedChanges.summary && suggestions.summary) {
			updatePersonalInfo({ summary: suggestions.summary });
			setAppliedChanges((prev) => ({ ...prev, summary: true }));
		}

		// 2. Apply Experience Changes
		for (let idx = 0; idx < suggestions.experienceChanges.length; idx++) {
			const change = suggestions.experienceChanges[idx];
			if (change && selectedChanges.experience[idx]) {
				const exp = original.experience[change.experienceIndex];
				if (exp) {
					updateExperience(exp.id, { description: change.newBullets });
					setAppliedChanges((prev) => ({
						...prev,
						experience: { ...prev.experience, [idx]: true },
					}));
				}
			}
		}

		setTimeout(onClose, 1500);
	};

	const toggleExperienceSelection = (idx: number) => {
		setSelectedChanges((prev) => ({
			...prev,
			experience: {
				...prev.experience,
				[idx]: !prev.experience[idx],
			},
		}));
	};

	const isAnythingSelected =
		selectedChanges.summary ||
		Object.values(selectedChanges.experience).some(Boolean);

	return (
		<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200">
			<div className="zoom-in-95 flex max-h-[90vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-300">
				{/* Header */}
				<header className="flex items-center justify-between border-slate-100 border-b bg-slate-50/50 p-6">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-indigo-600 p-2.5 text-white shadow-indigo-200 shadow-lg">
							<Wand2 className="h-6 w-6" />
						</div>
						<div>
							<h2 className="font-bold text-slate-900 text-xl tracking-tight">
								AI Job Tailoring
							</h2>
							<p className="font-medium text-slate-500 text-xs uppercase tracking-wider">
								Align your resume with specific job requirements
							</p>
						</div>
					</div>
					<button
						className="rounded-full p-2 transition-colors hover:bg-slate-200"
						onClick={onClose}
						type="button"
					>
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-8">
					{!suggestions && !isAnalyzing && (
						<div className="space-y-4">
							<label
								className="block font-semibold text-slate-800 text-sm"
								htmlFor="jd-input"
							>
								Job Description
							</label>
							<textarea
								className="min-h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
								id="jd-input"
								onChange={(e) => setJobDescription(e.target.value)}
								placeholder="Paste the full job description here..."
								value={jobDescription}
							/>
						</div>
					)}

					{isAnalyzing && (
						<div className="flex flex-col items-center justify-center space-y-6 py-20 text-center">
							<div className="relative">
								<div className="absolute inset-0 animate-ping rounded-full bg-indigo-100" />
								<div className="relative rounded-full bg-indigo-50 p-8">
									<BrainCircuit className="h-12 w-12 animate-pulse text-indigo-600" />
								</div>
							</div>
							<div className="space-y-2">
								<h3 className="font-bold text-2xl text-slate-900 tracking-tight">
									Analyzing JD Impact
								</h3>
								<p className="mx-auto max-w-md text-slate-500">
									Our AI is cross-referencing your experience with the job
									requirements to find the best semantic matches...
								</p>
							</div>
							<div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
								<Loader2 className="h-4 w-4 animate-spin text-slate-400" />
								<span className="font-bold text-slate-500 text-xs uppercase tracking-widest">
									Processing
								</span>
							</div>
						</div>
					)}

					{suggestions && !isAnalyzing && (
						<div className="slide-in-from-bottom-4 animate-in space-y-8 duration-500">
							{/* Summary Suggestion */}
							{suggestions.summary && (
								<div
									className={`group rounded-2xl border-2 p-6 transition-all ${selectedChanges.summary ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 bg-white"}`}
								>
									<div className="mb-4 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-indigo-500" />
											<h4 className="font-bold text-slate-900 text-sm uppercase tracking-tight">
												New Professional Summary
											</h4>
										</div>
										<button
											className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${selectedChanges.summary ? "bg-indigo-600 text-white" : "border-2 border-slate-200 text-transparent"}`}
											onClick={() =>
												setSelectedChanges((prev) => ({
													...prev,
													summary: !prev.summary,
												}))
											}
											type="button"
										>
											<Check className="h-3.5 w-3.5" />
										</button>
									</div>
									<p className="text-slate-700 text-sm italic leading-relaxed">
										"{suggestions.summary}"
									</p>
								</div>
							)}

							{/* Experience Suggestions */}
							<div className="space-y-4">
								<h4 className="font-bold text-slate-400 text-xs uppercase tracking-widest">
									Experience Enhancements
								</h4>
								{suggestions.experienceChanges.map((change, idx) => {
									const exp = original.experience[change.experienceIndex];
									if (!exp) return null;

									const isSelected = selectedChanges.experience[idx];

									return (
										<div
											className={`overflow-hidden rounded-2xl border-2 transition-all ${isSelected ? "border-indigo-600 shadow-indigo-100 shadow-xl" : "border-slate-100 hover:border-slate-200"}`}
											key={`${exp.id}-${change.experienceIndex}`}
										>
											<button
												className="flex w-full items-center justify-between bg-slate-50/50 px-6 py-4 text-left transition-colors hover:bg-slate-50"
												onClick={() => toggleExperienceSelection(idx)}
												type="button"
											>
												<div className="flex items-center gap-3">
													<div
														className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold text-xs ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500"}`}
													>
														{idx + 1}
													</div>
													<div>
														<p className="font-bold text-slate-900 text-sm">
															{exp.company}
														</p>
														<p className="font-medium text-slate-500 text-xs">
															{exp.position}
														</p>
													</div>
												</div>
												<div
													className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${isSelected ? "bg-indigo-600 text-white" : "border-2 border-slate-200 text-transparent"}`}
												>
													<Check className="h-3.5 w-3.5" />
												</div>
											</button>

											<div className="grid grid-cols-1 divide-y divide-slate-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
												<div className="p-6">
													<p className="mb-3 font-bold text-[10px] text-slate-400 uppercase tracking-widest">
														Current Bullets
													</p>
													<ul className="space-y-2 opacity-50 grayscale">
														{exp.description.map((b, _bidx) => (
															<li
																className="flex gap-2 text-slate-600 text-xs"
																key={`${exp.id}-current-${_bidx}-${b.slice(0, 10).replace(/\s/g, "-")}`}
															>
																<div className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
																{b}
															</li>
														))}
													</ul>
												</div>
												<div className="bg-indigo-50/20 p-6">
													<p className="mb-3 font-bold text-[10px] text-indigo-400 uppercase tracking-widest">
														Suggested Enhancement
													</p>
													<ul className="space-y-3">
														{change.newBullets.map((b, _bidx) => (
															<li
																className="flex gap-2 font-medium text-indigo-900 text-xs"
																key={`${exp.id}-new-${_bidx}-${b.slice(0, 10).replace(/\s/g, "-")}`}
															>
																<div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
																{b}
															</li>
														))}
													</ul>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t bg-slate-50 p-6">
					{!suggestions ? (
						<>
							<div className="flex items-center gap-2 font-medium text-slate-400 text-xs">
								<AlertCircle className="h-4 w-4" />
								Paste a JD to unlock AI tailoring
							</div>
							<button
								className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 font-bold text-sm text-white shadow-indigo-500/20 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
								disabled={!jobDescription.trim() || isAnalyzing}
								onClick={handleAnalyze}
								type="button"
							>
								{isAnalyzing ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Analyzing...
									</>
								) : (
									<>
										Analyze Impact
										<ChevronRight className="h-4 w-4" />
									</>
								)}
							</button>
						</>
					) : (
						<>
							<button
								className="font-bold text-slate-500 text-sm transition-colors hover:text-slate-700"
								onClick={() => setSuggestions(null)}
								type="button"
							>
								Back to Input
							</button>
							<button
								className="flex items-center gap-2 rounded-xl bg-green-600 px-10 py-3 font-bold text-sm text-white shadow-green-500/20 shadow-lg transition-all hover:bg-green-700 active:scale-95 disabled:opacity-50"
								disabled={
									!isAnythingSelected ||
									Object.values(appliedChanges.experience).some(Boolean)
								}
								onClick={applySelected}
								type="button"
							>
								{appliedChanges.summary ||
								Object.values(appliedChanges.experience).some(Boolean) ? (
									<>
										<CheckCircle2 className="h-4 w-4" />
										Changes Applied
									</>
								) : (
									<>
										Apply Selected Suggestions
										<ArrowRight className="h-4 w-4" />
									</>
								)}
							</button>
						</>
					)}
				</footer>
			</div>
		</div>
	);
}
