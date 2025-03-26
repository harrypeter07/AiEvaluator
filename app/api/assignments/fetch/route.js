// app/api/assignments/fetch/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.accessToken || session.provider !== "google") {
    return new Response(JSON.stringify({ error: "Unauthorized or not Google login" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Session:", session);

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const classroom = google.classroom({ version: "v1", auth });

  try {
    console.log("Fetching courses...");
    const coursesResponse = await classroom.courses.list({ courseStates: ["ACTIVE"] });
    const courses = coursesResponse.data.courses || [];
    console.log("Courses fetched:", courses.map(c => ({ id: c.id, name: c.name, ownerId: c.ownerId })));

    // Temporarily skip coursework fetch to test courses
    return new Response(JSON.stringify({ courses, assignments: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching Classroom data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}