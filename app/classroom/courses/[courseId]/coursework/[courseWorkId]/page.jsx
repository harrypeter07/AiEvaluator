"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CourseWorkDetail({ params }) {
	const { data: session, status } = useSession();
	const [courseWork, setCourseWork] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const router = useRouter();
	const { courseId, courseWorkId } = params;

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (session) {
			fetchCourseWorkDetail();
		}
	}, [session, status, courseId, courseWorkId, router]);

	const fetchCourseWorkDetail = async () => {
		try {
			setLoading(true);
			const response = await fetch(
				`/api/classroom/coursework/${courseWorkId}?courseId=${courseId}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch course work details");
			}

			setCourseWork(data);
		} catch (err) {
			setError(err.message);
			console.error("Error fetching course work details:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
					{error}
				</div>
			</div>
		);
	}

	if (!courseWork) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<div className="text-center py-12">
					<p className="text-gray-500">Course work not found</p>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<div className="mb-6">
				<button
					onClick={() => router.back()}
					className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
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
							strokeWidth="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						/>
					</svg>
					Back to Course Work
				</button>
				<h1 className="text-2xl font-bold text-gray-900">{courseWork.title}</h1>
				<div className="mt-2 flex items-center space-x-4">
					<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
						{courseWork.state}
					</span>
					{courseWork.dueDate && (
						<span className="text-sm text-gray-500">
							Due:{" "}
							{new Date(
								courseWork.dueDate.year,
								courseWork.dueDate.month - 1,
								courseWork.dueDate.day
							).toLocaleDateString()}
						</span>
					)}
				</div>
			</div>

			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				{courseWork.description && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							Description
						</h2>
						<p className="text-gray-600">{courseWork.description}</p>
					</div>
				)}

				{courseWork.materials && courseWork.materials.length > 0 && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							Materials
						</h2>
						<div className="space-y-2">
							{courseWork.materials.map((material, index) => (
								<div
									key={index}
									className="flex items-center p-3 bg-gray-50 rounded-lg"
								>
									<svg
										className="w-5 h-5 text-gray-400 mr-3"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
										/>
									</svg>
									<span className="text-gray-700">
										{material.title || "Untitled Material"}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{courseWork.assigneeMode && (
					<div className="mb-6">
						<h2 className="text-lg font-semibold text-gray-900 mb-2">
							Assignment Details
						</h2>
						<div className="space-y-2">
							<p className="text-gray-600">
								Assignee Mode: {courseWork.assigneeMode}
							</p>
							{courseWork.individualStudentsOptions && (
								<p className="text-gray-600">
									Individual Students:{" "}
									{courseWork.individualStudentsOptions.studentIds.length}
								</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
