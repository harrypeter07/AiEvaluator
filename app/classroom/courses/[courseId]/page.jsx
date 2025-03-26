"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CoursePage({ params }) {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [coursework, setCoursework] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [course, setCourse] = useState(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated") {
			fetchCourseDetails();
			fetchCoursework();
		}
	}, [status, router, params.courseId]);

	const fetchCourseDetails = async () => {
		try {
			const response = await fetch(`/api/classroom/courses/${params.courseId}`);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch course details");
			}

			setCourse(data.course);
		} catch (err) {
			setError(err.message);
		}
	};

	const fetchCoursework = async () => {
		try {
			const response = await fetch(
				`/api/classroom/coursework?courseId=${params.courseId}`
			);
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch coursework");
			}

			setCoursework(data.coursework);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen bg-gray-50 p-8">
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gray-50 p-8">
				<div className="max-w-7xl mx-auto">
					<div className="bg-red-50 border border-red-200 rounded-lg p-4">
						<p className="text-red-600">{error}</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-7xl mx-auto">
				<div className="mb-8">
					<Link
						href="/classroom"
						className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
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
								strokeWidth="2"
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						Back to Courses
					</Link>
					{course && (
						<h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
					)}
				</div>

				<div className="bg-white rounded-lg shadow-sm">
					<div className="p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">
							Coursework
						</h2>
						{coursework.length === 0 ? (
							<p className="text-gray-500 text-center py-8">
								No coursework available for this course
							</p>
						) : (
							<div className="space-y-4">
								{coursework.map((work) => (
									<div
										key={work.id}
										className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
									>
										<div className="flex items-start justify-between">
											<div>
												<h3 className="text-lg font-medium text-gray-900">
													{work.title}
												</h3>
												<p className="text-sm text-gray-500 mt-1">
													Due:{" "}
													{work.dueDate
														? new Date(
																work.dueDate.year,
																work.dueDate.month - 1,
																work.dueDate.day
														  ).toLocaleDateString()
														: "No due date"}
												</p>
											</div>
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{work.state}
											</span>
										</div>

										{work.description && (
											<p className="mt-2 text-gray-600">{work.description}</p>
										)}

										<div className="mt-4">
											<Link
												href={`/classroom/courses/${params.courseId}/coursework/${work.id}`}
												className="text-blue-600 hover:text-blue-800 text-sm font-medium"
											>
												View Details →
											</Link>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
