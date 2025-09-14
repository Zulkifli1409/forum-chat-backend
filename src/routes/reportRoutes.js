import express from "express";
import {
    reportMessage,
    getReports,
    takeAction,
    getReportStats,
} from "../controllers/reportController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isModerator } from "../middlewares/permissionMiddleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.post("/report", authMiddleware, validate([
    body("messageId").isMongoId().withMessage("Message ID tidak valid"),
    body("reportedId").isMongoId().withMessage("Reported ID tidak valid"),
    body("reasonCategory")
        .isIn(["toxic", "sara", "pornografi", "spam", "scam", "lainnya"])
        .withMessage("Kategori laporan tidak valid"),
    body("reason")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Alasan laporan maksimal 500 karakter"),
]), reportMessage);

router.get("/", authMiddleware, isModerator, getReports);
router.post("/action", authMiddleware, isModerator, takeAction);
router.get("/stats", authMiddleware, isModerator, getReportStats);

export default router;