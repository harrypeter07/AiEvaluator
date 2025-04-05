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
			<div className="flex justify-center items-center min-h-screen">
				<div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
			</div>
		);
	if (status === "unauthenticated")
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="p-8 text-center bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-2xl font-semibold">Please Log In</h2>
					<p className="mb-4 text-gray-600">
						You need to be logged in to access your courses.
					</p>
					<Link
						href="/login"
						className="inline-block px-6 py-2 text-white bg-blue-500 rounded-md transition-colors hover:bg-blue-600"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	if (session?.provider !== "google")
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="p-8 text-center bg-white rounded-lg shadow-md">
					<h2 className="mb-4 text-2xl font-semibold">Google Login Required</h2>
					<p className="text-gray-600">
						Please log in with Google to see your Classroom data.
					</p>
				</div>
			</div>
		);

	return (
		<div className="px-4 py-8 min-h-screen bg-teal-custom sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="mb-12 text-center">
					<h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
						Your Courses
					</h1>
					<p className="mt-3 text-lg text-gray-500">
						Select a course to view its assignments
					</p>
				</div>

				{courses.length === 0 ? (
					<div className="py-12 text-center bg-white rounded-lg shadow">
						<p className="text-lg text-gray-500">No courses found.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{courses.map((course, index) => {
							const gradientClasses = [
								
								"bg-gradient-to-r from-blue-500 to-teal-400",
								
								"bg-gradient-to-r from-green-400 to-emerald-600",
								"bg-gradient-to-r from-indigo-500 to-purple-500",
								"bg-gradient-to-r from-red-500 to-pink-500",
							];
							const gradientClass =
								gradientClasses[index % gradientClasses.length];

							return (
								<Link
									key={course.id}
									href={`/classroom/${course.id}`}
									className="block transition-all duration-300 transform group hover:scale-105"
								>
									<div className="overflow-hidden relative rounded-lg border-2 border-white shadow-lg transition-all duration-300 hover:shadow-2xl">
										{/* Gradient Background */}
										<div className={`absolute inset-0 ${gradientClass}`}></div>

										{/* Card Content */}
										<div className="relative z-10 p-6">
											<div className="flex justify-between items-center">
												<h3 className="text-lg font-semibold text-white group-hover:text-white">
													{course.name}
												</h3>
												<svg
													className="w-5 h-5 text-white transition-colors group-hover:text-white"
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
											<p className="mt-2 text-sm text-white">
												Course ID: {course.id}
											</p>
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
