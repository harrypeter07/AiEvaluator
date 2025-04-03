import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { createPartFromUri, GoogleGenAI } from "@google/genai";
import { connectDB } from "@/lib/db";
import Assignment from "@/models/Assignment";
import User from "@/models/User";
import crypto from 'crypto';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function generateFileHash(file) {
	return crypto.createHash('sha256').update(file.name + file.size + file.type).digest('hex');
}

async function uploadPDF(file, displayName) {
	const uploadedFile = await ai.files.upload({
		file: file,
		config: {
			displayName: displayName,
		},
	});

	// Wait for the file to be processed
	let getFile = await ai.files.get({ name: uploadedFile.name });
	while (getFile.state === 'PROCESSING') {
		getFile = await ai.files.get({ name: uploadedFile.name });
		console.log(`current file status: ${getFile.state}`);
		console.log('File is still processing, retrying in 5 seconds');

		await new Promise((resolve) => {
			setTimeout(resolve, 5000);
		});
	}

	if (getFile.state === 'FAILED') {
		throw new Error('File processing failed.');
	}

	return getFile;
}

export async function POST(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: "Session expired. Please sign in again." },
				{ status: 401 }
			);
		}

		await connectDB();

		// Find the user
		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 401 }
			);
		}

		const formData = await request.formData();
		const file1 = formData.get("file1");
		const file2 = formData.get("file2");

		if (!file1 || !file2) {
			return NextResponse.json(
				{ error: "Both PDF files are required" },
				{ status: 400 }
			);
		}

		if (!file1.type.includes("pdf") || !file2.type.includes("pdf")) {
			return NextResponse.json(
				{ error: "Only PDF files are allowed" },
				{ status: 400 }
			);
		}

		// Create the prompt for comparison
		const content = [
			`You are an expert at detecting plagiarism and comparing academic documents. Compare these two PDFs and provide a detailed analysis:

1. Calculate a similarity score (0-100%) based on:
   - Content similarity
   - Structure similarity
   - Language patterns
   - Key concepts and ideas

2. Identify specific sections that are similar or identical

3. Analyze if one document appears to be copied or derived from the other

4. Provide specific examples of similar content

5. Give a final recommendation on whether plagiarism is likely

Format your response as follows:

=== PDF Comparison Analysis ===

Similarity Score: [X]%

Detailed Analysis:
[Your detailed analysis here]

Similar Sections:
[List specific sections that are similar]

Recommendation:
[Your final recommendation]

Please be thorough but concise in your analysis.`
		];

		// Upload and process both PDFs
		const uploadedFile1 = await uploadPDF(file1, "PDF 1");
		if (uploadedFile1.uri && uploadedFile1.mimeType) {
			const fileContent1 = createPartFromUri(uploadedFile1.uri, uploadedFile1.mimeType);
			content.push(fileContent1);
		}

		const uploadedFile2 = await uploadPDF(file2, "PDF 2");
		if (uploadedFile2.uri && uploadedFile2.mimeType) {
			const fileContent2 = createPartFromUri(uploadedFile2.uri, uploadedFile2.mimeType);
			content.push(fileContent2);
		}

		// Generate content with Gemini
		const response = await ai.models.generateContent({
			model: 'gemini-1.5-flash',
			contents: content,
		});

		const analysis = response.text;
		const similarityScore = extractSimilarityScore(analysis);
       console.log("response"  ,analysis)
       console.log("similair"  ,similarityScore)
		// Save comparison results to database
		const comparison = new Assignment({
			userId: user._id,
			title: `Comparison: ${file1.name} vs ${file2.name}`,
			content: analysis,
			originalFileName: `${file1.name},${file2.name}`,
			fileHash: generateFileHash(file1) + generateFileHash(file2),
			plagiarismScore: similarityScore,
			crossComparisonResults: [{
				comparedWithId: null,
				similarityScore: similarityScore,
				sharedSegments: []
			}]
		});

		await comparison.save();

		// Format the response
		const formattedResponse = {
			success: true,
			comparison: {
				similarityScore: similarityScore,
				file1Name: file1.name,
				file2Name: file2.name,
			},
			feedback: analysis
		};
console.log("formattedResponse"  ,formattedResponse)
		return NextResponse.json(formattedResponse);
	} catch (error) {
		console.error("Error comparing PDFs:", error);
		
		// Handle specific error types
		if (error.message.includes('processing failed')) {
			return NextResponse.json(
				{ error: "Failed to process PDF files. Please check the file format." },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to compare PDFs. Please try again later." },
			{ status: 500 }
		);
	}
}

function extractSimilarityScore(analysis) {
	const match = analysis.match(/Similarity Score:\s*(\d+)%/);
	return match ? parseInt(match[1]) : 0;
} 