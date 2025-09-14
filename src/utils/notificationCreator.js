import Notification from "../models/Notification.js";
import { io, onlineUsers } from "../server.js";

export const createNotification = async ({ userId, type, message, link }) => {
    try {
        const notification = await Notification.create({
            userId,
            type,
            message,
            link
        });

        // Kirim notifikasi real-time jika user online
        const socketId = onlineUsers[userId];
        if (socketId) {
            io.to(socketId).emit("new_notification", notification);
        }
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};