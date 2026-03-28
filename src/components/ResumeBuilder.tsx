"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BrainCircuit,
	Check,
	LayoutDashboard,
	Loader2,
	Plus,
	Sparkles,
	Wand2,
	X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Layout } from "react-resizable-panels";
import { FabricationProgressModal } from "~/components/ai/FabricationProgressModal";
import { JobTailorModal } from "~/components/ai/JobTailorModal";
import { CustomSectionsForm } from "~/components/editor/forms/CustomSectionsForm";
import { EducationForm } from "~/components/editor/forms/EducationForm";
import { ExperienceForm } from "~/components/editor/forms/ExperienceForm";
import { PersonalInfoForm } from "~/components/editor/forms/PersonalInfoForm";
import { ProjectsForm } from "~/components/editor/forms/ProjectsForm";
import { SkillsForm } from "~/components/editor/forms/SkillsForm";
import { LinkedInImportModal } from "~/components/editor/LinkedInImportModal";
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
	initialData?: ResumeData;
	resumeId?: string;
}

export function ResumeBuilder({
	defaultLayout,
	initialData,
	resumeId,
}: ResumeBuilderProps) {
	const { original, draft, setOriginal, setDraft, applyDraft, discardDraft } =
		useResumeStore();

	const [pendingExtractedData, setPendingExtractedData] =
		useState<ResumeData | null>(null);
	const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
	const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
	const [isFabricating, setIsFabricating] = useState(false);
	const [fabricationStatus, setFabricationStatus] = useState("");
	const [currentStepId, setCurrentStepId] = useState("");

	// Initialize store with initialData if provided (from SSR)
	useEffect(() => {
		if (initialData) {
			setOriginal(initialData);
		}
	}, [initialData, setOriginal]);

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

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Fabrication failed");
			}

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
		<div className="flex h-full flex-col overflow-hidden bg-white">
			{isPreviewingDraft && (
				<div className="slide-in-from-top m-4 flex animate-in items-center justify-between rounded-xl bg-indigo-600 p-3 text-white shadow-xl ring-4 ring-indigo-600/20 duration-300">
					<div className="flex items-center gap-3">
						<Sparkles className="h-4 w-4 animate-pulse text-indigo-200" />
						<div>
							<p className="font-bold text-xs">Previewing Fabrication</p>
						</div>
					</div>
					<div className="flex gap-2">
						<button
							className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 font-bold text-[10px] transition-colors hover:bg-white/20"
							onClick={discardDraft}
							type="button"
						>
							<X className="h-3 w-3" />
							Discard
						</button>
						<button
							className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 font-bold text-[10px] text-indigo-600 transition-colors hover:bg-indigo-50"
							onClick={applyDraft}
							type="button"
						>
							<Check className="h-3 w-3" />
							Apply
						</button>
					</div>
				</div>
			)}

			<header className="flex items-center justify-between gap-4 border-slate-100 border-b bg-white px-6 py-3">
				<div className="flex items-center gap-3">
					<UserButton
						appearance={{
							elements: {
								avatarBox:
									"h-8 w-8 rounded-lg shadow-sm border border-slate-200",
							},
						}}
					/>
					<div className="h-6 w-px bg-slate-200" />
					<div className="flex flex-col">
						<h1 className="font-bold text-slate-900 text-sm leading-none tracking-tight">
							Resume Editor
						</h1>
						{resumeId && (
							<span className="font-bold text-[9px] text-indigo-500 uppercase tracking-tight">
								Saved Copy
							</span>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Link
						className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 text-xs transition-all hover:bg-slate-50"
						href="/dashboard"
					>
						<LayoutDashboard className="h-3.5 w-3.5" />
						Dashboard
					</Link>
					<div className="mx-1 h-5 w-px bg-slate-100" />
					<DownloadButton data={activeData} />
					<button
						className="flex min-w-[140px] items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 text-xs transition-all hover:bg-slate-50 disabled:opacity-50"
						disabled={isFabricating || isPreviewingDraft}
						onClick={handleFabricate}
						type="button"
					>
						{isFabricating ? (
							<div className="flex items-center gap-2 text-indigo-600">
								<Loader2 className="h-3 w-3 animate-spin" />
								<span className="font-bold text-[9px] uppercase tracking-tight">
									AI...
								</span>
							</div>
						) : (
							<>
								<BrainCircuit className="h-3.5 w-3.5 text-indigo-500" />
								AI Fabricate
							</>
						)}
					</button>
					<button
						className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 font-bold text-white text-xs shadow-indigo-500/20 shadow-lg transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
						disabled={isPreviewingDraft}
						onClick={() => setIsTailorModalOpen(true)}
						type="button"
					>
						<Wand2 className="h-3.5 w-3.5" />
						Tailor
					</button>
				</div>
			</header>

			<div className="flex-1 overflow-y-auto">
				<div className="p-6">
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<section className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50/50 p-6 text-center transition-colors hover:border-indigo-200">
							<div>
								<h3 className="font-bold text-slate-900 text-sm">
									LinkedIn Import
								</h3>
								<p className="mt-0.5 text-slate-500 text-xs">
									Instant profile ingestion
								</p>
							</div>
							<button
								className="mx-auto flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-[10px] text-white shadow-lg transition-all hover:bg-slate-800 active:scale-95"
								onClick={() => setIsLinkedInModalOpen(true)}
								type="button"
							>
								<Plus className="h-3 w-3" />
								Import
							</button>
						</section>

						<section className="flex flex-col justify-center space-y-3 rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50/50 p-6 text-center transition-colors hover:border-indigo-200">
							<div>
								<h3 className="font-bold text-slate-900 text-sm">PDF Upload</h3>
								<p className="mt-0.5 text-slate-500 text-xs">
									Extract from existing resume
								</p>
							</div>
							<PDFUpload onExtracted={handleExtracted} />
						</section>
					</div>
				</div>

				<div className="px-6 pb-20">
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
			</div>
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
			{isLinkedInModalOpen && (
				<LinkedInImportModal
					onClose={() => setIsLinkedInModalOpen(false)}
					onExtracted={handleExtracted}
				/>
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
