// app/classroom/[courseId]/[courseWorkId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Image from "next/image";

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

	if (status === "loading") return <p>Loading...</p>;
	if (status === "unauthenticated")
		return (
			<p>
				Please log in at <a href="/login">/login</a>.
			</p>
		);
	if (session?.provider !== "google")
		return <p>Please log in with Google to see Classroom data.</p>;

	if (!coursework) return <p>Loading coursework details...</p>;

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">{coursework.title}</h1>
			<p className="mb-4">
				<strong>Due: </strong>
				{coursework.dueDate
					? `${coursework.dueDate.month}/${coursework.dueDate.day}/${coursework.dueDate.year}`
					: "No due date"}
			</p>

			{/* Message/Description */}
			<div className="mb-4">
				<h2 className="text-xl font-semibold">Message</h2>
				<p>{coursework.description || "No description provided."}</p>
			</div>

			{/* Student Submissions */}
			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-3">Student Submissions</h2>
				<div className="grid gap-4">
					{submissions.map((submission) => (
						<div key={submission.id} className="bg-gray-50 p-4 rounded-lg">
							<div className="flex justify-between items-start">
								<div>
									<p>
										<strong>Student ID:</strong> {submission.userId}
									</p>
									<p>
										<strong>Status:</strong> {submission.state}
									</p>
									<p>
										<strong>Submitted:</strong>{" "}
										{formatDate(submission.creationTime)}
									</p>
									<p>
										<strong>Last Updated:</strong>{" "}
										{formatDate(submission.updateTime)}
									</p>
									{submission.assignedGrade && (
										<p>
											<strong>Grade:</strong> {submission.assignedGrade}
										</p>
									)}
									{submission.draftGrade && (
										<p>
											<strong>Draft Grade:</strong> {submission.draftGrade}
										</p>
									)}
									{submission.late && (
										<p className="text-red-600">
											<strong>Late Submission</strong>
										</p>
									)}
								</div>
								<a
									href={submission.alternateLink}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									View in Classroom
								</a>
							</div>

							{/* Attachments */}
							{submission.attachments.length > 0 && (
								<div className="mt-4">
									<h3 className="text-lg font-medium mb-2">Attachments</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{submission.attachments.map((attachment, index) => (
											<div key={index} className="bg-white p-3 rounded shadow">
												{attachment.driveFile && (
													<>
														<div className="relative h-40 mb-2">
                              {attachment.driveFile.thumbnailUr.length && (
                                <Image
																src={attachment.driveFile.thumbnailUrl}
																alt={attachment.driveFile.title}
																fill
																className="object-contain"
															/>
                              )}
															
														</div>
														<p className="font-medium truncate">
															{attachment.driveFile.title}
														</p>
														<div className="flex gap-2 mt-2">
															<button
																onClick={() => handlePreview(attachment)}
																className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
															>
																Preview
															</button>
															<a
																href={attachment.driveFile.alternateLink}
																target="_blank"
																rel="noopener noreferrer"
																className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
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

			{/* Preview Modal */}
			{previewUrl && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
						<div className="p-4 border-b flex justify-between items-center">
							<h3 className="text-lg font-medium">
								{selectedSubmission?.driveFile?.title}
							</h3>
							<button
								onClick={() => setPreviewUrl(null)}
								className="text-gray-500 hover:text-gray-700"
							>
								✕
							</button>
						</div>
						<div className="p-4">
							<iframe
								src={previewUrl}
								className="w-full h-[70vh]"
								title="File Preview"
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
