import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function fetchPDFAsBase64(fileUrl, accessToken) {
	// Extract file ID from Google Drive URL
	const fileId = fileUrl.match(/\/d\/(.+?)\/view/)?.[1];
	if (!fileId) {
		throw new Error("Invalid Google Drive URL");
	}

	// Use Google Drive API to download the file
	const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
	const response = await fetch(downloadUrl, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch PDF: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	return Buffer.from(arrayBuffer).toString("base64");
}

export async function analyzeClassroomSubmission(fileUrl, accessToken) {
	try {
		if (!accessToken) {
			throw new Error("Access token is required to download the PDF");
		}

		// Fetch and convert PDF to base64
		const base64Data = await fetchPDFAsBase64(fileUrl, accessToken);

		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const prompt = `Analyze this assignment submission carefully and thoroughly. Provide detailed feedback in the following format:

**Student Information:**
* Name: [Extract from document if available]
* Course: [Extract from document if available]
* Submission Date: [Extract from document if available]

**Keywords/Topics:**
* [Key Topic 1 - from actual content]
* [Key Topic 2 - from actual content]
* [Key Topic 3 - from actual content]

**Overall Assessment:**
[Provide a concise overall assessment based on the actual content]

**Detailed Feedback:**
* Content Quality: [Specific feedback based on the actual content]
* Structure: [Feedback on document structure and organization]
* Areas for Improvement: [Specific areas that need improvement]

**Score:**
[Score based on actual content quality: X/100]

**Justification:**
[Detailed explanation of the score based on specific content elements]

Important Guidelines:
1. Base ALL feedback on the ACTUAL CONTENT of the document
2. Do not make assumptions about content you cannot see
3. Be specific and reference actual elements from the submission
4. If the document is not readable or empty, report that as an error
5. Score should reflect the actual quality and completeness of the work`;

		const result = await model.generateContent({
			contents: [
				{
					parts: [
						{ text: prompt },
						{
							inlineData: {
								mimeType: "application/pdf",
								data: base64Data,
							},
						},
					],
				},
			],
		});

		const response = await result.response;
		const text = response.text();

		// Validate response
		if (!text || text.trim().length === 0) {
			throw new Error("Empty response from Gemini");
		}

		// Check if the response indicates inability to read the document
		if (
			text.toLowerCase().includes("unable to read") ||
			text.toLowerCase().includes("cannot access") ||
			text.toLowerCase().includes("document is not readable")
		) {
			throw new Error("Unable to read or process the PDF document");
		}

		// Validate score section
		if (!text.includes("**Score:**")) {
			throw new Error("Score section missing from response");
		}

		const scoreMatch = text.match(/\*\*Score:\*\*\s*([^\n]+)/);
		if (!scoreMatch || !scoreMatch[1].trim()) {
			throw new Error("Invalid score format");
		}

		return {
			extractedText: text,
		};
	} catch (error) {
		console.error("Error analyzing classroom submission:", error);
		throw new Error(`Failed to analyze assignment: ${error.message}`);
	}
}
