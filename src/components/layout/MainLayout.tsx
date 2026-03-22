"use client";

import type { Layout } from "react-resizable-panels";
import {
	Separator as ResizableHandle,
	Panel as ResizablePanel,
	Group as ResizablePanelGroup,
} from "react-resizable-panels";

interface MainLayoutProps {
	editor: React.ReactNode;
	preview: React.ReactNode;
	defaultLayout?: Layout;
}

export function MainLayout({
	editor,
	preview,
	defaultLayout,
}: MainLayoutProps) {
	const onLayoutChange = (layout: Layout) => {
		// biome-ignore lint/suspicious/noDocumentCookie: Necessary for persisting panel layout
		document.cookie = `react-resizable-panels:layout=${JSON.stringify(layout)}; path=/; max-age=31536000; SameSite=Lax`;
	};

	return (
		<div className="flex h-screen w-full flex-col overflow-hidden bg-slate-50 text-slate-900 antialiased">
			<main className="flex-1 overflow-hidden">
				<ResizablePanelGroup
					className="h-full items-stretch"
					onLayoutChange={onLayoutChange}
					orientation="horizontal"
				>
					<ResizablePanel
						className="bg-slate-50"
						defaultSize={defaultLayout ? defaultLayout[0] : 40}
						minSize={30}
					>
						<div className="h-full overflow-y-auto">{editor}</div>
					</ResizablePanel>

					<ResizableHandle className="w-2 bg-slate-200 transition-colors hover:bg-slate-300" />

					<ResizablePanel
						className="bg-slate-100"
						defaultSize={defaultLayout ? defaultLayout[1] : 60}
					>
						<div className="h-full overflow-hidden">{preview}</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
		</div>
	);
}
