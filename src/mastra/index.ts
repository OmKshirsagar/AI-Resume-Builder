import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import {
	architectAgent,
	auditorAgent,
	coverLetterWriterAgent,
	experienceMatcherAgent,
	fabricatorAgent,
	jdAnalyzerAgent,
	stylistAgent,
} from "./agents";
import { coverLetterWorkflow } from "./workflows/cover-letter";
import { fabricatorWorkflow } from "./workflows/fabricator";

export const mastra = new Mastra({
	storage: new LibSQLStore({
		id: "mastra-storage",
		url: ":memory:",
	}),
	agents: {
		"auditor-agent": auditorAgent,
		"architect-agent": architectAgent,
		"fabricator-agent": fabricatorAgent,
		"stylist-agent": stylistAgent,
		"jd-analyzer-agent": jdAnalyzerAgent,
		"experience-matcher-agent": experienceMatcherAgent,
		"cover-letter-writer-agent": coverLetterWriterAgent,
	},
	workflows: {
		fabricatorWorkflow,
		coverLetterWorkflow,
	},
});
