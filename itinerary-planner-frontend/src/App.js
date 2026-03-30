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
        const res = await axios.get('http://localhost:5001/tasks', getAuthHeaders());
        setTasks(res.data);
      } catch (err) {
        console.error("Error fetching tasks:", err.response || err);
      }
    };

    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  // ================= ADD TASK =================
  const addTask = async (task) => {
    try {
      const res = await axios.post('http://localhost:5001/tasks', task, getAuthHeaders());
      setTasks(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding task:", err.response || err);
      throw err;
    }
  };

  // ================= UPDATE TASK =================
  const updateTask = async (task) => {
    try {
      const res = await axios.put(`http://localhost:5001/tasks/${task._id}`, task, getAuthHeaders());
      setTasks(prev => prev.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      console.error("Error updating task:", err.response || err);
      throw err;
    }
  };

  // ================= DELETE TASK =================
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5001/tasks/${taskId}`, getAuthHeaders());
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
  };

  // ================= AUTH FLOW =================
  if (!isAuthenticated) {
    return showRegister
      ? <Register onRegister={() => setShowRegister(false)} goToLogin={() => setShowRegister(false)} />
      : <Login onLogin={() => setIsAuthenticated(true)} goToRegister={() => setShowRegister(true)} />;
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

          <button className="logout-btn" onClick={handleLogout}>
            Logout
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