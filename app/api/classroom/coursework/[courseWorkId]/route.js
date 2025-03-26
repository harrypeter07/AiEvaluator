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

		const { courseWorkId } = params;
		const { searchParams } = new URL(request.url);
		const courseId = searchParams.get("courseId");

		if (!courseId || !courseWorkId) {
			return NextResponse.json(
				{ error: "Course ID and Course Work ID are required" },
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

		const response = await classroom.courses.courseWork.get({
			courseId: courseId,
			id: courseWorkId,
		});

		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Error fetching course work details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch course work details" },
			{ status: 500 }
		);
	}
}
