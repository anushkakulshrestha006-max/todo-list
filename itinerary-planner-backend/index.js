require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { router: userRouter, authMiddleware } = require('./user');

const app = express();

// =========================
// ✅ CORS Setup — MUST be first
// =========================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default (just in case)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Handle preflight for ALL routes explicitly
app.options('*', cors());

// =========================
// ✅ Middleware
// =========================
app.use(express.json());

// =========================
// ✅ Health Check
// =========================
app.get("/", (req, res) => res.send("API is running 🚀"));

// =========================
// ✅ MongoDB Connection
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// =========================
// ✅ User Routes
// =========================
app.use('/auth', userRouter);

// =========================
// ✅ Task Model
// =========================
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// =========================
// ✅ Helper
// =========================
const getUserId = (req) => req.user?.id || req.user?.userId;

// =========================
// ✅ Task Routes
// =========================

// ➕ Create Task
app.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!req.body.title) return res.status(400).json({ message: "Title required" });

    const task = new Task({ title: req.body.title, userId });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📥 Get Tasks
app.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Update Task
app.put('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title: req.body.title, completed: req.body.completed },
      { new: true }
    );

    if (!updatedTask) return res.status(403).json({ message: "Not allowed" });
    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Delete Task
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const deletedTask = await Task.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedTask) return res.status(403).json({ message: "Not allowed" });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =========================
// ✅ Start Server
// =========================
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));