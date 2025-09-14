import express from "express";
import {
    getAnnouncements,
    createAnnouncement,
    broadcastAnnouncement, // Ganti toggle jadi broadcast
    deleteAnnouncement
} from "../controllers/announcementController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/permissionMiddleware.js";

const router = express.Router();

// Routes untuk admin
router.use(authMiddleware, isAdmin);
router.get("/", getAnnouncements);
router.post("/", createAnnouncement);
router.post("/:id/broadcast", broadcastAnnouncement); 
router.delete("/:id", deleteAnnouncement);

export default router;