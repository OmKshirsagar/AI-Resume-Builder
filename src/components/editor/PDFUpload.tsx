"use client";

import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { extractResumeFromPDF } from "~/app/actions/extract";
import { checkExistingResume } from "~/app/actions/resume";
import type { ResumeData } from "~/schemas/resume";

interface PDFUploadProps {
	onExtracted: (data: ResumeData, fileHash?: string) => void;
}

/**
 * Calculates the SHA-256 hash of a file.
 */
async function getFileHash(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function PDFUpload({ onExtracted }: PDFUploadProps) {
	const [isExtracting, setIsExtracting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.type !== "application/pdf") {
			setError("Please upload a PDF file.");
			return;
		}

		setIsExtracting(true);
		setError(null);

		try {
			// 1. Calculate file hash for deduplication
			const hash = await getFileHash(file);

			// 2. Check if this exact file was already processed for this user
			const existingData = await checkExistingResume(hash);
			if (existingData) {
				onExtracted(existingData, hash);
				setIsExtracting(false);
				return;
			}

			// 3. If not found, proceed with local parsing + AI extraction
			const formData = new FormData();
			formData.append("file", file);

			const result = await extractResumeFromPDF(formData, hash);

			if (result.success && result.data) {
				// biome-ignore lint/suspicious/noExplicitAny: complex AI output mapping
				onExtracted(result.data as any, hash);
			} else {
				setError(result.error || "Failed to extract data");
			}
		} catch (err) {
			console.error(err);
			setError("An unexpected error occurred during upload.");
		} finally {
			setIsExtracting(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	return (
		<div className="space-y-4">
			<button
				aria-label="Upload PDF Resume"
				className="group relative flex min-h-[200px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-slate-200 border-dashed bg-white p-8 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
				disabled={isExtracting}
				onClick={() => fileInputRef.current?.click()}
				onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
				type="button"
			>
				<input
					accept=".pdf"
					className="hidden"
					disabled={isExtracting}
					onChange={handleFileChange}
					ref={fileInputRef}
					type="file"
				/>

				{isExtracting ? (
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="relative">
							<div className="absolute inset-0 animate-ping rounded-full bg-indigo-100" />
							<Loader2 className="relative h-12 w-12 animate-spin text-indigo-600" />
						</div>
						<div>
							<p className="font-bold text-slate-900">Processing Resume</p>
							<p className="text-slate-500 text-sm">
								Parsing layout and extracting details...
							</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col items-center gap-4 text-center">
						<div className="rounded-full bg-slate-50 p-4 transition-colors group-hover:bg-white group-hover:shadow-lg">
							<Upload className="h-8 w-8 text-slate-400 group-hover:text-indigo-600" />
						</div>
						<div>
							<p className="font-bold text-slate-900">
								Click to upload or drag and drop
							</p>
							<p className="text-slate-500 text-sm">PDF (max. 4MB)</p>
						</div>
					</div>
				)}
			</button>

			{error && (
				<div className="fade-in slide-in-from-top-2 flex animate-in items-center gap-2 rounded-xl bg-red-50 p-4 text-red-600">
					<AlertCircle className="h-5 w-5" />
					<p className="font-medium text-sm">{error}</p>
				</div>
			)}

			<div className="flex items-center justify-center gap-2 text-slate-400">
				<FileText className="h-4 w-4" />
				<p className="font-medium text-[11px] uppercase tracking-wider">
					AI will parse your PDF into the editor automatically.
				</p>
			</div>
		</div>
	);
}
