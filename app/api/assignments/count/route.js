import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();
		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ count: 0 }, { status: 200 });
		}

		return NextResponse.json(
			{
				count: user.assignments ? user.assignments.length : 0,
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
