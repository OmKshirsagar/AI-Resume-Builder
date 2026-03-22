"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RefineButton } from "~/components/ai/RefineButton";
import type { ResumeData } from "~/schemas/resume";

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
					className="flex items-center gap-1 font-bold text-blue-600 text-xs hover:text-blue-700 disabled:opacity-50"
					disabled={disabled}
					onClick={() =>
						append({
							id: crypto.randomUUID(),
							company: "",
							position: "",
							location: "",
							startDate: "",
							endDate: "",
							current: false,
							description: [""],
						})
					}
					type="button"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Experience
				</button>
			</div>

			{fields.length === 0 && (
				<p className="py-4 text-center text-slate-400 text-sm italic">
					No experience added yet.
				</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<ExperienceItem
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

function ExperienceItem({
	index,
	onRemove,
	disabled,
}: {
	index: number;
	onRemove: () => void;
	disabled?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const { control, register, watch, setValue } = useFormContext<ResumeData>();

	// biome-ignore lint/suspicious/noExplicitAny: complex field path for nested arrays
	const fieldName = `experience.${index}.description` as any;

	const {
		fields: bulletFields,
		append: appendBullet,
		remove: removeBullet,
	} = useFieldArray({
		control,
		name: fieldName,
	});

	const company = watch(`experience.${index}.company`);
	const position = watch(`experience.${index}.position`);

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
						{position || "New Position"} {company ? `@ ${company}` : ""}
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
								htmlFor={`exp-company-${index}`}
							>
								Company
							</label>
							<input
								{...register(`experience.${index}.company`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`exp-company-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`exp-position-${index}`}
							>
								Position
							</label>
							<input
								{...register(`experience.${index}.position`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`exp-position-${index}`}
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`exp-start-${index}`}
							>
								Start Date
							</label>
							<input
								{...register(`experience.${index}.startDate`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`exp-start-${index}`}
								placeholder="e.g. Jan 2020"
							/>
						</div>
						<div className="space-y-1">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`exp-end-${index}`}
							>
								End Date
							</label>
							<input
								{...register(`experience.${index}.endDate`)}
								className="h-9 w-full rounded border border-slate-200 px-3 text-sm focus:border-blue-500 focus:outline-none"
								disabled={disabled}
								id={`exp-end-${index}`}
								placeholder="e.g. Present"
							/>
						</div>
					</div>

					<div className="space-y-3">
						<div className="flex items-center justify-between">
							<label
								className="font-bold text-[10px] text-slate-400 uppercase"
								htmlFor={`exp-bullets-label-${index}`}
							>
								Description Bullets
							</label>
							<button
								className="font-bold text-[10px] text-blue-600 hover:text-blue-700"
								disabled={disabled}
								onClick={() => appendBullet("")}
								type="button"
							>
								+ Add Bullet
							</button>
						</div>

						<div className="space-y-3" id={`exp-bullets-label-${index}`}>
							{bulletFields.map((bulletField, bIndex) => {
								const bPath = `experience.${index}.description.${bIndex}`;
								const bulletValue = watch(
									// biome-ignore lint/suspicious/noExplicitAny: complex field path
									bPath as any,
								);
								return (
									<div className="group relative" key={bulletField.id}>
										<div className="mb-1 flex items-center justify-between">
											<span className="font-bold text-[9px] text-slate-300 uppercase">
												Bullet {bIndex + 1}
											</span>
											<div className="flex items-center gap-2">
												{!disabled && (
													<RefineButton
														onApply={(newText) =>
															// biome-ignore lint/suspicious/noExplicitAny: complex field path
															setValue(bPath as any, newText, {
																shouldDirty: true,
															})
														}
														text={bulletValue || ""}
													/>
												)}
												<button
													className="text-slate-300 transition-colors hover:text-red-500"
													disabled={disabled}
													onClick={() => removeBullet(bIndex)}
													type="button"
												>
													<Trash2 className="h-3 w-3" />
												</button>
											</div>
										</div>
										<textarea
											// biome-ignore lint/suspicious/noExplicitAny: complex field path
											{...register(bPath as any)}
											className="w-full rounded border border-slate-200 bg-slate-50 p-2 text-xs shadow-sm transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
											disabled={disabled}
											rows={2}
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
