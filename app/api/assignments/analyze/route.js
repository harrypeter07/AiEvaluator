import { analyzeAssignment } from "@/lib/gemini";
import Assignment from "@/models/Assignment";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(req) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return Response.json(
				{
					error: "Session expired. Please sign in again.",
					code: "SESSION_EXPIRED",
				},
				{ status: 401 }
			);
		}

		const formData = await req.formData();
		const pdf = formData.get("pdf");
		const title = formData.get("title");

		// Validate required fields
		if (!pdf) {
			return Response.json({ error: "PDF file is required" }, { status: 400 });
		}
		if (!title) {
			return Response.json({ error: "Title is required" }, { status: 400 });
		}

		// Validate file type
		if (!pdf.type || !pdf.type.includes("pdf")) {
			return Response.json(
				{ error: "Only PDF files are allowed" },
				{ status: 400 }
			);
		}

		await connectDB();

		// Find the user by email
		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return Response.json(
				{
					error: "User not found. Please sign in again.",
					code: "USER_NOT_FOUND",
				},
				{ status: 401 }
			);
		}

		// Convert PDF to base64
		const bytes = await pdf.arrayBuffer();
		const base64Data = Buffer.from(bytes).toString("base64");

		// Get analysis from Gemini
		const analysis = await analyzeAssignment(base64Data);
		if (!analysis || !analysis.extractedText) {
			throw new Error("Failed to analyze PDF");
		}

		// Create and save assignment
		const assignment = new Assignment({
			userId: user._id,
			title,
			content: analysis.extractedText,
			originalFileName: pdf.name,
			feedback: analysis.extractedText,
		});

		await assignment.save();

		return Response.json({
			success: true,
			feedback: analysis.extractedText,
		});
	} catch (error) {
		console.error("Error processing assignment:", error);

		// Handle specific error types
		if (error.name === "CastError") {
			return Response.json(
				{
					error: "Invalid data format",
					details:
						process.env.NODE_ENV === "development" ? error.message : undefined,
				},
				{ status: 400 }
			);
		}

		return Response.json(
			{
				error: error.message || "Internal server error",
				details:
					process.env.NODE_ENV === "development" ? error.stack : undefined,
			},
			{ status: 500 }
		);
	}
}
