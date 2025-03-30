<<<<<<< HEAD
import { analyzePDF } from "@/lib/gemini";
import { analyzeLargePDF } from "@/lib/largePDF";
=======
import { extractPDFText, analyzeAssignment } from "@/lib/gemini";
import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
import Assignment from "@/models/Assignment";
import { connectDB } from "@/lib/db";
>>>>>>> hassan

export async function POST(req) {
    try {
        const formData = await req.formData();
        const userId = formData.get("userId");
        const pdf = formData.get("pdf");
        const title = formData.get("title");

<<<<<<< HEAD
		if (!file) {
			return Response.json({ error: "No file provided" }, { status: 400 });
		}

		// Check file size (20MB = 20 * 1024 * 1024 bytes)
		const FILE_SIZE_LIMIT = 20 * 1024 * 1024;
		if (file.size > FILE_SIZE_LIMIT) {
			// Use File Manager for large files
			const result = await analyzeLargePDF(file);
			console.log("Analysis result:", result);
			return Response.json({
				feedback: result.text,
				fileMetadata: result.fileInfo,
			});
		}

		// Convert PDF to base64 for smaller files
		const bytes = await file.arrayBuffer();
		const base64Data = Buffer.from(bytes).toString("base64");
=======
        if (!userId || !pdf || !title) {
            return Response.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectDB();
>>>>>>> hassan

        const bytes = await pdf.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");
        const extractedText = await extractPDFText(base64Data);
        const analysis = await analyzeAssignment(base64Data);

        const fileHash = generateContentHash(extractedText);
        const existingAssignments = await Assignment.find({ userId: { $ne: userId } });
        const plagiarismReport = checkPlagiarism(extractedText, existingAssignments);

        const assignment = new Assignment({
            userId,
            title,
            content: extractedText,
            originalFileName: pdf.name,
            fileHash,
            plagiarismScore: plagiarismReport.overallRisk,
            similarityMatches: plagiarismReport.potentialPlagiarism,
            feedback: analysis.extractedText
        });

        await assignment.save();

        return Response.json({
            success: true,
            plagiarismScore: plagiarismReport.overallRisk,
            similarityMatches: plagiarismReport.potentialPlagiarism,
            feedback: analysis.extractedText
        });
    } catch (error) {
        console.error("Error processing assignment:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}