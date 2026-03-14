"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { ResumeData } from "~/schemas/resume";

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
				<h2 className="font-semibold text-lg text-slate-800">Skills</h2>
				<button
					className="flex items-center gap-1 font-bold text-blue-600 text-xs hover:text-blue-700 disabled:opacity-50"
					disabled={disabled}
					onClick={() =>
						append({ id: crypto.randomUUID(), name: "", level: "" })
					}
					type="button"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Skill
				</button>
			</div>

			<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
				{fields.map((field, index) => (
					<div className="group flex items-center gap-2" key={field.id}>
						<input
							{...register(`skills.${index}.name`)}
							className="h-9 w-full rounded border border-slate-200 px-3 text-xs focus:border-blue-500 focus:outline-none"
							disabled={disabled}
							placeholder="Skill name"
						/>
						<button
							className="text-slate-300 opacity-0 transition-colors hover:text-red-500 group-hover:opacity-100"
							disabled={disabled}
							onClick={() => remove(index)}
							type="button"
						>
							<Trash2 className="h-3.5 w-3.5" />
						</button>
					</div>
				))}
			</div>
		</section>
	);
}
