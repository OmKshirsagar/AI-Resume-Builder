"use client";

import { readStreamableValue } from "@ai-sdk/rsc";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
	BrainCircuit,
	Download,
	Loader2,
	Save,
	Send,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
	generateCoverLetter,
	saveCoverLetter,
} from "~/app/actions/cover-letter";
import type { ResumeData } from "~/schemas/resume";
import { CoverLetterPDFDocument } from "../export/CoverLetterPDFDocument";

interface DraftingLabProps {
	resumeData: ResumeData;
	resumeId: string;
}

export function DraftingLab({ resumeData, resumeId }: DraftingLabProps) {
	const [jobDescription, setJobDescription] = useState("");
	const [companyName, setCompanyName] = useState("");
	const [tone, setTone] = useState("professional");
	const [length, setLength] = useState<"short" | "medium" | "long">("medium");
	const [content, setContent] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [status, setStatus] = useState("");
	const [lastSavedId, setLastSavedId] = useState<string | null>(null);

	const handleGenerate = async () => {
		if (!jobDescription.trim()) return;

		setIsGenerating(true);
		setContent("");
		setStatus("Starting AI synthesis...");

		try {
			const { output } = await generateCoverLetter(resumeId, jobDescription, {
				companyName,
				tone,
				length,
			});

			for await (const delta of readStreamableValue(output)) {
				if (typeof delta === "string") {
					if (delta.startsWith("STATUS:")) {
						setStatus(delta.replace("STATUS:", ""));
					} else {
						setContent((prev) => prev + delta);
					}
				}
			}
			setStatus("Synthesis complete!");
		} catch (error) {
			console.error(error);
			alert("Failed to generate cover letter.");
		} finally {
			setIsGenerating(false);
		}
	};

	const handleSave = async () => {
		if (!content) return;

		setIsSaving(true);
		try {
			const result = await saveCoverLetter({
				id: lastSavedId || undefined,
				resumeId: resumeId,
				jobDescription,
				content,
				companyName,
				tone,
				length,
			});

			if (result.success && result.id) {
				setLastSavedId(result.id);
				alert("Cover letter saved successfully!");
			}
		} catch (error) {
			console.error(error);
			alert("Failed to save cover letter.");
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-5">
			{/* Left: Input Controls (2/5) */}
			<div className="flex flex-col space-y-6 lg:col-span-2">
				<div className="flex flex-1 flex-col space-y-4 rounded-3xl border bg-white p-6 shadow-sm">
					<div className="space-y-1">
						<label
							className="font-bold text-[10px] text-slate-400 uppercase tracking-widest"
							htmlFor="company-name"
						>
							Company Name
						</label>
						<input
							className="h-10 w-full rounded-xl border border-slate-200 px-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							id="company-name"
							onChange={(e) => setCompanyName(e.target.value)}
							placeholder="e.g. Google, Stripe..."
							type="text"
							value={companyName}
						/>
					</div>

					<div className="flex-1 space-y-1">
						<label
							className="font-bold text-[10px] text-slate-400 uppercase tracking-widest"
							htmlFor="jd-input"
						>
							Job Description
						</label>
						<textarea
							className="h-full min-h-[200px] w-full resize-none rounded-2xl border border-slate-200 p-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
							id="jd-input"
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the job requirements here..."
							value={jobDescription}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4 pt-2">
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase tracking-widest"
								htmlFor="tone-select"
							>
								Tone
							</label>
							<select
								className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none"
								id="tone-select"
								onChange={(e) => setTone(e.target.value)}
								value={tone}
							>
								<option value="professional">Professional</option>
								<option value="bold">Bold & Creative</option>
								<option value="academic">Academic</option>
								<option value="minimalist">Minimalist</option>
							</select>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase tracking-widest"
								htmlFor="length-select"
							>
								Length
							</label>
							<select
								className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-indigo-500 focus:outline-none"
								id="length-select"
								onChange={(e) =>
									setLength(e.target.value as "short" | "medium" | "long")
								}
								value={length}
							>
								<option value="short">Concise</option>
								<option value="medium">Standard</option>
								<option value="long">Detailed</option>
							</select>
						</div>
					</div>

					<button
						className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-sm text-white shadow-indigo-200 shadow-xl transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
						disabled={isGenerating || !jobDescription.trim()}
						onClick={handleGenerate}
						type="button"
					>
						{isGenerating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Synthesizing...
							</>
						) : (
							<>
								<BrainCircuit className="h-4 w-4 transition-transform group-hover:rotate-12" />
								Generate AI Draft
							</>
						)}
					</button>
				</div>
			</div>

			{/* Right: Preview (3/5) */}
			<div className="flex flex-col space-y-4 lg:col-span-3">
				<div className="flex items-center justify-between px-2">
					<div className="flex items-center gap-2">
						{isGenerating && (
							<div className="fade-in slide-in-from-left-2 flex animate-in items-center gap-2 rounded-full bg-indigo-50 px-3 py-1">
								<Sparkles className="h-3 w-3 animate-pulse text-indigo-500" />
								<span className="font-bold text-[10px] text-indigo-600 uppercase tracking-tight">
									{status}
								</span>
							</div>
						)}
					</div>
					<div className="flex gap-2">
						{content && (
							<>
								<button
									className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 text-xs transition-colors hover:bg-slate-50"
									disabled={isSaving}
									onClick={handleSave}
									type="button"
								>
									{isSaving ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Save className="h-3.5 w-3.5" />
									)}
									Save Draft
								</button>
								<PDFDownloadLink
									document={
										<CoverLetterPDFDocument
											content={content}
											resumeData={resumeData}
										/>
									}
									fileName={`CoverLetter_${companyName || "Draft"}.pdf`}
								>
									{/* @ts-ignore */}
									{({ loading }) => (
										<button
											className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white text-xs shadow-lg transition-all hover:bg-slate-800"
											disabled={loading}
											type="button"
										>
											{loading ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<Download className="h-3.5 w-3.5" />
											)}
											Download PDF
										</button>
									)}
								</PDFDownloadLink>
							</>
						)}
					</div>
				</div>

				<div className="relative flex-1 overflow-hidden rounded-3xl border bg-white shadow-inner">
					{!content && !isGenerating ? (
						<div className="flex h-full flex-col items-center justify-center p-12 text-center">
							<div className="mb-4 rounded-2xl bg-slate-50 p-4">
								<Send className="h-8 w-8 text-slate-300" />
							</div>
							<h4 className="font-bold text-slate-900">No Draft Yet</h4>
							<p className="mt-1 max-w-[240px] text-slate-400 text-xs leading-relaxed">
								Input the job details on the left to generate your first AI
								cover letter draft.
							</p>
						</div>
					) : (
						<div className="prose prose-slate prose-sm h-full max-w-none overflow-y-auto p-10 prose-p:leading-relaxed">
							<ReactMarkdown>{content}</ReactMarkdown>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
