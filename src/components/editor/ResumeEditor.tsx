"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type ResumeData, ResumeSchema } from "~/schemas/resume";

interface ResumeEditorProps {
	data: ResumeData;
	onSync: (data: ResumeData) => void;
	disabled?: boolean;
	children: React.ReactNode;
}

export function ResumeEditor({
	data,
	onSync,
	disabled,
	children,
}: ResumeEditorProps) {
	// Deep clone the data to prevent mutation errors
	const clonedData = JSON.parse(JSON.stringify(data));

	const methods = useForm<ResumeData>({
		// biome-ignore lint/suspicious/noExplicitAny: complex Zod resolver type
		resolver: zodResolver(ResumeSchema) as any,
		defaultValues: clonedData,
		mode: "onChange",
	});

	const { watch, reset } = methods;
	const isFirstRender = useRef(true);
	const lastSyncedDataRef = useRef<string>(JSON.stringify(data));
	const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Watch all form changes
	const watchedData = watch();

	// Debounced sync to store
	useEffect(() => {
		if (isFirstRender.current) {
			isFirstRender.current = false;
			return;
		}

		if (syncTimeoutRef.current) {
			clearTimeout(syncTimeoutRef.current);
		}

		syncTimeoutRef.current = setTimeout(() => {
			const currentStringified = JSON.stringify(watchedData);
			if (currentStringified !== lastSyncedDataRef.current) {
				lastSyncedDataRef.current = currentStringified;
				onSync(watchedData);
			}
		}, 400);

		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [watchedData, onSync]);

	// Handle external data changes (e.g., AI extraction, store updates)
	useEffect(() => {
		const incomingStringified = JSON.stringify(data);

		// Only reset if the incoming data is different from what we last SYNCED
		// AND different from what is currently in the form.
		// This prevents the "reset loop" where a local change triggers a store update
		// which triggers a reset that kills the local change.
		if (incomingStringified !== lastSyncedDataRef.current) {
			console.log("🔄 External data change detected, resetting form...");
			lastSyncedDataRef.current = incomingStringified;
			reset(JSON.parse(incomingStringified));
		}
	}, [data, reset]);

	return (
		<FormProvider {...methods}>
			<form className="mx-auto flex max-w-2xl flex-col space-y-8 p-6 pb-24">
				<fieldset className="contents space-y-8" disabled={disabled}>
					{children}
				</fieldset>
			</form>
		</FormProvider>
	);
}
