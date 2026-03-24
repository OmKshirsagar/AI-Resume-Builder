import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
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

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<ClerkProvider>
			<html className={`${geist.variable} font-sans`} lang="en">
				<body className="h-screen w-full overflow-hidden bg-slate-50 text-slate-900 antialiased">
					<SyncObserver />
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
