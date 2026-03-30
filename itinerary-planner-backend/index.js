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
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB connection error:", err));

// =========================
// ✅ User Routes
// =========================
app.use('/auth', userRouter);

// =========================
// ✅ Task Model (ONLY ONE MODEL)
// =========================
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);

// =========================
// ✅ TASK ROUTES
// =========================
app.post('/tasks', authMiddleware, async (req, res) => {
    try {
        console.log("Creating task:", req.body); // ✅ DEBUG

        if (!req.body.title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const task = new Task({
            title: req.body.title,
            userId: req.user.id
        });

        await task.save();
        res.status(201).json(task);

    } catch (err) {
        console.error("Create Task error:", err);
        res.status(500).json({ message: "Error creating task" });
    }
});

app.get('/tasks', authMiddleware, async (req, res) => {
    try {
        console.log("Fetching tasks for:", req.user.id); // ✅ DEBUG

        const tasks = await Task.find({ userId: req.user.id });
        res.json(tasks);

    } catch (err) {
        console.error("Get Tasks error:", err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

app.put('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
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
        res.status(500).json({ message: "Error updating task" });
    }
});

app.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const deletedTask = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!deletedTask) {
            return res.status(403).json({ message: "Not allowed" });
        }

        res.json({ message: "Task deleted" });

    } catch (err) {
        console.error("Delete Task error:", err);
        res.status(500).json({ message: "Error deleting task" });
    }
});

// =========================
// ✅ Start Server
// =========================
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});