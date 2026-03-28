"use client";

import {
	type Layout,
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
					id="main-layout-group"
					onLayoutChange={onLayoutChange}
					orientation="horizontal"
				>
					<ResizablePanel
						className="h-full bg-white"
						defaultSize={defaultLayout ? defaultLayout[0] : 40}
						id="editor-panel"
						minSize={30}
					>
						<div className="h-full overflow-hidden">{editor}</div>
					</ResizablePanel>

					<ResizableHandle className="w-1 bg-slate-100 transition-colors hover:bg-indigo-200" />

					<ResizablePanel
						className="h-full bg-slate-100/50"
						defaultSize={defaultLayout ? defaultLayout[1] : 60}
						id="preview-panel"
					>
						<div className="h-full overflow-hidden">{preview}</div>
					</ResizablePanel>
				</ResizablePanelGroup>
			</main>
		</div>
	);
}
