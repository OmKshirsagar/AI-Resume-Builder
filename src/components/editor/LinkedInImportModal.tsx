"use client";

import { ArrowRight, FileDown, Info, Loader2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { extractResumeFromPDF } from "~/app/actions/extract";
import { checkExistingResume } from "~/app/actions/resume";
import type { ResumeData } from "~/schemas/resume";

interface LinkedInImportModalProps {
	onClose: () => void;
	onExtracted: (data: ResumeData, fileHash?: string) => void;
}

export function LinkedInImportModal({
	onClose,
	onExtracted,
}: LinkedInImportModalProps) {
	const [step, setStep] = useState(1);
	const [isExtracting, setIsExtracting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const getFileHash = async (file: File): Promise<string> => {
		const buffer = await file.arrayBuffer();
		const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsExtracting(true);
		setError(null);

		try {
			const hash = await getFileHash(file);
			const existingData = await checkExistingResume(hash);

			if (existingData) {
				onExtracted(existingData, hash);
				onClose();
				return;
			}

			const formData = new FormData();
			formData.append("file", file);

			const result = await extractResumeFromPDF(formData, hash);

			if (result.success && result.data) {
				// biome-ignore lint/suspicious/noExplicitAny: AI data cast
				onExtracted(result.data as any, hash);
				onClose();
			} else {
				setError(result.error || "Failed to parse LinkedIn PDF");
			}
		} catch (err) {
			console.error(err);
			setError("An error occurred during import.");
		} finally {
			setIsExtracting(false);
		}
	};

	return (
		<div className="fade-in fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-300">
			<div className="zoom-in-95 flex max-h-[90vh] w-full max-w-2xl animate-in flex-col overflow-hidden rounded-3xl bg-white shadow-2xl duration-300">
				{/* Header */}
				<header className="flex items-center justify-between border-slate-100 border-b bg-slate-50/50 p-6">
					<div className="flex items-center gap-3">
						<div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-blue-200 shadow-lg">
							<FileDown className="h-6 w-6" />
						</div>
						<div>
							<h2 className="font-bold text-slate-900 text-xl tracking-tight">
								Import from LinkedIn
							</h2>
							<p className="font-medium text-slate-500 text-xs uppercase tracking-wider">
								Turn your profile into a professional resume
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
					{step === 1 && (
						<div className="slide-in-from-bottom-4 animate-in space-y-8 duration-500">
							<div className="space-y-4">
								<h3 className="font-bold text-lg text-slate-900">
									How to get your LinkedIn PDF:
								</h3>
								<div className="grid gap-4">
									{[
										"Go to your LinkedIn Profile",
										"Click the 'More' button in your header",
										"Select 'Save to PDF' from the dropdown",
									].map((text, i) => (
										<div className="flex items-center gap-4" key={text}>
											<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600 text-sm">
												{i + 1}
											</div>
											<p className="font-medium text-slate-700">{text}</p>
										</div>
									))}
								</div>
							</div>

							<div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
								<div className="flex gap-3">
									<Info className="h-5 w-5 shrink-0 text-blue-500" />
									<p className="text-blue-700 text-sm leading-relaxed">
										LinkedIn's "Save to PDF" export is much cleaner than a web
										print. Our AI is tuned specifically to recognize this format
										accurately.
									</p>
								</div>
							</div>

							<button
								className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-bold text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95"
								onClick={() => setStep(2)}
								type="button"
							>
								I have my PDF ready
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					)}

					{step === 2 && (
						<div className="slide-in-from-bottom-4 animate-in space-y-6 duration-500">
							<button
								className="group relative flex min-h-[250px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-slate-200 border-dashed bg-slate-50 p-8 transition-all hover:border-blue-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								disabled={isExtracting}
								onClick={() => fileInputRef.current?.click()}
								onKeyDown={(e) =>
									e.key === "Enter" &&
									!isExtracting &&
									fileInputRef.current?.click()
								}
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
											<div className="absolute inset-0 animate-ping rounded-full bg-blue-100" />
											<Loader2 className="relative h-12 w-12 animate-spin text-blue-600" />
										</div>
										<div>
											<p className="font-bold text-slate-900">
												Parsing LinkedIn Data
											</p>
											<p className="text-slate-500 text-sm">
												This usually takes about 10-15 seconds...
											</p>
										</div>
									</div>
								) : (
									<div className="flex flex-col items-center gap-4 text-center">
										<div className="rounded-full bg-white p-5 shadow-sm transition-transform group-hover:scale-110">
											<Upload className="h-8 w-8 text-blue-500" />
										</div>
										<div>
											<p className="font-bold text-lg text-slate-900">
												Upload your LinkedIn PDF
											</p>
											<p className="text-slate-500 text-sm">
												Drop the file here or click to browse
											</p>
										</div>
									</div>
								)}
							</button>

							{error && (
								<div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-red-600">
									<X className="h-5 w-5 shrink-0" />
									<p className="font-medium text-sm">{error}</p>
								</div>
							)}

							<button
								className="w-full font-bold text-slate-400 text-sm transition-colors hover:text-slate-600"
								disabled={isExtracting}
								onClick={() => setStep(1)}
								type="button"
							>
								Back to Instructions
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
