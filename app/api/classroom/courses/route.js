import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
			const response = await classroom.courses.list({
				pageSize: 30,
				courseStates: ["ACTIVE"],
			});

			// Transform the response to include only necessary data
			const courses =
				response.data.courses?.map((course) => ({
					id: course.id,
					name: course.name,
					description: course.description,
					ownerId: course.ownerId,
					creationTime: course.creationTime,
					updateTime: course.updateTime,
					enrollmentCode: course.enrollmentCode,
					courseState: course.courseState,
					alternateLink: course.alternateLink,
				})) || [];

			return NextResponse.json({ courses });
		} catch (error) {
			console.error("Error fetching courses:", error);

			if (error.code === 403) {
				return NextResponse.json(
					{
						error:
							"You don't have permission to view courses. Please ensure you are logged in with the correct Google account.",
					},
					{ status: 403 }
				);
			}

			return NextResponse.json(
				{ error: "Failed to fetch courses. Please try again later." },
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
