"use client";

import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { clsx } from "clsx";
import type { ResumeData } from "~/schemas/resume";

// Simple Tailwind configuration for react-pdf
const tw = createTw({
	theme: {
		extend: {
			colors: {
				slate: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
				},
			},
		},
	},
});

interface PDFDocumentProps {
	data: ResumeData;
}

export function PDFDocument({ data }: PDFDocumentProps) {
	const { personalInfo, experience = [], education = [], skills = [], projects = [], customSections = [], design } = data;

	const inlineSections = design?.layout?.inlineSections || [];
	const lineHeight = design?.theme?.lineHeight || "relaxed";
	const fontSize = design?.theme?.fontSize || "medium";
	const template = design?.template || "classic";
	const isSidebar = template === "sidebar";

	const isInline = (id: string) => {
		return inlineSections.some(s => s.toLowerCase() === id.toLowerCase());
	};

	const renderSmartList = (items: string[]) => {
		if (!items || items.length === 0) return null;
		
		const totalLength = items.join("").length;
		const isShort = items.length > 2 && totalLength < 100;

		if (isShort) {
			return (
				<Text style={tw("text-[9px] text-slate-700 mt-1")}>
					{items.join(" • ")}
				</Text>
			);
		}

		return (
			<View style={tw("mt-1 ml-2")}>
				{items.map((item, idx) => (
					<View key={idx} style={tw("flex-row mb-0.5")}>
						<Text style={tw("text-[9px] mr-2")}>•</Text>
						<Text style={tw("text-[9px] text-slate-800 flex-1")}>{item}</Text>
					</View>
				))}
			</View>
		);
	};

	const renderSection = (id: string) => {
		switch (id) {
			case "experience":
				return experience.length > 0 && (
					<View key="experience" style={tw("mb-4")}>
						<Text style={tw("border-b border-slate-900 font-bold uppercase text-[9px] mb-2 pb-0.5")}>Experience</Text>
						{experience.map((exp) => (
							<View key={exp.id} style={tw("mb-3")}>
								<View style={tw("flex-row justify-between")}>
									<Text style={tw("font-bold text-[10px] text-slate-900")}>{exp.company}</Text>
									<Text style={tw("text-[9px] text-slate-600")}>{exp.startDate} — {exp.current ? "Present" : exp.endDate}</Text>
								</View>
								<View style={tw("flex-row justify-between mb-1")}>
									<Text style={tw("italic text-[9px] text-slate-700")}>{exp.position}</Text>
									<Text style={tw("text-[9px] text-slate-700")}>{exp.location}</Text>
								</View>
								{renderSmartList(exp.description)}
							</View>
						))}
					</View>
				);
			case "education":
				return education.length > 0 && (
					<View key="education" style={tw("mb-3")}>
						<Text style={tw("border-b border-slate-900 font-bold uppercase text-[9px] mb-2 pb-0.5")}>Education</Text>
						{education.map((edu) => (
							<View key={edu.id} style={tw("mb-2")}>
								<View style={tw("flex-row justify-between")}>
									<Text style={tw("font-bold text-[10px] text-slate-900")}>{edu.school}</Text>
									<Text style={tw("text-[9px] text-slate-600")}>{edu.endDate}</Text>
								</View>
								<Text style={tw("italic text-[9px] text-slate-700")}>
									{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ""}
								</Text>
							</View>
						))}
					</View>
				);
			case "skills":
				return skills.length > 0 && (
					<View key="skills" style={tw("mb-3")}>
						<Text style={tw("border-b border-slate-900 font-bold uppercase text-[9px] mb-1.5 pb-0.5")}>Skills</Text>
						<Text style={tw("text-[9px] leading-tight text-slate-800")}>
							{skills.map(s => s.name).join(" • ")}
						</Text>
					</View>
				);
			case "projects":
				return projects.length > 0 && (
					<View key="projects" style={tw("mb-3")}>
						<Text style={tw("border-b border-slate-900 font-bold uppercase text-[9px] mb-1.5 pb-0.5")}>Projects</Text>
						{projects.map((p) => (
							<View key={p.id} style={tw("mb-2")}>
								<View style={tw("flex-row justify-between mb-0.5")}>
									<Text style={tw("font-bold text-[10px] text-slate-900")}>{p.name}</Text>
									<Text style={tw("text-[9px] text-slate-600")}>{p.endDate}</Text>
								</View>
								{renderSmartList(p.description)}
							</View>
						))}
					</View>
				);
			default:
				const customSection = customSections.find(s => s.id === id || s.title.toLowerCase() === id.toLowerCase());
				if (customSection) {
					const useInline = isInline(id) || isInline(customSection.title);
					return (
						<View key={customSection.id} style={tw("mb-3")}>
							<Text style={tw("border-b border-slate-900 font-bold uppercase text-[9px] mb-1.5 pb-0.5")}>{customSection.title}</Text>
							{useInline ? (
								<Text style={tw("text-[9px] text-slate-800 leading-tight")}>
									{customSection.items.map(item => [item.title, item.subtitle, item.date].filter(Boolean).join(", ")).join(" • ")}
								</Text>
							) : (
								<View>
									{customSection.items.map((item) => (
										<View key={item.id} style={tw("mb-2")}>
											<View style={tw("flex-row justify-between mb-0.5")}>
												<Text style={tw("font-bold text-[10px] text-slate-900")}>{item.title}</Text>
												<Text style={tw("text-[9px] text-slate-600")}>{item.date}</Text>
											</View>
											{item.subtitle && <Text style={tw("italic text-[9px] text-slate-700")}>{item.subtitle}</Text>}
											{renderSmartList(item.description)}
										</View>
									))}
								</View>
							)}
						</View>
					);
				}
				return null;
		}
	};

	const mainSections = design?.layout?.mainSections || [];
	const sidebarSections = design?.layout?.sidebarSections || [];
	const allPossibleSections = ["experience", "education", "skills", "projects", ...customSections.map(s => s.id)];
	const mappedSections = new Set([...mainSections, ...sidebarSections]);
	const unmappedSections = allPossibleSections.filter(id => !mappedSections.has(id));
	const finalMain = mainSections.length > 0 ? [...mainSections, ...unmappedSections] : allPossibleSections;

	return (
		<Document>
			<Page size="A4" style={tw(clsx(
				"flex flex-col p-10 bg-white",
				fontSize === "small" ? "text-[10px]" : fontSize === "large" ? "text-[12px]" : "text-[11px]",
				lineHeight === "tight" ? "leading-tight" : "leading-normal"
			))}>
				{/* Header */}
				<View style={tw("flex flex-col items-center mb-4 pb-2 border-b border-slate-100")}>
					<Text style={tw("text-2xl font-bold uppercase mb-1 text-slate-900")}>
						{personalInfo?.fullName || "Your Name"}
					</Text>
					<View style={tw("flex-row justify-center gap-3 text-[9px] text-slate-600 font-bold uppercase")}>
						{personalInfo?.email && <Text>{personalInfo.email}</Text>}
						{personalInfo?.phone && <Text>| {personalInfo.phone}</Text>}
						{personalInfo?.location && <Text>| {personalInfo.location}</Text>}
					</View>
				</View>

				{/* Summary */}
				{personalInfo?.summary && (
					<View style={tw("mb-5 px-10")}>
						<Text style={tw("text-[10px] text-center italic text-slate-700 font-medium")}>
							{personalInfo.summary}
						</Text>
					</View>
				)}

				{/* Content */}
				<View style={tw("flex-row gap-8 flex-1")}>
					<View style={tw(isSidebar ? "w-2/3" : "w-full")}>
						{finalMain.map(id => renderSection(id))}
					</View>

					{isSidebar && sidebarSections.length > 0 && (
						<View style={tw("w-1/3 border-l border-slate-200 pl-5 h-full")}>
							{sidebarSections.map(id => renderSection(id))}
						</View>
					)}
				</View>
			</Page>
		</Document>
	);
}
