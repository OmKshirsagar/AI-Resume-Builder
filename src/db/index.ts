import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "~/env";
import * as schema from "./schema";

// Smart client initialization:
// Skip authToken if using a local SQLite file (file:dev.db)
const client = createClient({
	url: env.TURSO_DATABASE_URL,
	authToken: env.TURSO_DATABASE_URL.startsWith("file:")
		? undefined
		: env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
