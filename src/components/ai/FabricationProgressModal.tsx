"use client";

import { Check, Loader2, Sparkles, BrainCircuit, Layout, BarChart3, PenLine } from "lucide-react";
import { clsx } from "clsx";

interface FabricationProgressModalProps {
	status: string;
	currentStepId: string;
}

export function FabricationProgressModal({ status, currentStepId }: FabricationProgressModalProps) {
	const steps = [
		{ id: "audit-resume", label: "Audit", icon: BarChart3 },
		{ id: "budget-resume", label: "Budget", icon: BrainCircuit },
		{ id: "fabricate-resume", label: "Fabricate", icon: PenLine },
		{ id: "stylist-orchestration", label: "Stylist", icon: Layout },
	];

	const getCurrentStepIndex = () => {
		return steps.findIndex(s => s.id === currentStepId);
	};

	const currentIndex = getCurrentStepIndex();

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
			<div className="w-full max-w-md scale-100 rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95 duration-300">
				<div className="flex flex-col items-center text-center space-y-6">
					{/* Header Icon */}
					<div className="relative">
						<div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
						<div className="relative rounded-full bg-indigo-600 p-4 text-white shadow-xl shadow-indigo-200">
							<Sparkles className="h-8 w-8 animate-pulse" />
						</div>
					</div>

					<div className="space-y-2">
						<h2 className="text-2xl font-bold text-slate-900 tracking-tight">Agentic Fabrication</h2>
						<p className="text-sm text-slate-500 font-medium">Multi-agent AI is redesigning your resume...</p>
					</div>

					{/* Steps Visualization */}
					<div className="w-full py-4">
						<div className="flex justify-between items-center relative">
							{/* Progress Line */}
							<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -translate-y-1/2" />
							<div 
								className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 transition-all duration-500 ease-in-out" 
								style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
							/>

							{steps.map((step, index) => {
								const Icon = step.icon;
								const isCompleted = index < currentIndex;
								const isActive = index === currentIndex;

								return (
									<div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
										<div className={clsx(
											"flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
											isCompleted ? "bg-green-500 border-green-500 text-white" : 
											isActive ? "bg-white border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-100" : 
											"bg-white border-slate-200 text-slate-400"
										)}>
											{isCompleted ? <Check className="h-5 w-5" /> : isActive ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon className="h-5 w-5" />}
										</div>
										<span className={clsx(
											"text-[10px] font-bold uppercase tracking-widest",
											isActive ? "text-indigo-600" : "text-slate-400"
										)}>
											{step.label}
										</span>
									</div>
								);
							})}
						</div>
					</div>

					{/* Current Status Badge */}
					<div className="w-full rounded-2xl bg-slate-50 p-4 border border-slate-100">
						<div className="flex items-center justify-center gap-3">
							<div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
							<p className="text-sm font-bold text-slate-700 tracking-tight">{status}</p>
						</div>
					</div>

					<p className="text-[10px] text-slate-400 italic">
						Mastra workflow ensures reliability and deterministic step-by-step progress.
					</p>
				</div>
			</div>
		</div>
	);
}
