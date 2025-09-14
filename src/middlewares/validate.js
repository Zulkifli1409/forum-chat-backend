import { body, validationResult } from "express-validator";

// Middleware untuk cek hasil validasi
export const validate = (rules) => {
    return [
        ...rules,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        },
    ];
};
