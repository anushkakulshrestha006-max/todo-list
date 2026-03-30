import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import Login from './Login';
import Register from './Register';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false);

  // ✅ ALWAYS get fresh token
  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // =========================
  // ✅ Fetch tasks
  // =========================
  useEffect(() => {
    if (isAuthenticated) {
      axios.get('http://localhost:5001/tasks', getAuthHeaders())
        .then(res => setTasks(res.data))
        .catch(err => console.error("Error fetching tasks:", err.response || err));
    }
  }, [isAuthenticated]);

  // =========================
  // ✅ Add Task
  // =========================
  const addTask = (task) => {
    axios.post('http://localhost:5001/tasks', task, getAuthHeaders())
      .then(res => setTasks([...tasks, res.data]))
      .catch(err => console.error("Error adding task:", err.response || err));
  };

  // =========================
  // ✅ Update Task
  // =========================
  const updateTask = (task) => {
    axios.put(`http://localhost:5001/tasks/${task._id}`, task, getAuthHeaders())
      .then(res => setTasks(tasks.map(t => t._id === task._id ? res.data : t)))
      .catch(err => console.error("Error updating task:", err.response || err));
  };

  // =========================
  // ✅ Delete Task
  // =========================
  const deleteTask = (taskId) => {
    axios.delete(`http://localhost:5001/tasks/${taskId}`, getAuthHeaders())
      .then(() => setTasks(tasks.filter(t => t._id !== taskId)))
      .catch(err => console.error("Error deleting task:", err.response || err));
  };

  // =========================
  // ✅ Toggle Complete
  // =========================
  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    updateTask({ ...task, completed: !task.completed });
  };

  // =========================
  // ✅ Logout
  // =========================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setTasks([]);
  };

  // =========================
  // ✅ AUTH FLOW
  // =========================
  if (!isAuthenticated) {
    return showRegister
      ? <Register onRegister={() => setShowRegister(false)} goToLogin={() => setShowRegister(false)} />
      : <Login onLogin={() => setIsAuthenticated(true)} goToRegister={() => setShowRegister(true)} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Itinerary Planner</h1>
        <p>Welcome, {localStorage.getItem('username')}!</p>

        <button onClick={handleLogout}>Logout</button>

        <button
          className="add-task-button"
          onClick={() => {
            setCurrentTask(null);
            setIsModalOpen(true);
          }}
        >
          Add Task
        </button>
      </header>

      <TaskList
        tasks={tasks}
        onEdit={task => {
          setCurrentTask(task);
          setIsModalOpen(true);
        }}
        onDelete={taskId => {
          setTaskToDelete(taskId);
          setIsDeleteModalOpen(true);
        }}
        onToggleComplete={toggleTaskCompletion}
      />

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={currentTask ? updateTask : addTask}
        task={currentTask}
      />

      {/* Delete confirmation */}
      <TaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => {
          deleteTask(taskToDelete);
          setIsDeleteModalOpen(false);
        }}
        isDeleteMode={true}
      />
    </div>
  );
}

export default App;