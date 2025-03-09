import { analyzePDF } from "@/lib/gemini";
// import fs from "fs";

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get("pdf");

        if (!file) {
            return Response.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert PDF to base64
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString("base64");

        // Call Gemini for analysis
        const feedback = await analyzePDF(base64Data);

        return Response.json({ feedback });
    } catch (error) {
        console.error("Error processing PDF:", error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}
