import "~/styles/globals.css";

import { ClerkProvider, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SyncObserver } from "~/components/ai/SyncObserver";

export const metadata: Metadata = {
	title: "Gemini Resume Builder",
	description: "Build ATS-optimized resumes with AI-powered feedback.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default async function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const { userId } = await auth();

	return (
		<ClerkProvider>
			<html className={`${geist.variable} font-sans`} lang="en">
				<body className="h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
					<SyncObserver />
					{userId && (
						<div className="fixed top-4 right-4 z-[100]">
							<UserButton />
						</div>
					)}
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
