"use client";

import { clsx } from "clsx";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { A4_HEIGHT_PX, getA4Scale } from "~/lib/scaling";
import { A4Page } from "./A4Page";

interface PreviewPaneProps {
	children: ReactNode;
}

/**
 * PreviewPane acts as the resizable container for the A4Page.
 * It uses ResizeObserver to dynamically update the scaling factor.
 */
export function PreviewPane({ children }: PreviewPaneProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [isOverflowing, setIsOverflowing] = useState(false);

	useEffect(() => {
		if (!containerRef.current) return;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const { width } = entry.contentRect;
				const newScale = getA4Scale(width, 64); // 64px total padding (32px each side)
				setScale(newScale);
			}
		});

		resizeObserver.observe(containerRef.current);
		return () => resizeObserver.disconnect();
	}, []);

	// Simple overflow detection: check if content exceeds A4 height
	useEffect(() => {
		if (!contentRef.current) return;

		const checkOverflow = () => {
			if (contentRef.current) {
				const height = contentRef.current.scrollHeight;
				setIsOverflowing(height > A4_HEIGHT_PX);
			}
		};

		// Run initially and set up an observer for content changes
		checkOverflow();
		const mutationObserver = new MutationObserver(checkOverflow);
		mutationObserver.observe(contentRef.current, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		return () => mutationObserver.disconnect();
	}, []);

	return (
		<div
			className="relative flex h-full w-full items-start justify-center overflow-y-auto bg-slate-200 p-8"
			ref={containerRef}
		>
			<div
				className={clsx(
					"transition-transform duration-200 ease-out",
					isOverflowing &&
						"ring-4 ring-red-500 ring-offset-4 ring-offset-slate-200",
				)}
				style={{
					width: `calc(var(--a4-width) * ${scale})`,
					height: `calc(var(--a4-height) * ${scale})`,
				}}
			>
				<A4Page scale={scale}>
					<div className="h-full" ref={contentRef}>
						{children}
					</div>
				</A4Page>
			</div>

			{isOverflowing && (
				<div className="fixed right-8 bottom-8 z-50 flex animate-bounce items-center gap-2 rounded-full bg-red-600 px-4 py-2 font-bold text-sm text-white shadow-lg">
					<svg
						fill="none"
						height="16"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						viewBox="0 0 24 24"
						width="16"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
						<path d="M12 9v4" />
						<path d="M12 17h.01" />
					</svg>
					Page Overflow
				</div>
			)}
		</div>
	);
}
