import Ad from "../models/Ad.js";
import { io } from "../server.js"; // Pastikan baris ini ada

export const getAds = async (req, res) => {
    try {
        const ads = await Ad.find().sort({ createdAt: -1 });
        res.json(ads);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const createAd = async (req, res) => {
    try {
        const newAd = await Ad.create(req.body);
        io.emit("adsUpdated"); // Ini akan memicu pembaruan real-time
        res.status(201).json(newAd);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedAd = await Ad.findByIdAndUpdate(id, req.body, { new: true });
        io.emit("adsUpdated"); // Ini akan memicu pembaruan real-time
        res.json(updatedAd);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        await Ad.findByIdAndDelete(id);
        io.emit("adsUpdated"); // Ini akan memicu pembaruan real-time
        res.json({ msg: "Ad deleted successfully" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};