require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// =========================
// 1️⃣ User Schema
// =========================
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken:       { type: String },
  resetTokenExpiry: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// =========================
// 2️⃣ Nodemailer Setup
// =========================
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

// =========================
// 3️⃣ REGISTER
// =========================
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// 4️⃣ LOGIN
// =========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// 5️⃣ FORGOT PASSWORD
// =========================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    if (!user)
      return res.json({ message: "If this email exists, a reset link has been sent." });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // ✅ Reset link points to your Vercel frontend
    const resetLink = `https://todo-list-three-blond-ccml2grnlo.vercel.app/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: `"Todo App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:30px;border-radius:12px;background:#f8fbff;">
          <h2 style="color:#4facfe;">Reset Your Password</h2>
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Click the button below to reset your password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetLink}"
            style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(135deg,#4facfe,#00f2fe);color:white;border-radius:25px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="margin-top:20px;font-size:12px;color:#aaa;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "If this email exists, a reset link has been sent." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// 6️⃣ RESET PASSWORD
// =========================
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password required" });

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // not expired
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset token" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful ✅ You can now login." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// 7️⃣ Auth Middleware
// =========================
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid token format" });

    const decoded = jwt.verify(parts[1], SECRET);
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

// =========================
// 8️⃣ Export
// =========================
module.exports = { router, authMiddleware, User };