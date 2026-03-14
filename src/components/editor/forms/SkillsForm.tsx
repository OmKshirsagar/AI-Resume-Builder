"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";
import { Plus, Trash2 } from "lucide-react";

interface SkillsFormProps {
	disabled?: boolean;
}

export function SkillsForm({ disabled }: SkillsFormProps) {
	const { control, register } = useFormContext<ResumeData>();
	const { fields, append, remove } = useFieldArray({
		control,
		name: "skills",
	});

	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between border-b pb-2">
				<h2 className="font-semibold text-lg text-slate-800">
					Skills
				</h2>
				<button
					type="button"
					onClick={() => append({ id: crypto.randomUUID(), name: "", level: "" })}
					disabled={disabled}
					className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Skill
				</button>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
				{fields.map((field, index) => (
					<div key={field.id} className="flex items-center gap-2 group">
						<input
							{...register(`skills.${index}.name`)}
							placeholder="Skill name"
							className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
							disabled={disabled}
						/>
						<button
							type="button"
							onClick={() => remove(index)}
							disabled={disabled}
							className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
