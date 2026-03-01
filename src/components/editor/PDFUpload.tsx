"use client";

import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { extractResumeFromPDF } from "~/app/actions/extract";
import type { ResumeData } from "~/schemas/resume";

interface PDFUploadProps {
	onExtracted: (data: ResumeData) => void;
}

export function PDFUpload({ onExtracted }: PDFUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check file type
		if (file.type !== "application/pdf") {
			setError("Please upload a PDF file.");
			return;
		}

		// Check file size (4MB limit)
		if (file.size > 4 * 1024 * 1024) {
			setError("File size exceeds 4MB limit.");
			return;
		}

		setIsUploading(true);
		setError(null);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const result = await extractResumeFromPDF(formData);

			if (result.success && result.data) {
				// Map extracted data to include IDs for the resume store
				const dataWithIds: ResumeData = {
					personalInfo: {
						...result.data.personalInfo,
						website: "",
						linkedin: "",
						github: "",
						summary: result.data.personalInfo.summary ?? "",
						phone: result.data.personalInfo.phone ?? "",
						location: result.data.personalInfo.location ?? "",
					},
					experience: result.data.experience.map((exp) => ({
						...exp,
						id: crypto.randomUUID(),
						location: exp.location ?? "",
						endDate: exp.endDate ?? "",
					})),
					education: result.data.education.map((edu) => ({
						...edu,
						id: crypto.randomUUID(),
						location: edu.location ?? "",
						startDate: edu.startDate ?? "",
						endDate: edu.endDate ?? "",
						fieldOfStudy: edu.fieldOfStudy ?? "",
						current: false,
						description: [],
					})),
					skills: result.data.skills.map((skill) => ({
						...skill,
						id: crypto.randomUUID(),
						level: skill.level ?? "",
					})),
					projects: result.data.projects.map((project) => ({
						id: crypto.randomUUID(),
						name: project.name,
						description: [project.description],
						link: project.link ?? "",
						startDate: project.startDate ?? "",
						endDate: project.endDate ?? "",
					})),
				};

				onExtracted(dataWithIds);
			} else {
				setError(result.error ?? "Failed to extract data");
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
			console.error(err);
		} finally {
			setIsUploading(false);
			// Reset file input
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="flex flex-col gap-4">
			<button
				type="button"
				aria-label="Upload PDF resume"
				className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${isUploading ? "border-muted bg-muted/50" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"}`}
				onClick={() => !isUploading && fileInputRef.current?.click()}
				disabled={isUploading}
			>
				<input
					accept="application/pdf"
					className="hidden"
					disabled={isUploading}
					onChange={handleFileChange}
					ref={fileInputRef}
					type="file"
				/>

				{isUploading ? (
					<div className="flex flex-col items-center gap-3">
						<Loader2 className="h-10 w-10 animate-spin text-primary" />
						<p className="font-medium text-muted-foreground text-sm">
							Extracting resume data...
						</p>
					</div>
				) : (
					<div className="flex flex-col items-center gap-3">
						<div className="rounded-full bg-primary/10 p-3">
							<Upload className="h-6 w-6 text-primary" />
						</div>
						<div className="text-center">
							<p className="font-semibold text-sm">
								Click to upload or drag and drop
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								PDF (max. 4MB)
							</p>
						</div>
					</div>
				)}
			</button>

			{error && (
				<div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-destructive text-sm">
					<AlertCircle className="h-4 w-4 shrink-0" />
					<p>{error}</p>
				</div>
			)}

			{!isUploading && !error && (
				<div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
					<FileText className="h-3 w-3" />
					<p>AI will parse your PDF into the editor automatically.</p>
				</div>
			)}
		</div>
	);
}
