export const runtime = "edge";

import { analyzeClassroomSubmission } from "@/lib/classroomGemini";

export async function POST(req) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const writeJSON = async (data) => {
		await writer.write(encoder.encode(JSON.stringify(data) + "\n"));
	};

	(async () => {
		try {
			const { courseId, courseWorkId, submissions, accessToken } =
				await req.json();

			if (!accessToken) {
				await writeJSON({ error: "Google access token not found" });
				await writer.close();
				return;
			}

			console.log("Starting evaluation for submissions:", submissions.length);

			// Process each submission
			for (const submission of submissions) {
				try {
					console.log(`Processing submission ${submission.id}`);

					// Get the submission details with attachment using fetch
					const submissionResponse = await fetch(
						`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions/${submission.id}`,
						{
							headers: {
								Authorization: `Bearer ${accessToken}`,
								Accept: "application/json",
							},
						}
					);

					if (!submissionResponse.ok) {
						throw new Error(
							`Failed to fetch submission: ${submissionResponse.statusText}`
						);
					}

					const submissionData = await submissionResponse.json();

					if (!submissionData.assignmentSubmission?.attachments?.length) {
						await writeJSON({
							evaluation: {
								submissionId: submission.id,
								studentId: submission.userId,
								error: "No attachments found",
							},
						});
						continue;
					}

					const attachment = submissionData.assignmentSubmission.attachments[0];
					if (!attachment.driveFile) {
						await writeJSON({
							evaluation: {
								submissionId: submission.id,
								studentId: submission.userId,
								error: "No drive file found in attachment",
							},
						});
						continue;
					}

					// Get the file's web view link
					const fileUrl = attachment.driveFile.alternateLink;
					console.log("Processing file:", attachment.driveFile.title);

					// Analyze with Gemini
					const analysis = await analyzeClassroomSubmission(
						fileUrl,
						accessToken
					);

					// Extract numerical score from analysis
					const scoreMatch = analysis.extractedText.match(
						/\*\*Score:\*\*\s*(\d+)\/100/
					);
					const score = scoreMatch ? parseInt(scoreMatch[1]) : null;

					await writeJSON({
						evaluation: {
							submissionId: submission.id,
							studentId: submission.userId,
							feedback: analysis.extractedText,
							score: score,
						},
					});
				} catch (error) {
					console.error(`Error processing submission ${submission.id}:`, error);
					await writeJSON({
						evaluation: {
							submissionId: submission.id,
							studentId: submission.userId,
							error: error.message || "Failed to evaluate submission",
						},
					});
				}

				// Add a delay between submissions to prevent rate limiting
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			await writer.close();
		} catch (error) {
			console.error("Error evaluating submissions:", error);
			await writeJSON({ error: error.message || "Unknown error occurred" });
			await writer.close();
		}
	})();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "application/x-ndjson",
			"Transfer-Encoding": "chunked",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
