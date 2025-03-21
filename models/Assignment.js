import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		content: { type: String, required: true }, // Extracted text content for plagiarism checking
		originalFileName: { type: String, required: true },
		fileHash: { type: String, required: true }, // For quick duplicate detection
		plagiarismScore: { type: Number, default: 0 }, // Overall plagiarism percentage
		batchId: { type: String }, // Group ID for batch uploads
		batchSize: { type: Number }, // Total number of files in the batch
		similarityMatches: [
			{
				matchedAssignmentId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Assignment",
				},
				similarityPercentage: { type: Number },
				matchedSegments: [
					{
						originalText: { type: String },
						matchedText: { type: String },
						similarity: { type: Number },
					},
				],
			},
		],
		feedback: { type: String }, // Store Gemini's analysis
		grade: { type: Number },
		submittedAt: { type: Date, default: Date.now },
		batchAnalysisComplete: { type: Boolean, default: false }, // Flag for batch processing status
		crossComparisonResults: [
			{
				comparedWithId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Assignment",
				},
				similarityScore: { type: Number },
				sharedSegments: [
					{
						text: { type: String },
						similarity: { type: Number },
					},
				],
			},
		],
	},
	{ timestamps: true }
);

export default mongoose.models.Assignment ||
	mongoose.model("Assignment", AssignmentSchema);
