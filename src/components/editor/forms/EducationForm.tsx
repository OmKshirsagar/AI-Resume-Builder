"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";

interface EducationFormProps {
	disabled?: boolean;
}

export function EducationForm({ disabled }: EducationFormProps) {
	const { control } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "education",
	});

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">Education</h2>
				<button
					className="flex items-center gap-1 font-bold text-blue-600 text-xs hover:text-blue-700 disabled:opacity-50"
					disabled={disabled}
					onClick={() =>
						append({
							id: crypto.randomUUID(),
							school: "",
							degree: "",
							fieldOfStudy: "",
							location: "",
							startDate: "",
							endDate: "",
							current: false,
							description: [],
						})
					}
					type="button"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Education
				</button>
			</div>

			{fields.length === 0 && (
				<p className="py-4 text-center text-slate-400 text-sm italic">
					No education added yet.
				</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<EducationItem
						disabled={disabled}
						index={index}
						key={field.id}
						onRemove={() => remove(index)}
					/>
				))}
			</div>
		</section>
	);
}

function EducationItem({
	index,
	onRemove,
	disabled,
}: {
	index: number;
	onRemove: () => void;
	disabled?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const { register, watch } = useFormContext<ResumeData>();

	const school = watch(`education.${index}.school`);
	const degree = watch(`education.${index}.degree`);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div className="flex items-center justify-between bg-slate-50 px-4 py-3">
				<button
					className="flex flex-1 items-center gap-2 text-left font-bold text-slate-700 text-sm transition-colors hover:text-slate-900"
					onClick={() => setIsOpen(!isOpen)}
					type="button"
				>
					{isOpen ? (
						<ChevronDown className="h-4 w-4" />
					) : (
						<ChevronRight className="h-4 w-4" />
					)}
					<span className="truncate">
						{degree || "New Degree"} {school ? `@ ${school}` : ""}
					</span>
				</button>
				<button
					className="ml-2 text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
					disabled={disabled}
					onClick={onRemove}
					type="button"
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>

			{isOpen && (
				<div className="slide-in-from-top-2 animate-in space-y-4 p-4 duration-200">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`edu-school-${index}`}
							>
								School
							</label>
							<input
								{...register(`education.${index}.school`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`edu-school-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`edu-degree-${index}`}
							>
								Degree
							</label>
							<input
								{...register(`education.${index}.degree`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`edu-degree-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`edu-major-${index}`}
							>
								Major / Field
							</label>
							<input
								{...register(`education.${index}.fieldOfStudy`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`edu-major-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`edu-date-${index}`}
							>
								End Date
							</label>
							<input
								{...register(`education.${index}.endDate`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`edu-date-${index}`}
								placeholder="e.g. 2023"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
