import Report from "../models/Report.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import PrivateChat from "../models/PrivateChat.js";
import { io, onlineUsers } from "../server.js";
import { logAction } from "../utils/auditLogger.js";
import { createNotification } from "../utils/notificationCreator.js";

export const reportMessage = async (req, res) => {
    try {
        const { messageId, reportedId, reasonCategory, reason } = req.body;

        if (!reportedId || !messageId || !reasonCategory) {
            return res.status(400).json({ msg: "Data laporan tidak lengkap" });
        }

        const report = await Report.create({
            reporterId: req.user.id,
            reportedId,
            messageId,
            reasonCategory,
            reason,
        });
        io.emit("adminReportsChanged");
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate("reporterId", "alias nim") // Tambahkan nim
            .populate("reportedId", "alias nim warnCount isMuted muteUntil") // Tambahkan nim
            .sort({ createdAt: -1 })
            .lean();

        const reportsWithMessage = await Promise.all(
            reports.map(async (r) => {
                let messageText = null;
                const chat = await Chat.findById(r.messageId);
                if (chat) {
                    messageText = chat.message;
                } else {
                    const priv = await PrivateChat.findById(r.messageId);
                    if (priv) messageText = priv.message;
                }
                return { ...r, messageText };
            })
        );

        res.json(reportsWithMessage);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const takeAction = async (req, res) => {
    try {
        const { userId, action, reportId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const report = await Report.findById(reportId).populate('reporterId');
        let msg = "";
        let finalUser = user.toObject();
        let notificationMessage = "";

        switch (action) {
            case "warn":
                user.warnCount = (user.warnCount || 0) + 1;
                msg = `⚠️ User ${user.alias} mendapat peringatan (${user.warnCount})`;
                notificationMessage = `Anda telah menerima peringatan dari admin karena perilaku Anda.`;
                if (user.warnCount >= 3 && user.warnCount < 5) {
                    user.isMuted = true;
                    user.muteUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                    msg += " → Auto Mute 24h";
                }
                if (user.warnCount >= 5) {
                    msg += ` → Mencapai 5 peringatan. User ${user.alias} diban dan dihapus.`;
                    await User.findByIdAndDelete(userId);
                }
                break;
            case "mute":
                user.isMuted = true;
                user.muteUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
                msg = `🔇 User ${user.alias} dimute 24 jam`;
                notificationMessage = `Anda telah di-mute selama 24 jam oleh admin.`;
                break;
            case "ban":
                msg = `🚫 User ${user.alias} telah diban dan dihapus.`;
                notificationMessage = `Akun Anda telah di-banned secara permanen.`;
                await User.findByIdAndDelete(userId);
                break;
            default:
                return res.status(400).json({ msg: "Action tidak valid" });
        }

        if (action !== "ban" && user.warnCount < 5) {
            await user.save();
            finalUser = user.toObject();
        }

        if (reportId) {
            await Report.findByIdAndUpdate(reportId, { status: "actionTaken" });
        }

        await logAction({
            adminId: req.user.id,
            adminAlias: req.user.alias,
            action: `ACTION_${action.toUpperCase()}`,
            targetUserId: user._id,
            targetUserAlias: user.alias,
            details: `Action taken based on report ID: ${reportId}`
        });

        // Kirim notifikasi ke user yang ditindak
        await createNotification({
            userId: user._id,
            type: 'new_warning',
            message: notificationMessage,
            link: '/chat' // Arahkan ke chat sebagai pengingat umum
        });

        // Kirim notifikasi ke user yang melapor
        if (report && report.reporterId && report.reporterId._id.toString() !== user._id.toString()) {
            await createNotification({
                userId: report.reporterId._id,
                type: 'report_update',
                message: `Laporan Anda terhadap ${user.alias} telah ditindaklanjuti.`,
            });
        }

        const socketId = onlineUsers[userId];
        if (socketId) {
            io.to(socketId).emit("userUpdated", finalUser);
        }

        io.emit("adminDataChanged");
        io.emit("adminReportsChanged");
        res.json({ msg, user: finalUser });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getReportStats = async (req, res) => {
    try {
        const total = await Report.countDocuments();
        const pending = await Report.countDocuments({ status: "pending" });
        const actionTaken = await Report.countDocuments({ status: "actionTaken" });
        const byCategory = await Report.aggregate([
            { $group: { _id: "$reasonCategory", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        res.json({ total, pending, actionTaken, byCategory });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};