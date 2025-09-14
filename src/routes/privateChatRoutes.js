import express from "express";
import {
    sendPrivateMessage,
    getPrivateUsers,
    getPrivateMessages,
    replyPrivateMessage
} from "../controllers/privateChatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendPrivateMessage); // user kirim
router.get("/users", authMiddleware, getPrivateUsers);    // admin lihat list user
router.get("/:userId", authMiddleware, getPrivateMessages); // percakapan
router.post("/reply", authMiddleware, replyPrivateMessage); // admin balas

export default router;
