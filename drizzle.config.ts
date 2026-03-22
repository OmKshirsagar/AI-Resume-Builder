import { defineConfig } from "drizzle-kit";
import { env } from "~/env";

export default defineConfig({
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dialect: "turso",
	dbCredentials: {
		url: env.TURSO_DATABASE_URL,
		// Skip authToken if using a local SQLite file (file:dev.db)
		authToken: env.TURSO_DATABASE_URL.startsWith("file:")
			? undefined
			: env.TURSO_AUTH_TOKEN,
	},
});
