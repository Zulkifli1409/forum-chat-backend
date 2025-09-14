import Chat from "../models/Chat.js";
import User from "../models/User.js";
import { createNotification } from "../utils/notificationCreator.js";

const parseMentions = async (message) => {
    // ... (fungsi ini tidak berubah)
    const mentionRegex = /@([A-Za-z0-9#]+)/g;
    const mentions = message.match(mentionRegex);
    if (!mentions) return [];

    const mentionedAliases = mentions.map(m => m.substring(1));

    const mentionedUsers = await User.find({ alias: { $in: mentionedAliases } }).select('_id');
    return mentionedUsers.map(user => user._id);
};

export const sendChat = async (req, res) => {
    try {
        // ... (logika pengecekan user tidak berubah)
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        if (user.isBanned) return res.status(403).json({ msg: "🚫 Akun Anda dibanned" });
        if (user.isMuted && user.muteUntil > new Date()) return res.status(403).json({ msg: `🔇 Anda dimute sampai ${new Date(user.muteUntil).toLocaleString()}` });

        const { message, replyTo } = req.body;
        let replyToAlias = null;

        if (replyTo) {
            const originalMessage = await Chat.findById(replyTo);
            if (originalMessage) replyToAlias = originalMessage.alias;
        }

        const mentionedUserIds = await parseMentions(message);

        const chat = await Chat.create({
            userId: req.user.id,
            alias: req.user.alias || "Anon",
            message,
            replyTo,
            replyToAlias,
            mentions: mentionedUserIds
        });

        mentionedUserIds.forEach(userId => {
            if (userId.toString() !== req.user.id) {
                createNotification({
                    userId: userId,
                    type: 'new_private_message',
                    message: `${req.user.alias} menyebut Anda dalam sebuah pesan.`,
                    link: '/chat'
                });
            }
        });

        // ▼▼▼ UBAH BAGIAN POPULATE DI SINI ▼▼▼
        const populatedChat = await Chat.findById(chat._id)
            .populate('userId', 'alias role') // Tambahkan 'role'
            .populate({ path: 'replyTo', select: 'message alias' })
            .lean();
        // ▲▲▲ AKHIR PERUBAHAN ▲▲▲

        const finalChat = {
            ...populatedChat,
            alias: populatedChat.userId ? populatedChat.userId.alias : populatedChat.alias,
        };

        res.json(finalChat);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getChats = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // ▼▼▼ UBAH BAGIAN POPULATE DI SINI ▼▼▼
        const chats = await Chat.find()
            .populate('userId', 'alias role') // Tambahkan 'role'
            .populate({
                path: 'replyTo',
                select: 'message alias'
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        // ▲▲▲ AKHIR PERUBAHAN ▲▲▲

        const processedChats = chats.map(chat => {
            if (!chat.userId) {
                return { ...chat, alias: "[User Telah Dibanned]" };
            }
            return { ...chat, alias: chat.userId.alias, userRole: chat.userId.role }; // Sertakan role
        });

        processedChats.reverse();

        const total = await Chat.countDocuments();

        res.json({
            total,
            page,
            limit,
            hasMore: (page * limit) < total,
            chats: processedChats,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};