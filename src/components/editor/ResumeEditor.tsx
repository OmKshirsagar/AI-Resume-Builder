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
	// Deep clone the data to prevent mutation errors from frozen state
	const clonedData = JSON.parse(JSON.stringify(data));

	const methods = useForm<ResumeData>({
		resolver: zodResolver(ResumeSchema) as any,
		defaultValues: clonedData,
		mode: "onChange",
	});

	const { watch, reset } = methods;
	const isFirstRender = useRef(true);
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
			onSync(watchedData);
		}, 400);

		return () => {
			if (syncTimeoutRef.current) {
				clearTimeout(syncTimeoutRef.current);
			}
		};
	}, [watchedData, onSync]);

	// Handle external data changes (e.g., AI extraction)
	useEffect(() => {
		// Only reset if the incoming data is significantly different from current form state
		if (JSON.stringify(data) !== JSON.stringify(watchedData)) {
			reset(JSON.parse(JSON.stringify(data)));
		}
	}, [data, reset, watchedData]);

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
