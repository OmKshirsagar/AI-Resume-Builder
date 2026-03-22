"use client";

import {
	Calendar,
	Copy,
	FileText,
	MoreVertical,
	Pencil,
	Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { deleteResume, renameResume } from "~/app/actions/dashboard";

interface ResumeCardProps {
	resume: {
		id: string;
		title: string;
		isMaster: boolean;
		updatedAt: Date | null;
		createdAt: Date;
		tailoringCount: number;
	};
	view: "grid" | "list";
}

export function ResumeCard({ resume, view }: ResumeCardProps) {
	const [showMenu, setShowMenu] = useState(false);
	const [isRenaming, setIsRenaming] = useState(false);
	const [newTitle, setNewTitle] = useState(resume.title);

	const handleDelete = async () => {
		if (confirm("Are you sure you want to delete this resume?")) {
			await deleteResume(resume.id);
		}
	};

	const handleRename = async () => {
		if (newTitle.trim() && newTitle !== resume.title) {
			await renameResume(resume.id, newTitle.trim());
		}
		setIsRenaming(false);
		setShowMenu(false);
	};

	const formattedDate = resume.updatedAt
		? new Date(resume.updatedAt).toLocaleDateString("en-US", {
				month: "short",
				day: "numeric",
				year: "numeric",
			})
		: "Recently";

	if (view === "list") {
		return (
			<div className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-indigo-100 hover:shadow-sm">
				<div className="flex items-center gap-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-500">
						<FileText className="h-6 w-6" />
					</div>
					<div>
						{isRenaming ? (
							<input
								className="rounded border border-indigo-200 px-2 py-1 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								onBlur={handleRename}
								onChange={(e) => setNewTitle(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleRename()}
								value={newTitle}
							/>
						) : (
							<div className="flex items-center gap-2">
								<h3 className="font-bold text-slate-900">{resume.title}</h3>
								{resume.isMaster && (
									<span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-[10px] text-indigo-600 uppercase tracking-wider">
										Master
									</span>
								)}
							</div>
						)}
						<div className="mt-1 flex items-center gap-3 text-slate-400 text-xs">
							<span className="flex items-center gap-1">
								<Calendar className="h-3 w-3" />
								Updated {formattedDate}
							</span>
							{resume.tailoringCount > 0 && (
								<span className="flex items-center gap-1 font-medium text-indigo-400">
									<Copy className="h-3 w-3" />
									{resume.tailoringCount} tailored variants
								</span>
							)}
						</div>
					</div>
				</div>

				<div className="relative flex items-center gap-2">
					<Link
						className="rounded-lg bg-slate-50 px-4 py-2 font-bold text-slate-600 text-xs transition-colors hover:bg-indigo-600 hover:text-white"
						href={`/editor/${resume.id}`}
					>
						Edit
					</Link>
					<button
						aria-label="Toggle menu"
						className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
						onClick={() => setShowMenu(!showMenu)}
						type="button"
					>
						<MoreVertical className="h-4 w-4" />
					</button>

					{showMenu && (
						<>
							<button
								aria-label="Close menu"
								className="fixed inset-0 z-10 h-full w-full cursor-default bg-transparent"
								onClick={() => setShowMenu(false)}
								type="button"
							/>
							<div className="fade-in slide-in-from-top-2 absolute top-full right-0 z-20 mt-1 w-40 animate-in rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
								<button
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 text-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
									onClick={() => {
										setIsRenaming(true);
										setShowMenu(false);
									}}
									type="button"
								>
									<Pencil className="h-3.5 w-3.5" />
									Rename
								</button>
								<button
									className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 text-xs transition-colors hover:bg-red-50"
									onClick={handleDelete}
									type="button"
								>
									<Trash2 className="h-3.5 w-3.5" />
									Delete
								</button>
							</div>
						</>
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-2 transition-all hover:border-indigo-100 hover:shadow-indigo-500/5 hover:shadow-xl">
			<Link
				className="flex aspect-[3/4] w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-50 transition-colors group-hover:bg-indigo-50/30"
				href={`/editor/${resume.id}`}
			>
				<FileText className="h-12 w-12 text-slate-200 transition-colors group-hover:text-indigo-200" />
				<div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
					<span className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-sm text-white shadow-indigo-200 shadow-lg">
						Open Editor
					</span>
				</div>
			</Link>

			<div className="p-4">
				<div className="flex items-start justify-between">
					<div className="flex-1 overflow-hidden">
						{isRenaming ? (
							<input
								className="w-full rounded border border-indigo-200 px-2 py-1 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
								onBlur={handleRename}
								onChange={(e) => setNewTitle(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleRename()}
								value={newTitle}
							/>
						) : (
							<div className="flex items-center gap-2 overflow-hidden">
								<h3 className="truncate font-bold text-slate-900 text-sm">
									{resume.title}
								</h3>
								{resume.isMaster && (
									<span className="shrink-0 rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-[9px] text-indigo-600 uppercase tracking-wider">
										Master
									</span>
								)}
							</div>
						)}
						<p className="mt-1 flex items-center gap-1 font-medium text-[10px] text-slate-400 uppercase tracking-wider">
							Updated {formattedDate}
						</p>
					</div>

					<div className="relative">
						<button
							aria-label="Toggle menu"
							className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
							onClick={() => setShowMenu(!showMenu)}
							type="button"
						>
							<MoreVertical className="h-4 w-4" />
						</button>

						{showMenu && (
							<>
								<button
									aria-label="Close menu"
									className="fixed inset-0 z-10 h-full w-full cursor-default bg-transparent"
									onClick={() => setShowMenu(false)}
									type="button"
								/>
								<div className="fade-in slide-in-from-top-2 absolute right-0 bottom-full z-20 mb-1 w-40 animate-in rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
									<button
										className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-600 text-xs transition-colors hover:bg-slate-50 hover:text-slate-900"
										onClick={() => {
											setIsRenaming(true);
											setShowMenu(false);
										}}
										type="button"
									>
										<Pencil className="h-3.5 w-3.5" />
										Rename
									</button>
									<button
										className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 text-xs transition-colors hover:bg-red-50"
										onClick={handleDelete}
										type="button"
									>
										<Trash2 className="h-3.5 w-3.5" />
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				</div>

				{resume.tailoringCount > 0 && (
					<div className="mt-3 flex items-center gap-1.5 rounded-lg bg-indigo-50/50 px-2 py-1.5 font-bold text-[10px] text-indigo-600 uppercase tracking-tight">
						<Copy className="h-3 w-3" />
						{resume.tailoringCount} tailored variants
					</div>
				)}
			</div>
		</div>
	);
}
