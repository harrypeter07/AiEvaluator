import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

export async function GET(request, { params }) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Ensure params is resolved
		const courseId = await Promise.resolve(params.courseId);

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
			const response = await classroom.courses.get({
				id: courseId,
			});

			// Transform the response to include only necessary data
			const course = {
				id: response.data.id,
				name: response.data.name,
				description: response.data.description,
				ownerId: response.data.ownerId,
				creationTime: response.data.creationTime,
				updateTime: response.data.updateTime,
				enrollmentCode: response.data.enrollmentCode,
				courseState: response.data.courseState,
				alternateLink: response.data.alternateLink,
			};

			return NextResponse.json({ course });
		} catch (error) {
			console.error("Error fetching course:", error);

			if (error.code === 403) {
				return NextResponse.json(
					{ error: "You don't have permission to view this course" },
					{ status: 403 }
				);
			}

			return NextResponse.json(
				{ error: "Failed to fetch course details" },
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
