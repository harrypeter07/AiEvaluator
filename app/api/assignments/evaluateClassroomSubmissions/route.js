export const runtime = "edge";

import { analyzeClassroomSubmission } from "@/lib/classroomGemini";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

export async function POST(req) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const writeJSON = async (data) => {
		await writer.write(encoder.encode(JSON.stringify(data) + "\n"));
	};

	(async () => {
		try {
			const session = await getServerSession(authOptions);
			if (!session?.user?.email) {
				await writeJSON({ error: "Session expired. Please sign in again." });
				await writer.close();
				return;
			}

			if (!session.accessToken) {
				await writeJSON({ error: "Google access token not found" });
				await writer.close();
				return;
			}

			const { courseId, courseWorkId, submissions } = await req.json();
			console.log("Starting evaluation for submissions:", submissions.length);

			// Initialize Google Classroom API
			const auth = new google.auth.OAuth2();
			auth.setCredentials({ access_token: session.accessToken });
			const classroom = google.classroom({ version: "v1", auth });

			// Process each submission
			for (const submission of submissions) {
				try {
					console.log(`Processing submission ${submission.id}`);

					// Get the submission details with attachment
					const { data: submissionData } =
						await classroom.courses.courseWork.studentSubmissions.get({
							courseId: courseId,
							courseWorkId: courseWorkId,
							id: submission.id,
						});

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
						session.accessToken
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
