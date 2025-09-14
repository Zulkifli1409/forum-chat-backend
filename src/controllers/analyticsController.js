import Chat from "../models/Chat.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import mongoose from "mongoose";

// Statistik Umum
export const getGeneralStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalChats = await Chat.countDocuments();
        const totalReports = await Report.countDocuments();
        res.json({ totalUsers, totalChats, totalReports });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Aktivitas Chat per Jam
export const getChatActivityByHour = async (req, res) => {
    try {
        const activity = await Chat.aggregate([
            {
                $group: {
                    _id: { $hour: { date: "$createdAt", timezone: "Asia/Jakarta" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Format data untuk Chart.js
        const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        const data = Array(24).fill(0);
        activity.forEach(item => {
            data[item._id] = item.count;
        });

        res.json({ labels, data });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Top 5 User Paling Aktif
export const getMostActiveUsers = async (req, res) => {
    try {
        const activeUsers = await Chat.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $project: {
                    alias: "$user.alias",
                    count: "$count"
                }
            }
        ]);
        res.json(activeUsers);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};