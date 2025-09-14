import express from "express";
import {
    approveUser,
    getUsers,
    deleteUser,
    deleteChat,
    getChats,
    toggleRole,
    rejectUser // Impor fungsi baru
} from "../controllers/adminController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isModerator, isAdmin, isSuperAdmin } from "../middlewares/permissionMiddleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.use(authMiddleware, isModerator);

router.get("/users", getUsers);
router.get("/chats", getChats);
router.delete("/chats/:id", deleteChat);

router.patch("/users/:id/approve", isAdmin, approveUser);
router.patch("/users/:id/reject", isAdmin, rejectUser); // Tambahkan route baru
router.delete("/users/:id", isAdmin, deleteUser);

router.put("/users/:id/role", isSuperAdmin, validate([
    body("role")
        .isIn(["user", "moderator", "admin", "super-admin"])
        .withMessage("Role yang diberikan tidak valid"),
]), toggleRole);

export default router;