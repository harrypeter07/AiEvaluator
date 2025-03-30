// app/classroom/[courseId]/[courseWorkId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function CourseWorkDetails() {
	const { courseId, courseWorkId } = useParams();
	const { data: session, status } = useSession();
	const [coursework, setCoursework] = useState(null);
	const [submissions, setSubmissions] = useState([]);
	const [selectedSubmission, setSelectedSubmission] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	useEffect(() => {
		if (status === "authenticated" && session?.provider === "google") {
			fetchCourseWorkDetails();
		}
	}, [status, session, courseId, courseWorkId]);

	const fetchCourseWorkDetails = async () => {
		try {
			const res = await fetch(
				`/api/assignments/fetchCourseWorkDetails?courseId=${courseId}&courseWorkId=${courseWorkId}`
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch");
			setCoursework(data.coursework);
			setSubmissions(data.submissions || []);
		} catch (error) {
			console.error("Error fetching coursework details:", error);
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

	if (status === "loading")
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	if (status === "unauthenticated")
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center p-8 bg-white rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold mb-4">Please Log In</h2>
					<p className="text-gray-600 mb-4">
						You need to be logged in to access your coursework.
					</p>
					<Link
						href="/login"
						className="inline-block bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	if (session?.provider !== "google")
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center p-8 bg-white rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold mb-4">Google Login Required</h2>
					<p className="text-gray-600">
						Please log in with Google to see your coursework.
					</p>
				</div>
			</div>
		);

	if (!coursework)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<Link
							href={`/classroom/${courseId}`}
							className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-2"
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
						<div className="mt-2 flex items-center text-gray-600">
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
				<div className="bg-white rounded-lg shadow-md p-6 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-3">
						Description
					</h2>
					<p className="text-gray-600 whitespace-pre-wrap">
						{coursework.description || "No description provided."}
					</p>
				</div>

				{/* Student Submissions */}
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold text-gray-900 mb-6">
						Student Submissions
					</h2>
					<div className="space-y-6">
						{submissions.map((submission) => (
							<div
								key={submission.id}
								className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
							>
								<div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
									<div className="space-y-2">
										<div className="flex items-center gap-2">
											<span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
												{submission.state}
											</span>
											{submission.late && (
												<span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
													Late Submission
												</span>
											)}
										</div>
										<p className="text-sm text-gray-600">
											<span className="font-medium">Student ID:</span>{" "}
											{submission.userId}
										</p>
										<p className="text-sm text-gray-600">
											<span className="font-medium">Submitted:</span>{" "}
											{formatDate(submission.creationTime)}
										</p>
										<p className="text-sm text-gray-600">
											<span className="font-medium">Last Updated:</span>{" "}
											{formatDate(submission.updateTime)}
										</p>
										{submission.assignedGrade && (
											<p className="text-sm text-gray-600">
												<span className="font-medium">Grade:</span>{" "}
												{submission.assignedGrade}
											</p>
										)}
										{submission.draftGrade && (
											<p className="text-sm text-gray-600">
												<span className="font-medium">Draft Grade:</span>{" "}
												{submission.draftGrade}
											</p>
										)}
									</div>
									<a
										href={submission.alternateLink}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
								</div>

								{/* Attachments */}
								{submission.attachments != undefined &&
									submission.attachments.length > 0 && (
										<div className="mt-6">
											<h3 className="text-lg font-medium text-gray-900 mb-4">
												Attachments
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
												{submission.attachments.map((attachment, index) => (
													<div
														key={index}
														className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
													>
														{attachment.driveFile && (
															<>
																<div className="relative h-40 mb-3 rounded-md overflow-hidden bg-white">
																	{attachment.driveFile.thumbnailUrl !=
																		undefined &&
																		attachment.driveFile.thumbnailUrl
																			.length && (
																			<Image
																				src={attachment.driveFile.thumbnailUrl}
																				alt={attachment.driveFile.title}
																				fill
																				className="object-contain"
																			/>
																		)}
																</div>
																<p className="font-medium text-gray-900 truncate mb-3">
																	{attachment.driveFile.title}
																</p>
																<div className="flex gap-2">
																	<button
																		onClick={() => handlePreview(attachment)}
																		className="flex-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
																	>
																		Preview
																	</button>
																	<a
																		href={attachment.driveFile.alternateLink}
																		target="_blank"
																		rel="noopener noreferrer"
																		className="flex-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-center"
																	>
																		Download
																	</a>
																</div>
															</>
														)}
													</div>
												))}
											</div>
										</div>
									)}
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Preview Modal */}
			{previewUrl && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
						<div className="p-4 border-b flex justify-between items-center bg-gray-50">
							<h3 className="text-lg font-medium text-gray-900">
								{selectedSubmission?.driveFile?.title}
							</h3>
							<button
								onClick={() => setPreviewUrl(null)}
								className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200 transition-colors"
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
							<iframe
								src={previewUrl}
								className="w-full h-[70vh] rounded-md"
								title="File Preview"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
