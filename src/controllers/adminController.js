import User from "../models/User.js";
import Chat from "../models/Chat.js";
import { io } from "../server.js";
import {
    generateAlias,
    generateAdminAlias,
    generateModeratorAlias,
    generateSuperAdminAlias
} from "../utils/generateAlias.js";
import { logAction } from "../utils/auditLogger.js";

export const approveUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(
            id,
            { status: "approved" },
            { new: true }
        );
        if (!user) return res.status(404).json({ msg: "User not found" });

        io.emit("adminDataChanged");
        res.json({ msg: "User approved", user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Fungsi rejectUser diubah untuk langsung menghapus user
export const rejectUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToDelete = await User.findById(id);

        if (!userToDelete) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Pastikan hanya user dengan status 'pending' yang bisa di-reject/hapus melalui endpoint ini
        if (userToDelete.status !== 'pending') {
            return res.status(400).json({ msg: "Only pending users can be rejected." });
        }

        await User.findByIdAndDelete(id);

        // Tambahkan log audit untuk aksi penolakan
        await logAction({
            adminId: req.user.id,
            adminAlias: req.user.alias,
            action: "REJECT_USER",
            targetUserAlias: userToDelete.alias,
            details: `Rejected (and deleted) pending user with NIM ${userToDelete.nim}.`
        });


        io.emit("adminDataChanged");
        res.json({ msg: "User rejected and deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


export const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await User.countDocuments();
        res.json({ total, page: parseInt(page), limit: parseInt(limit), users });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id);

        if (!chat) {
            return res.status(404).json({ msg: "Chat not found" });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            id,
            {
                message: "[Pesan ini telah dihapus oleh admin]",
                isDeleted: true,
                originalMessage: chat.message
            },
            { new: true }
        ).populate('userId', 'alias').lean();

        await logAction({
            adminId: req.user.id,
            adminAlias: req.user.alias,
            action: "DELETE_CHAT",
            details: `Deleted message: "${chat.message.substring(0, 50)}..."`
        });

        io.emit("chatMessageUpdated", updatedChat);
        io.emit("adminDataChanged");

        res.json({ msg: "Chat message soft deleted", chat: updatedChat });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getChats = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;
        const chats = await Chat.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = await Chat.countDocuments();
        res.json({ total, page: parseInt(page), limit: parseInt(limit), chats });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ msg: "User tidak ditemukan" });

        const performingAdmin = req.user;

        if (performingAdmin.role === 'super-admin') {
            if (performingAdmin.id === userToDelete._id.toString()) {
                return res.status(403).json({ msg: "Anda tidak bisa menghapus akun Anda sendiri." });
            }
        }
        else if (performingAdmin.role === 'admin') {
            if (userToDelete.role === 'admin' || userToDelete.role === 'super-admin') {
                return res.status(403).json({ msg: "Admin tidak bisa menghapus admin lain." });
            }
        }

        const userAlias = userToDelete.alias;
        await User.findByIdAndDelete(req.params.id);

        await logAction({
            adminId: req.user.id,
            adminAlias: req.user.alias,
            action: "DELETE_USER",
            targetUserAlias: userAlias,
            details: `User with NIM ${userToDelete.nim} was deleted.`
        });

        io.emit("adminDataChanged");
        res.json({ msg: "User deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const toggleRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const oldRole = user.role;
        user.role = role;

        switch (role) {
            case 'moderator':
                user.alias = generateModeratorAlias();
                break;
            case 'admin':
                user.alias = generateAdminAlias();
                break;
            case 'super-admin':
                user.alias = generateSuperAdminAlias();
                break;
            case 'user':
                user.alias = generateAlias();
                break;
        }

        await user.save();

        await logAction({
            adminId: req.user.id,
            adminAlias: req.user.alias,
            action: "CHANGE_ROLE",
            targetUserId: user._id,
            targetUserAlias: user.alias,
            details: `Role changed from '${oldRole}' to '${role}'.`
        });

        io.emit("adminDataChanged");
        res.json({ msg: "User role updated", user });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};