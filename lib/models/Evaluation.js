import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
	{
		courseId: { type: String, required: true },
		courseWorkId: { type: String, required: true },
		submissionId: { type: String, required: true },
		studentId: { type: String, required: true },
		studentName: { type: String },
		studentEmail: { type: String },
		feedback: { type: String },
		score: { type: Number },
		attachments: [{ type: Object }],
		evaluationTimestamp: { type: Date },
		updatedAt: { type: Date, default: Date.now },
	},
	{
		timestamps: true,
	}
);

// Create a compound index for efficient querying
evaluationSchema.index({ courseId: 1, courseWorkId: 1, submissionId: 1 });

export default mongoose.models.Evaluation ||
	mongoose.model("Evaluation", evaluationSchema);
