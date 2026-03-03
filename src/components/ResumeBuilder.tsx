"use client";

import { useState, useCallback, useRef } from "react";
import { MainLayout } from "~/components/layout/MainLayout";
import { PreviewPane } from "~/components/preview/PreviewPane";
import { ResumeRenderer } from "~/components/preview/ResumeRenderer";
import { PDFUpload } from "~/components/editor/PDFUpload";
import { ParsedDataReview } from "~/components/editor/ParsedDataReview";
import { useResumeStore } from "~/store/useResumeStore";
import type { ResumeData } from "~/schemas/resume";
import { RefineButton } from "~/components/ai/RefineButton";
import { JobTailorModal } from "~/components/ai/JobTailorModal";
import { CustomSections } from "~/components/editor/CustomSections";
import { fabricateResume } from "~/app/actions/condense";
import { Wand2, Check, X, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { readStreamableValue } from "@ai-sdk/rsc";

import { type Layout } from "react-resizable-panels";

interface ResumeBuilderProps {
	defaultLayout?: Layout;
}

export function ResumeBuilder({ defaultLayout }: ResumeBuilderProps) {
	const { 
		original, 
		draft, 
		setOriginal, 
		setDraft, 
		applyDraft, 
		discardDraft, 
		updatePersonalInfo, 
		updateExperience,
		setCustomSections
	} = useResumeStore();
	
	const [pendingExtractedData, setPendingExtractedData] = useState<ResumeData | null>(null);
	const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
	const [isFabricating, setIsFabricating] = useState(false);
	const [fabricationStatus, setFabricationStatus] = useState("");

	// Determine which data to show in editor and preview
	const activeData = draft || original;
	const isPreviewingDraft = !!draft;

	const handleExtracted = (extractedData: ResumeData) => {
		setPendingExtractedData(extractedData);
	};

	const handleConfirmExtraction = () => {
		if (pendingExtractedData) {
			setOriginal(pendingExtractedData);
			setPendingExtractedData(null);
		}
	};

	const handleCancelExtraction = () => {
		setPendingExtractedData(null);
	};

	const handleCustomSectionsChange = useCallback((sections: any) => {
		if (!isPreviewingDraft) {
			setCustomSections(sections);
		}
	}, [isPreviewingDraft, setCustomSections]);

	const handleFabricate = async () => {
		setIsFabricating(true);
		setFabricationStatus("Initiating Mastra workflow...");
		
		try {
			const response = await fetch("/api/workflow/fabricate", {
				method: "POST",
				body: JSON.stringify({ resumeData: original }),
			});

			if (!response.ok) throw new Error("Fabrication failed");

			const reader = response.body?.getReader();
			const textDecoder = new TextDecoder();
			let buffer = ""; // Buffer for handling fragmented NDJSON chunks

			if (!reader) return;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += textDecoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				
				// Keep the last partial line in the buffer
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const update = JSON.parse(line);
						console.log("📥 UI Event:", update.status || "data");
						
						if (update.status) {
							setFabricationStatus(update.status);
						}
						
						if (update.data) {
							console.log("✅ SUCCESS: Final Resume Data Received!");
							setDraft(update.data as ResumeData);
						}
						
						if (update.error) {
							throw new Error(update.error);
						}
					} catch (e) {
						console.error("Error parsing NDJSON line:", e);
					}
				}
			}
		} catch (error) {
			console.error("❌ Fabrication Error:", error);
			alert(error instanceof Error ? error.message : "An unexpected error occurred during fabrication.");
		} finally {
			setIsFabricating(false);
			setFabricationStatus("");
		}
	};

	const Editor = (
		<div className="mx-auto flex max-w-2xl flex-col space-y-8 p-6 pb-24">
			{isPreviewingDraft && (
				<div className="sticky top-0 z-30 mb-4 flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white shadow-xl animate-in slide-in-from-top duration-300 ring-4 ring-indigo-600/20">
					<div className="flex items-center gap-3">
						<Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
						<div>
							<p className="font-bold text-sm">Previewing Agentic Fabrication</p>
							<p className="text-xs text-indigo-100">AI has redesigned your resume using Mastra. Review in preview.</p>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							onClick={discardDraft}
							className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 transition-colors"
						>
							<X className="h-3 w-3" />
							Discard
						</button>
						<button
							onClick={applyDraft}
							className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
						>
							<Check className="h-3 w-3" />
							Apply
						</button>
					</div>
				</div>
			)}

			<header className="flex items-center justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl text-slate-900">Resume Editor</h1>
					<p className="text-slate-500 text-sm">
						Fill in your details to build your resume.
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleFabricate}
						disabled={isFabricating || isPreviewingDraft}
						className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 min-w-[160px] justify-center"
					>
						{isFabricating ? (
							<div className="flex items-center gap-2">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								<span className="text-[10px] animate-pulse uppercase tracking-tight truncate max-w-[100px]">{fabricationStatus}</span>
							</div>
						) : (
							<>
								<BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
								Agentic Fabricate
							</>
						)}
					</button>
					<button
						onClick={() => setIsTailorModalOpen(true)}
						disabled={isPreviewingDraft}
						className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
					>
						<Wand2 className="h-3.5 w-3.5" />
						Tailor for Job
					</button>
				</div>
			</header>

			<section className="space-y-4">
				<h2 className="border-b pb-2 font-semibold text-lg text-slate-800">
					Import Existing Resume
				</h2>
				<PDFUpload onExtracted={handleExtracted} />
			</section>

			<section className="space-y-4">
				<h2 className="border-b pb-2 font-semibold text-lg text-slate-800">
					Personal Details
				</h2>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<label className="font-medium text-slate-500 text-xs uppercase">
							Full Name
						</label>
						<input
							type="text"
							value={activeData.personalInfo.fullName || ""}
							onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
							className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
							placeholder="John Doe"
							disabled={isPreviewingDraft}
						/>
					</div>
					<div className="space-y-2">
						<label className="font-medium text-slate-500 text-xs uppercase">
							Email
						</label>
						<input
							type="email"
							value={activeData.personalInfo.email || ""}
							onChange={(e) => updatePersonalInfo({ email: e.target.value })}
							className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
							placeholder="john@example.com"
							disabled={isPreviewingDraft}
						/>
					</div>
				</div>
				<div className="space-y-2">
					<div className="flex items-center justify-between">
						<label className="font-medium text-slate-500 text-xs uppercase">
							Professional Summary
						</label>
						{!isPreviewingDraft && (
							<RefineButton
								text={activeData.personalInfo.summary || ""}
								onApply={(newText) => updatePersonalInfo({ summary: newText })}
							/>
						)}
					</div>
					<textarea
						value={activeData.personalInfo.summary || ""}
						onChange={(e) => updatePersonalInfo({ summary: e.target.value })}
						className="min-h-[100px] w-full rounded border bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
						placeholder="Briefly describe your professional background and goals..."
						disabled={isPreviewingDraft}
					/>
				</div>
			</section>

			<section className="space-y-4">
				<h2 className="border-b pb-2 font-semibold text-lg text-slate-800">
					Work Experience
				</h2>
				{(!activeData.experience || activeData.experience.length === 0) ? (
					<p className="text-sm text-slate-400 italic">No experience added yet.</p>
				) : (
					<div className="space-y-6">
						{activeData.experience.map((exp) => (
							<div key={exp.id} className="rounded border bg-white p-4 shadow-sm space-y-4">
								<div className="flex justify-between items-start border-b border-slate-50 pb-3">
									<div>
										<p className="font-bold text-slate-900">{exp.position}</p>
										<p className="text-sm text-slate-600 font-medium">{exp.company}</p>
									</div>
									<span className="text-[10px] bg-slate-100 px-2 py-1 rounded font-bold text-slate-500 uppercase">
										{exp.startDate} — {exp.current ? "Present" : exp.endDate}
									</span>
								</div>
								
								<div className="space-y-3">
									<label className="font-medium text-slate-500 text-xs uppercase">
										Experience Bullets
									</label>
									{(exp.description || []).map((bullet, idx) => (
										<div key={idx} className="group relative space-y-1">
											<div className="flex justify-between items-center mb-1">
												<span className="text-[10px] text-slate-400 font-medium uppercase">Bullet {idx + 1}</span>
												{!isPreviewingDraft && (
													<RefineButton
														text={bullet}
														onApply={(newText) => {
															const newDescription = [...exp.description];
															newDescription[idx] = newText;
															updateExperience(exp.id, { description: newDescription });
														}}
													/>
												)}
											</div>
											<textarea
												value={bullet}
												onChange={(e) => {
													const newDescription = [...exp.description];
													newDescription[idx] = e.target.value;
													updateExperience(exp.id, { description: newDescription });
												}}
												className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
												rows={2}
												disabled={isPreviewingDraft}
											/>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</section>

			<CustomSections 
				data={activeData} 
				onChange={handleCustomSectionsChange}
				disabled={isPreviewingDraft}
			/>

			<section className="space-y-4">
				<h2 className="border-b pb-2 font-semibold text-lg text-slate-800">
					Education
				</h2>
				{(!activeData.education || activeData.education.length === 0) ? (
					<p className="text-sm text-slate-400 italic">No education added yet.</p>
				) : (
					<div className="space-y-4">
						{activeData.education.map((edu) => (
							<div key={edu.id} className="rounded border bg-white p-4 shadow-sm">
								<p className="font-bold text-slate-900">{edu.degree}</p>
								<p className="text-sm text-slate-600">{edu.school}</p>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	);

	const Preview = (
		<PreviewPane>
			<ResumeRenderer data={activeData} />
		</PreviewPane>
	);

	return (
		<>
			<MainLayout
				defaultLayout={defaultLayout}
				editor={Editor}
				preview={Preview}
			/>
			{pendingExtractedData && (
				<ParsedDataReview
					data={pendingExtractedData}
					onConfirm={handleConfirmExtraction}
					onCancel={handleCancelExtraction}
				/>
			)}
			{isTailorModalOpen && (
				<JobTailorModal onClose={() => setIsTailorModalOpen(false)} />
			)}
		</>
	);
}
