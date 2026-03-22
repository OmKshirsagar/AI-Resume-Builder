"use client";

import { useFormContext } from "react-hook-form";
import { RefineButton } from "~/components/ai/RefineButton";
import type { ResumeData } from "~/schemas/resume";

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
					<label
						className="font-medium text-slate-500 text-xs uppercase"
						htmlFor="fullName"
					>
						Full Name
					</label>
					<input
						{...register("personalInfo.fullName")}
						className="h-10 w-full rounded border bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						disabled={disabled}
						id="fullName"
						placeholder="John Doe"
					/>
				</div>
				<div className="space-y-2">
					<label
						className="font-medium text-slate-500 text-xs uppercase"
						htmlFor="email"
					>
						Email
					</label>
					<input
						{...register("personalInfo.email")}
						className="h-10 w-full rounded border bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						disabled={disabled}
						id="email"
						placeholder="john@example.com"
						type="email"
					/>
				</div>
				<div className="space-y-2">
					<label
						className="font-medium text-slate-500 text-xs uppercase"
						htmlFor="phone"
					>
						Phone
					</label>
					<input
						{...register("personalInfo.phone")}
						className="h-10 w-full rounded border bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						disabled={disabled}
						id="phone"
						placeholder="+1 234 567 890"
					/>
				</div>
				<div className="space-y-2">
					<label
						className="font-medium text-slate-500 text-xs uppercase"
						htmlFor="location"
					>
						Location
					</label>
					<input
						{...register("personalInfo.location")}
						className="h-10 w-full rounded border bg-white px-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
						disabled={disabled}
						id="location"
						placeholder="City, State"
					/>
				</div>
			</div>
			<div className="space-y-2">
				<div className="flex items-center justify-between">
					<label
						className="font-medium text-slate-500 text-xs uppercase"
						htmlFor="summary"
					>
						Professional Summary
					</label>
					{!disabled && (
						<RefineButton
							onApply={(newText) =>
								setValue("personalInfo.summary", newText, { shouldDirty: true })
							}
							text={summary || ""}
						/>
					)}
				</div>
				<textarea
					{...register("personalInfo.summary")}
					className="min-h-[100px] w-full rounded border bg-white p-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
					disabled={disabled}
					id="summary"
					placeholder="Briefly describe your professional background and goals..."
				/>
			</div>
		</section>
	);
}
