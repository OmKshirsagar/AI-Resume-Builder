"use client";

import { useEffect } from "react";
import { syncResumeData } from "~/app/actions/sync";
import { useResumeStore } from "~/store/useResumeStore";

/**
 * Background component that observes the store and ensures
 * local storage data is migrated to the cloud for signed-in users.
 */
export function SyncObserver() {
	const { original } = useResumeStore();

	useEffect(() => {
		const sync = async () => {
			// Only auto-sync if there is actually data to sync
			if (original.personalInfo.fullName !== "") {
				console.log("☁️ Syncing local data to cloud...");
				try {
					// For new users without a specific resumeId yet,
					// we use a default ID or create one.
					const resumeId = original.id || crypto.randomUUID();
					await syncResumeData(original, resumeId);
				} catch (e) {
					console.error("Failed to background sync:", e);
				}
			}
		};

		sync();
	}, [original]);

	return null;
}
