// app/classroom/[courseId]/[courseWorkId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import EvaluationResultPreview from "@/components/EvaluationResultPreview";

export default function CourseWorkDetails() {
	const { courseId, courseWorkId } = useParams();
	const { data: session, status } = useSession();
	const [coursework, setCoursework] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [selectedSubmission, setSelectedSubmission] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);
	const [studentNames, setStudentNames] = useState({});
	const [isEvaluating, setIsEvaluating] = useState(false);
	const [evaluationProgress, setEvaluationProgress] = useState(0);
	const [evaluationResults, setEvaluationResults] = useState([]);
	const [evaluatingSubmissions, setEvaluatingSubmissions] = useState(new Set());
	const [evaluationErrors, setEvaluationErrors] = useState({});

	useEffect(() => {
		// Load student names from sessionStorage
		const storedNames = sessionStorage.getItem(`studentNames-${courseId}`);
		if (storedNames) {
			setStudentNames(JSON.parse(storedNames));
		}
	}, [courseId]);

	useEffect(() => {
		if (status === "authenticated" && session?.provider === "google") {
			fetchCourseWorkDetails();
			fetchStoredEvaluations();
		}
	}, [status, session, courseId, courseWorkId]);

	const fetchCourseWorkDetails = async () => {
		try {
			console.log("Fetching coursework details...");
			const res = await fetch(
				`/api/assignments/fetchCourseWorkDetails?courseId=${courseId}&courseWorkId=${courseWorkId}`
			);
			const data = await res.json();
			console.log("Fetched coursework details:", data);

			if (!res.ok) throw new Error(data.error || "Failed to fetch");

			// Map the submissions with evaluation results if available
			const updatedSubmissions = (data.submissions || []).map((submission) => {
				const evaluation = evaluationResults.find(
					(e) => e.submissionId === submission.id
				);
				return {
					...submission,
					evaluationFeedback: evaluation?.feedback || null,
					evaluationScore: evaluation?.score || null,
				};
			});

			setCoursework(data.coursework);
			setSubmissions(updatedSubmissions);

			console.log("Updated submissions with evaluations:", updatedSubmissions);
		} catch (error) {
			console.error("Error fetching coursework details:", error);
		}
	};

	const fetchStoredEvaluations = async () => {
		try {
			const response = await fetch(
				`/api/assignments/getEvaluations?courseId=${courseId}&courseWorkId=${courseWorkId}`
			);
			const data = await response.json();

			if (!response.ok)
				throw new Error(data.error || "Failed to fetch evaluations");

			setEvaluationResults(data.evaluations);
		} catch (error) {
			console.error("Error fetching stored evaluations:", error);
		}
	};

	const saveEvaluation = async (evaluation) => {
		try {
			const submission = submissions.find(
				(s) => s.id === evaluation.submissionId
			);
			if (!submission) return;

			const evaluationData = {
				...evaluation,
				courseId,
				courseWorkId,
				studentId: submission.userId,
				studentName: submission.studentName,
				studentEmail: submission.studentEmail,
				attachments: submission.attachments,
				evaluationTimestamp: new Date().toISOString(),
			};

			const response = await fetch("/api/assignments/saveEvaluation", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(evaluationData),
			});

			if (!response.ok) {
				throw new Error("Failed to save evaluation");
			}
		} catch (error) {
			console.error("Error saving evaluation:", error);
		}
	};

	const handleEvaluateAll = async (submissionsToEvaluate) => {
		try {
			setEvaluatingSubmissions(new Set(submissionsToEvaluate.map((s) => s.id)));

			// Process submissions one at a time with a delay
			for (const submission of submissionsToEvaluate) {
				try {
					const response = await fetch(
						"/api/assignments/evaluateClassroomSubmissions",
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								courseId,
								courseWorkId,
								submissions: [submission],
							}),
						}
					);

					if (!response.ok) {
						throw new Error("Failed to evaluate submission");
					}

					const reader = response.body.getReader();
					const decoder = new TextDecoder();

					while (true) {
						const { value, done } = await reader.read();
						if (done) break;

						const chunk = decoder.decode(value);
						try {
							const data = JSON.parse(chunk);
							if (data.evaluation) {
								// Save evaluation to MongoDB
								await saveEvaluation(data.evaluation);

								setEvaluationResults((prev) => [...prev, data.evaluation]);
								setEvaluatingSubmissions((prev) => {
									const next = new Set(prev);
									next.delete(data.evaluation.submissionId);
									return next;
								});
							}
						} catch (e) {
							console.error("Error parsing chunk:", e);
						}
					}

					// Add a 10-second delay between submissions
					await new Promise((resolve) => setTimeout(resolve, 10000));
				} catch (error) {
					console.error("Error processing submission:", error);
					setEvaluationErrors((prev) => ({
						...prev,
						[submission.id]: error.message,
					}));
				}
			}
		} catch (error) {
			console.error("Error:", error);
			setEvaluationErrors((prev) => ({
				...prev,
				general: error.message,
			}));
		} finally {
			setEvaluatingSubmissions(new Set());
		}
	};

	const handlePreview = (attachment) => {
		if (attachment.driveFile) {
			setPreviewUrl(attachment.driveFile.alternateLink);
			setSelectedSubmission(attachment);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleString();
	};

	if (status === "loading" || isEvaluating)
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="w-12 h-12 mb-4 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
					<div className="text-xl text-gray-600">
						{isEvaluating ? "Evaluating submissions..." : "Loading..."}
					</div>
					{isEvaluating && (
						<p className="mt-2 text-sm text-gray-500">
							This may take a few minutes depending on the number of submissions
						</p>
					)}
				</div>
			</div>
		);
	if (status === "unauthenticated")
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="p-8 text-center bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-2xl font-semibold">Please Log In</h2>
					<p className="mb-4 text-gray-600">
						You need to be logged in to access your coursework.
					</p>
					<Link
						href="/login"
						className="inline-block px-6 py-2 text-white transition-colors bg-blue-500 rounded-md hover:bg-blue-600"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	if (session?.provider !== "google")
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="p-8 text-center bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-2xl font-semibold">Google Login Required</h2>
					<p className="text-gray-600">
						Please log in with Google to see your coursework.
					</p>
				</div>
			</div>
		);

	if (!coursework)
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
			</div>
		);

	return (
		<div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				{/* Add sign out button */}
				{status === "authenticated" && (
					<div className="flex justify-end mb-4">
						<button
							onClick={() => signOut({ callbackUrl: "/login" })}
							className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
						>
							<svg
								className="w-5 h-5 mr-2 -ml-1"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414V15h12V7.414z"
									clipRule="evenodd"
								/>
							</svg>
							Sign out to refresh permissions
						</button>
					</div>
				)}
				<div className="flex items-center justify-between mb-8">
					<div>
						<Link
							href={`/classroom/${courseId}`}
							className="inline-flex items-center mb-2 text-sm text-gray-500 hover:text-gray-700"
						>
							<svg
								className="w-5 h-5 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							Back to Assignments
						</Link>
						<h1 className="text-3xl font-bold text-gray-900">
							{coursework.title}
						</h1>
						<div className="flex items-center mt-2 text-gray-600">
							<svg
								className="w-5 h-5 mr-1"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
							<span>
								Due:{" "}
								{coursework.dueDate
									? `${coursework.dueDate.month}/${coursework.dueDate.day}/${coursework.dueDate.year}`
									: "No due date"}
							</span>
						</div>
					</div>
				</div>

				{/* Message/Description */}
				<div className="p-6 mb-8 bg-white rounded-lg shadow-md">
					<h2 className="mb-3 text-xl font-semibold text-gray-900">
						Description
					</h2>
					<p className="text-gray-600 whitespace-pre-wrap">
						{coursework.description || "No description provided."}
					</p>
				</div>

				{/* Student Submissions */}
				<div className="p-6 bg-white rounded-lg shadow-md">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">
							Student Submissions
						</h2>
						{submissions.length > 0 && (
							<button
								onClick={() =>
									handleEvaluateAll(
										submissions.filter((s) => s.state === "TURNED_IN")
									)
								}
								disabled={evaluatingSubmissions.size > 0}
								className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
									evaluatingSubmissions.size > 0
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700"
								} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
							>
								{evaluatingSubmissions.size > 0 ? (
									<>
										<svg
											className="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Evaluating {evaluatingSubmissions.size} submissions...
									</>
								) : (
									"Evaluate All Submissions"
								)}
							</button>
						)}
					</div>

					{evaluationErrors.general && (
						<div className="p-4 mb-4 text-red-700 border border-red-200 rounded-md bg-red-50">
							{evaluationErrors.general}
						</div>
					)}

					<div className="space-y-6">
						{submissions.map((submission) => {
							console.log("Rendering submission:", {
								id: submission.id,
								grade: submission.assignedGrade,
								feedback: submission.feedback,
								evaluationFeedback: submission.evaluationFeedback,
								evaluationScore: submission.evaluationScore,
							});
							return (
								<div
									key={submission.id}
									className="p-6 transition-colors border border-gray-200 rounded-lg hover:border-gray-300"
								>
									<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
													{submission.state}
												</span>
												{submission.late && (
													<span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
														Late Submission
													</span>
												)}
											</div>
											{submission.studentName && (
												<p className="text-sm text-gray-600">
													<span className="font-medium">Student:</span>{" "}
													{submission.studentName}
												</p>
											)}
											<p className="text-sm text-gray-600">
												<span className="font-medium">Student ID:</span>{" "}
												{submission.userId}
											</p>
											{submission.studentEmail && (
												<p className="text-sm text-gray-600">
													<span className="font-medium">Email:</span>{" "}
													{submission.studentEmail}
												</p>
											)}
											<p className="text-sm text-gray-600">
												<span className="font-medium">Submitted:</span>{" "}
												{formatDate(submission.creationTime)}
											</p>
											<p className="text-sm text-gray-600">
												<span className="font-medium">Last Updated:</span>{" "}
												{formatDate(submission.updateTime)}
											</p>
											{submission.assignedGrade && (
												<p className="text-sm font-semibold text-gray-900">
													<span className="font-medium">Grade:</span>{" "}
													{submission.assignedGrade}/100
												</p>
											)}
											{submission.draftGrade && (
												<p className="text-sm text-gray-600">
													<span className="font-medium">Draft Grade:</span>{" "}
													{submission.draftGrade}
												</p>
											)}
										</div>
										<div className="flex flex-col gap-2">
											<a
												href={submission.alternateLink}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
											>
												<svg
													className="w-5 h-5 mr-2"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
													/>
												</svg>
												View in Classroom
											</a>
											{submission.state === "TURNED_IN" && (
												<button
													onClick={() => handleEvaluateAll([submission])}
													disabled={evaluatingSubmissions.has(submission.id)}
													className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
														evaluatingSubmissions.has(submission.id)
															? "bg-gray-400 cursor-not-allowed"
															: "bg-green-600 hover:bg-green-700"
													} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
												>
													{evaluatingSubmissions.has(submission.id) ? (
														<>
															<svg
																className="w-5 h-5 mr-2 -ml-1 text-white animate-spin"
																xmlns="http://www.w3.org/2000/svg"
																fill="none"
																viewBox="0 0 24 24"
															>
																<circle
																	className="opacity-25"
																	cx="12"
																	cy="12"
																	r="10"
																	stroke="currentColor"
																	strokeWidth="4"
																></circle>
																<path
																	className="opacity-75"
																	fill="currentColor"
																	d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																></path>
															</svg>
															Evaluating...
														</>
													) : (
														"Evaluate"
													)}
												</button>
											)}
										</div>
									</div>

									{/* Evaluation Results */}
									{evaluationResults.find(
										(e) => e.submissionId === submission.id
									) && (
										<div className="mt-4">
											<EvaluationResultPreview
												evaluation={evaluationResults.find(
													(e) => e.submissionId === submission.id
												)}
											/>
										</div>
									)}

									{/* Attachments */}
									{submission.attachments &&
										submission.attachments.length > 0 && (
											<div className="mt-6">
												<h3 className="mb-4 text-lg font-medium text-gray-900">
													Attachments
												</h3>
												<div className="grid grid-cols-1 gap-4">
													{submission.attachments.map((attachment, index) => (
														<div
															key={index}
															className="p-4 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100"
														>
															{attachment.driveFile && (
																<div className="flex flex-col gap-2">
																	<div className="flex items-center justify-between">
																		<p className="font-medium text-gray-900">
																			{attachment.driveFile.title}
																		</p>
																		<span className="text-sm text-gray-500">
																			ID: {attachment.driveFile.id}
																		</span>
																	</div>
																	<div className="flex gap-2">
																		<a
																			href={attachment.driveFile.alternateLink}
																			target="_blank"
																			rel="noopener noreferrer"
																			className="inline-flex items-center justify-center flex-1 px-3 py-2 text-sm text-center text-blue-700 transition-colors bg-blue-100 rounded-md hover:bg-blue-200"
																		>
																			<svg
																				className="w-4 h-4 mr-2"
																				fill="none"
																				stroke="currentColor"
																				viewBox="0 0 24 24"
																			>
																				<path
																					strokeLinecap="round"
																					strokeLinejoin="round"
																					strokeWidth={2}
																					d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
																				/>
																			</svg>
																			View in Drive
																		</a>
																		{attachment.driveFile.thumbnailUrl && (
																			<button
																				onClick={() =>
																					handlePreview(attachment)
																				}
																				className="inline-flex items-center justify-center px-3 py-2 text-sm text-green-700 transition-colors bg-green-100 rounded-md hover:bg-green-200"
																			>
																				<svg
																					className="w-4 h-4 mr-2"
																					fill="none"
																					stroke="currentColor"
																					viewBox="0 0 24 24"
																				>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
																					/>
																					<path
																						strokeLinecap="round"
																						strokeLinejoin="round"
																						strokeWidth={2}
																						d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
																					/>
																				</svg>
																				Preview
																			</button>
																		)}
																	</div>
																</div>
															)}
														</div>
													))}
												</div>
											</div>
										)}
								</div>
							);
						})}
					</div>
				</div>
			</div>

			{/* Preview Modal */}
			{previewUrl && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
						<div className="flex items-center justify-between p-4 border-b bg-gray-50">
							<h3 className="text-lg font-medium text-gray-900">
								{selectedSubmission?.driveFile?.title}
							</h3>
							<button
								onClick={() => {
									setPreviewUrl(null);
									setSelectedSubmission(null);
								}}
								className="p-1 text-gray-500 transition-colors rounded-full hover:text-gray-700 hover:bg-gray-200"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="p-4">
							{selectedSubmission?.driveFile?.thumbnailUrl ? (
								<div className="flex justify-center">
									<img
										src={selectedSubmission.driveFile.thumbnailUrl}
										alt="File Preview"
										className="max-w-full max-h-[70vh] object-contain rounded-md"
									/>
								</div>
							) : (
								<iframe
									src={previewUrl}
									className="w-full h-[70vh] rounded-md"
									title="File Preview"
								/>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
