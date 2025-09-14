import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
    {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        adminAlias: { type: String, required: true },
        action: { type: String, required: true },
        targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        targetUserAlias: { type: String },
        details: { type: String } 
    },
    { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);