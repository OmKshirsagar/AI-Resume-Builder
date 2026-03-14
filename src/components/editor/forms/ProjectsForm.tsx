"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ProjectsFormProps {
	disabled?: boolean;
}

export function ProjectsForm({ disabled }: ProjectsFormProps) {
	const { control } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "projects",
	});

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">
					Projects
				</h2>
				<button
					type="button"
					onClick={() => append({ id: crypto.randomUUID(), name: "", description: [""], link: "", startDate: "", endDate: "" })}
					disabled={disabled}
					className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Project
				</button>
			</div>

			<div className="space-y-4">
				{fields.map((field, index) => (
					<ProjectItem
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

function ProjectItem({ index, onRemove, disabled }: { index: number, onRemove: () => void, disabled?: boolean }) {
	const [isOpen, setIsOpen] = useState(true);
	const { register, watch, control } = useFormContext<ResumeData>();
	const name = watch(`projects.${index}.name`);

	const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({
		control,
		name: `projects.${index}.description` as any,
	});

	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
			<div className="flex items-center justify-between bg-slate-50 px-4 py-3">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="flex items-center gap-2 font-bold text-slate-700 text-sm hover:text-slate-900 transition-colors flex-1 text-left"
				>
					{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
					<span className="truncate">{name || "New Project"}</span>
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
							<label htmlFor={`proj-name-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">Project Name</label>
							<input
								{...register(`projects.${index}.name`)}
								id={`proj-name-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`proj-link-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">Link</label>
							<input
								{...register(`projects.${index}.link`)}
								id={`proj-link-${index}`}
								placeholder="https://..."
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
							<button
								type="button"
								onClick={() => appendBullet("")}
								disabled={disabled}
								className="text-[10px] font-bold text-blue-600"
							>
								+ Add Detail
							</button>
						</div>
						<div className="space-y-2">
							{bulletFields.map((bField, bIndex) => (
								<div key={bField.id} className="flex gap-2">
									<input
										{...register(`projects.${index}.description.${bIndex}` as any)}
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
									/>
									<button
										type="button"
										onClick={() => removeBullet(bIndex)}
										disabled={disabled}
										className="text-slate-300 hover:text-red-500 transition-colors"
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
