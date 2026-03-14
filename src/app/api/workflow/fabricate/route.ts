import type { NextRequest } from "next/server";
import { mastra } from "~/mastra";

export const maxDuration = 60;

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
					console.log(`📡 Sending to client: ${data.status || "data"}`);
					controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
				};

				try {
					console.log("⏱️ Starting Workflow Stream...");
					const { fullStream } = run.stream({
						inputData: { resumeData },
					});

					for await (const event of fullStream) {
						console.log(`📦 Internal Event: ${event.type}`);

						const stepId = (event.payload as any)?.id;

						if (event.type === "workflow-step-start") {
							console.log(`  -> Step Started: ${stepId}`);

							const messages: Record<string, string> = {
								"audit-resume": "Step 1/4: Auditing resume impact...",
								"budget-resume": "Step 2/4: Optimizing space budget...",
								"fabricate-resume":
									"Step 3/4: Fabricating high-density resume...",
								"stylist-orchestration":
									"Step 4/4: Finalizing visual design...",
							};

							if (stepId && messages[stepId]) {
								send({ status: messages[stepId], stepId });
							}
						}

						if (event.type === "workflow-step-result") {
							console.log(`  -> Step Result: ${stepId}`);

							if (stepId === "stylist-orchestration") {
								const output = (event.payload as any).output;
								console.log("✅ Final Stylized Output captured!");
								send({ status: "DONE", data: output });
							}
						}

						if (event.type === "workflow-finish") {
							console.log("🏁 Workflow Finish event received");
						}
					}

					console.log("🏁 Stream closed");
					controller.close();
				} catch (err) {
					console.error("❌ Workflow execution error:", err);
					send({
						error: err instanceof Error ? err.message : "Workflow failed",
					});
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "application/x-ndjson",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			},
		});
	} catch (error) {
		console.error("❌ API Route error:", error);
		return Response.json({ error: "Invalid request" }, { status: 400 });
	}
}
