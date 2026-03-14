"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { Download, Loader2 } from "lucide-react";
import { PDFDocument } from "./PDFDocument";
import type { ResumeData } from "~/schemas/resume";

interface DownloadButtonProps {
	data: ResumeData;
}

export function DownloadButton({ data }: DownloadButtonProps) {
	const [isGenerating, setIsGenerating] = useState(false);

	const handleDownload = async () => {
		setIsGenerating(true);
		try {
			const blob = await pdf(<PDFDocument data={data} />).toBlob();
			const fileName = `${data.personalInfo.fullName.replace(/\s+/g, "_")}_Resume.pdf`;
			saveAs(blob, fileName);
		} catch (error) {
			console.error("PDF Generation failed:", error);
			alert("Failed to generate PDF. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<button
			onClick={handleDownload}
			disabled={isGenerating}
			className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
		>
			{isGenerating ? (
				<>
					<Loader2 className="h-3.5 w-3.5 animate-spin" />
					Generating...
				</>
			) : (
				<>
					<Download className="h-3.5 w-3.5" />
					Download PDF
				</>
			)}
		</button>
	);
}
