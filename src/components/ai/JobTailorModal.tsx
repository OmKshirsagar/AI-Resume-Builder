"use client";

import { useState } from "react";
import { readStreamableValue } from "@ai-sdk/rsc";
import { 
	Check, 
	X, 
	Wand2, 
	Briefcase, 
	MessageSquare, 
	AlertCircle,
	Loader2
} from "lucide-react";
import { tailorResume, type TailorSuggestions } from "~/app/actions/tailor";
import { useResumeStore } from "~/store/useResumeStore";
import { clsx } from "clsx";

interface JobTailorModalProps {
	onClose: () => void;
}

export function JobTailorModal({ onClose }: JobTailorModalProps) {
	const { data: resumeData, updatePersonalInfo, updateExperience } = useResumeStore();
	const [jobDescription, setJobDescription] = useState("");
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [suggestions, setSuggestions] = useState<Partial<TailorSuggestions> | null>(null);
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
						setSelectedChanges(prev => ({
							...prev,
							experience: (obj.experienceChanges as any[]).reduce<Record<number, boolean>>((acc, _, idx) => ({
								...acc,
								[idx]: prev.experience[idx] ?? true
							}), {})
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
					const experienceEntry = resumeData.experience.find(e => e.id === change.experienceId);
					if (experienceEntry) {
						const newDescription = [...experienceEntry.description];
						newDescription[change.bulletIndex] = change.newBullet;
						updateExperience(change.experienceId, { description: newDescription });
					}
				}
			});
		}

		onClose();
	};

	const toggleExperience = (idx: number) => {
		setSelectedChanges(prev => ({
			...prev,
			experience: {
				...prev.experience,
				[idx]: !prev.experience[idx]
			}
		}));
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
			<div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
				{/* Header */}
				<header className="flex items-center justify-between border-b p-6 bg-slate-50">
					<div className="flex items-center gap-3">
						<div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
							<Wand2 className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-bold text-xl text-slate-900">Tailor Resume for Job</h2>
							<p className="text-sm text-slate-500">Align your experience with a specific job description.</p>
						</div>
					</div>
					<button onClick={onClose} className="rounded-full p-2 hover:bg-slate-200 transition-colors">
						<X className="h-5 w-5 text-slate-500" />
					</button>
				</header>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{!suggestions && !isAnalyzing ? (
						<div className="space-y-4">
							<label className="block font-semibold text-slate-800 text-sm">
								Job Description
							</label>
							<textarea
								value={jobDescription}
								onChange={(e) => setJobDescription(e.target.value)}
								placeholder="Paste the job description here..."
								className="min-h-[300px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
							/>
							<div className="rounded-lg bg-blue-50 p-4 flex gap-3 border border-blue-100">
								<MessageSquare className="h-5 w-5 text-blue-600 shrink-0" />
								<p className="text-xs text-blue-800 leading-relaxed">
									AI will analyze the JD to find key requirements and suggest improvements to your summary and experience bullets using the X-Y-Z formula.
								</p>
							</div>
						</div>
					) : (
						<div className="space-y-8 animate-in fade-in duration-500">
							{/* Summary Suggestion */}
							{suggestions?.summary && (
								<section className="space-y-4">
									<div className="flex items-center justify-between">
										<h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Professional Summary</h3>
										<button 
											onClick={() => setSelectedChanges(prev => ({ ...prev, summary: !prev.summary }))}
											className={clsx(
												"flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all",
												selectedChanges.summary ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"
											)}
										>
											{selectedChanges.summary ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
											{selectedChanges.summary ? "Included" : "Excluded"}
										</button>
									</div>
									<div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
										<div className="text-xs font-bold text-indigo-600 uppercase">Suggestion</div>
										<p className="text-sm text-slate-700 leading-relaxed italic">"{suggestions.summary}"</p>
									</div>
								</section>
							)}

							{/* Experience Changes */}
							<section className="space-y-4">
								<h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Experience Enhancements</h3>
								<div className="space-y-6">
									{suggestions?.experienceChanges?.map((change, idx) => (
										<div key={idx} className="group relative rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:border-indigo-200">
											<div className="flex items-center justify-between border-b bg-slate-50 px-4 py-2">
												<div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
													<Briefcase className="h-3 w-3" />
													{resumeData.experience.find(e => e.id === change?.experienceId)?.company}
												</div>
												<button 
													onClick={() => toggleExperience(idx)}
													className={clsx(
														"flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all",
														selectedChanges.experience[idx] ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
													)}
												>
													{selectedChanges.experience[idx] ? "Selected" : "Ignored"}
												</button>
											</div>
											<div className="p-4 space-y-4">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-1.5 opacity-50">
														<div className="text-[10px] font-bold text-slate-400 uppercase">Original</div>
														<p className="text-xs text-slate-600">{change?.originalBullet}</p>
													</div>
													<div className="space-y-1.5">
														<div className="text-[10px] font-bold text-indigo-500 uppercase">AI Tailored</div>
														<p className="text-xs text-slate-900 font-medium leading-relaxed">{change?.newBullet}</p>
													</div>
												</div>
												{change?.reasoning && (
													<div className="flex gap-2 rounded-lg bg-amber-50 p-2 text-[10px] text-amber-800 border border-amber-100">
														<AlertCircle className="h-3 w-3 shrink-0" />
														<span>{change.reasoning}</span>
													</div>
												)}
											</div>
										</div>
									))}
									{isAnalyzing && (
										<div className="flex flex-col items-center justify-center p-8 gap-3 border-2 border-dashed rounded-xl border-slate-100">
											<Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
											<p className="text-sm text-slate-400 animate-pulse font-medium">Generating more suggestions...</p>
										</div>
									)}
								</div>
							</section>
						</div>
					)}
				</div>

				{/* Footer */}
				<footer className="flex items-center justify-between border-t p-6 bg-slate-50">
					<div className="text-xs text-slate-400 italic">
						{isAnalyzing ? "Analyzing Job Description..." : suggestions ? "Review and apply changes" : "Ready to analyze"}
					</div>
					<div className="flex gap-3">
						<button
							onClick={onClose}
							className="rounded-lg border bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
						>
							Cancel
						</button>
						{!suggestions ? (
							<button
								onClick={handleTailor}
								disabled={isAnalyzing || !jobDescription.trim()}
								className="flex items-center gap-2 rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
							>
								{isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
								Analyze & Tailor
							</button>
						) : (
							<button
								onClick={handleApply}
								disabled={isAnalyzing}
								className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 hover:bg-green-700 transition-all active:scale-95"
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
