"use client";

import { useState, useCallback } from "react";
import { MainLayout } from "~/components/layout/MainLayout";
import { PreviewPane } from "~/components/preview/PreviewPane";
import { ResumeRenderer } from "~/components/preview/ResumeRenderer";
import { PDFUpload } from "~/components/editor/PDFUpload";
import { ParsedDataReview } from "~/components/editor/ParsedDataReview";
import { useResumeStore } from "~/store/useResumeStore";
import type { ResumeData } from "~/schemas/resume";
import { JobTailorModal } from "~/components/ai/JobTailorModal";
import { ResumeEditor } from "~/components/editor/ResumeEditor";
import { PersonalInfoForm } from "~/components/editor/forms/PersonalInfoForm";
import { ExperienceForm } from "~/components/editor/forms/ExperienceForm";
import { EducationForm } from "~/components/editor/forms/EducationForm";
import { SkillsForm } from "~/components/editor/forms/SkillsForm";
import { ProjectsForm } from "~/components/editor/forms/ProjectsForm";
import { CustomSectionsForm } from "~/components/editor/forms/CustomSectionsForm";
import { FabricationProgressModal } from "~/components/ai/FabricationProgressModal";
import { DownloadButton } from "~/components/export/DownloadButton";
import { Wand2, Check, X, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

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
	} = useResumeStore();
	
	const [pendingExtractedData, setPendingExtractedData] = useState<ResumeData | null>(null);
	const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
	const [isFabricating, setIsFabricating] = useState(false);
	const [fabricationStatus, setFabricationStatus] = useState("");
	const [currentStepId, setCurrentStepId] = useState("");

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

	const handleSync = useCallback((data: ResumeData) => {
		if (!isPreviewingDraft) {
			setOriginal(data);
		}
	}, [isPreviewingDraft, setOriginal]);

	const handleFabricate = async () => {
		setIsFabricating(true);
		setFabricationStatus("Initiating Mastra workflow...");
		setCurrentStepId("audit-resume");
		
		try {
			const response = await fetch("/api/workflow/fabricate", {
				method: "POST",
				body: JSON.stringify({ resumeData: original }),
			});

			if (!response.ok) throw new Error("Fabrication failed");

			const reader = response.body?.getReader();
			const textDecoder = new TextDecoder();
			let buffer = "";

			if (!reader) return;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += textDecoder.decode(value, { stream: true });
				const lines = buffer.split("\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.trim()) continue;
					try {
						const update = JSON.parse(line);
						if (update.status) {
							setFabricationStatus(update.status);
						}
						if (update.stepId) {
							setCurrentStepId(update.stepId);
						}
						if (update.data) {
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
			console.error(error);
			alert(error instanceof Error ? error.message : "An unexpected error occurred during fabrication.");
		} finally {
			setIsFabricating(false);
			setFabricationStatus("");
			setCurrentStepId("");
		}
	};

	const Editor = (
		<div className="flex flex-col min-h-full">
			{isPreviewingDraft && (
				<div className="sticky top-0 z-30 m-6 flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white shadow-xl animate-in slide-in-from-top duration-300 ring-4 ring-indigo-600/20">
					<div className="flex items-center gap-3">
						<Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
						<div>
							<p className="font-bold text-sm">Previewing Agentic Fabrication</p>
							<p className="text-xs text-indigo-100">AI has redesigned your resume using Mastra. Review in preview.</p>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							onClick={discardDraft}
							className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 transition-colors"
						>
							<X className="h-3 w-3" />
							Discard
						</button>
						<button
							type="button"
							onClick={applyDraft}
							className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
						>
							<Check className="h-3 w-3" />
							Apply
						</button>
					</div>
				</div>
			)}

			<header className="flex items-center justify-between gap-4 p-6 pb-4 border-b border-slate-100 bg-white sticky top-0 z-20">
				<div className="flex items-center gap-4">
					<UserButton />
					<div className="h-8 w-px bg-slate-200" />
					<div className="flex flex-col">
						<h1 className="font-bold text-xl text-slate-900 tracking-tight leading-none mb-1">Resume Editor</h1>
						<p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
							v1.0.0 Stable
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<DownloadButton data={activeData} />
					<div className="h-6 w-px bg-slate-100 mx-1" />
					<button
						type="button"
						onClick={handleFabricate}
						disabled={isFabricating || isPreviewingDraft}
						className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50 min-w-[160px] justify-center"
					>
						{isFabricating ? (
							<div className="flex items-center gap-2 text-indigo-600">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								<span className="text-[10px] uppercase tracking-tight font-bold">Fabricating...</span>
							</div>
						) : (
							<>
								<BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
								Agentic Fabricate
							</>
						)}
					</button>
					<button
						type="button"
						onClick={() => setIsTailorModalOpen(true)}
						disabled={isPreviewingDraft}
						className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
					>
						<Wand2 className="h-3.5 w-3.5" />
						Tailor for Job
					</button>
				</div>
			</header>

			<div className="p-6">
				<section className="space-y-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
					<h2 className="font-semibold text-lg text-slate-800">
						Import Existing Resume
					</h2>
					<PDFUpload onExtracted={handleExtracted} />
				</section>
			</div>

			<ResumeEditor data={activeData} onSync={handleSync} disabled={isPreviewingDraft}>
				<PersonalInfoForm disabled={isPreviewingDraft} />
				<ExperienceForm disabled={isPreviewingDraft} />
				<EducationForm disabled={isPreviewingDraft} />
				<SkillsForm disabled={isPreviewingDraft} />
				<ProjectsForm disabled={isPreviewingDraft} />
				<CustomSectionsForm disabled={isPreviewingDraft} />
			</ResumeEditor>
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
			{isFabricating && (
				<FabricationProgressModal 
					status={fabricationStatus} 
					currentStepId={currentStepId} 
				/>
			)}
		</>
	);
}
