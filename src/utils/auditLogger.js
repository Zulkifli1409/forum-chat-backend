import AuditLog from "../models/AuditLog.js";

export const logAction = async ({ adminId, adminAlias, action, targetUserId, targetUserAlias, details }) => {
    try {
        await AuditLog.create({
            adminId,
            adminAlias,
            action,
            targetUserId,
            targetUserAlias,
            details
        });
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
};