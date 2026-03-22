"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";

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
				<h2 className="font-semibold text-lg text-slate-800">Projects</h2>
				<button
					className="flex items-center gap-1 font-bold text-blue-600 text-xs hover:text-blue-700 disabled:opacity-50"
					disabled={disabled}
					onClick={() =>
						append({
							id: crypto.randomUUID(),
							name: "",
							description: [""],
							link: "",
							startDate: "",
							endDate: "",
						})
					}
					type="button"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Project
				</button>
			</div>

			<div className="space-y-4">
				{fields.map((field, index) => (
					<ProjectItem
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

function ProjectItem({
	index,
	onRemove,
	disabled,
}: {
	index: number;
	onRemove: () => void;
	disabled?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const { register, watch, control } = useFormContext<ResumeData>();
	const name = watch(`projects.${index}.name`);

	const {
		fields: bulletFields,
		append: appendBullet,
		remove: removeBullet,
	} = useFieldArray({
		control,
		// biome-ignore lint/suspicious/noExplicitAny: complex field path
		name: `projects.${index}.description` as any,
	});

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
					<span className="truncate">{name || "New Project"}</span>
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
								htmlFor={`proj-name-${index}`}
							>
								Project Name
							</label>
							<input
								{...register(`projects.${index}.name`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`proj-name-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`proj-link-${index}`}
							>
								Link
							</label>
							<input
								{...register(`projects.${index}.link`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`proj-link-${index}`}
								placeholder="https://..."
							/>
						</div>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`proj-desc-label-${index}`}
							>
								Description
							</label>
							<button
								className="font-bold text-[10px] text-blue-600"
								disabled={disabled}
								onClick={() => appendBullet("")}
								type="button"
							>
								+ Add Detail
							</button>
						</div>
						<div className="space-y-2" id={`proj-desc-label-${index}`}>
							{bulletFields.map((bField, bIndex) => (
								<div className="flex gap-2" key={bField.id}>
									<input
										{...register(
											// biome-ignore lint/suspicious/noExplicitAny: complex field path
											`projects.${index}.description.${bIndex}` as any,
										)}
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
									/>
									<button
										className="text-slate-300 transition-colors hover:text-red-500"
										disabled={disabled}
										onClick={() => removeBullet(bIndex)}
										type="button"
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
