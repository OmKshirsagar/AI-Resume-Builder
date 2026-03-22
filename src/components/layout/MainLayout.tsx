"use client";

import type { ReactNode } from "react";
import { Group, type Layout, Panel, Separator } from "react-resizable-panels";

interface MainLayoutProps {
	editor: ReactNode;
	preview: ReactNode;
	defaultLayout?: Layout;
}

export function MainLayout({
	editor,
	preview,
	defaultLayout,
}: MainLayoutProps) {
	const onLayoutChange = (layout: Layout) => {
		document.cookie = `react-resizable-panels:layout=${JSON.stringify(layout)}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<div className="h-screen w-screen overflow-hidden">
			<Group
				id="main-group"
				onLayoutChange={onLayoutChange}
				orientation="horizontal"
			>
				<Panel
					defaultSize={defaultLayout?.["editor-panel"] ?? 30}
					id="editor-panel"
					minSize={20}
				>
					<div className="flex h-full flex-col overflow-y-auto border-r bg-slate-50">
						{editor}
					</div>
				</Panel>
				<Separator
					className="w-1.5 transition-colors hover:bg-blue-400/20 active:bg-blue-400/30"
					id="separator"
				/>
				<Panel
					defaultSize={defaultLayout?.["preview-panel"] ?? 70}
					id="preview-panel"
					minSize={30}
				>
					<div className="h-full w-full">{preview}</div>
				</Panel>
			</Group>
		</div>
	);
}
