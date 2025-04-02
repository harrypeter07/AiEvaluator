// app/classroom/[courseId]/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function CourseAssignments() {
	const { courseId } = useParams();
	const { data: session, status } = useSession();
	const [assignments, setAssignments] = useState([]);
	const [courseDetails, setCourseDetails] = useState(null);
	const [studentNames, setStudentNames] = useState({});

	useEffect(() => {
		if (status === "authenticated" && session?.provider === "google") {
			fetchCourseAssignments();
		}
	}, [status, session, courseId]);

	const fetchCourseAssignments = async () => {
		try {
			const res = await fetch(
				`/api/assignments/fetchCourseWork?courseId=${courseId}`
			);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch");
			setAssignments(data.assignments || []);
			setCourseDetails(data.course || null);
			setStudentNames(data.studentNames || {});

			// Store student names in sessionStorage for child routes
			sessionStorage.setItem(
				`studentNames-${courseId}`,
				JSON.stringify(data.studentNames || {})
			);
		} catch (error) {
			console.error("Error fetching course assignments:", error);
		}
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
						You need to be logged in to access your assignments.
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
						Please log in with Google to see your assignments.
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="flex items-center justify-between mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							{courseDetails?.name || "Course Assignments"}
						</h1>
						<p className="mt-2 text-gray-600">
							{courseDetails?.description || `Course ID: ${courseId}`}
						</p>
					</div>
					<Link
						href="/classroom"
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
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back to Courses
					</Link>
				</div>

				{assignments.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg shadow">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
							/>
						</svg>
						<p className="mt-3 text-lg text-gray-500">
							No assignments found for this course.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{assignments.map((assignment) => (
							<Link
								key={assignment.id}
								href={`/classroom/${courseId}/${assignment.id}`}
								className="block group"
							>
								<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											{assignment.title}
										</h3>
										<svg
											className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</div>
									<div className="mt-4">
										<p className="text-sm text-gray-500">
											Due:{" "}
											{assignment.dueDate ? (
												<span className="font-medium text-gray-900">
													{`${assignment.dueDate.month}/${assignment.dueDate.day}/${assignment.dueDate.year}`}
												</span>
											) : (
												<span className="text-yellow-600">No due date</span>
											)}
										</p>
									</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
