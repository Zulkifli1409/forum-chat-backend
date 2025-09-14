import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./models/User.js";
import connectDB from "./config/db.js";
import { generateSuperAdminAlias } from "./utils/generateAlias.js";

dotenv.config();

const createSuperAdmin = async (nim, password) => {
    if (!nim || !password) {
        console.error("❌ Usage: node generateAdmin.js <nim> <password>");
        process.exit(1);
    }

    await connectDB();

    try {
        // Cek apakah user sudah ada
        const existingUser = await User.findOne({ nim });
        if (existingUser) {
            console.error(`❌ User dengan NIM ${nim} sudah ada.`);
            mongoose.connection.close();
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const alias = generateSuperAdminAlias();

        const newAdmin = new User({
            nim,
            password: hashedPassword,
            alias,  
            role: "super-admin",
            status: "approved"
        });

        await newAdmin.save();
        console.log(`✅ Super Admin dengan NIM ${nim} berhasil dibuat!`);
        console.log(`Alias: ${alias}`);
    } catch (err) {
        console.error("❌ Gagal membuat Super Admin:", err.message);
    } finally {
        mongoose.connection.close();
    }
};

const [nim, password] = process.argv.slice(2);
createSuperAdmin(nim, password);