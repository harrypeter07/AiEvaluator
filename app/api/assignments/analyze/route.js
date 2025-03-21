import { extractPDFText, analyzeAssignment } from "@/lib/gemini";
import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
import Assignment from "@/models/Assignment";
import { connectDB } from "@/lib/db";

export async function POST(req) {
	try {
		const formData = await req.formData();
		// Handle both single file and multi-file cases
		const pdfs = formData.getAll("pdfs"); // For backward compatibility
		const titles = formData.getAll("titles"); // For backward compatibility
		const userId = formData.get("userId");

		// For new single-file API
		const singlePdf = formData.get("pdf");
		const singleTitle = formData.get("title");

		// Use single file if provided, otherwise use first file from pdfs array
		const file = singlePdf || pdfs[0];
		const title = singleTitle || titles[0];

		if (!file || !title || !userId) {
			return Response.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Convert PDF to base64
		const bytes = await file.arrayBuffer();
		const base64Data = Buffer.from(bytes).toString("base64");

		// Extract text content using Gemini
		const extractedText = await extractPDFText(base64Data);

		if (!extractedText) {
			return Response.json(
				{ error: "Failed to extract document content" },
				{ status: 500 }
			);
		}

		// Analyze the extracted text
		const analysis = await analyzeAssignment(base64Data);

		if (!analysis) {
			return Response.json(
				{ error: "Failed to analyze document content" },
				{ status: 500 }
			);
		}

		const { keywords, contentStructure } = analysis;

		// Generate content hash
		const fileHash = generateContentHash(base64Data);

		// Find existing assignments to compare against
		const existingAssignments = await Assignment.find({
			_id: { $ne: null }, // Just to get all assignments
		});

		// Check plagiarism against existing assignments
		// Check plagiarism using the extracted and structured content
		const { plagiarismScore, similarityMatches } = await checkPlagiarism(
			extractedText,
			existingAssignments,
			{
				keywords,
				contentStructure,
			}
		);

		// Create and save the assignment
		const assignment = new Assignment({
			userId,
			title,
			content: extractedText,
			originalFileName: file.name,
			fileHash,
			plagiarismScore,
			similarityMatches,
			feedback: JSON.stringify(contentStructure),
		});

		await assignment.save();

		return Response.json({
			success: true,
			assignmentId: assignment._id,
			title: assignment.title,
			plagiarismScore,
			similarityMatches,
			feedback,
		});
	} catch (error) {
		console.error("Error processing PDF:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
