import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";
import { rateLimit } from "@/lib/rateLimit";
import { cache } from "@/lib/cache";
import { logger } from "@/lib/logger";

// Rate limiter: 100 requests per minute
const limiter = rateLimit({
	interval: 60 * 1000, // 1 minute
	uniqueTokenPerInterval: 500, // Max 500 users per interval
});

export async function GET(request) {
	try {
		// Rate limiting
		try {
			await limiter.check(request, 100, "CACHE_TOKEN");
		} catch {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{ status: 429 }
			);
		}

		// Authentication check
		const session = await getServerSession(authOptions);
		if (!session) {
			logger.warn("Unauthorized access attempt", { path: request.url });
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Parameter validation
		const { searchParams } = new URL(request.url);
		const courseId = searchParams.get("courseId");

		if (!courseId) {
			logger.warn("Missing courseId parameter", { path: request.url });
			return NextResponse.json(
				{ error: "Course ID is required" },
				{ status: 400 }
			);
		}

		// Check cache first
		const cacheKey = `coursework:${courseId}:${session.user.email}`;
		const cachedData = await cache.get(cacheKey);
		if (cachedData) {
			logger.info("Cache hit for coursework", { courseId });
			return NextResponse.json(JSON.parse(cachedData));
		}

		// Setup Google OAuth2 client
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

			// Then fetch the course work with student-specific endpoint
			const response =
				await classroom.courses.courseWork.studentSubmissions.list({
					courseId: courseId,
					courseWorkId: "-", // This will list all coursework
					pageSize: 30,
				});

			// Transform and validate the response
			const coursework =
				response.data.studentSubmissions
					?.map((submission) => {
						// Validate required fields
						if (!submission.courseWorkId || !submission.courseWorkTitle) {
							logger.warn("Invalid submission data", { submission });
							return null;
						}

						return {
							id: submission.courseWorkId,
							title: submission.courseWorkTitle,
							state: submission.state || "UNSUBMITTED",
							assignedGrade: submission.assignedGrade,
							draftGrade: submission.draftGrade,
							updateTime: submission.updateTime,
							creationTime: submission.creationTime,
						};
					})
					.filter(Boolean) || [];

			// Cache the result for 5 minutes
			await cache.set(cacheKey, JSON.stringify({ coursework }), 300);

			logger.info("Successfully fetched coursework", {
				courseId,
				count: coursework.length,
			});

			return NextResponse.json({ coursework });
		} catch (error) {
			logger.error("Error in Google Classroom API", {
				error: error.message,
				code: error.code,
				courseId,
			});

			if (error.code === 403) {
				return NextResponse.json(
					{
						error:
							"You don't have permission to view this course work. Please ensure you are enrolled in the course.",
					},
					{ status: 403 }
				);
			}

			throw error; // Let the outer catch handle other errors
		}
	} catch (error) {
		logger.error("Unexpected error in coursework route", {
			error: error.message,
			stack: error.stack,
		});

		// Classify and handle different types of errors
		if (error.code === "ECONNREFUSED") {
			return NextResponse.json(
				{
					error:
						"Unable to connect to Google Classroom. Please try again later.",
				},
				{ status: 503 }
			);
		}

		if (error.code === "ETIMEDOUT") {
			return NextResponse.json(
				{ error: "Request timed out. Please try again." },
				{ status: 504 }
			);
		}

		return NextResponse.json(
			{ error: "An unexpected error occurred. Our team has been notified." },
			{ status: 500 }
		);
	}
}
