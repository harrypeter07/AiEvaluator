// import { analyzePDF } from "@/lib/gemini";
// import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
// import Assignment from "@/models/Assignment";
// import { connectDB } from "@/lib/db";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const files = formData.getAll("pdfs");
//     const titles = formData.getAll("titles");
//     const userId = formData.get("userId");
//     const batchId = Date.now().toString(); // Generate unique batch ID

//     if (!files.length || !titles.length || !userId) {
//       return Response.json(
//         { error: "Missing required fields" },
//         { status: 400 }
//       );
//     }

//     if (files.length !== titles.length) {
//       return Response.json(
//         { error: "Number of files and titles must match" },
//         { status: 400 }
//       );
//     }

//     // Connect to database
//     await connectDB();

//     // Process each PDF and store results
//     const processedFiles = await Promise.all(
//       files.map(async (file, index) => {
//         // Convert PDF to base64
//         const bytes = await file.arrayBuffer();
//         const base64Data = Buffer.from(bytes).toString("base64");

//         // Call Gemini for analysis
//         const feedback = await analyzePDF(base64Data);

//         // Generate content hash
//         const fileHash = generateContentHash(base64Data);

//         // Create assignment document
//         const assignment = new Assignment({
//           userId,
//           title: titles[index],
//           content: feedback,
//           originalFileName: file.name,
//           fileHash,
//           feedback,
//           batchId,
//           batchSize: files.length,
//         });

//         await assignment.save();

//         return {
//           assignment,
//           base64Data,
//           feedback,
//           title: titles[index],
//           originalFileName: file.name,
//         };
//       })
//     );

//     // Cross-compare all files for plagiarism
//     const plagiarismResults = [];

//     for (let i = 0; i < processedFiles.length; i++) {
//       const currentFile = processedFiles[i];
//       const otherFiles = processedFiles.filter((_, index) => index !== i);

//       // Get previously stored assignments for comparison
//       const existingAssignments = await Assignment.find({
//         _id: { $ne: currentFile.assignment._id },
//         batchId: { $ne: batchId },
//       });

//       // Check plagiarism against other files in the batch and existing assignments
//       const { plagiarismScore, similarityMatches } = await checkPlagiarism(
//         currentFile.feedback,
//         [
//           ...otherFiles.map(file => ({
//             content: file.feedback,
//             _id: file.assignment._id, // Using actual assignment ID
//           })),
//           ...existingAssignments
//         ]
//       );

//       // Update the assignment with plagiarism results
//       currentFile.assignment.plagiarismScore = plagiarismScore;
//       currentFile.assignment.similarityMatches = similarityMatches;
//       currentFile.assignment.batchAnalysisComplete = true;

//       // Add cross-comparison results
//       currentFile.assignment.crossComparisonResults = otherFiles.map(other => ({
//         comparedWithId: other.assignment._id,
//         similarityScore:
//           similarityMatches.find(m => m.matchedAssignmentId.equals(other.assignment._id))
//             ?.similarityPercentage || 0,
//         sharedSegments:
//           similarityMatches.find(m => m.matchedAssignmentId.equals(other.assignment._id))
//             ?.matchedSegments || [],
//       }));

//       await currentFile.assignment.save();

//       plagiarismResults.push({
//         id: currentFile.assignment._id,
//         title: currentFile.title,
//         plagiarismScore,
//         similarityMatches,
//       });
//     }

//     return Response.json({
//       success: true,
//       message: "Batch analysis complete",
//       batchId,
//       results: plagiarismResults,
//     });
//   } catch (error) {
//     console.error("Error processing PDFs:", error);
//     return Response.json({ error: "Internal server error" }, { status: 500 });
//   }
// }

import { analyzeAssignment } from "@/lib/gemini";
import { generateContentHash, checkPlagiarism } from "@/lib/plagiarism";
import Assignment from "@/models/Assignment";
import { connectDB } from "@/lib/db";

export async function POST(req) {
	try {
		const formData = await req.formData();
		const files = formData.getAll("pdfs");
		const titles = formData.getAll("titles");
		const userId = formData.get("userId");
		const batchId = Date.now().toString(); // Generate unique batch ID

		if (!files.length || !titles.length || !userId) {
			return Response.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		if (files.length !== titles.length) {
			return Response.json(
				{ error: "Number of files and titles must match" },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Process each PDF and store results with proper error handling
		const processedFiles = await Promise.all(
			files.map(async (file, index) => {
				try {
					// Convert PDF to base64
					const bytes = await file.arrayBuffer();
					const base64Data = Buffer.from(bytes).toString("base64");

					// Call Gemini for analysis
					const analysis = await analyzeAssignment(base64Data);
					const feedback = analysis.extractedText;

					// Generate content hash
					const fileHash = generateContentHash(base64Data);

					// Create and save the assignment document
					const assignment = new Assignment({
						userId,
						title: titles[index],
						content: feedback,
						originalFileName: file.name,
						fileHash,
						feedback,
						batchId,
						batchSize: files.length,
					});

					// Save immediately to get valid MongoDB ID
					const savedAssignment = await assignment.save();

					return {
						assignment: savedAssignment,
						feedback,
						fileHash,
						title: titles[index],
						originalFileName: file.name,
					};
				} catch (error) {
					console.error(`Error processing file ${index}:`, error);
					throw error;
				}
			})
		);

		// Get all existing assignments (excluding the current batch)
		const existingAssignments = await Assignment.find({
			batchId: { $ne: batchId },
		});

		// Cross-compare all files for plagiarism
		const plagiarismResults = [];
		const savedAssignments = [];

		for (let i = 0; i < processedFiles.length; i++) {
			const currentFile = processedFiles[i];

			// Get other files in this batch (but not the current one)
			const otherFilesInBatch = processedFiles
				.filter((_, index) => index !== i)
				.map((file) => ({
					_id: file.assignment._id,
					title: file.title,
					content: file.feedback,
				}));

			// Combine with existing assignments for comparison
			const comparisonSet = [...otherFilesInBatch, ...existingAssignments];

			console.log(
				`Comparing file ${i + 1}/${processedFiles.length} against ${
					comparisonSet.length
				} documents`
			);

			// Check plagiarism against other files and existing assignments
			const { plagiarismScore, similarityMatches } = await checkPlagiarism(
				currentFile.feedback,
				comparisonSet
			);

			// Update the assignment with plagiarism results
			currentFile.assignment.plagiarismScore = plagiarismScore;
			currentFile.assignment.similarityMatches = similarityMatches.filter(
				(match) => match.matchedAssignmentId
			);
			currentFile.assignment.batchAnalysisComplete = true;

			// Add cross-comparison results
			currentFile.assignment.crossComparisonResults = otherFilesInBatch
				.filter((other) => other._id)
				.map((other) => {
					const matchInfo = similarityMatches.find(
						(m) =>
							m.matchedAssignmentId &&
							m.matchedAssignmentId.toString() === other._id.toString()
					);

					return {
						comparedWithId: other._id,
						similarityScore: matchInfo?.similarityPercentage || 0,
						sharedSegments: matchInfo?.matchedSegments || [],
					};
				});

			// Save the assignment
			await currentFile.assignment.save();
			savedAssignments.push(currentFile.assignment);

			plagiarismResults.push({
				id: currentFile.assignment._id,
				title: currentFile.title,
				plagiarismScore,
				similarityMatches,
			});
		}

		return Response.json({
			success: true,
			message: "Batch analysis complete",
			batchId,
			resultsCount: plagiarismResults.length,
			results: plagiarismResults,
		});
	} catch (error) {
		console.error("Error processing PDFs:", error);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
}
