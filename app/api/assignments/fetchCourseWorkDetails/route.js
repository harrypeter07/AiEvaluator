// app/api/assignments/fetchCourseWorkDetails/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req) {
	const { searchParams } = new URL(req.url);
	const courseId = searchParams.get("courseId");
	const courseWorkId = searchParams.get("courseWorkId");

	if (!courseId || !courseWorkId) {
		return NextResponse.json(
			{ error: "Course ID and CourseWork ID are required" },
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
		// Fetch coursework details
		const courseworkResponse = await classroom.courses.courseWork.get({
			courseId,
			id: courseWorkId,
		});
		const coursework = courseworkResponse.data;

		// Fetch student submissions
		const submissionsResponse =
			await classroom.courses.courseWork.studentSubmissions.list({
				courseId,
				courseWorkId,
			});

		// Map submissions to include all necessary information
		const submissions =
			submissionsResponse.data.studentSubmissions?.map((sub) => ({
				id: sub.id,
				userId: sub.userId,
				state: sub.state,
				assignedGrade: sub.assignedGrade,
				draftGrade: sub.draftGrade,
				late: sub.late,
				creationTime: sub.creationTime,
				updateTime: sub.updateTime,
				alternateLink: sub.alternateLink,
				courseWorkType: sub.courseWorkType,
				attachments: sub.assignmentSubmission?.attachments || [],
			})) || [];

		return NextResponse.json(
			{
				coursework,
				submissions,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching coursework details:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}

export async function PATCH(req) {
	const { searchParams } = new URL(req.url);
	const courseId = searchParams.get("courseId");
	const courseWorkId = searchParams.get("courseWorkId");
	const attachmentId = searchParams.get("attachmentId");
	const submissionId = searchParams.get("submissionId");

	if (!courseId || !courseWorkId || !attachmentId || !submissionId) {
		return NextResponse.json(
			{
				error:
					"Course ID, CourseWork ID, Attachment ID, and Submission ID are required",
			},
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

	try {
		const requestBody = await req.json();
		const auth = new google.auth.OAuth2();
		auth.setCredentials({ access_token: session.accessToken });

		const classroom = google.classroom({ version: "v1", auth });

		const submissionResponse =
			await classroom.courses.courseWork.addOnAttachments.studentSubmissions.patch(
				{
					courseId,
					itemId: courseWorkId,
					attachmentId,
					submissionId,
					requestBody,
				}
			);

		return NextResponse.json(submissionResponse.data, { status: 200 });
	} catch (error) {
		console.error("Error updating student submission:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
