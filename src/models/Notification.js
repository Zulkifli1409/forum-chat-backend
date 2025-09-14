// full src/src backend/models/Notification.js

import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['new_private_message', 'new_warning', 'report_update'],
            required: true
        },
        message: { type: String, required: true },
        isRead: { type: Boolean, default: false },
        link: { type: String }
    },
    { timestamps: true }
);

NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

export default mongoose.model("Notification", NotificationSchema);