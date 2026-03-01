import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

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
		<html className={`${geist.variable} font-sans`} lang="en">
			<body className="h-screen overflow-hidden bg-slate-50 antialiased">
				{children}
			</body>
		</html>
	);
}
