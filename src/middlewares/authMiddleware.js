import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Memastikan alias dan role disertakan.
        // Jika tidak ada di token, ambil dari database.
        if (!decoded.alias || !decoded.role) {
            const user = await User.findById(decoded.id).select("alias role");
            if (!user) {
                return res.status(404).json({ msg: "User not found" });
            }
            decoded.alias = user.alias;
            decoded.role = user.role;
        }

        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ msg: "Invalid or expired token" });
    }
};
