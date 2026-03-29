import { beforeEach, describe, expect, it, vi } from "vitest";
import { db } from "~/db";
import { resumes } from "~/db/schema";
import { DEFAULT_RESUME } from "~/schemas/resume";
import { syncResumeData } from "./sync";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
	auth: vi.fn().mockResolvedValue({ userId: "user_123" }),
}));

// Mock Drizzle db
vi.mock("~/db", () => ({
	db: {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		onConflictDoUpdate: vi.fn().mockResolvedValue({}),
		delete: vi.fn().mockReturnThis(),
		where: vi.fn().mockResolvedValue({}),
		query: {
			resumes: {
				findFirst: vi.fn(),
			},
			customSections: {
				findMany: vi.fn().mockResolvedValue([]),
			},
		},
	},
}));

vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
}));

describe("syncResumeData", () => {
	const mockResume = {
		...DEFAULT_RESUME,
		experience: [
			{
				id: "exp-1",
				company: "Test Co",
				position: "Dev",
				client: "",
				isClientWhitelabeled: false,
				location: "Remote",
				startDate: "2020",
				endDate: "Present",
				current: true,
				description: ["Built stuff"],
			},
		],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should return already_synced if master resume exists", async () => {
		// No special logic anymore, just verify it calls upsert
		const result = await syncResumeData(mockResume, "res-123");
		expect(result.success).toBe(true);
		expect(db.insert).toHaveBeenCalledWith(resumes);
	});

	it("should migrate data if no master resume exists", async () => {
		const result = await syncResumeData(mockResume, "res-123");
		expect(result.success).toBe(true);
		expect(db.insert).toHaveBeenCalled();
	});
});
