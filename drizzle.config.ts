import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env for Turso Cloud credentials
dotenv.config();

const dbUrl = process.env.TURSO_DATABASE_URL || "file:local.db";
const isLocal = dbUrl.startsWith("file:");

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: dbUrl,
		// Skip authToken if using a local SQLite file
		authToken: isLocal ? undefined : process.env.TURSO_AUTH_TOKEN,
	},
});
