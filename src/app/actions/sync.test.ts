import { auth, currentUser } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/db";
import { DEFAULT_RESUME } from "~/schemas/resume";
import { syncResumeData } from "./sync";

// Mock dependencies
vi.mock("~/db", () => ({
	db: {
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				onConflictDoUpdate: vi.fn(() => Promise.resolve()),
			})),
		})),
		query: {
			resumes: {
				findFirst: vi.fn(),
			},
		},
	},
}));

vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
}));

describe("syncResumeData", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should throw an error if user is not authorized", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: mock type
		vi.mocked(auth).mockResolvedValue({ userId: null } as any);
		vi.mocked(currentUser).mockResolvedValue(null);

		await expect(syncResumeData(DEFAULT_RESUME)).rejects.toThrow(
			"Unauthorized",
		);
	});

	it("should return already_synced if master resume exists", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: mock type
		vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);

		vi.mocked(currentUser).mockResolvedValue({
			id: "user_123",
			emailAddresses: [{ emailAddress: "test@example.com" }],
			// biome-ignore lint/suspicious/noExplicitAny: mock type
		} as any);

		vi.mocked(db.query.resumes.findFirst).mockResolvedValue({
			id: "resume_123",
			// biome-ignore lint/suspicious/noExplicitAny: mock type
		} as any);

		const result = await syncResumeData(DEFAULT_RESUME);
		expect(result.status).toBe("already_synced");
	});

	it("should migrate data if no master resume exists", async () => {
		// biome-ignore lint/suspicious/noExplicitAny: mock type
		vi.mocked(auth).mockResolvedValue({ userId: "user_123" } as any);

		vi.mocked(currentUser).mockResolvedValue({
			id: "user_123",
			emailAddresses: [{ emailAddress: "test@example.com" }],
			// biome-ignore lint/suspicious/noExplicitAny: mock type
		} as any);

		vi.mocked(db.query.resumes.findFirst).mockResolvedValue(null);

		const result = await syncResumeData(DEFAULT_RESUME);
		expect(result.status).toBe("migrated");
		expect(db.insert).toHaveBeenCalled();
	});
});
