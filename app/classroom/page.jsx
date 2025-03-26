// app/classroom/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClassroomPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [courses, setCourses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
			return;
		}

		if (status === "authenticated") {
			fetchCourses();
		}
	}, [status, router]);

	const fetchCourses = async () => {
		try {
			const response = await fetch("/api/classroom/courses");
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to fetch courses");
			}

			setCourses(data.courses);
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
				<h1 className="text-3xl font-bold text-gray-900 mb-8">My Courses</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{courses.map((course) => (
						<Link
							key={course.id}
							href={`/classroom/courses/${course.id}`}
							className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
						>
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								{course.name}
							</h2>
							{course.description && (
								<p className="text-gray-600 mb-4 line-clamp-2">
									{course.description}
								</p>
							)}
							<div className="flex items-center text-sm text-gray-500">
								<span className="mr-4">
									Created: {new Date(course.creationTime).toLocaleDateString()}
								</span>
								<span>
									Last updated:{" "}
									{new Date(course.updateTime).toLocaleDateString()}
								</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
