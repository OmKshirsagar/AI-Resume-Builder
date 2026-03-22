"use client";

import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

interface PreviewPaneProps {
	children: React.ReactNode;
}

export function PreviewPane({ children }: PreviewPaneProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const [scale, setScale] = useState(1);
	const [isOverflowing, setIsOverflowing] = useState(false);

	// Constants for A4 dimensions at 96 DPI
	const A4_WIDTH = 794;
	const A4_HEIGHT = 1123;

	useEffect(() => {
		const updateScale = () => {
			if (!containerRef.current || !contentRef.current) return;

			const containerWidth = containerRef.current.clientWidth - 80; // account for padding
			const containerHeight = containerRef.current.clientHeight - 80;

			const scaleX = containerWidth / A4_WIDTH;
			const scaleY = containerHeight / A4_HEIGHT;

			// Use the smaller of the two scales to ensure the page fits entirely
			const newScale = Math.min(scaleX, scaleY, 1);
			setScale(newScale);

			// Check for overflow (if content is taller than A4 height)
			// Using a small buffer for rounding errors
			setIsOverflowing(contentRef.current.scrollHeight > A4_HEIGHT + 2);
		};

		const observer = new ResizeObserver(updateScale);
		if (containerRef.current) observer.observe(containerRef.current);

		updateScale();
		return () => observer.disconnect();
	}, []);

	return (
		<div
			className="flex h-full w-full items-start justify-center overflow-auto bg-slate-100 p-10"
			ref={containerRef}
		>
			<div
				className={clsx(
					"relative origin-top bg-white shadow-2xl transition-transform duration-200 ease-out",
					isOverflowing ? "ring-2 ring-red-500" : "ring-1 ring-slate-200",
				)}
				style={{
					width: `${A4_WIDTH}px`,
					height: `${A4_HEIGHT}px`,
					transform: `scale(${scale})`,
					minWidth: `${A4_WIDTH}px`,
					minHeight: `${A4_HEIGHT}px`,
				}}
			>
				{/* The actual A4 content */}
				<div className="h-full w-full overflow-hidden" ref={contentRef}>
					{children}
				</div>

				{/* Overflow indicator badge */}
				{isOverflowing && (
					<div className="fixed right-8 bottom-8 z-50 flex animate-bounce items-center gap-2 rounded-full bg-red-600 px-4 py-2 font-bold text-sm text-white shadow-lg">
						<svg
							aria-label="Warning: Content exceeds one page"
							className="h-5 w-5"
							fill="none"
							role="img"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Page Overflow Warning</title>
							<path
								d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
							<path
								d="M12 9v4"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
							<path
								d="M12 17h.01"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
							/>
						</svg>
						Page Overflow
					</div>
				)}
			</div>
		</div>
	);
}
