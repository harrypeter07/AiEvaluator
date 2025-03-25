import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function analyzeLargePDF(file) {
	try {
		// Convert file to buffer
		const bytes = await file.arrayBuffer();
		const buffer = Buffer.from(bytes);

		// Upload file buffer directly
		const uploadResult = await fileManager.uploadFile(buffer, {
			mimeType: "application/pdf",
			displayName: file.name,
		});

		// Get the uploaded file's metadata
		const fileMetadata = await fileManager.getFile(uploadResult.file.name);
		console.log(`File uploaded successfully: ${fileMetadata.displayName}`);
		console.log(`File URI: ${fileMetadata.uri}`);

		const result = await model.generateContent([
			{
				fileData: {
					fileUri: fileMetadata.uri,
					mimeType: fileMetadata.mimeType,
				},
			},
			`Your job is to extract the exact text from the pdf without any formatting or changing grammer or any word. If there is any image just describe that image in the text. You have to be very careful with the text and make sure you dont miss anything.`,
		]);

		return {
			text: result.response.text(),
			fileInfo: {
				displayName: fileMetadata.displayName,
				uri: fileMetadata.uri,
				mimeType: fileMetadata.mimeType,
			},
		};
	} catch (error) {
		console.error("Error analyzing large PDF:", error);
		return null;
	}
}
