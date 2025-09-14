import PrivateChat from "../models/PrivateChat.js";
import User from "../models/User.js";
import { io } from "../server.js";
import { createNotification } from "../utils/notificationCreator.js";

// Fungsi sendPrivateMessage tidak berubah
export const sendPrivateMessage = async (req, res) => {
    try {
        const admins = await User.find({ role: { $in: ["admin", "super-admin", "moderator"] } });
        if (admins.length === 0) return res.status(500).json({ msg: "No admin/moderator found" });

        const chat = await PrivateChat.create({
            from: { id: req.user.id, role: "user", alias: req.user.alias },
            to: { id: 'admins', role: "admin", alias: "Admin Support" },
            message: req.body.message,
            clientId: req.user.id,
        });

        admins.forEach(admin => {
            const adminRoomId = admin._id.toString();
            io.to(adminRoomId).emit("privateChatListChanged");
            io.to(adminRoomId).emit("privateMessage", chat);
        });

        io.to(req.user.id).emit("privateMessage", chat);

        res.status(201).json(chat);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Fungsi replyPrivateMessage tidak berubah
export const replyPrivateMessage = async (req, res) => {
    try {
        const { userId, message } = req.body;
        const targetUser = await User.findById(userId);
        if (!targetUser) return res.status(404).json({ msg: "User not found" });

        await PrivateChat.updateMany(
            { clientId: userId, adminId: null },
            { $set: { adminId: req.user.id } }
        );

        const chat = await PrivateChat.create({
            from: { id: req.user.id, role: req.user.role, alias: req.user.alias },
            to: { id: targetUser._id, role: "user", alias: targetUser.alias },
            message: message,
            clientId: targetUser._id,
            adminId: req.user.id,
        });

        io.to(targetUser._id.toString()).emit("privateMessage", chat);
        io.to(req.user.id).emit("privateMessage", chat);

        await createNotification({
            userId: targetUser._id,
            type: 'new_private_message',
            message: `Anda menerima pesan baru dari ${req.user.alias || 'Admin'}.`,
            link: '/chat-admin'
        });

        io.emit("privateChatListChanged");

        res.json(chat);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// ▼▼▼ UBAH FUNGSI INI ▼▼▼
export const getPrivateMessages = async (req, res) => {
    try {
        const { userId } = req.params;

        // Tandai semua pesan dari user ini sebagai 'read' oleh admin
        const updateResult = await PrivateChat.updateMany(
            { clientId: userId, "from.role": "user", status: { $ne: "read" } },
            { $set: { status: "read" } }
        );

        // Jika ada pesan yang statusnya diubah, kirim notifikasi balik ke user
        if (updateResult.modifiedCount > 0) {
            // Kirim event ke user spesifik bahwa pesannya telah dibaca
            io.to(userId).emit("messagesReadByAdmin");
        }

        const chats = await PrivateChat.find({ clientId: userId })
            .sort({ createdAt: 1 });
        res.json(chats);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
// ▲▲▲ AKHIR PERUBAHAN ▲▲▲

// Fungsi getPrivateUsers tidak berubah
export const getPrivateUsers = async (req, res) => {
    try {
        let queryCondition;
        if (req.user.role === "super-admin") {
            queryCondition = {};
        } else {
            queryCondition = {
                $or: [
                    { adminId: null },
                    { adminId: req.user.id }
                ]
            };
        }
        const relevantUserIds = await PrivateChat.distinct("clientId", queryCondition);
        const result = await User.find({ _id: { $in: relevantUserIds } }).select("alias nim role").lean();
        res.json(result);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};