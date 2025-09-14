import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    alias: { type: String },
    message: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    originalMessage: { type: String },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", default: null },
    replyToAlias: { type: String },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;