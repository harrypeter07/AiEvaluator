import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
    userEmail: { type: String, required: true },
    filename: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
});

export default mongoose.models.Assignment || mongoose.model("Assignment", AssignmentSchema);
