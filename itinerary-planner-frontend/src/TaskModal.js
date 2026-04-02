import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './TaskModal.css';

Modal.setAppElement('#root');

function TaskModal({ isOpen, onClose, onSave, onDelete, task, isDeleteMode }) {
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(task?.title || '');
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      if (isDeleteMode) {
        if (!task?._id) return;
        await onDelete(task._id);
      } else {
        if (!title.trim()) {
          setError('Task cannot be empty');
          return;
        }

        const taskToSave = task
          ? { ...task, title }
          : { title, completed: false };

        await onSave(taskToSave);
      }

      onClose();

    } catch (err) {
      console.error(err);
      setError(isDeleteMode ? "Failed to delete task" : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} className="modal" overlayClassName="overlay">
      <form onSubmit={handleSubmit} className="task-form">

        {isDeleteMode ? (
          <>
            <p>Are you sure you want to delete this task?</p>

            <div className="modal-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Deleting..." : "Yes"}
              </button>
              <button type="button" onClick={onClose}>
                No
              </button>
            </div>
          </>
        ) : (
          <>
            <label>
              Task:
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                required
              />
            </label>

            {error && <p className="error-message">{error}</p>}

            <div className="modal-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}

      </form>
    </Modal>
  );
}

export default TaskModal;