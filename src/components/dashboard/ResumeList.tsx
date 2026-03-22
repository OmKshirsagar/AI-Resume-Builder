"use client";

import { Grid, List } from "lucide-react";
import { useState } from "react";
import { ResumeCard } from "./ResumeCard";

interface Resume {
	id: string;
	title: string;
	isMaster: boolean;
	updatedAt: Date | null;
	createdAt: Date;
	tailoringCount: number;
}

interface ResumeListProps {
	initialResumes: Resume[];
}

export function ResumeList({ initialResumes }: ResumeListProps) {
	const [view, setView] = useState<"grid" | "list">("grid");

	return (
		<div className="space-y-6">
			{/* View Toggle */}
			<div className="flex items-center justify-end border-slate-100 border-b pb-4">
				<div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
					<button
						aria-label="Grid View"
						className={`rounded-lg p-2 transition-all ${
							view === "grid"
								? "bg-white text-indigo-600 shadow-sm"
								: "text-slate-400 hover:text-slate-600"
						}`}
						onClick={() => setView("grid")}
						type="button"
					>
						<Grid className="h-4 w-4" />
					</button>
					<button
						aria-label="List View"
						className={`rounded-lg p-2 transition-all ${
							view === "list"
								? "bg-white text-indigo-600 shadow-sm"
								: "text-slate-400 hover:text-slate-600"
						}`}
						onClick={() => setView("list")}
						type="button"
					>
						<List className="h-4 w-4" />
					</button>
				</div>
			</div>

			{/* Resumes Grid/List */}
			<div
				className={
					view === "grid"
						? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
						: "flex flex-col gap-4"
				}
			>
				{initialResumes.map((resume) => (
					<ResumeCard key={resume.id} resume={resume} view={view} />
				))}
			</div>
		</div>
	);
}
