import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get request body
		const { assignmentName, mode } = await request.json();

		if (!assignmentName) {
			return NextResponse.json(
				{ error: "Assignment name is required" },
				{ status: 400 }
			);
		}

		// Get current count
		const currentCount = await prisma.assignmentCount.findFirst({
			where: {
				assignmentName,
			},
		});

		if (currentCount) {
			// Update existing count
			await prisma.assignmentCount.update({
				where: {
					assignmentName,
				},
				data: {
					count: {
						increment: 1,
					},
					lastUpdated: new Date(),
					mode: mode || "single", // Store the mode of submission
				},
			});
		} else {
			// Create new count entry
			await prisma.assignmentCount.create({
				data: {
					assignmentName,
					count: 1,
					lastUpdated: new Date(),
					mode: mode || "single", // Store the mode of submission
				},
			});
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating assignment count:", error);
		return NextResponse.json(
			{ error: "Failed to update assignment count" },
			{ status: 500 }
		);
	}
}
