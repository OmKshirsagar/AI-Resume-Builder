"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResumeSchema, type ResumeData, type CustomSection } from "~/schemas/resume";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface CustomSectionsProps {
	data: ResumeData;
	onChange: (customSections: CustomSection[]) => void;
	disabled?: boolean;
}

export function CustomSections({ data, onChange, disabled }: CustomSectionsProps) {
	// Using any for resolver because the strict ResumeSchema type sometimes conflicts with
	// the recursive nature of useFieldArray's internal representation.
	const { control, watch, reset } = useForm<ResumeData>({
		resolver: zodResolver(ResumeSchema as any),
		defaultValues: data,
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "customSections",
	});

	// Use ref to prevent circular updates
	const isResetting = useRef(false);

	// Reset form when external data changes (e.g. after extraction)
	useEffect(() => {
		isResetting.current = true;
		reset(data);
		// Reset the flag after RHF has processed the reset
		setTimeout(() => {
			isResetting.current = false;
		}, 0);
	}, [data, reset]);

	// Watch for changes and sync back to parent
	const watchedSections = watch("customSections");
	
	useEffect(() => {
		if (watchedSections && !isResetting.current) {
			// Deep compare to avoid unnecessary updates if data hasn't changed
			if (JSON.stringify(watchedSections) !== JSON.stringify(data.customSections)) {
				onChange(watchedSections);
			}
		}
	}, [watchedSections, onChange, data.customSections]);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">Custom Sections</h2>
				<button
					type="button"
					onClick={() => append({ id: crypto.randomUUID(), title: "New Section", items: [] })}
					disabled={disabled}
					className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Section
				</button>
			</div>

			{fields.length === 0 && (
				<p className="text-sm text-slate-400 italic">No custom sections added yet.</p>
			)}

			<div className="space-y-4">
				{fields.map((field, index) => (
					<SectionItem 
						key={field.id}
						index={index}
						control={control}
						onRemove={() => remove(index)}
						disabled={disabled}
					/>
				))}
			</div>
		</div>
	);
}

function SectionItem({ index, control, onRemove, disabled }: { index: number, control: any, onRemove: () => void, disabled?: boolean }) {
	const [isOpen, setIsOpen] = useState(true);
	const { fields, append, remove } = useFieldArray({
		control,
		name: `customSections.${index}.items`,
	});

	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
			<div className="flex items-center justify-between bg-slate-50 px-4 py-3">
				<div className="flex items-center gap-2 font-bold text-slate-700 text-sm flex-1">
					<button 
						type="button"
						onClick={() => setIsOpen(!isOpen)}
						className="p-1 hover:bg-slate-200 rounded transition-colors"
					>
						{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
					</button>
					<input 
						{...control.register(`customSections.${index}.title`)}
						className="bg-transparent border-none p-0 font-bold focus:ring-0 w-full text-sm"
						placeholder="Section Title (e.g. Certifications)"
						disabled={disabled}
					/>
				</div>
				<button
					type="button"
					onClick={onRemove}
					disabled={disabled}
					className="text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
				>
					<Trash2 className="h-4 w-4" />
				</button>
			</div>

			{isOpen && (
				<div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
					<div className="space-y-4">
						{fields.map((itemField, itemIndex) => (
							<div key={itemField.id} className="relative pl-4 border-l-2 border-slate-100 space-y-3">
								<button
									type="button"
									onClick={() => remove(itemIndex)}
									disabled={disabled}
									className="absolute -right-1 top-0 text-slate-300 hover:text-red-500 transition-colors"
								>
									<Trash2 className="h-3.5 w-3.5" />
								</button>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
									<input 
										{...control.register(`customSections.${index}.items.${itemIndex}.title`)}
										placeholder="Item Title (e.g. AWS Certified)"
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
									/>
									<input 
										{...control.register(`customSections.${index}.items.${itemIndex}.date`)}
										placeholder="Date"
										className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
										disabled={disabled}
									/>
								</div>
								<input 
									{...control.register(`customSections.${index}.items.${itemIndex}.subtitle`)}
									placeholder="Subtitle/Organization"
									className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
									disabled={disabled}
								/>
							</div>
						))}
					</div>

					<button
						type="button"
						onClick={() => append({ id: crypto.randomUUID(), title: "", subtitle: "", date: "", description: [] })}
						disabled={disabled}
						className="flex items-center gap-1.5 rounded-lg border border-dashed border-slate-200 px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all w-full justify-center"
					>
						<Plus className="h-3.5 w-3.5" />
						Add Item
					</button>
				</div>
			)}
		</div>
	);
}
