import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET() {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Connect to database
		await connectDB();

		// Find user and get assignments count
		const user = await User.findOne({ email: session.user.email });

		// If user not found or no assignments, return 0
		if (!user || !user.assignments) {
			return NextResponse.json({ count: 0 }, { status: 200 });
		}

		// Return assignments count
		return NextResponse.json(
			{
				count: user.assignments.length,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Error fetching assignment count:", error);
		return NextResponse.json(
			{ error: "Failed to fetch assignment count" },
			{ status: 500 }
		);
	}
}
