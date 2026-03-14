"use client";

import { readStreamableValue } from "@ai-sdk/rsc";
import { Check, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { refineText } from "~/app/actions/refine";

interface RefineButtonProps {
	text: string;
	onApply: (newText: string) => void;
}

export function RefineButton({ text, onApply }: RefineButtonProps) {
	const [isRefining, setIsRefining] = useState(false);
	const [refinedText, setRefinedText] = useState("");
	const [showPreview, setShowPreview] = useState(false);

	const handleRefine = async () => {
		if (!text.trim()) return;

		setIsRefining(true);
		setRefinedText("");
		setShowPreview(true);

		try {
			const { output } = await refineText(text);

			for await (const delta of readStreamableValue(output)) {
				setRefinedText((current) => current + (delta ?? ""));
			}
		} catch (error) {
			console.error("Refinement failed:", error);
			setShowPreview(false);
		} finally {
			setIsRefining(false);
		}
	};

	const handleApply = () => {
		onApply(refinedText);
		setShowPreview(false);
		setRefinedText("");
	};

	const handleCancel = () => {
		setShowPreview(false);
		setRefinedText("");
	};

	return (
		<div className="relative inline-block">
			<button
				className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-600 text-xs transition-colors hover:bg-blue-100 disabled:opacity-50"
				disabled={isRefining || !text.trim()}
				onClick={handleRefine}
				title="Refine with AI (X-Y-Z formula)"
				type="button"
			>
				{isRefining ? (
					<Loader2 className="h-3 w-3 animate-spin" />
				) : (
					<Sparkles className="h-3 w-3" />
				)}
				Refine
			</button>

			{showPreview && (
				<div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-lg border bg-white p-4 shadow-xl ring-1 ring-black/5">
					<div className="mb-2 flex items-center justify-between">
						<span className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
							AI Refinement (X-Y-Z)
						</span>
						<button
							className="text-slate-400 hover:text-slate-600"
							onClick={handleCancel}
							type="button"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					<div className="mb-4 min-h-[4rem] rounded bg-slate-50 p-3 text-slate-700 text-sm italic leading-relaxed">
						{refinedText || (isRefining && "Generating...")}
						{isRefining && (
							<span className="ml-0.5 inline-block h-3 w-1 animate-pulse bg-blue-500" />
						)}
					</div>

					{!isRefining && refinedText && (
						<div className="flex justify-end gap-2">
							<button
								className="rounded px-2.5 py-1.5 font-medium text-slate-600 text-xs hover:bg-slate-100"
								onClick={handleCancel}
								type="button"
							>
								Discard
							</button>
							<button
								className="flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-1.5 font-medium text-white text-xs hover:bg-blue-700"
								onClick={handleApply}
								type="button"
							>
								<Check className="h-3 w-3" />
								Apply
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
