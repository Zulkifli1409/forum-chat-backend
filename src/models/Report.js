import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema(
    {
        reporterId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reportedId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        messageId: String,
        reasonCategory: {
            type: String,
            enum: ["toxic", "sara", "pornografi", "spam", "scam", "lainnya"],
            required: true
        },
        reason: String,
        status: {
            type: String,
            enum: ["pending", "reviewed", "actionTaken"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Report", ReportSchema);