import type { NextRequest } from "next/server";
import { mastra } from "~/mastra";
import { ResumeSchema } from "~/schemas/resume";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
	console.log("🚀 [Fabricate] Request received");
	try {
		const body = await req.json();
		const { resumeData } = body;

		if (!resumeData) {
			console.error("❌ [Fabricate] Missing resumeData in request body");
			return Response.json({ error: "Missing resume data" }, { status: 400 });
		}

		// Validate incoming data
		const validation = ResumeSchema.safeParse(resumeData);
		if (!validation.success) {
			console.error(
				"❌ [Fabricate] Resume validation failed:",
				validation.error.format(),
			);
			return Response.json(
				{
					error: "Invalid resume data format",
					details: validation.error.format(),
				},
				{ status: 400 },
			);
		}

		const workflow = mastra.getWorkflow("fabricatorWorkflow");
		if (!workflow) {
			console.error("❌ [Fabricate] Workflow 'fabricatorWorkflow' not found");
			return Response.json({ error: "Workflow not found" }, { status: 404 });
		}

		console.log("📦 [Fabricate] Creating workflow run...");
		const run = await workflow.createRun();

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				// biome-ignore lint/suspicious/noExplicitAny: complex stream data
				const send = (data: any) => {
					try {
						const json = JSON.stringify(data);
						console.log(
							`📡 [Fabricate] Sending to client: ${data.status || "data"}`,
						);
						controller.enqueue(encoder.encode(`${json}\n`));
					} catch (e) {
						console.error(
							"❌ [Fabricate] Failed to stringify or enqueue data:",
							e,
						);
					}
				};

				try {
					console.log("⏱️ [Fabricate] Starting Workflow Stream...");
					const { fullStream } = run.stream({
						inputData: { resumeData: validation.data },
					});

					for await (const event of fullStream) {
						// biome-ignore lint/suspicious/noExplicitAny: complex workflow payload
						const stepId = (event.payload as any)?.id;

						if (event.type === "workflow-step-start") {
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
							if (
								stepId === "stylized-output" ||
								stepId === "stylist-orchestration"
							) {
								// biome-ignore lint/suspicious/noExplicitAny: complex workflow output
								const output = (event.payload as any).output;
								console.log("✅ [Fabricate] Final Stylized Output captured!");
								send({ status: "DONE", data: output });
							}
						}
					}

					console.log("🏁 [Fabricate] Stream finished normally");
					controller.close();
				} catch (err) {
					console.error("❌ [Fabricate] Workflow execution error:", err);
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
		console.error("❌ [Fabricate] API Route critical failure:", error);
		// Return JSON error even for route crashes to avoid plain text 500s
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Internal Server Error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
