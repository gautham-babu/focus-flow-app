import { useState, useEffect } from 'react';
import PomodoroTimer from './components/PomodoroTimer';
import SessionLogger from './components/SessionLogger';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/tasks/')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error fetching tasks:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      title,
      estimated_pomodoros: 1,
      priority,
      category: 'work',
      start_date: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const data = await response.json();
      setTasks([...tasks, data]);
      setTitle('');
    } catch (err) {
      console.error("Error creating task:", err);
    }
  };

  return (
    <div className="app-container">
      <h1>Focus Flow</h1>
      <p>A focused-work manager combining Pomodoro, task lists, and distraction logging.</p>

      <PomodoroTimer />
      <SessionLogger />
      <Analytics />

      <form onSubmit={handleSubmit} className="task-form">
        <input
          type="text"
          placeholder="What are you working on?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="task-input"
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="task-select">
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <button type="submit" className="task-button">Add Task</button>
      </form>

      <h2>Task List</h2>
      <ul className="task-list">
        {tasks.map(task => (
          <li
            key={task.id}
            className="task-item"
            style={{ borderLeft: `5px solid ${task.priority === 'High' ? '#e74c3c' : '#3498db'}` }}
          >
            <span>{task.title}</span>
            <span className="task-meta">Priority: {task.priority}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;