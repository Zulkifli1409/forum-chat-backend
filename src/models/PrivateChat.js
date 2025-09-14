import mongoose from "mongoose";

const PrivateChatSchema = new mongoose.Schema(
    {
        from: { id: String, role: String, alias: String },
        to: { id: String, role: String, alias: String },
        message: String,
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },
        // Menyimpan ID user (klien) untuk memudahkan query
        clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        // Menyimpan ID admin yang bertugas, null jika belum ada yang klaim
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    },
    { timestamps: true }
);

export default mongoose.model("PrivateChat", PrivateChatSchema);