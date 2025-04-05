import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Evaluation from "@/lib/models/Evaluation";

export async function POST(req) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		await connectDB();
		const data = await req.json();

		const {
			courseId,
			courseWorkId,
			submissionId,
			studentId,
			studentName,
			studentEmail,
			feedback,
			score,
			attachments,
			evaluationTimestamp,
		} = data;

		// Create or update evaluation result using Mongoose
		const result = await Evaluation.findOneAndUpdate(
			{
				courseId,
				courseWorkId,
				submissionId,
			},
			{
				$set: {
					courseId,
					courseWorkId,
					submissionId,
					studentId,
					studentName,
					studentEmail,
					feedback,
					score,
					attachments,
					evaluationTimestamp: new Date(evaluationTimestamp),
					updatedAt: new Date(),
				},
			},
			{ upsert: true, new: true }
		);

		return new Response(JSON.stringify({ success: true, result }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error saving evaluation:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
