"use client";

import { useState, useCallback } from "react";
import { MainLayout } from "~/components/layout/MainLayout";
import { PreviewPane } from "~/components/preview/PreviewPane";
import { PDFUpload } from "~/components/editor/PDFUpload";
import { ParsedDataReview } from "~/components/editor/ParsedDataReview";
import { useResumeStore } from "~/store/useResumeStore";
import type { ResumeData } from "~/schemas/resume";
import { RefineButton } from "~/components/ai/RefineButton";
import { JobTailorModal } from "~/components/ai/JobTailorModal";
import { CustomSections } from "~/components/editor/CustomSections";
import { condenseResume } from "~/app/actions/condense";
import { Wand2, Check, X, Loader2, Sparkles } from "lucide-react";

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
	const [isCondensing, setIsCondensing] = useState(false);

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

	const handleCondense = async () => {
		setIsCondensing(true);
		try {
			const result = await condenseResume(original);
			if (result.success && result.data) {
				setDraft(result.data);
			} else {
				alert(result.error || "Failed to condense resume");
			}
		} catch (error) {
			console.error(error);
			alert("An unexpected error occurred during condensation.");
		} finally {
			setIsCondensing(false);
		}
	};

	const Editor = (
		<div className="mx-auto flex max-w-2xl flex-col space-y-8 p-6 pb-24">
			{isPreviewingDraft && (
				<div className="sticky top-0 z-30 mb-4 flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white shadow-xl animate-in slide-in-from-top duration-300 ring-4 ring-indigo-600/20">
					<div className="flex items-center gap-3">
						<Sparkles className="h-5 w-5 text-indigo-200 animate-pulse" />
						<div>
							<p className="font-bold text-sm">Previewing AI Condensed Version</p>
							<p className="text-xs text-indigo-100">Review changes in the preview pane before applying.</p>
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
							Apply to Master
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
						onClick={handleCondense}
						disabled={isCondensing || isPreviewingDraft}
						className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
					>
						{isCondensing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-indigo-500" />}
						Condense to 1-Page
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
							value={activeData.personalInfo.fullName}
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
							value={activeData.personalInfo.email}
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
				{activeData.experience.length === 0 ? (
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
									{exp.description.map((bullet, idx) => (
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
				{activeData.education.length === 0 ? (
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
			<div className="flex flex-col gap-6 p-8">
				<div className="flex flex-col items-center gap-1 text-center">
					<h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
						{activeData.personalInfo.fullName || "Your Name"}
					</h1>
					<div className="flex gap-2 text-sm text-slate-600">
						{activeData.personalInfo.email && <span>{activeData.personalInfo.email}</span>}
						{activeData.personalInfo.phone && (
							<>
								<span>•</span>
								<span>{activeData.personalInfo.phone}</span>
							</>
						)}
						{activeData.personalInfo.location && (
							<>
								<span>•</span>
								<span>{activeData.personalInfo.location}</span>
							</>
						)}
					</div>
				</div>

				{activeData.personalInfo.summary && (
					<section>
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-2 text-slate-900">
							Professional Summary
						</h2>
						<p className="text-sm leading-relaxed text-slate-800">{activeData.personalInfo.summary}</p>
					</section>
				)}

				{activeData.experience.length > 0 && (
					<section>
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3 text-slate-900">
							Experience
						</h2>
						<div className="space-y-4">
							{activeData.experience.map((exp) => (
								<div key={exp.id}>
									<div className="flex justify-between font-bold text-sm text-slate-900">
										<span>{exp.company}</span>
										<span>
											{exp.startDate} — {exp.current ? "Present" : exp.endDate}
										</span>
									</div>
									<div className="flex justify-between italic text-sm mb-1 text-slate-700 font-medium">
										<span>{exp.position}</span>
										<span>{exp.location}</span>
									</div>
									<ul className="list-disc ml-4 space-y-1">
										{exp.description.map((bullet, idx) => (
											<li key={idx} className="text-xs leading-relaxed text-slate-800">
												{bullet}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</section>
				)}

				{activeData.customSections.map((section) => (
					<section key={section.id}>
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3 text-slate-900">
							{section.title}
						</h2>
						<div className="space-y-3">
							{section.items.map((item) => (
								<div key={item.id}>
									<div className="flex justify-between font-bold text-sm text-slate-900">
										<span>{item.title}</span>
										{item.date && <span>{item.date}</span>}
									</div>
									{item.subtitle && (
										<div className="italic text-sm text-slate-700 font-medium">
											{item.subtitle}
										</div>
									)}
									<ul className="list-disc ml-4 mt-1 space-y-1">
										{item.description.map((bullet, idx) => (
											<li key={idx} className="text-xs leading-relaxed text-slate-800">
												{bullet}
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</section>
				))}

				{activeData.education.length > 0 && (
					<section>
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-3 text-slate-900">
							Education
						</h2>
						<div className="space-y-3">
							{activeData.education.map((edu) => (
								<div key={edu.id}>
									<div className="flex justify-between font-bold text-sm text-slate-900">
										<span>{edu.school}</span>
										<span>{edu.endDate}</span>
									</div>
									<div className="flex justify-between italic text-sm text-slate-700 font-medium">
										<span>
											{edu.degree}
											{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
										</span>
										<span>{edu.location}</span>
									</div>
								</div>
							))}
						</div>
					</section>
				)}

				{activeData.skills.length > 0 && (
					<section>
						<h2 className="border-b border-slate-900 font-bold uppercase tracking-wider text-sm mb-2 text-slate-900">
							Skills
						</h2>
						<div className="text-sm text-slate-800">
							<span className="font-bold">Technical Skills: </span>
							<span>{activeData.skills.map((s) => s.name).join(", ")}</span>
						</div>
					</section>
				)}
			</div>
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
