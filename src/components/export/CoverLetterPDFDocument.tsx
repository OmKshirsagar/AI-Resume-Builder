"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData } from "~/schemas/resume";

const styles = StyleSheet.create({
	page: {
		padding: 50,
		fontFamily: "Helvetica",
		backgroundColor: "#FFFFFF",
		color: "#1e293b", // slate-800
	},
	header: {
		marginBottom: 30,
		borderBottom: 1,
		borderBottomColor: "#e2e8f0", // slate-200
		paddingBottom: 20,
		textAlign: "center",
	},
	name: {
		fontSize: 24,
		fontWeight: "bold",
		textTransform: "uppercase",
		letterSpacing: 1,
		marginBottom: 4,
		color: "#0f172a", // slate-900
	},
	contactInfo: {
		fontSize: 9,
		color: "#64748b", // slate-500
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	date: {
		fontSize: 10,
		marginBottom: 20,
		color: "#475569", // slate-600
	},
	body: {
		marginTop: 10,
	},
	text: {
		fontSize: 11,
		lineHeight: 1.6,
		marginBottom: 12,
		textAlign: "justify",
	},
	signature: {
		marginTop: 30,
		fontSize: 11,
		fontWeight: "bold",
	},
});

interface CoverLetterPDFDocumentProps {
	resumeData: ResumeData;
	content: string;
}

export function CoverLetterPDFDocument({
	resumeData,
	content,
}: CoverLetterPDFDocumentProps) {
	const { personalInfo } = resumeData;
	const today = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Split content by double newlines to handle paragraphs
	const paragraphs = content
		.split("\n")
		.map((p) => p.trim())
		.filter(Boolean);

	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header (Branding consistent with Resume) */}
				<View style={styles.header}>
					<Text style={styles.name}>{personalInfo.fullName}</Text>
					<Text style={styles.contactInfo}>
						{personalInfo.email}
						{personalInfo.phone ? `  |  ${personalInfo.phone}` : ""}
						{personalInfo.location ? `  |  ${personalInfo.location}` : ""}
					</Text>
				</View>

				{/* Date */}
				<Text style={styles.date}>{today}</Text>

				{/* Letter Body */}
				<View style={styles.body}>
					{paragraphs.map((para, index) => (
						<Text key={`para-${index.toString()}`} style={styles.text}>
							{para}
						</Text>
					))}
				</View>

				{/* Signature */}
				<View style={styles.signature}>
					<Text>Sincerely,</Text>
					<Text style={{ marginTop: 10 }}>{personalInfo.fullName}</Text>
				</View>
			</Page>
		</Document>
	);
}
