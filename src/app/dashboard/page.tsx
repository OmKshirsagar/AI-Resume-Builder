import { UserButton } from "@clerk/nextjs";
import { FilePlus, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { listResumes } from "~/app/actions/dashboard";
import { ResumeList } from "~/components/dashboard/ResumeList";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
	const resumes = await listResumes();

	return (
		<div className="min-h-screen bg-slate-50/50 text-slate-900">
			{/* Navbar */}
			<header className="sticky top-0 z-10 border-slate-200 border-b bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
					<div className="flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-slate-200 shadow-xl">
							<LayoutDashboard className="h-6 w-6" />
						</div>
						<div>
							<h1 className="font-bold text-lg text-slate-900 tracking-tight">
								Dashboard
							</h1>
							<p className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">
								Manage your documents
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<Link
							className="group hidden items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 font-bold text-white text-xs transition-all hover:bg-slate-800 hover:shadow-xl active:scale-95 sm:flex"
							href="/"
						>
							<Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
							Create New
						</Link>
						<div className="h-8 w-[1px] bg-slate-200" />
						<UserButton
							appearance={{
								elements: {
									avatarBox:
										"h-9 w-9 rounded-xl shadow-sm border border-slate-200",
								},
							}}
						/>
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
					<div>
						<h2 className="font-bold text-3xl text-slate-900 tracking-tight">
							Your Resumes
						</h2>
						<p className="mt-2 text-slate-500">
							{resumes.length === 0
								? "You haven't created any resumes yet."
								: `You have ${resumes.length} ${resumes.length === 1 ? "document" : "documents"} in your library.`}
						</p>
					</div>

					<Link
						className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 border-dashed p-4 transition-all hover:border-indigo-400 hover:bg-indigo-50/30 sm:hidden"
						href="/"
					>
						<Plus className="h-5 w-5 text-indigo-600" />
						<span className="font-bold text-indigo-600 text-sm">
							Create New Resume
						</span>
					</Link>
				</div>

				{resumes.length === 0 ? (
					<div className="flex flex-col items-center justify-center rounded-3xl border-2 border-slate-200 border-dashed bg-white py-24 text-center shadow-sm">
						<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-300">
							<FilePlus className="h-10 w-10" />
						</div>
						<h3 className="font-bold text-slate-900 text-xl tracking-tight">
							Start your first resume
						</h3>
						<p className="mx-auto mb-10 max-w-sm text-slate-500">
							Import from PDF or create from scratch to build an AI-optimized
							professional resume in minutes.
						</p>
						<Link
							className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-8 py-4 font-bold text-white shadow-indigo-200 shadow-xl transition-all hover:bg-indigo-700 hover:shadow-2xl active:scale-95"
							href="/"
						>
							<Plus className="h-5 w-5" />
							Create New Resume
						</Link>
					</div>
				) : (
					<ResumeList initialResumes={resumes} />
				)}

				{/* Dashboard Stats / Info */}
				{resumes.length > 0 && (
					<div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3">
						<div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
								<LayoutDashboard className="h-5 w-5" />
							</div>
							<h4 className="font-bold text-slate-900">AI Tailoring</h4>
							<p className="mt-1 text-slate-500 text-xs leading-relaxed">
								Create specific versions of your master resume for different job
								descriptions with one click.
							</p>
						</div>
						<div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
								<FilePlus className="h-5 w-5" />
							</div>
							<h4 className="font-bold text-slate-900">ATS Optimized</h4>
							<p className="mt-1 text-slate-500 text-xs leading-relaxed">
								All templates are designed to be easily parsed by Applicant
								Tracking Systems.
							</p>
						</div>
						<div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
							<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
								<LayoutDashboard className="h-5 w-5" />
							</div>
							<h4 className="font-bold text-slate-900">Master Tracking</h4>
							<p className="mt-1 text-slate-500 text-xs leading-relaxed">
								Keep a "Master" document and track all tailored variants under
								it automatically.
							</p>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
