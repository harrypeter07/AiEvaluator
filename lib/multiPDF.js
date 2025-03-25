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
		throw error;
	}
}

export async function processMultiplePDFs(files) {
	try {
		const uploadPromises = files.map(async (file) => {
			const buffer = Buffer.from(await file.arrayBuffer());
			const tempPath = path.join(
				process.cwd(),
				"temp",
				`${Date.now()}-${file.name}`
			);

			// Ensure temp directory exists
			if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
				fs.mkdirSync(path.join(process.cwd(), "temp"));
			}

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
            Analyze these ${files.length} student submissions and provide personalized feedback for each student:

            1. For each submission:
               - Student's name (from filename)
               - Overall assessment of the work
               - Strengths and areas for improvement
               - Specific feedback on answers and solutions
               - Grade or score if applicable

            2. Answer Analysis:
               - Check correctness of mathematical solutions
               - Verify logical reasoning in explanations
               - Identify any misconceptions
               - Point out calculation errors
               - Suggest alternative approaches where applicable

            3. Learning Support:
               - Identify areas where the student needs additional help
               - Suggest specific resources or practice problems
               - Provide constructive criticism
               - Highlight good practices and correct approaches

            4. Individual Progress:
               - Compare with previous submissions if available
               - Note improvement areas
               - Recognize achievements
               - Set goals for improvement

            Format the response with clear sections for each student.
            Use a supportive and constructive tone.
            Focus on helping students learn and improve.
        `;

		const result = await model.generateContent([...uploadedFiles, prompt]);

		return result.response.text();
	} catch (error) {
		console.error("Error processing multiple PDFs:", error);
		throw error;
	}
}

// Function to extract exact text from PDF
async function extractExactText(file) {
	try {
		const buffer = Buffer.from(await file.arrayBuffer());
		const tempPath = path.join(
			process.cwd(),
			"temp",
			`${Date.now()}-${file.name}`
		);

		// Ensure temp directory exists
		if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
			fs.mkdirSync(path.join(process.cwd(), "temp"));
		}

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
		throw error;
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
		union += freq2[word];
	});

	// Calculate Jaccard similarity
	const similarity = (intersection * 2) / (union - intersection);
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
		throw error;
	}
}
