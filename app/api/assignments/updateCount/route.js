import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db"; // ✅ Match the correct import
import User from "@/models/User";
import { authOptions } from "@/lib/authOptions";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();
        const { assignmentName } = await req.json();

        // ✅ Store assignments as an array of strings inside `users` collection
        await User.updateOne(
            { email: session.user.email },
            { $addToSet: { assignments: assignmentName } }, // Prevent duplicates
            { upsert: true }
        );

        return NextResponse.json({ message: "Assignment updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error updating assignment count:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
