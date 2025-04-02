// app/api/assignments/fetchCourseWork/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const courseId = searchParams.get("courseId");

	if (!courseId) {
		return NextResponse.json(
			{ error: "Course ID is required" },
			{ status: 400 }
		);
	}

	const session = await getServerSession(authOptions);
	if (!session || !session.accessToken || session.provider !== "google") {
		return NextResponse.json(
			{ error: "Unauthorized or not Google login" },
			{ status: 401 }
		);
	}

	const auth = new google.auth.OAuth2();
	auth.setCredentials({ access_token: session.accessToken });

	const classroom = google.classroom({ version: "v1", auth });

	try {
		// First get the course details to check our role
		const courseResponse = await classroom.courses.get({
			id: courseId,
		});

		const course = courseResponse.data;

		// Get course work
		const courseworkResponse = await classroom.courses.courseWork.list({
			courseId,
			fields:
				"courseWork(id,title,description,workType,state,alternateLink,creationTime,updateTime,dueDate,maxPoints)",
		});

		const assignments = courseworkResponse.data.courseWork || [];

		// Try to get student names if we're a teacher
		let studentNames = {};
		if (course.teacherFolder) {
			// This indicates we have teacher access
			try {
				const studentsResponse = await classroom.courses.students.list({
					courseId,
					fields: "students(userId,profile(name,emailAddress))",
				});

				if (studentsResponse.data.students) {
					studentNames = studentsResponse.data.students.reduce(
						(acc, student) => {
							acc[student.userId] = student.profile.name.fullName;
							return acc;
						},
						{}
					);
				}
			} catch (error) {
				console.log(
					"Could not fetch student details - continuing without student names"
				);
			}
		}

		return NextResponse.json(
			{
				assignments,
				course,
				studentNames,
				isTeacher: !!course.teacherFolder,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching course work:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
