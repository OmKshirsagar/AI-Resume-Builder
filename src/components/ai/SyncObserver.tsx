"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { syncResumeData } from "~/app/actions/sync";
import { useResumeStore } from "~/store/useResumeStore";

export function SyncObserver() {
	const { user, isLoaded } = useUser();
	const { original } = useResumeStore();
	const hasSynced = useRef(false);

	useEffect(() => {
		if (isLoaded && user && !hasSynced.current) {
			// Trigger migration if there is data in the local store
			if (original.personalInfo.fullName !== "Your Name") {
				console.log("☁️ Syncing local data to cloud for new user...");
				syncResumeData(original).then((res) => {
					if (res.status === "migrated") {
						console.log("✅ Data successfully migrated to cloud.");
					}
					hasSynced.current = true;
				});
			} else {
				hasSynced.current = true;
			}
		}
	}, [isLoaded, user, original]);

	return null;
}
