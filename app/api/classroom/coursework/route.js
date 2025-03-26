import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const courseId = searchParams.get("courseId");

		if (!courseId) {
			return NextResponse.json(
				{ error: "Course ID is required" },
				{ status: 400 }
			);
		}

		const oauth2Client = new google.auth.OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			process.env.NEXTAUTH_URL
		);

		oauth2Client.setCredentials({
			access_token: session.accessToken,
			refresh_token: session.refreshToken,
		});

		const classroom = google.classroom({ version: "v1", auth: oauth2Client });

		try {
			// First verify the user has access to this course
			await classroom.courses.get({
				id: courseId,
			});

			// Then fetch the course work
			const response = await classroom.courses.courseWork.list({
				courseId: courseId,
				orderBy: "dueDate desc",
				pageSize: 30,
			});

			// Transform the response to include only necessary data
			const coursework =
				response.data.courseWork?.map((work) => ({
					id: work.id,
					title: work.title,
					description: work.description,
					dueDate: work.dueDate,
					dueTime: work.dueTime,
					maxPoints: work.maxPoints,
					type: work.type,
					state: work.state,
					creationTime: work.creationTime,
					updateTime: work.updateTime,
				})) || [];

			return NextResponse.json({ coursework });
		} catch (error) {
			console.error("Error fetching course work:", error);

			if (error.code === 403) {
				return NextResponse.json(
					{
						error:
							"You don't have permission to view this course work. Please ensure you are enrolled in the course.",
					},
					{ status: 403 }
				);
			}

			return NextResponse.json(
				{ error: "Failed to fetch course work. Please try again later." },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{ error: "An unexpected error occurred" },
			{ status: 500 }
		);
	}
}
