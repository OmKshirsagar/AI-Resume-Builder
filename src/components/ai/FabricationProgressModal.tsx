"use client";

import { clsx } from "clsx";
import {
	BarChart3,
	BrainCircuit,
	Check,
	Layout,
	Loader2,
	PenLine,
	Sparkles,
} from "lucide-react";

interface FabricationProgressModalProps {
	status: string;
	currentStepId: string;
}

export function FabricationProgressModal({
	status,
	currentStepId,
}: FabricationProgressModalProps) {
	const steps = [
		{ id: "audit-resume", label: "Audit", icon: BarChart3 },
		{ id: "budget-resume", label: "Budget", icon: BrainCircuit },
		{ id: "fabricate-resume", label: "Fabricate", icon: PenLine },
		{ id: "stylist-orchestration", label: "Stylist", icon: Layout },
	];

	const getCurrentStepIndex = () => {
		return steps.findIndex((s) => s.id === currentStepId);
	};

	const currentIndex = getCurrentStepIndex();

	return (
		<div className="fade-in fixed inset-0 z-[100] flex animate-in items-center justify-center bg-black/60 backdrop-blur-md duration-300">
			<div className="zoom-in-95 w-full max-w-md scale-100 animate-in rounded-3xl bg-white p-8 shadow-2xl duration-300">
				<div className="flex flex-col items-center space-y-6 text-center">
					{/* Header Icon */}
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
						<div className="relative rounded-full bg-indigo-600 p-4 text-white shadow-indigo-200 shadow-xl">
							<Sparkles className="h-8 w-8 animate-pulse" />
						</div>
					</div>

					<div className="space-y-2">
						<h2 className="font-bold text-2xl text-slate-900 tracking-tight">
							Agentic Fabrication
						</h2>
						<p className="font-medium text-slate-500 text-sm">
							Multi-agent AI is redesigning your resume...
						</p>
					</div>

					{/* Steps Visualization */}
					<div className="w-full py-4">
						<div className="relative flex items-center justify-between">
							{/* Progress Line */}
							<div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 bg-slate-100" />
							<div
								className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-indigo-600 transition-all duration-500 ease-in-out"
								style={{
									width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
								}}
							/>

							{steps.map((step, index) => {
								const Icon = step.icon;
								const isCompleted = index < currentIndex;
								const isActive = index === currentIndex;

								return (
									<div
										className="relative z-10 flex flex-col items-center gap-2"
										key={step.id}
									>
										<div
											className={clsx(
												"flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
												isCompleted
													? "border-green-500 bg-green-500 text-white"
													: isActive
														? "scale-110 border-indigo-600 bg-white text-indigo-600 shadow-indigo-100 shadow-lg"
														: "border-slate-200 bg-white text-slate-400",
											)}
										>
											{isCompleted ? (
												<Check className="h-5 w-5" />
											) : isActive ? (
												<Loader2 className="h-5 w-5 animate-spin" />
											) : (
												<Icon className="h-5 w-5" />
											)}
										</div>
										<span
											className={clsx(
												"font-bold text-[10px] uppercase tracking-widest",
												isActive ? "text-indigo-600" : "text-slate-400",
											)}
										>
											{step.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Current Status Badge */}
					<div className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
						<div className="flex items-center justify-center gap-3">
							<div className="h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
							<p className="font-bold text-slate-700 text-sm tracking-tight">
								{status}
							</p>
						</div>
					</div>

					<p className="text-[10px] text-slate-400 italic">
						Mastra workflow ensures reliability and deterministic step-by-step
						progress.
					</p>
				</div>
			</div>
		</div>
	);
}
