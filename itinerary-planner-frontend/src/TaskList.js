import React from 'react';
import './TaskList.css';

function TaskList({ tasks, onEdit, onDelete, onToggleComplete }) {
    // Sort tasks: incomplete first
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);

    console.log("Tasks to display:", sortedTasks); // Debugging

    return (
        <div className="task-list">
            {sortedTasks.length === 0 ? (
                <p className="no-tasks">No tasks yet. Add one!</p>
            ) : (
                <ul>
                    {sortedTasks.map(task => (
                        <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                            {/* ✅ Toggle complete */}
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggleComplete(task._id)}
                            />

                            {/* ✅ Display task title */}
                            <span>{task.title}</span>

                            {/* ✅ Edit & Delete buttons */}
                            <div className="task-buttons">
                                <button
                                    className="edit-button"
                                    onClick={() => onEdit(task)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={() => onDelete(task._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default TaskList;