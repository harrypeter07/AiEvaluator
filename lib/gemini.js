import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function analyzePDF(base64Data) {
    try {
        const chatSession = model.startChat({ history: [] });
        const result = await chatSession.sendMessage([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf",
                },
            },
            "Analyze this document and provide feedback.",
        ]);

        return result.response.text(); // Returns analyzed text
    } catch (error) {
        console.error("Error analyzing PDF:", error);
        return null;
    }
}
