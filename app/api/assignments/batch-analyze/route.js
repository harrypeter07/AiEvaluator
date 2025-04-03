import { analyzeAssignment } from "@/lib/gemini";
import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
import Assignment from "@/models/Assignment";
import { connectDB } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import User from "@/models/User";

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
		const pdfs = formData.getAll("pdfs");
		const titles = formData.getAll("titles");

		if (!pdfs.length || !titles.length || pdfs.length !== titles.length) {
			return Response.json({ error: "Invalid input data" }, { status: 400 });
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

		const processedFiles = await Promise.all(
			pdfs.map(async (pdf, index) => {
				const bytes = await pdf.arrayBuffer();
				const base64Data = Buffer.from(bytes).toString("base64");
				const analysis = await analyzeAssignment(base64Data);
				const fileHash = generateContentHash(base64Data);

				return {
					title: titles[index],
					content: analysis.extractedText,
					feedback: analysis.extractedText,
					originalFileName: pdf.name,
					fileHash,
					base64Data,
				};
			})
		);

		const existingAssignments = await Assignment.find({
			userId: { $ne: user._id },
		});
		const batchResults = [];

		for (const file of processedFiles) {
			const plagiarismReport = checkPlagiarism(file.content, [
				...processedFiles
					.filter((f) => f !== file)
					.map((f) => ({ content: f.content })),
				...existingAssignments,
			]);

			const assignment = new Assignment({
				userId: user._id,
				title: file.title,
				content: file.content,
				originalFileName: file.originalFileName,
				fileHash: file.fileHash,
				plagiarismScore: plagiarismReport.overallRisk,
				similarityMatches: plagiarismReport.potentialPlagiarism,
				feedback: file.feedback,
			});

			await assignment.save();

			batchResults.push({
				id: assignment._id,
				title: file.title,
				plagiarismScore: plagiarismReport.overallRisk,
				similarityMatches: plagiarismReport.potentialPlagiarism,
				feedback: file.feedback,
			});
		}

		return Response.json({
			success: true,
			results: batchResults,
		});
	} catch (error) {
		console.error("Error in batch analysis:", error);
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
