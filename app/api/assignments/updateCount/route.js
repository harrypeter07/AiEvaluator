import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Connect to database
		await connectDB();

		const { assignmentName } = await request.json();

		if (!assignmentName) {
			return NextResponse.json(
				{ error: "Assignment name is required" },
				{ status: 400 }
			);
		}

		// Update user's assignments array
		const result = await User.findOneAndUpdate(
			{ email: session.user.email },
			{
				$addToSet: { assignments: assignmentName }, // Use addToSet to prevent duplicates
			},
			{
				new: true, // Return updated document
				upsert: true, // Create if doesn't exist
			}
		);

		return NextResponse.json({
			success: true,
			count: result.assignments.length,
		});
	} catch (error) {
		console.error("Error updating assignment count:", error);
		return NextResponse.json(
			{ error: "Failed to update assignment count" },
			{ status: 500 }
		);
	}
}
