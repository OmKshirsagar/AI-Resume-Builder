"use client";

import type { ReactNode } from "react";

interface A4PageProps {
	scale: number;
	children: ReactNode;
}

/**
 * A4Page component that renders a fixed A4-sized container (210mm x 297mm).
 * It uses CSS transforms to scale itself based on the provided scale factor.
 * It also acts as a container-query container for its children.
 */
export function A4Page({ scale, children }: A4PageProps) {
	return (
		<div
			className="relative mx-auto flex origin-top flex-col overflow-hidden bg-white shadow-xl"
			style={{
				width: "var(--a4-width)",
				height: "var(--a4-height)",
				minWidth: "var(--a4-width)",
				minHeight: "var(--a4-height)",
				transform: `scale(${scale})`,
				// container-type: inline-size enables @container queries for children
				// We use camelCase for style object properties
				containerType: "inline-size",
			}}
		>
			{/* 
        This is the actual page content. 
        Children can use @container (min-width: ...) to be responsive 
        relative to the A4 page's actual physical width.
      */}
			<div className="h-full w-full flex-1 p-8 md:p-12">{children}</div>
		</div>
	);
}
