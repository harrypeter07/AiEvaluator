import { analyzePDF } from "@/lib/gemini";
import { analyzeLargePDF } from "@/lib/largePDF";

export async function POST(req) {
	try {
		const formData = await req.formData();
		const file = formData.get("pdf");

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

		// Call Gemini for analysis
		const feedback = await analyzePDF(base64Data);

		return Response.json({ feedback });
	} catch (error) {
		console.error("Error processing PDF:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
