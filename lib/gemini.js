import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
<<<<<<< HEAD
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

export async function analyzePDF(
	base64Data,
	assignmentInstructions,
	gradeLevel,
	courseName,
	areasOfFocus
) {
	try {
		const chatSession = model.startChat({ history: [] });

		const prompt = `
You are a highly experienced and insightful teacher providing feedback on a student's assignment.
Your goal is to analyze the student's work, identify errors, provide constructive criticism,
and offer personalized guidance for improvement. You will also extract student information,
assess the quality of writing, and assign a score out of 100.
=======
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function extractPDFText(base64Data) {
    try {
        const chatSession = model.startChat({ history: [] });
        const prompt = `Extract and return only the raw text content from this PDF document, maintaining its original structure and formatting. Do not perform any analysis or provide any feedback.`;

        const result = await chatSession.sendMessage([
            { inlineData: { data: base64Data, mimeType: "application/pdf" } },
            prompt
        ]);
        return result.response.text();
    } catch (error) {
        console.error("Error extracting PDF text:", error);
        throw new Error("Failed to extract PDF text");
    }
}

export async function analyzeAssignment(
    base64Data,
    assignmentInstructions = "",
    gradeLevel = "",
    courseName = "",
    areasOfFocus = ""
) {
    try {
        const chatSession = model.startChat({ history: [] });
        const prompt = `
You are a highly experienced teacher providing feedback on a student's assignment.
Analyze the student's work and provide structured feedback.
>>>>>>> hassan

**Context:**
* Grade Level: ${gradeLevel}
* Course Name: ${courseName}
* Assignment Instructions: ${assignmentInstructions}
<<<<<<< HEAD
* Specific Areas of Focus: ${areasOfFocus}

**Tasks:**
1.  **Extract Student Information:** Identify and extract the student's name either from file or from file name , roll number (if available), school name (if available), and any other relevant identifying information from the document.
2.  **Analyze Content and Writing:** Evaluate the student's submission based on the provided assignment instructions and areas of focus. Look for:
    *   Accuracy of information
    *   Clarity of writing
    *   Organization and structure
    *   Grammar and spelling
    *   Argumentation and evidence (if applicable)
    *   Overall understanding of the subject matter
3.  **Provide Detailed Feedback:** Offer specific and constructive feedback, categorized as follows:
    *   Overall Assessment (Brief summary of strengths and weaknesses)
    *   Content/Understanding (Accuracy, depth of knowledge)
    *   Clarity/Organization (Structure, flow, coherence)
    *   Grammar/Mechanics (Spelling, punctuation, sentence structure)
    *   Style/Voice (Appropriateness, engagement)
4.  **Assign a Score:** Based on your analysis, assign a score out of 100, reflecting the overall quality of the student's work. Justify the score with specific reasons.
5. **Extract Keywords/Topics:** Try to extract the main keywords/topics covered in the PDF document.
=======
* Areas of Focus: ${areasOfFocus}
>>>>>>> hassan

**Output Format:**
**Student Information:**
* Name: [Student's Name]
* Roll Number: [Roll Number]
* School: [School Name]
* Other: [Other Info]

**Keywords/Topics:**
* [List of keywords/topics]

**Overall Assessment:** [Summary]

**Detailed Feedback:**
* Content/Understanding: [Feedback]
* Clarity/Organization: [Feedback]
* Grammar/Mechanics: [Feedback]
* Style/Voice: [Feedback]

**Score:** [Score/100]
**Justification:** [Explanation]
`;

<<<<<<< HEAD
		const result = await chatSession.sendMessage([
			{
				inlineData: {
					data: base64Data,
					mimeType: "application/pdf",
				},
			},
			prompt,
		]);

		return result.response.text(); // Returns analyzed text
	} catch (error) {
		console.error("Error analyzing PDF:", error);
		return null;
	}
}
=======
        const result = await chatSession.sendMessage([
            { inlineData: { data: base64Data, mimeType: "application/pdf" } },
            prompt
        ]);

        const analysisText = result.response.text();
        return {
            extractedText: analysisText,
            keywords: extractKeywords(analysisText),
            contentStructure: {
                studentInfo: extractStudentInfo(analysisText),
                feedback: splitIntoSections(analysisText),
                score: extractScore(analysisText)
            }
        };
    } catch (error) {
        console.error("Error in assignment analysis:", error);
        throw new Error("Failed to analyze assignment");
    }
}

function extractKeywords(text) {
    const keywordSection = text.match(/Keywords\/Topics:[\s\S]*?(?=\n\n|$)/i)?.[0] || "";
    return keywordSection
        .replace(/Keywords\/Topics:/i, "")
        .split("*")
        .map(k => k.trim())
        .filter(k => k.length > 0);
}

function extractStudentInfo(text) {
    const studentInfoSection = text.match(/Student Information:[\s\S]*?(?=\n\n|$)/i)?.[0] || "";
    const info = {};
    ["Name", "Roll Number", "School", "Other"].forEach(field => {
        const match = studentInfoSection.match(new RegExp(`${field}:\s*\[(.*?)\]`, "i"));
        if (match) info[field.toLowerCase().replace(" ", "_")] = match[1].trim();
    });
    return info;
}

function splitIntoSections(text) {
    const sections = {};
    const sectionHeaders = [
        "Overall Assessment",
        "Content/Understanding",
        "Clarity/Organization",
        "Grammar/Mechanics",
        "Style/Voice",
        "Justification"
    ];

    sectionHeaders.forEach(header => {
        const sectionMatch = text.match(new RegExp(`${header}:[\s\S]*?(?=\n\n|$)`, "i"));
        if (sectionMatch) {
            sections[header.toLowerCase().replace("/", "_")] = sectionMatch[0]
                .replace(new RegExp(`${header}:`, "i"), "")
                .trim();
        }
    });
    return sections;
}

function extractScore(text) {
    const scoreMatch = text.match(/Score:\s*\[(\d+)\/100\]/i);
    return scoreMatch ? parseInt(scoreMatch[1]) : 0;
}
>>>>>>> hassan
