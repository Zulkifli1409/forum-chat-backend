import cron from "node-cron";
import Chat from "./models/Chat.js";
import User from "./models/User.js"; // Impor model User

// Menghapus semua chat setiap tengah malam
cron.schedule("0 0 * * *", async () => {
    await Chat.deleteMany({});
    console.log("🗑️ All chats deleted at midnight");
});

// Tugas baru: Hapus pengguna yang tidak aktif setiap hari pada jam 1 pagi
cron.schedule("0 1 * * *", async () => {
    console.log("Running cron job to delete inactive users...");
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    try {
        const result = await User.deleteMany({
            // Hanya user dengan peran 'user' atau 'moderator'
            role: { $in: ["user", "moderator"] },
            // Yang terakhir login lebih dari 7 hari yang lalu
            lastLogin: { $lt: sevenDaysAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`✅ Successfully deleted ${result.deletedCount} inactive users.`);
        } else {
            console.log("No inactive users to delete.");
        }
    } catch (err) {
        console.error("❌ Error deleting inactive users:", err.message);
    }
});