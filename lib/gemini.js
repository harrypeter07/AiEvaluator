import { GoogleGenerativeAI } from "@google/generative-ai"; // Correct package name!

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function analyzePDF(base64Data, assignmentInstructions, gradeLevel, courseName, areasOfFocus) {
    try {
        const chatSession = model.startChat({ history: [] });

        const prompt = `
You are a highly experienced and insightful teacher providing feedback on a student's assignment.
Your goal is to analyze the student's work, identify errors, provide constructive criticism,
and offer personalized guidance for improvement. You will also extract student information,
assess the quality of writing, and assign a score out of 100.

**Context:**
* Grade Level: ${gradeLevel}
* Course Name: ${courseName}
* Assignment Instructions: ${assignmentInstructions}
* Specific Areas of Focus: ${areasOfFocus}

**Tasks:**
1.  **Extract Student Information:** Identify and extract the student's name, roll number (if available), school name (if available), and any other relevant identifying information from the document.
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

**Output Format:**

---

**Student Information:**
*   Name: [Student's Name]
*   Roll Number: [Roll Number, if found]
*   School: [School Name, if found]
*   Other: [Any other relevant information found]

**Keywords/Topics:**
* [List of keywords/topics extracted from document]

**Overall Assessment:** [1-2 sentence summary]

**Detailed Feedback:**
*   Content/Understanding: [Specific feedback]
*   Clarity/Organization: [Specific feedback]
*   Grammar/Mechanics: [Specific feedback]
*   Style/Voice: [Specific feedback]

**Score:** [Score out of 100]
**Justification:** [Brief explanation of the score]

---

Now, analyze the following PDF document:
        `;

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
        console.error("Error analyzing :", error);
        return null;
    }
}