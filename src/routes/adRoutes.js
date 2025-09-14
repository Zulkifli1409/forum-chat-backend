import express from "express";
import { getAds, createAd, updateAd, deleteAd } from "../controllers/adController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/permissionMiddleware.js";
import { body } from "express-validator";
import { validate } from "../middlewares/validate.js";

const router = express.Router();

router.get("/", authMiddleware, getAds);
router.post(
    "/",
    authMiddleware,
    isAdmin,
    validate([
        body("title")
            .notEmpty()
            .withMessage("Judul iklan tidak boleh kosong"),
        body("type")
            .isIn(["custom", "adsense"])
            .withMessage("Tipe iklan tidak valid"),
        body("imageUrl").optional().isURL().withMessage("URL gambar tidak valid"),
        body("linkUrl").optional().isURL().withMessage("URL tautan tidak valid"),
    ]),
    createAd
);
router.put(
    "/:id",
    authMiddleware,
    isAdmin,
    validate([
        body("title").optional().notEmpty().withMessage("Judul tidak boleh kosong"),
        body("type")
            .optional()
            .isIn(["custom", "adsense"])
            .withMessage("Tipe iklan tidak valid"),
        body("imageUrl").optional().isURL().withMessage("URL gambar tidak valid"),
        body("linkUrl").optional().isURL().withMessage("URL tautan tidak valid"),
        body("adsenseCode").optional().notEmpty().withMessage("Kode AdSense tidak boleh kosong")
    ]),
    updateAd
);
router.delete("/:id", authMiddleware, isAdmin, deleteAd);

export default router;