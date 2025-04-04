import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Evaluation from "@/lib/models/Evaluation";

export async function GET(req) {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
				headers: { "Content-Type": "application/json" },
			});
		}

		const { searchParams } = new URL(req.url);
		const courseId = searchParams.get("courseId");
		const courseWorkId = searchParams.get("courseWorkId");

		if (!courseId || !courseWorkId) {
			return new Response(
				JSON.stringify({ error: "Missing required parameters" }),
				{
					status: 400,
					headers: { "Content-Type": "application/json" },
				}
			);
		}

		await connectDB();

		const evaluations = await Evaluation.find({
			courseId,
			courseWorkId,
		}).lean();

		return new Response(JSON.stringify({ evaluations }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching evaluations:", error);
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}
