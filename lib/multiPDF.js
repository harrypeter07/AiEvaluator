import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function listUploadedFiles() {
	try {
		const listFilesResponse = await fileManager.listFiles();
		return listFilesResponse.files;
	} catch (error) {
		console.error("Error listing files:", error);
		throw new Error("Failed to list files: " + error.message);
	}
}

export async function processMultiplePDFs(files) {
	try {
		// Ensure temp directory exists
		const tempDir = path.join(process.cwd(), "temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		const uploadPromises = files.map(async (file) => {
			const buffer = Buffer.from(await file.arrayBuffer());
			const tempPath = path.join(tempDir, `${Date.now()}-${file.name}`);

			// Write file temporarily
			fs.writeFileSync(tempPath, buffer);

			// Upload to Gemini
			const uploadResult = await fileManager.uploadFile(tempPath, {
				mimeType: "application/pdf",
				displayName: file.name,
			});

			// Clean up temp file
			fs.unlinkSync(tempPath);

			return {
				fileData: {
					fileUri: uploadResult.file.uri,
					mimeType: uploadResult.file.mimeType,
				},
			};
		});

		const uploadedFiles = await Promise.all(uploadPromises);

		// Generate analysis prompt for personalized feedback
		const prompt = `
            You are analyzing ${files.length} student submissions. You MUST analyze each submission individually and provide a complete analysis for each one.
            
            For each submission, you MUST follow this exact format:

            === Analysis for [Student Name] ===

            **Student Information:**
            * Name: [Student Name]
            * Course: [Course Name]
            * Submission Date: [Date]

            **Keywords/Topics:**
            * [Key Topic 1]
            * [Key Topic 2]
            * [Key Topic 3]

            **Overall Assessment:**
            [Provide a concise overall assessment of the work]

            **Detailed Feedback:**
            * Content Quality: [Feedback on content quality]
            * Structure: [Feedback on structure]
            * Grammar: [Feedback on grammar]
            * Areas for Improvement: [Specific areas to improve]

            **Score:**
            [Provide a score in the format: X/100 or A, B, C, D, F]

            **Justification:**
            [Explain the reasoning behind the score]

            CRITICAL REQUIREMENTS:
            1. You MUST analyze ALL ${files.length} submissions
            2. Each submission MUST have its own complete analysis section
            3. Each analysis MUST be separated by === Analysis for [Student Name] ===
            4. The Score section MUST contain a numerical score (X/100) or letter grade (A, B, C, D, F)
            5. Do not leave any section blank
            6. Provide specific, actionable feedback
            7. Base the score on the quality of content, structure, and grammar
            8. Make sure to analyze each submission independently
            9. Do not combine or merge analyses
            10. Each submission should be treated as a separate, complete analysis

            IMPORTANT: You must provide a complete analysis for each and every submission. Do not skip any submissions.
            The number of analysis sections in your response must exactly match the number of submissions (${files.length}).
        `;

		const result = await model.generateContent([...uploadedFiles, prompt]);
		const analysis = result.response.text();
 console.log("analysis" , analysis)
		// Validate that we have the correct number of analyses
		const analysisCount = (analysis.match(/=== Analysis for/g) || []).length;
		if (analysisCount !== files.length) {
			throw new Error(
				`Expected ${files.length} analyses but got ${analysisCount}. Please ensure all submissions are analyzed.`
			);
		}
 
		// Split the analysis into individual results
		const analyses = analysis.split(/=== Analysis for/).filter(Boolean);
		const formattedAnalyses = analyses.map((analysis) => {
			const lines = analysis.trim().split("\n");
			const studentName = lines[0].trim();
			const content = lines.slice(1).join("\n").trim();
			return `=== Analysis for ${studentName} ===\n\n${content}`;
		});

		return formattedAnalyses.join("\n\n");
	} catch (error) {
		console.error("Error processing multiple PDFs:", error);
		throw new Error("Failed to process PDFs: " + error.message);
	}
}

// Function to extract exact text from PDF
async function extractExactText(file) {
	try {
		// Ensure temp directory exists
		const tempDir = path.join(process.cwd(), "temp");
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const tempPath = path.join(tempDir, `${Date.now()}-${file.name}`);

		// Write file temporarily
		fs.writeFileSync(tempPath, buffer);

		// Upload to Gemini
		const uploadResult = await fileManager.uploadFile(tempPath, {
			mimeType: "application/pdf",
			displayName: file.name,
		});

		// Clean up temp file
		fs.unlinkSync(tempPath);

		const prompt = `
            Extract the exact text content from this PDF document.
            Do not modify, paraphrase, or change any content.
            Preserve all formatting, line breaks, and structure.
            Include all text exactly as it appears in the document.
            Do not add any analysis or commentary.
            Return only the raw text content.
        `;

		const result = await model.generateContent([
			{
				fileData: {
					fileUri: uploadResult.file.uri,
					mimeType: uploadResult.file.mimeType,
				},
			},
			prompt,
		]);

		return result.response.text();
	} catch (error) {
		console.error("Error extracting text:", error);
		throw new Error("Failed to extract text: " + error.message);
	}
}

// Function to calculate similarity between two texts
function calculateSimilarity(text1, text2) {
	// Convert texts to lowercase and split into words
	const words1 = text1.toLowerCase().split(/\s+/);
	const words2 = text2.toLowerCase().split(/\s+/);

	// Create word frequency maps
	const freq1 = {};
	const freq2 = {};

	words1.forEach((word) => {
		freq1[word] = (freq1[word] || 0) + 1;
	});

	words2.forEach((word) => {
		freq2[word] = (freq2[word] || 0) + 1;
	});

	// Calculate intersection and union
	let intersection = 0;
	let union = 0;

	// Count intersection
	Object.keys(freq1).forEach((word) => {
		if (freq2[word]) {
			intersection += Math.min(freq1[word], freq2[word]);
		}
	});

	// Count union
	Object.keys(freq1).forEach((word) => {
		union += freq1[word];
	});
	Object.keys(freq2).forEach((word) => {
		if (!freq1[word]) {
			// Only add if not already counted
			union += freq2[word];
		}
	});

	// Calculate Jaccard similarity
	const similarity = union === 0 ? 0 : (intersection * 2) / union;
	return Math.round(similarity * 100); // Convert to percentage
}

export async function comparePDFs(file1, file2) {
	try {
		// Extract exact text from both PDFs
		const text1 = await extractExactText(file1);
		const text2 = await extractExactText(file2);

		// Calculate similarity score
		const similarityScore = calculateSimilarity(text1, text2);

		// Generate comparison report
		const prompt = `
            Compare these two exact text contents and provide a detailed analysis:

            1. Similarity Score: ${similarityScore}%

            2. Exact Matches:
               - List all sections that are exactly identical
               - Include line numbers or paragraph numbers
               - Highlight any suspicious patterns

            3. Content Analysis:
               - Identify any modifications or changes
               - Note any structural differences
               - Flag potential academic integrity concerns

            4. Recommendations:
               - Suggest further investigation if needed
               - Provide specific examples of concerns
               - Recommend appropriate actions

            Format the response in a clear, structured way.
            Use a red flag system (🚩) to highlight serious concerns.
            Include specific examples with line numbers where possible.
        `;

		const result = await model.generateContent([
			{ text: text1 },
			{ text: text2 },
			prompt,
		]);

		return result.response.text();
	} catch (error) {
		console.error("Error comparing PDFs:", error);
		throw new Error("Failed to compare PDFs: " + error.message);
	}
}
