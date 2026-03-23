const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express(); // ✅ IMPORTANT

app.use(bodyParser.json()); // ✅ IMPORTANT

const corsOptions = {
    origin: [
        "http://localhost:3000",
        "https://todo-list-three-blond-ccml2grnlo.vercel.app" // ✅ NO trailing /
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const uri = "mongodb+srv://anushkakulshrestha006_db_user:iQGrDCkKyEGX9FaB@xyz.aouxtsf.mongodb.net/?appName=xyz";

mongoose.connect(uri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

const TaskSchema = new mongoose.Schema({
    text: String,
    completed: Boolean
});

const Task = mongoose.model('Task', TaskSchema);

app.get("/", (req, res) => {
    res.json({ message: "Itinerary planner is live" });
});

app.post('/tasks', async (req, res) => {
    try {
        console.log("Incoming body:", req.body); // 👈 debug

        const task = new Task(req.body);
        await task.save();

        res.send(task);
    } catch (err) {
        console.error("POST ERROR:", err); // 👈 VERY IMPORTANT
        res.status(500).send(err.message);
    }
});

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.send({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).send(err);
    }
});

app.listen(5001, () => {
    console.log('Server started on port 5001');
});