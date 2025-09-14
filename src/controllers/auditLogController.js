import AuditLog from "../models/AuditLog.js";

export const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 25 } = req.query; // Default ke 25 log per halaman
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await AuditLog.countDocuments();

        res.json({
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            logs
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};