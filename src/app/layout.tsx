import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

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
	return (
		<ClerkProvider>
			<html className={`${geist.variable} font-sans`} lang="en">
				<body className="h-screen overflow-hidden bg-slate-50 antialiased text-slate-900">
					{children}
				</body>
			</html>
		</ClerkProvider>
	);
}
