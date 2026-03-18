import React from 'react';
import './TaskList.css';

function TaskList({ tasks, onEdit, onDelete, onToggleComplete }) {
    const sortedTasks = [...tasks].sort((a, b) => a.completed - b.completed);
    console.log(sortedTasks);

    return (
        <div className="task-list">
            <ul>
                {sortedTasks.map(task => (
                    <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                        <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => onToggleComplete(task._id)}
                        />
                        <span>{task.text}</span>
                        <div className="task-buttons">
                            <button className="edit-button" onClick={() => onEdit(task)}>Edit</button>
                            <button className="delete-button" onClick={() => onDelete(task)}>Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;
