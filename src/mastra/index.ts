import { Mastra } from "@mastra/core";
import { LibSQLStore } from "@mastra/libsql";
import { auditorAgent, architectAgent, fabricatorAgent, stylistAgent } from "./agents";
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
	},
	workflows: {
		fabricatorWorkflow,
	},
});
