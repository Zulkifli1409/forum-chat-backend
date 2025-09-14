import express from "express";
import {
    getGeneralStats,
    getChatActivityByHour,
    getMostActiveUsers
} from "../controllers/analyticsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isModerator } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Semua rute di sini memerlukan hak akses moderator
router.use(authMiddleware, isModerator);

router.get("/stats", getGeneralStats);
router.get("/activity-by-hour", getChatActivityByHour);
router.get("/active-users", getMostActiveUsers);

export default router;