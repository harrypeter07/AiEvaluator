import { NextResponse } from "next/server";
import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
const location = process.env.GOOGLE_CLOUD_LOCATION || "us";
const processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID;

// Check if required environment variables are present
if (!projectId || !processorId) {
	throw new Error("Missing required Google Cloud configuration");
}

// Initialize Document AI client with project configuration
const client = new DocumentProcessorServiceClient({
	apiEndpoint: process.env.OCR_URL || `${location}-documentai.googleapis.com`,
	projectId,
});

export async function POST(request) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get form data
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Convert file to buffer
		const buffer = Buffer.from(await file.arrayBuffer());

		// Construct request for Document AI
		const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
		const request_doc = {
			name,
			rawDocument: {
				content: buffer,
				mimeType: file.type,
			},
		};

		// Process document
		const [result] = await client.processDocument(request_doc);
		const { document } = result;

		// Extract text from the document
		const text = document.text;

		return NextResponse.json({ text });
	} catch (error) {
		console.error("OCR processing error:", error);
		return NextResponse.json(
			{ error: "Failed to process document" },
			{ status: 500 }
		);
	}
}