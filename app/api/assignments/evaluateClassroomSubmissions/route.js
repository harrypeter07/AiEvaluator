import { analyzeAssignment } from "@/lib/gemini";
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
					console.log("Submission data:", submissionData);

					if (submissionData.assignmentSubmission?.attachments?.length > 0) {
						// Get the PDF file from the attachment
						const attachment =
							submissionData.assignmentSubmission.attachments[0];
						console.log("Processing attachment:", attachment);

						if (attachment.driveFile) {
							try {
								console.log("Processing file:", attachment.driveFile.title);

								// Get the file's web view link
								const fileUrl = attachment.driveFile.alternateLink;
								console.log("File URL:", fileUrl);

								// Analyze with Gemini
								console.log("Starting Gemini analysis");
								const analysis = await analyzeAssignment(fileUrl);
								console.log("Gemini analysis result:", analysis);

								// Extract numerical score from analysis
								const scoreMatch = analysis.extractedText.match(
									/\*\*Score:\*\*\s*(\d+)\/100/
								);
								const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
								console.log("Extracted score:", score);

								// Stream the evaluation result
								await writeJSON({
									evaluation: {
										submissionId: submission.id,
										studentId: submission.userId,
										feedback: analysis.extractedText,
										score: score,
									},
								});
							} catch (error) {
								console.error("Error processing file:", error);
								await writeJSON({
									evaluation: {
										submissionId: submission.id,
										studentId: submission.userId,
										error: `Error processing file: ${error.message}`,
									},
								});
							}
						} else {
							console.log("No drive file found in attachment");
							await writeJSON({
								evaluation: {
									submissionId: submission.id,
									studentId: submission.userId,
									error: "No drive file found in attachment",
								},
							});
						}
					} else {
						console.log("No attachments found for submission:", submission.id);
						await writeJSON({
							evaluation: {
								submissionId: submission.id,
								studentId: submission.userId,
								error: "No attachments found",
							},
						});
					}
				} catch (submissionError) {
					console.error(
						`Error processing submission ${submission.id}:`,
						submissionError
					);
					await writeJSON({
						evaluation: {
							submissionId: submission.id,
							studentId: submission.userId,
							error: submissionError.message,
						},
					});
				}
			}

			await writer.close();
		} catch (error) {
			console.error("Error evaluating submissions:", error);
			await writeJSON({ error: error.message });
			await writer.close();
		}
	})();

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
