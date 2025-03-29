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
		} catch (error) {
			console.error("Error fetching course assignments:", error);
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
			<h1 className="text-2xl font-bold mb-4">
				Assignments for Course {courseId}
			</h1>
			{assignments.length === 0 ? (
				<p>No assignments found.</p>
			) : (
				<ul className="list-disc pl-5">
					{assignments.map((assignment) => (
						<li key={assignment.id}>
							<Link
								href={`/classroom/${courseId}/${assignment.id}`}
								className="text-blue-600 hover:underline"
							>
								{assignment.title} (Due:{" "}
								{assignment.dueDate
									? `${assignment.dueDate.month}/${assignment.dueDate.day}/${assignment.dueDate.year}`
									: "No due date"}
								)
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
