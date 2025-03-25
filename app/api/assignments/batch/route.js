import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { processMultiplePDFs, comparePDFs } from "@/lib/multiPDF";

export async function POST(request) {
	try {
		// Check authentication
		const session = await getServerSession(authOptions);
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const formData = await request.formData();
		const files = formData.getAll("files");
		const mode = formData.get("mode"); // "batch" or "compare"
		const file1 = formData.get("file1");
		const file2 = formData.get("file2");

		if (mode === "compare" && (!file1 || !file2)) {
			return NextResponse.json(
				{ error: "Both files are required for comparison" },
				{ status: 400 }
			);
		}

		if (mode === "batch" && (!files || files.length === 0)) {
			return NextResponse.json({ error: "No files provided" }, { status: 400 });
		}

		let result;
		if (mode === "compare") {
			result = await comparePDFs(file1, file2);
		} else {
			result = await processMultiplePDFs(files);
		}

		return NextResponse.json({ result });
	} catch (error) {
		console.error("Error processing files:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to process files" },
			{ status: 500 }
		);
	}
}
