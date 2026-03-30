import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './TaskModal.css';

Modal.setAppElement('#root');

function TaskModal({ isOpen, onClose, onSave, onDelete, task, isDeleteMode }) {
    const [title, setTitle] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false); // ✅ NEW

    useEffect(() => {
        if (task && task.title) {
            setTitle(task.title);
        } else {
            setTitle('');
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isDeleteMode) {
            if (!task || !task._id) return; // ✅ SAFE GUARD
            try {
                setLoading(true);
                await onDelete(task._id);
                onClose();
            } catch (err) {
                setError("Failed to delete task");
            } finally {
                setLoading(false);
            }
            return;
        }

        if (title.trim() === '') {
            setError('Task cannot be empty');
            return;
        }

        const taskToSave = task
            ? { ...task, title }
            : { title, completed: false };

        try {
            setLoading(true);
            await onSave(taskToSave); // ✅ wait for API
            onClose();
        } catch (err) {
            setError("Failed to save task");
        } finally {
            setLoading(false);
        }
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
                            <button className="confirm-button" type="submit" disabled={loading}>
                                {loading ? "Deleting..." : "Yes"}
                            </button>
                            <button className="cancel-button" type="button" onClick={onClose}>
                                No
                            </button>
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
                            <button className="save-button" type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                            </button>
                            <button className="cancel-button" type="button" onClick={onClose}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </Modal>
    );
}

export default TaskModal;