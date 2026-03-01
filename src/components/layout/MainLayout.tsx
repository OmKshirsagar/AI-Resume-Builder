"use client";

import {
	Panel,
	Group,
	Separator,
	type Layout,
} from "react-resizable-panels";
import { type ReactNode } from "react";

interface MainLayoutProps {
	editor: ReactNode;
	preview: ReactNode;
	defaultLayout?: Layout;
}

export function MainLayout({ editor, preview, defaultLayout }: MainLayoutProps) {
	const onLayoutChange = (layout: Layout) => {
		document.cookie = `react-resizable-panels:layout=${JSON.stringify(layout)}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<div className="h-screen w-screen overflow-hidden">
			<Group 
				id="main-group"
				orientation="horizontal" 
				onLayoutChange={onLayoutChange} 
			>
				<Panel 
					id="editor-panel"
					defaultSize={defaultLayout?.["editor-panel"] ?? 30} 
					minSize={20}
				>
					<div className="flex h-full flex-col border-r bg-slate-50 overflow-y-auto">
						{editor}
					</div>
				</Panel>
				<Separator id="separator" className="w-1.5 transition-colors hover:bg-blue-400/20 active:bg-blue-400/30" />
				<Panel 
					id="preview-panel"
					defaultSize={defaultLayout?.["preview-panel"] ?? 70} 
					minSize={30}
				>
					<div className="h-full w-full">
						{preview}
					</div>
				</Panel>
			</Group>
		</div>
	);
}
