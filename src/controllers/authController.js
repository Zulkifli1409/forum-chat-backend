import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateAlias } from "../utils/generateAlias.js";
import RefreshToken from '../models/RefreshToken.js';
import cookieParser from 'cookie-parser';

export const register = async (req, res) => {
    try {
        const { nim, password } = req.body;
        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            nim,
            password: hashed,
            alias: generateAlias(),
            role: "user",
            status: "pending"
        });

        res.json({ msg: "Registered, waiting for admin approval" });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ msg: "NIM sudah terdaftar. Silakan gunakan NIM lain." });
        }
        res.status(500).json({ msg: err.message });
    }
};

export const login = async (req, res) => {
    try {
        console.log("DEBUG: JWT_SECRET is:", process.env.JWT_SECRET); 
        console.log("DEBUG: REFRESH_TOKEN_SECRET is:", process.env.REFRESH_TOKEN_SECRET);
        const { nim, password } = req.body;
        const user = await User.findOne({ nim });
        if (!user) return res.status(404).json({ msg: "User not found" });
        if (user.status !== "approved")
            return res.status(403).json({ msg: "Not approved by admin" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ msg: "Wrong password" });

        // Perbarui waktu login terakhir
        user.lastLogin = new Date();
        await user.save();

        const accessToken = jwt.sign(
            { id: user._id, alias: user.alias, role: user.role, nim: user.nim },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.REFRESH_TOKEN_SECRET,   // <- ganti ini
            { expiresIn: "7d" }
        );

        await RefreshToken.deleteMany({ user: user._id });
        const newRefreshToken = new RefreshToken({
            token: refreshToken,
            user: user._id,
        });
        await newRefreshToken.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({
            id: user._id,
            token: accessToken,
            alias: user.alias,
            role: user.role,
            warnCount: user.warnCount,
            isMuted: user.isMuted,
            muteUntil: user.muteUntil,
            isBanned: user.isBanned,
            nim: user.nim,
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) return res.status(401).json({ msg: "No refresh token" });

    try {
        const storedToken = await RefreshToken.findOne({ token: refreshToken });
        if (!storedToken) return res.status(403).json({ msg: "Invalid refresh token" });

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const newAccessToken = jwt.sign(
            { id: user._id, alias: user.alias, role: user.role, nim: user.nim },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ msg: "Invalid refresh token" });
    }
};