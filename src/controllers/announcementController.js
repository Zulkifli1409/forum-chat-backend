import Announcement from "../models/Announcement.js";
import { io } from "../server.js";

// getAnnouncements dan createAnnouncement tetap sama...
export const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json(announcements);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const createAnnouncement = async (req, res) => {
    try {
        const { message, duration } = req.body;
        const newAnnouncement = await Announcement.create({
            message,
            duration: duration || 10,
        });
        res.status(201).json(newAnnouncement);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


export const broadcastAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return res.status(404).json({ msg: "Announcement not found" });
        }

        // Langsung siarkan pengumuman ke semua klien
        io.emit("newAnnouncement", announcement);

        res.json({ msg: "Announcement broadcasted successfully" });
    } catch (err) {
        console.error("Error broadcasting announcement:", err);
        res.status(500).json({ msg: err.message });
    }
};

// deleteAnnouncement tetap sama...
export const deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        await Announcement.findByIdAndDelete(id);
        io.emit("clearAnnouncement");
        res.json({ msg: "Announcement deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};