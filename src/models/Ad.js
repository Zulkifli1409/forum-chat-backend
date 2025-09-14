import mongoose from "mongoose";

const adSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ["custom", "adsense"],
            required: true,
        },
        imageUrl: { type: String },
        linkUrl: { type: String },
        adsenseCode: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Ad = mongoose.model("Ad", adSchema);

export default Ad;