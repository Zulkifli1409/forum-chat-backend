import Notification from "../models/Notification.js";

// Mengambil notifikasi untuk user yang sedang login
export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20); // Ambil 20 notifikasi terbaru
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Menandai semua notifikasi sebagai sudah dibaca
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ msg: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};