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

	if (status === "loading") return <p>Loading...</p>;
	if (status === "unauthenticated")
		return (
			<p>
				Please log in at <a href="/login">/login</a>.
			</p>
		);
	if (session?.provider !== "google")
		return <p>Please log in with Google to see Classroom data.</p>;

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold mb-4">Your Courses</h1>
			{courses.length === 0 ? (
				<p>No courses found.</p>
			) : (
				<ul className="list-disc pl-5 mb-4">
					{courses.map((course) => (
						<li key={course.id} className="mb-2">
							<Link
								href={`/classroom/${course.id}`}
								className="text-blue-600 hover:underline"
							>
								{course.name} (ID: {course.id})
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
