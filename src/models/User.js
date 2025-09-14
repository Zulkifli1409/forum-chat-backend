import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    nim: { type: String, required: true, unique: true },
    password: String,
    alias: String,
    role: {
        type: String,
        enum: ["user", "moderator", "admin", "super-admin"],
        default: "user"
    },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
    isMuted: { type: Boolean, default: false },
    muteUntil: { type: Date, default: null },
    isBanned: { type: Boolean, default: false },
    warnCount: { type: Number, default: 0 },
    lastLogin: { type: Date, default: Date.now }, // Field baru untuk melacak login terakhir
}, { timestamps: true });

export default mongoose.model("User", UserSchema);