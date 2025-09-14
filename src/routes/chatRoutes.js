import express from "express";
import { sendChat, getChats } from "../controllers/chatController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate([
        body("message")
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage("Pesan harus memiliki 1-500 karakter"),
    ]),
    sendChat
);

router.get("/", authMiddleware, getChats);

export default router;