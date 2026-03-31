import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import './App.css';

const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('login'); // 'login' | 'register' | 'forgotPassword' | 'resetPassword'

  // ✅ Check URL for reset-password token on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/reset-password' || params.get('token')) {
      setPage('resetPassword');
    }
  }, []);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // ================= FETCH TASKS =================
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/tasks`, getAuthHeaders());
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err.response || err);
      }
    };
    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated]);

  // ================= ADD TASK =================
  const addTask = async (task) => {
    try {
      const res = await axios.post(`${BASE_URL}/tasks`, task, getAuthHeaders());
      setTasks(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding task:", err.response || err);
      throw err;
    }
  };

  // ================= UPDATE TASK =================
  const updateTask = async (task) => {
    try {
      const res = await axios.put(`${BASE_URL}/tasks/${task._id}`, task, getAuthHeaders());
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      console.error("Error updating task:", err.response || err);
      throw err;
    }
  };

  // ================= DELETE TASK =================
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${BASE_URL}/tasks/${taskId}`, getAuthHeaders());
      setTasks(prev => prev.filter(t => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err.response || err);
      throw err;
    }
  };

  // ================= TOGGLE =================
  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    updateTask({ ...task, completed: !task.completed });
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setTasks([]);
    setPage('login');
  };

  // ================= AUTH FLOW =================
  if (!isAuthenticated) {
    if (page === 'resetPassword') {
      return <ResetPassword goToLogin={() => setPage('login')} />;
    }
    if (page === 'forgotPassword') {
      return <ForgotPassword goToLogin={() => setPage('login')} />;
    }
    if (page === 'register') {
      return (
        <Register
          onRegister={() => setPage('login')}
          goToLogin={() => setPage('login')}
        />
      );
    }
    return (
      <Login
        onLogin={() => setIsAuthenticated(true)}
        goToRegister={() => setPage('register')}
        goToForgotPassword={() => setPage('forgotPassword')}
      />
    );
  }

  // ================= MAIN UI =================
  return (
    <div className="App">
      <header className="App-header">
        <div className="header-left">
          <h1>Itinerary Planner</h1>
          <p className="welcome-text">
            Welcome, {localStorage.getItem('username')} 👋
          </p>
        </div>

        <div className="header-right">
          <button
            className="add-task-button"
            onClick={() => {
              setCurrentTask(null);
              setIsModalOpen(true);
            }}
          >
            + Add Task
          </button>

          <div className="logout-wrapper">
            <button className="logout-btn" onClick={handleLogout}>
              ⎋ Logout
            </button>
          </div>
        </div>
      </header>

      <TaskList
        tasks={tasks}
        onEdit={(task) => {
          setCurrentTask(task);
          setIsModalOpen(true);
        }}
        onDelete={(taskId) => {
          setTaskToDelete(taskId);
          setIsDeleteModalOpen(true);
        }}
        onToggleComplete={toggleTaskCompletion}
      />

      {/* Add / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={currentTask ? updateTask : addTask}
        task={currentTask}
      />

      {/* Delete Modal */}
      <TaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={async () => {
          await deleteTask(taskToDelete);
          setIsDeleteModalOpen(false);
        }}
        task={{ _id: taskToDelete }}
        isDeleteMode={true}
      />
    </div>
  );
}

export default App;