"use client";

import { BrainCircuit, Check, Loader2, Sparkles, Wand2, X } from "lucide-react";
import { useCallback, useState } from "react";
import type { Layout } from "react-resizable-panels";
import { FabricationProgressModal } from "~/components/ai/FabricationProgressModal";
import { JobTailorModal } from "~/components/ai/JobTailorModal";
import { CustomSectionsForm } from "~/components/editor/forms/CustomSectionsForm";
import { EducationForm } from "~/components/editor/forms/EducationForm";
import { ExperienceForm } from "~/components/editor/forms/ExperienceForm";
import { PersonalInfoForm } from "~/components/editor/forms/PersonalInfoForm";
import { ProjectsForm } from "~/components/editor/forms/ProjectsForm";
import { SkillsForm } from "~/components/editor/forms/SkillsForm";
import { ParsedDataReview } from "~/components/editor/ParsedDataReview";
import { PDFUpload } from "~/components/editor/PDFUpload";
import { ResumeEditor } from "~/components/editor/ResumeEditor";
import { DownloadButton } from "~/components/export/DownloadButton";
import { MainLayout } from "~/components/layout/MainLayout";
import { PreviewPane } from "~/components/preview/PreviewPane";
import { ResumeRenderer } from "~/components/preview/ResumeRenderer";
import type { ResumeData } from "~/schemas/resume";
import { useResumeStore } from "~/store/useResumeStore";

interface ResumeBuilderProps {
	defaultLayout?: Layout;
}

export function ResumeBuilder({ defaultLayout }: ResumeBuilderProps) {
	const { original, draft, setOriginal, setDraft, applyDraft, discardDraft } =
		useResumeStore();

	const [pendingExtractedData, setPendingExtractedData] =
		useState<ResumeData | null>(null);
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

	const handleSync = useCallback(
		(data: ResumeData) => {
			if (!isPreviewingDraft) {
				setOriginal(data);
			}
		},
		[isPreviewingDraft, setOriginal],
	);

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
			alert(
				error instanceof Error
					? error.message
					: "An unexpected error occurred during fabrication.",
			);
		} finally {
			setIsFabricating(false);
			setFabricationStatus("");
			setCurrentStepId("");
		}
	};

	const Editor = (
		<div className="flex min-h-full flex-col">
			{isPreviewingDraft && (
				<div className="slide-in-from-top sticky top-0 z-30 m-6 flex animate-in items-center justify-between rounded-xl bg-indigo-600 p-4 text-white shadow-xl ring-4 ring-indigo-600/20 duration-300">
					<div className="flex items-center gap-3">
						<Sparkles className="h-5 w-5 animate-pulse text-indigo-200" />
						<div>
							<p className="font-bold text-sm">
								Previewing Agentic Fabrication
							</p>
							<p className="text-indigo-100 text-xs">
								AI has redesigned your resume using Mastra. Review in preview.
							</p>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 font-bold text-xs transition-colors hover:bg-white/20"
							onClick={discardDraft}
						>
							<X className="h-3 w-3" />
							Discard
						</button>
						<button
							className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 font-bold text-indigo-600 text-xs transition-colors hover:bg-indigo-50"
							onClick={applyDraft}
						>
							<Check className="h-3 w-3" />
							Apply
						</button>
					</div>
				</div>
			)}

			<header className="flex items-center justify-between gap-4 p-6 pb-0">
				<div className="flex flex-col gap-1">
					<h1 className="font-bold text-2xl text-slate-900">Resume Editor</h1>
					<p className="text-slate-500 text-sm">
						Fill in your details to build your resume.
					</p>
				</div>
				<div className="flex gap-2">
					<DownloadButton data={activeData} />
					<button
						className="flex min-w-[160px] items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 text-xs transition-all hover:bg-slate-50 disabled:opacity-50"
						disabled={isFabricating || isPreviewingDraft}
						onClick={handleFabricate}
					>
						{isFabricating ? (
							<div className="flex items-center gap-2 text-indigo-600">
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								<span className="text-[10px] uppercase tracking-tight">
									Fabricating...
								</span>
							</div>
						) : (
							<>
								<BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
								Agentic Fabricate
							</>
						)}
					</button>
					<button
						className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-bold text-white text-xs shadow-indigo-500/20 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
						disabled={isPreviewingDraft}
						onClick={() => setIsTailorModalOpen(true)}
					>
						<Wand2 className="h-3.5 w-3.5" />
						Tailor for Job
					</button>
				</div>
			</header>

			<div className="p-6">
				<section className="space-y-4 rounded-xl border border-slate-200 border-dashed bg-slate-50/50 p-6">
					<h2 className="font-semibold text-lg text-slate-800">
						Import Existing Resume
					</h2>
					<PDFUpload onExtracted={handleExtracted} />
				</section>
			</div>

			<ResumeEditor
				data={activeData}
				disabled={isPreviewingDraft}
				onSync={handleSync}
			>
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
					onCancel={handleCancelExtraction}
					onConfirm={handleConfirmExtraction}
				/>
			)}
			{isTailorModalOpen && (
				<JobTailorModal onClose={() => setIsTailorModalOpen(false)} />
			)}
			{isFabricating && (
				<FabricationProgressModal
					currentStepId={currentStepId}
					status={fabricationStatus}
				/>
			)}
		</>
	);
}
