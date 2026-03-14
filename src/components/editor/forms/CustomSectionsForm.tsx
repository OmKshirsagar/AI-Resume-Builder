"use client";

import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";

interface CustomSectionsFormProps {
	disabled?: boolean;
}

export function CustomSectionsForm({ disabled }: CustomSectionsFormProps) {
	const { control } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "customSections",
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">
					Custom Sections
				</h2>
				<button
					className="flex items-center gap-1 font-bold text-blue-600 text-xs hover:text-blue-700 disabled:opacity-50"
					disabled={disabled}
					onClick={() =>
						append({ id: crypto.randomUUID(), title: "New Section", items: [] })
					}
					type="button"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Section
				</button>
			</div>

			{fields.length === 0 && (
				<p className="text-slate-400 text-sm italic">
					No custom sections added yet.
				</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<CustomSectionItemComponent
						disabled={disabled}
						index={index}
						key={field.id}
						onRemove={() => remove(index)}
					/>
				))}
			</div>
		</div>
	);
}

function CustomSectionItemComponent({
	index,
	onRemove,
	disabled,
}: {
	index: number;
	onRemove: () => void;
	disabled?: boolean;
}) {
	const [isOpen, setIsOpen] = useState(true);
	const { control, register, watch } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: `customSections.${index}.items`,
	});

	const title = watch(`customSections.${index}.title`);

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
			<div className="flex items-center justify-between bg-slate-50 px-4 py-3">
				<div className="flex flex-1 items-center gap-2 font-bold text-slate-700 text-sm">
					<button
						className="rounded p-1 transition-colors hover:bg-slate-200"
						onClick={() => setIsOpen(!isOpen)}
						type="button"
					>
						{isOpen ? (
							<ChevronDown className="h-4 w-4" />
						) : (
							<ChevronRight className="h-4 w-4" />
						)}
					</button>
					<input
						{...register(`customSections.${index}.title`)}
						className="w-full border-none bg-transparent p-0 font-bold text-sm focus:ring-0"
						disabled={disabled}
						placeholder="Section Title (e.g. Certifications)"
					/>
				</div>
				<button
					className="text-slate-400 transition-colors hover:text-red-500 disabled:opacity-50"
					disabled={disabled}
					onClick={onRemove}
					type="button"
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>

			{isOpen && (
				<div className="slide-in-from-top-2 animate-in space-y-4 p-4 duration-200">
					<div className="space-y-4">
						{fields.map((itemField, itemIndex) => (
							<div
								className="relative space-y-3 border-slate-100 border-l-2 pl-4"
								key={itemField.id}
							>
								<button
									className="absolute top-0 -right-1 text-slate-300 transition-colors hover:text-red-500"
									disabled={disabled}
									onClick={() => remove(itemIndex)}
									type="button"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>

								<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
									<input
										{...register(
											`customSections.${index}.items.${itemIndex}.title`,
										)}
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
										placeholder="Item Title"
									/>
									<input
										{...register(
											`customSections.${index}.items.${itemIndex}.date`,
										)}
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
										placeholder="Date"
									/>
								</div>
								<input
									{...register(
										`customSections.${index}.items.${itemIndex}.subtitle`,
									)}
									className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
									disabled={disabled}
									placeholder="Subtitle/Organization"
								/>
							</div>
						))}
					</div>

					<button
						className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 border-dashed px-4 py-2 font-medium text-slate-500 text-xs transition-all hover:bg-slate-50 hover:text-slate-700"
						disabled={disabled}
						onClick={() =>
							append({
								id: crypto.randomUUID(),
								title: "",
								subtitle: "",
								date: "",
								description: [],
							})
						}
						type="button"
					>
						<Plus className="h-3.5 w-3.5" />
						Add Item to {title || "Section"}
					</button>
				</div>
			)}
		</div>
	);
}
