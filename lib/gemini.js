import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
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

**Context:**
* Grade Level: ${gradeLevel}
* Course Name: ${courseName}
* Assignment Instructions: ${assignmentInstructions}
* Areas of Focus: ${areasOfFocus}

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
