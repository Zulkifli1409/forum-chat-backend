import mongoose from "mongoose";

const AnnouncementSchema = new mongoose.Schema(
    {
        message: { type: String, required: true },
        duration: { type: Number, default: 10 }, // Durasi dalam detik
    },
    { timestamps: true }
);

export default mongoose.model("Announcement", AnnouncementSchema);