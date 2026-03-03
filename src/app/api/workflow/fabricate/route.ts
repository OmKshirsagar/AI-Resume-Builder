import { mastra } from "~/mastra";
import { type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	console.log("🚀 Fabrication request received");
	try {
		const { resumeData } = await req.json();
		
		const workflow = mastra.getWorkflow("fabricatorWorkflow");
		if (!workflow) {
			console.error("❌ Workflow 'fabricatorWorkflow' not found");
			return Response.json({ error: "Workflow not found" }, { status: 404 });
		}

		console.log("📦 Creating workflow run...");
		const run = await workflow.createRun();

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				const send = (data: any) => {
					console.log(`📡 Sending to client: ${data.status || 'data'}`);
					controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
				};

				try {
					console.log("⏱️ Starting Workflow Stream...");
					const { fullStream } = run.stream({
						inputData: { resumeData }
					});

					for await (const event of fullStream) {
						console.log(`📦 Internal Event: ${event.type}`);
						
						// Using event.payload.id based on the type information provided
						const stepId = (event.payload as any)?.id;

						if (event.type === 'workflow-step-start') {
							console.log(`  -> Step Started: ${stepId}`);
							
							const messages: Record<string, string> = {
								'audit-resume': "Step 1/3: Auditing resume impact...",
								'architect-layout': "Step 2/3: Architecting 1-page strategy...",
								'fabricate-resume': "Step 3/3: Fabricating high-density resume...",
							};
							
							if (stepId && messages[stepId]) {
								send({ status: messages[stepId] });
							}
						}

						if (event.type === 'workflow-step-result') {
							console.log(`  -> Step Result: ${stepId}`);
							
							if (stepId === 'fabricate-resume') {
								const output = (event.payload as any).output;
								console.log("✅ Final Fabrication Output captured!");
								send({ status: "DONE", data: output });
							}
						}
						
						if (event.type === 'workflow-finish') {
							console.log("🏁 Workflow Finish event received");
						}
					}
					
					console.log("🏁 Stream closed");
					controller.close();
				} catch (err) {
					console.error("❌ Workflow execution error:", err);
					send({ error: err instanceof Error ? err.message : "Workflow failed" });
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "application/x-ndjson",
				"Cache-Control": "no-cache",
				"Connection": "keep-alive",
			},
		});
	} catch (error) {
		console.error("❌ API Route error:", error);
		return Response.json({ error: "Invalid request" }, { status: 400 });
	}
}
