import express from "express";
import { register, login, refreshToken } from "../controllers/authController.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.post(
    "/register",
    validate([
        body("nim").isLength({ max: 15 }).withMessage("NIM tidak valid. Maksimal 15 digit."),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password minimal 6 karakter"),
    ]),
    register
);

router.post(
    "/login",
    validate([
        body("nim").isLength({ max: 15 }).withMessage("NIM tidak valid. Maksimal 15 digit."),
        body("password").notEmpty().withMessage("Password wajib diisi"),
    ]),
    login
);

router.post("/token", refreshToken);

export default router;