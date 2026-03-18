import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskList from './TaskList';
import TaskModal from './TaskModal';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5001/tasks')
      .then(response => setTasks(response.data))
      .catch(error => console.error(error));
  }, []);

  const addTask = (task) => {
    console.log(task);
    axios.post('http://localhost:5001/tasks', task, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => setTasks([...tasks, response.data]))
      .catch(error => console.error(error));
  };

  const updateTask = (updatedTask) => {
    axios.put(`http://localhost:5001/tasks/${updatedTask._id}`, updatedTask, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        setTasks(tasks.map(task => task._id === updatedTask._id ? response.data : task));
      })
      .catch(error => console.error(error));
  };

  const deleteTask = (taskId) => {
    axios.delete(`http://localhost:5001/tasks/${taskId}`)
      .then(() => {
        setTasks(tasks.filter(task => task._id !== taskId));
      })
      .catch(error => console.error(error));
  };

  const toggleTaskCompletion = (taskId) => {
    const task = tasks.find(task => task._id === taskId);
    task.completed = !task.completed;
    updateTask(task);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Itinerary Planner</h1>
        <button className="add-task-button" onClick={() => { setCurrentTask(null); setIsModalOpen(true); }}>Add Task</button>
      </header>
      <TaskList
        tasks={tasks}
        onEdit={task => { setCurrentTask(task); setIsModalOpen(true); }}
        onDelete={task => { setTaskToDelete(task); setIsDeleteModalOpen(true); }}
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
        task={taskToDelete}
        isDeleteMode={true}
      />
    </div>
  );
}

export default App;
