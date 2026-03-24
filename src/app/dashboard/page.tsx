import { UserButton } from "@clerk/nextjs";
import { FilePlus, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { listResumes } from "~/app/actions/dashboard";
import { ResumeList } from "~/components/dashboard/ResumeList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const resumes = await listResumes();

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900">
			{/* Compact Navbar */}
			<header className="z-10 border-slate-200 border-b bg-white">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
					<div className="flex items-center gap-3">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-200">
							<LayoutDashboard className="h-5 w-5" />
						</div>
						<div>
							<h1 className="font-bold text-base text-slate-900 tracking-tight">
								Dashboard
							</h1>
							<p className="font-bold text-[9px] text-slate-400 uppercase tracking-widest">
								Manage documents
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<Link
							className="group hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white text-xs transition-all hover:bg-slate-800 active:scale-95 sm:flex"
							href="/"
						>
							<Plus className="h-3.5 w-3.5 transition-transform group-hover:rotate-90" />
							Create New
						</Link>
						<div className="h-6 w-[1px] bg-slate-200" />
						<UserButton
							appearance={{
								elements: {
									avatarBox:
										"h-8 w-8 rounded-xl shadow-sm border border-slate-200",
								},
							}}
						/>
					</div>
				</div>
			</header>

			<main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
				<div className="mx-auto max-w-7xl">
					<div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
						<div>
							<h2 className="font-bold text-2xl text-slate-900 tracking-tight">
								Your Resumes
							</h2>
							<p className="mt-1 text-slate-500 text-sm">
								{resumes.length === 0
									? "You haven't created any resumes yet."
									: `You have ${resumes.length} ${resumes.length === 1 ? "document" : "documents"} in your library.`}
							</p>
						</div>

						<Link
							className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 border-dashed p-3 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 sm:hidden"
							href="/"
						>
							<Plus className="h-4 w-4 text-indigo-600" />
							<span className="font-bold text-indigo-600 text-sm">
								New Resume
							</span>
						</Link>
					</div>

					{resumes.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-3xl border-2 border-slate-200 border-dashed bg-white py-16 text-center shadow-sm">
							<div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
								<FilePlus className="h-8 w-8" />
							</div>
							<h3 className="font-bold text-lg text-slate-900 tracking-tight">
								Start your first resume
							</h3>
							<p className="mx-auto mb-8 max-w-xs text-slate-500 text-sm">
								Import from PDF or create from scratch to build an AI-optimized
								professional resume in minutes.
							</p>
							<Link
								className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-indigo-200 shadow-lg transition-all hover:bg-indigo-700 active:scale-95"
								href="/"
							>
								<Plus className="h-4 w-4" />
								Create New Resume
							</Link>
						</div>
					) : (
						<ResumeList initialResumes={resumes} />
					)}

					{/* Dashboard Info - More compact */}
					{resumes.length > 0 && (
						<div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
							<div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
								<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
									<LayoutDashboard className="h-4 w-4" />
								</div>
								<h4 className="font-bold text-slate-900 text-sm">
									AI Tailoring
								</h4>
								<p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
									Create specific versions of your master resume for job
									descriptions with one click.
								</p>
							</div>
							<div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
								<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">
									<FilePlus className="h-4 w-4" />
								</div>
								<h4 className="font-bold text-slate-900 text-sm">
									ATS Optimized
								</h4>
								<p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
									All templates are designed to be easily parsed by Applicant
									Tracking Systems.
								</p>
							</div>
							<div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
								<div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
									<LayoutDashboard className="h-4 w-4" />
								</div>
								<h4 className="font-bold text-slate-900 text-sm">
									Master Tracking
								</h4>
								<p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
									Keep a "Master" document and track all tailored variants under
									it automatically.
								</p>
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
