import type { NextRequest } from "next/server";
import { mastra } from "~/mastra";
import { ResumeSchema } from "~/schemas/resume";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
	console.log("🚀 Fabrication request received");
	try {
		const body = await req.json();
		const { resumeData } = body;

		if (!resumeData) {
			console.error("❌ Missing resumeData in request body");
			return Response.json({ error: "Missing resume data" }, { status: 400 });
		}

		// Validate incoming data
		const validation = ResumeSchema.safeParse(resumeData);
		if (!validation.success) {
			console.error("❌ Resume validation failed:", validation.error.format());
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
			console.error("❌ Workflow 'fabricatorWorkflow' not found");
			return Response.json({ error: "Workflow not found" }, { status: 404 });
		}

		console.log("📦 Creating workflow run...");
		const run = await workflow.createRun();

		const stream = new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();

				// biome-ignore lint/suspicious/noExplicitAny: complex stream data
				const send = (data: any) => {
					controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
				};

				try {
					console.log("⏱️ Starting Workflow Stream...");
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
								console.log("✅ Final Stylized Output captured!");
								send({ status: "DONE", data: output });
							}
						}
					}

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
		return Response.json(
			{ error: error instanceof Error ? error.message : "Invalid request" },
			{ status: 400 },
		);
	}
}
