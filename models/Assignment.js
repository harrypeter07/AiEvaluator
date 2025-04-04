import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: { type: String, required: true },
		content: { type: String, required: true }, // Extracted text content
		originalFileName: { type: String, required: true },
		feedback: { type: String, required: true }, // Store Gemini's analysis
		grade: { type: Number },
		submittedAt: { type: Date, default: Date.now },
		similarityScore: { type: Number }, // For comparison results
	},
	{ timestamps: true }
);

export default mongoose.models.Assignment ||
	mongoose.model("Assignment", AssignmentSchema);
