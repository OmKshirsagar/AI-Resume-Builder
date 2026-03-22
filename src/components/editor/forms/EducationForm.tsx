"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

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
				<h2 className="font-semibold text-lg text-slate-800">
					Education
				</h2>
				<button
					type="button"
					onClick={() => append({
						id: crypto.randomUUID(),
						school: "",
						degree: "",
						fieldOfStudy: "",
						location: "",
						startDate: "",
						endDate: "",
						current: false,
						description: [],
					})}
					disabled={disabled}
					className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Education
				</button>
			</div>

			{fields.length === 0 && (
				<p className="text-sm text-slate-400 italic text-center py-4">No education added yet.</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<EducationItem
						key={field.id}
						index={index}
						onRemove={() => remove(index)}
						disabled={disabled}
					/>
				))}
			</div>
		</section>
	);
}

function EducationItem({ index, onRemove, disabled }: { index: number, onRemove: () => void, disabled?: boolean }) {
	const [isOpen, setIsOpen] = useState(true);
	const { register, watch } = useFormContext<ResumeData>();

	const school = watch(`education.${index}.school`);
	const degree = watch(`education.${index}.degree`);

	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
			<div className="flex items-center justify-between bg-slate-50 px-4 py-3">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:text-slate-900 transition-colors flex-1 text-left"
				>
					{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
					<span className="truncate">
						{degree || "New Degree"} {school ? `@ ${school}` : ""}
					</span>
				</button>
				<button
					type="button"
					onClick={onRemove}
					disabled={disabled}
					className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50 ml-2"
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>

			{isOpen && (
				<div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1">
							<label htmlFor={`edu-school-${index}`} className="font-bold text-[10px] text-slate-400 uppercase">School</label>
							<input
								{...register(`education.${index}.school`)}
								id={`edu-school-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`edu-degree-${index}`} className="font-bold text-[10px] text-slate-400 uppercase">Degree</label>
							<input
								{...register(`education.${index}.degree`)}
								id={`edu-degree-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`edu-major-${index}`} className="font-bold text-[10px] text-slate-400 uppercase">Major / Field</label>
							<input
								{...register(`education.${index}.fieldOfStudy`)}
								id={`edu-major-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`edu-date-${index}`} className="font-bold text-[10px] text-slate-400 uppercase">End Date</label>
							<input
								{...register(`education.${index}.endDate`)}
								id={`edu-date-${index}`}
								placeholder="e.g. 2023"
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
