import { extractPDFText, analyzeAssignment } from "@/lib/gemini";
import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
import Assignment from "@/models/Assignment";
import { connectDB } from "@/lib/db";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("pdfs");
        const titles = formData.getAll("titles");
        const userId = formData.get("userId");

        if (!files.length || !titles.length || !userId || files.length !== titles.length) {
            return Response.json({ error: "Invalid input data" }, { status: 400 });
        }

        await connectDB();

        const processedFiles = await Promise.all(
            files.map(async (file, index) => {
                const bytes = await file.arrayBuffer();
                const base64Data = Buffer.from(bytes).toString("base64");
                const extractedText = await extractPDFText(base64Data);
                const analysis = await analyzeAssignment(base64Data);
                const fileHash = generateContentHash(extractedText);

                return {
                    title: titles[index],
                    content: extractedText,
                    feedback: analysis.extractedText,
                    originalFileName: file.name,
                    fileHash,
                    base64Data
                };
            })
        );

        const existingAssignments = await Assignment.find({ userId: { $ne: userId } });
        const batchResults = [];

        for (const file of processedFiles) {
            const plagiarismReport = checkPlagiarism(file.content, [
                ...processedFiles.filter(f => f !== file).map(f => ({ content: f.content })),
                ...existingAssignments
            ]);

            const assignment = new Assignment({
                userId,
                title: file.title,
                content: file.content,
                originalFileName: file.originalFileName,
                fileHash: file.fileHash,
                plagiarismScore: plagiarismReport.overallRisk,
                similarityMatches: plagiarismReport.potentialPlagiarism,
                feedback: file.feedback
            });

            await assignment.save();

            batchResults.push({
                id: assignment._id,
                title: file.title,
                plagiarismScore: plagiarismReport.overallRisk,
                similarityMatches: plagiarismReport.potentialPlagiarism,
                feedback: file.feedback
            });
        }

        return Response.json({
            success: true,
            results: batchResults
        });
    } catch (error) {
        console.error("Error in batch analysis:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}