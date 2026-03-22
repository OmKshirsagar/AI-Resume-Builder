"use client";

import { useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";
import { RefineButton } from "~/components/ai/RefineButton";

interface PersonalInfoFormProps {
	disabled?: boolean;
}

export function PersonalInfoForm({ disabled }: PersonalInfoFormProps) {
	const { register, setValue, watch } = useFormContext<ResumeData>();
	const summary = watch("personalInfo.summary");

	return (
		<section className="space-y-4">
			<h2 className="border-b pb-2 font-semibold text-lg text-slate-800">
				Personal Details
			</h2>
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<label htmlFor="fullName" className="font-medium text-slate-500 text-xs uppercase">
						Full Name
					</label>
					<input
						{...register("personalInfo.fullName")}
						id="fullName"
						className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
						placeholder="John Doe"
						disabled={disabled}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="email" className="font-medium text-slate-500 text-xs uppercase">
						Email
					</label>
					<input
						{...register("personalInfo.email")}
						id="email"
						type="email"
						className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
						placeholder="john@example.com"
						disabled={disabled}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="phone" className="font-medium text-slate-500 text-xs uppercase">
						Phone
					</label>
					<input
						{...register("personalInfo.phone")}
						id="phone"
						className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
						placeholder="+1 234 567 890"
						disabled={disabled}
					/>
				</div>
				<div className="space-y-2">
					<label htmlFor="location" className="font-medium text-slate-500 text-xs uppercase">
						Location
					</label>
					<input
						{...register("personalInfo.location")}
						id="location"
						className="h-10 w-full rounded border bg-white px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
						placeholder="City, State"
						disabled={disabled}
					/>
				</div>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label htmlFor="summary" className="font-medium text-slate-500 text-xs uppercase">
						Professional Summary
					</label>
					{!disabled && (
						<RefineButton
							text={summary || ""}
							onApply={(newText) => setValue("personalInfo.summary", newText, { shouldDirty: true })}
						/>
					)}
				</div>
				<textarea
					{...register("personalInfo.summary")}
					id="summary"
					className="min-h-[100px] w-full rounded border bg-white p-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
					placeholder="Briefly describe your professional background and goals..."
					disabled={disabled}
				/>
			</div>
		</section>
	);
}
