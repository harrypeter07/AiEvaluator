import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeAssignment(base64Data) {
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

		const contents = [
			{
				text: `Analyze this assignment and provide detailed feedback in the following format:

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

Important:
1. The Score section MUST contain a numerical score (X/100) or letter grade (A, B, C, D, F)
2. Do not leave any section blank
3. Provide specific, actionable feedback
4. Base the score on the quality of content, structure, and grammar

Please analyze the content quality, structure, grammar, and provide specific feedback for improvement.`,
			},
			{
				inlineData: {
					mimeType: "application/pdf",
					data: base64Data,
				},
			},
		];

		const result = await model.generateContent(contents);
		const response = await result.response;
		const text = response.text();

		// Validate and ensure score section is present
		if (!text.includes("**Score:**")) {
			throw new Error("Score section missing from response");
		}

		// Extract score section
		const scoreMatch = text.match(/\*\*Score:\*\*\s*([^\n]+)/);
		if (!scoreMatch || !scoreMatch[1].trim()) {
			throw new Error("Invalid score format");
		}

		return {
			extractedText: text,
		};
	} catch (error) {
		console.error("Error analyzing assignment:", error);
		throw new Error("Failed to analyze assignment");
	}
}
