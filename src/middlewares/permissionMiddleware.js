// Middleware untuk memeriksa apakah pengguna memiliki setidaknya peran Moderator
export const isModerator = (req, res, next) => {
    const allowedRoles = ["moderator", "admin", "super-admin"];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({ msg: "Akses ditolak. Membutuhkan hak akses Moderator." });
    }
};

// Middleware untuk memeriksa apakah pengguna memiliki setidaknya peran Admin
export const isAdmin = (req, res, next) => {
    const allowedRoles = ["admin", "super-admin"];
    if (req.user && allowedRoles.includes(req.user.role)) {
        next();
    } else {
        return res.status(403).json({ msg: "Akses ditolak. Membutuhkan hak akses Admin." });
    }
};

// Middleware untuk memeriksa apakah pengguna adalah Super Admin
export const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === "super-admin") {
        next();
    } else {
        return res.status(403).json({ msg: "Akses ditolak. Hanya untuk Super Admin." });
    }
};