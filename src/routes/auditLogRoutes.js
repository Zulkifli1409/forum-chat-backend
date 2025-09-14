import express from "express";
import { getAuditLogs } from "../controllers/auditLogController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isModerator } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Hanya moderator ke atas yang bisa melihat log
router.get("/", authMiddleware, isModerator, getAuditLogs);

export default router;