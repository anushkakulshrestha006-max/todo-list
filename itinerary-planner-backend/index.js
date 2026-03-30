require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { router: userRouter, authMiddleware } = require('./user');

const app = express();

// =========================
// ✅ Middleware
// =========================
app.use(cors());
app.use(express.json());

// =========================
// ✅ Connect to MongoDB
// =========================
console.log(process.env.MONGO_URI);
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
// ✅ Helper to safely get userId
// =========================
const getUserId = (req) => {
    return req.user?.userId || req.user?.id;
};

// =========================
// ✅ TASK ROUTES
// =========================

// ➕ Create Task
app.post('/tasks', authMiddleware, async (req, res) => {
    try {
        console.log("Creating task:", req.body);
        console.log("USER:", req.user);

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - No user ID" });
        }

        if (!req.body.title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = new Task({
            title: req.body.title,
            userId: userId
        });

        await task.save();
        res.status(201).json(task);

    } catch (err) {
        console.error("Create Task error:", err);
        res.status(500).json({ message: err.message }); // 🔥 REAL ERROR
    }
});

// 📥 Get Tasks
app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        console.log("USER:", req.user);

        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - No user ID" });
        }

        console.log("Fetching tasks for:", userId);

        const tasks = await Task.find({ userId });
        res.json(tasks);

    } catch (err) {
        console.error("Get Tasks error:", err);
        res.status(500).json({ message: err.message });
    }
});

// ✏️ Update Task
app.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - No user ID" });
        }

        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId },
            {
                title: req.body.title,
                completed: req.body.completed
            },
            { new: true }
        );

        if (!updatedTask) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json(updatedTask);

    } catch (err) {
        console.error("Update Task error:", err);
        res.status(500).json({ message: err.message });
    }
});

// ❌ Delete Task
app.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - No user ID" });
        }

        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            userId
        });

        if (!deletedTask) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json({ message: "Task deleted" });

    } catch (err) {
        console.error("Delete Task error:", err);
        res.status(500).json({ message: err.message });
    }
});

// =========================
// ✅ Start Server
// =========================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});