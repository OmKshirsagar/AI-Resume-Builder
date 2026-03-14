"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { RefineButton } from "~/components/ai/RefineButton";
import { clsx } from "clsx";

interface ExperienceFormProps {
	disabled?: boolean;
}

export function ExperienceForm({ disabled }: ExperienceFormProps) {
	const { control } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "experience",
	});

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">
					Work Experience
				</h2>
				<button
					type="button"
					onClick={() => append({
						id: crypto.randomUUID(),
						company: "",
						position: "",
						location: "",
						startDate: "",
						endDate: "",
						current: false,
						description: [""],
					})}
					disabled={disabled}
					className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Experience
				</button>
			</div>

			{fields.length === 0 && (
				<p className="text-sm text-slate-400 italic text-center py-4">No experience added yet.</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<ExperienceItem
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

function ExperienceItem({ index, onRemove, disabled }: { index: number, onRemove: () => void, disabled?: boolean }) {
	const [isOpen, setIsOpen] = useState(true);
	const { control, register, watch, setValue } = useFormContext<ResumeData>();
	const { fields: bulletFields, append: appendBullet, remove: removeBullet } = useFieldArray({
		control,
		name: `experience.${index}.description` as any,
	});

	const company = watch(`experience.${index}.company`);
	const position = watch(`experience.${index}.position`);

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
						{position || "New Position"} {company ? `@ ${company}` : ""}
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
							<label htmlFor={`exp-company-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">Company</label>
							<input
								{...register(`experience.${index}.company`)}
								id={`exp-company-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`exp-position-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">Position</label>
							<input
								{...register(`experience.${index}.position`)}
								id={`exp-position-${index}`}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`exp-start-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
							<input
								{...register(`experience.${index}.startDate`)}
								id={`exp-start-${index}`}
								placeholder="e.g. Jan 2020"
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
						<div className="space-y-1">
							<label htmlFor={`exp-end-${index}`} className="text-[10px] font-bold text-slate-400 uppercase">End Date</label>
							<input
								{...register(`experience.${index}.endDate`)}
								id={`exp-end-${index}`}
								placeholder="e.g. Present"
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
							/>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label className="text-[10px] font-bold text-slate-400 uppercase">Description Bullets</label>
							<button
								type="button"
								onClick={() => appendBullet("")}
								disabled={disabled}
								className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
							>
								+ Add Bullet
							</button>
						</div>
						
						<div className="space-y-3">
							{bulletFields.map((bulletField, bIndex) => {
								const bulletValue = watch(`experience.${index}.description.${bIndex}` as any);
								return (
									<div key={bulletField.id} className="relative group">
										<div className="flex justify-between items-center mb-1">
											<span className="text-[9px] text-slate-300 font-bold uppercase">Bullet {bIndex + 1}</span>
											<div className="flex items-center gap-2">
												{!disabled && (
													<RefineButton
														text={bulletValue || ""}
														onApply={(newText) => setValue(`experience.${index}.description.${bIndex}` as any, newText, { shouldDirty: true })}
													/>
												)}
												<button
													type="button"
													onClick={() => removeBullet(bIndex)}
													disabled={disabled}
													className="text-slate-300 hover:text-red-500 transition-colors"
												>
													<Trash2 className="h-3 w-3" />
												</button>
											</div>
										</div>
										<textarea
											{...register(`experience.${index}.description.${bIndex}` as any)}
											className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs shadow-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
											rows={2}
											disabled={disabled}
										/>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
