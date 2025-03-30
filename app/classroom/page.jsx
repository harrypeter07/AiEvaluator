// app/classroom/page.js
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Classroom() {
	const { data: session, status } = useSession();
	const [courses, setCourses] = useState([]);

	useEffect(() => {
		if (status === "authenticated" && session?.provider === "google") {
			fetchClassroomData();
		}
	}, [status, session]);

	const fetchClassroomData = async () => {
		try {
			const res = await fetch("/api/assignments/fetch");
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to fetch");
			setCourses(data.courses || []);
		} catch (error) {
			console.error("Error fetching Classroom data:", error);
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
						You need to be logged in to access your courses.
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
						Please log in with Google to see your Classroom data.
					</p>
				</div>
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
						Your Courses
					</h1>
					<p className="mt-3 text-lg text-gray-500">
						Select a course to view its assignments
					</p>
				</div>

				{courses.length === 0 ? (
					<div className="text-center py-12 bg-white rounded-lg shadow">
						<p className="text-gray-500 text-lg">No courses found.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{courses.map((course) => (
							<Link
								key={course.id}
								href={`/classroom/${course.id}`}
								className="block group"
							>
								<div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
									<div className="flex items-center justify-between">
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
											{course.name}
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
									<p className="mt-2 text-sm text-gray-500">
										Course ID: {course.id}
									</p>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
