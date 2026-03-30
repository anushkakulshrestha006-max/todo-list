require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const router = express.Router();

// ✅ Always use .env secret (NO fallback in production)
const SECRET = process.env.JWT_SECRET;

// =========================
// 1️⃣ User Schema
// =========================
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// =========================
// 2️⃣ REGISTER
// =========================
router.post('/register', async (req, res) => {
    try {
        console.log("Register request:", req.body);

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check existing user
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ message: err.message }); // 🔥 real error
    }
});

// =========================
// 3️⃣ LOGIN
// =========================
router.post('/login', async (req, res) => {
    try {
        console.log("Login request:", req.body);

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // ✅ Token payload (IMPORTANT)
        const token = jwt.sign(
            {
                id: user._id,            // 👈 this is what backend uses
                username: user.username,
                email: user.email
            },
            SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: err.message });
    }
});

// =========================
// 4️⃣ Auth Middleware
// =========================
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const token = parts[1];

        const decoded = jwt.verify(token, SECRET);

        console.log("Decoded token:", decoded); // 🔍 DEBUG

        req.user = decoded; // ✅ VERY IMPORTANT

        next();

    } catch (err) {
        console.error("Auth error:", err);
        res.status(401).json({ message: err.message });
    }
};

// =========================
// 5️⃣ Export
// =========================
module.exports = { router, authMiddleware, User };