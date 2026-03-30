require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const router = express.Router();

// ✅ Use secret from .env
const SECRET = process.env.JWT_SECRET || "fallback_secret_key";

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
        console.log("Register request body:", req.body); // ✅ DEBUG

        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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
        console.error("Register error:", err.message || err);
        res.status(500).json({ message: "Server error" });
    }
});

// =========================
// 3️⃣ LOGIN
// =========================
router.post('/login', async (req, res) => {
    try {
        console.log("Login request body:", req.body); // ✅ DEBUG

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

        const token = jwt.sign(
            {
                id: user._id,
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
                name: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login error:", err.message || err);
        res.status(500).json({ message: "Server error" });
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

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = jwt.verify(token, SECRET);

        req.user = decoded;

        next();

    } catch (err) {
        console.error("Auth middleware error:", err.message || err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// =========================
// 5️⃣ Export
// =========================
module.exports = { router, authMiddleware, User };