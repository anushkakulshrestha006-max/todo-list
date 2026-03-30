import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './TaskModal.css';

Modal.setAppElement('#root');

function TaskModal({ isOpen, onClose, onSave, onDelete, task, isDeleteMode }) {
    const [title, setTitle] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (task) {
            setTitle(task.title); // ✅ FIXED
        } else {
            setTitle('');
        }
    }, [task]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isDeleteMode) {
            onDelete(task._id);
            onClose();
            return;
        }

        if (title.trim() === '') {
            setError('Task cannot be empty');
            return;
        }

        // ✅ FIXED: send title instead of text
        const taskToSave = task
            ? { ...task, title }
            : { title, completed: false };

        onSave(taskToSave);
        onClose();
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setError(null);
    };

    return (
        <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
            <form onSubmit={handleSubmit} className="task-form">
                {isDeleteMode ? (
                    <div>
                        <p>Are you sure you want to delete this task?</p>
                        <div className="modal-buttons">
                            <button className="confirm-button" type="submit">Yes</button>
                            <button className="cancel-button" type="button" onClick={onClose}>No</button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <label>
                            Task:
                            <input
                                type="text"
                                value={title}
                                onChange={handleTitleChange}
                                required
                            />
                        </label>

                        {error && <p className="error-message">{error}</p>}

                        <div className="modal-buttons">
                            <button className="save-button" type="submit">Save</button>
                            <button className="cancel-button" type="button" onClick={onClose}>Cancel</button>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}

export default TaskModal;