import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import privateChatRoutes from "./routes/privateChatRoutes.js";
import PrivateChat from "./models/PrivateChat.js";
import Chat from "./models/Chat.js";
import User from "./models/User.js";
import reportRoutes from "./routes/reportRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adRoutes from "./routes/adRoutes.js";
import announcementRoutes from "./routes/announcementRoutes.js";
import Announcement from "./models/Announcement.js";

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "http://192.168.1.13:3000",
    "https://fortek.vercel.app/",
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
};

// Middleware Keamanan Utama
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(cors(corsOptions));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"], // Izinkan konten dari domain sendiri
                scriptSrc: ["'self'"], // Hanya izinkan skrip dari domain sendiri
                styleSrc: ["'self'", "'unsafe-inline'"], // Izinkan inline style jika Anda menggunakannya
                imgSrc: ["'self'", "data:"], // Izinkan gambar dari domain sendiri dan data URI
                connectSrc: ["'self'"], // Batasi koneksi API hanya ke domain sendiri
                fontSrc: ["'self'"],
                objectSrc: ["'none'"], // Jangan izinkan plugin seperti Flash
                frameAncestors: ["'none'"], // Mencegah clickjacking
                upgradeInsecureRequests: [],
            },
        },
    })
);

// Rate Limiter untuk Otentikasi
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { msg: "Terlalu banyak percobaan, coba lagi setelah 15 menit" },
    standardHeaders: true,
    legacyHeaders: false,
});

const actionLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit
    max: 100, // Izinkan 100 request dari 1 IP dalam 5 menit
    message: { msg: "Terlalu banyak request, coba lagi nanti." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Penerapan Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Terapkan actionLimiter ke rute yang relevan
app.use("/api/chat", actionLimiter, chatRoutes);
app.use("/api/private", actionLimiter, privateChatRoutes);
app.use("/api/reports", actionLimiter, reportRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/announcements", announcementRoutes);


const server = http.createServer(app);
export const io = new Server(server, { cors: { origin: allowedOrigins } });

export let onlineUsers = {};

const emitChatStats = async () => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMessages = await Chat.countDocuments();
        const onlineCount = Object.keys(onlineUsers).length;
        io.emit("updateChatStats", {
            onlineCount,
            totalUsers,
            totalMessages,
        });
    } catch (err) {
        console.error("Failed to emit chat stats:", err.message);
    }
};

io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    const sendActiveAnnouncement = async () => {
        try {
            // Logika ini dihapus karena sistem broadcast tidak memerlukan pengecekan saat connect
        } catch (error) {
            console.error("Failed to send active announcement:", error);
        }
    };
    sendActiveAnnouncement();

    socket.on("publicTyping", (alias) => {
        socket.broadcast.emit("publicTyping", alias);
    });

    socket.on("publicStopTyping", () => {
        socket.broadcast.emit("publicStopTyping");
    });

    socket.on("chatMessage", (msg) => {
        io.emit("chatMessage", msg);
        emitChatStats();
    });

    socket.on("registerUserSocket", (userId) => {
        if (userId) {
            onlineUsers[userId] = socket.id;
            console.log("Online users mapping:", onlineUsers);
            io.emit("onlineUsers", Object.keys(onlineUsers));
            emitChatStats();
        }
    });

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`✅ ${socket.id} joined room ${roomId}`);
    });

    socket.on("typing", (roomId, alias) => {
        socket.to(roomId).emit("typing", alias);
    });

    socket.on("stopTyping", (roomId) => {
        socket.to(roomId).emit("stopTyping");
    });

    socket.on("markAsRead", async (msgId) => {
        try {
            const msg = await PrivateChat.findByIdAndUpdate(
                msgId,
                { status: "read" },
                { new: true }
            );
            if (msg) {
                io.to(msg.from.id).emit("messageRead", msgId);
            }
        } catch (err) {
            console.error("markAsRead error:", err.message);
        }
    });

    socket.on("disconnect", () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                break;
            }
        }
        io.emit("onlineUsers", Object.keys(onlineUsers));
        console.log("❌ User disconnected:", socket.id);
        console.log("Online users mapping:", onlineUsers);
        emitChatStats();
    });
});

const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () =>
    console.log(`🚀 Server running on http://${HOST}:${PORT}`)
);