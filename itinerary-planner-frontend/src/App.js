import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './Forgotpassword';
import ResetPassword from './Resetpassword';
import './App.css';

const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [page, setPage] = useState('login');

  useEffect(() => {
    document.title = "Itinerary Planner";
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/reset-password' || params.get('token')) {
      setPage('resetPassword');
    }
  }, []);

  // ✅ SAFER TOKEN HANDLER
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn("No token found");
      return null;
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // ================= FETCH TASKS =================
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const config = getAuthHeaders();
        if (!config) return;

        const res = await axios.get(`${BASE_URL}/tasks`, config);
        setTasks(res.data);

      } catch (err) {
        console.error("Error fetching tasks:", err.response || err);

        // 🔥 AUTO LOGOUT ON 401
        if (err.response?.status === 401) {
          handleLogout();
        }
      }
    };

    if (isAuthenticated) fetchTasks();
  }, [isAuthenticated]);

  // ================= ADD TASK =================
  const addTask = async (task) => {
    try {
      const config = getAuthHeaders();
      if (!config) return;

      const res = await axios.post(`${BASE_URL}/tasks`, task, config);
      setTasks(prev => [...prev, res.data]);

    } catch (err) {
      console.error("Error adding task:", err.response || err);

      if (err.response?.status === 401) {
        handleLogout();
      }

      throw err;
    }
  };

  // ================= UPDATE TASK =================
  const updateTask = async (task) => {
    try {
      const config = getAuthHeaders();
      if (!config) return;

      const res = await axios.put(`${BASE_URL}/tasks/${task._id}`, task, config);
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));

    } catch (err) {
      console.error("Error updating task:", err.response || err);

      if (err.response?.status === 401) {
        handleLogout();
      }

      throw err;
    }
  };

  // ================= DELETE TASK =================
  const deleteTask = async (taskId) => {
    try {
      const config = getAuthHeaders();
      if (!config) return;

      await axios.delete(`${BASE_URL}/tasks/${taskId}`, config);
      setTasks(prev => prev.filter(t => t._id !== taskId));

    } catch (err) {
      console.error("Error deleting task:", err.response || err);

      if (err.response?.status === 401) {
        handleLogout();
      }

      throw err;
    }
  };

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    updateTask({ ...task, completed: !task.completed });
  };

  // 🔥 CLEAN LOGOUT
  const handleLogout = () => {
    localStorage.clear();
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

          <button className="logout-btn" onClick={handleLogout}>
            ⎋ Logout
          </button>
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

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={currentTask ? updateTask : addTask}
        task={currentTask}
      />

      <TaskModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={deleteTask}
        task={{ _id: taskToDelete }}
        isDeleteMode={true}
      />
    </div>
  );
}

export default App;