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
    const courseworkResponse = await classroom.courses.courseWork.get({
      courseId,
      id: courseWorkId,
    });
    const coursework = courseworkResponse.data;

    return NextResponse.json(
      { coursework },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching coursework details:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}