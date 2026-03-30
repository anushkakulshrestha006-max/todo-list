const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: String,
    completed: { type: Boolean, default: false },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Todo', todoSchema);