import { useState, useEffect } from 'react';

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [estimatedTime, setEstimatedTime] = useState('');
    const [timeUnit, setTimeUnit] = useState('mins');
    const [priority, setPriority] = useState('Medium');
    const [category, setCategory] = useState('Work');
    const [startDateTime, setStartDateTime] = useState('');

    // Filtering state
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedPriority, setSelectedPriority] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:8000/tasks/')
            .then((res) => res.json())
            .then((data) => setTasks(Array.isArray(data) ? data : []))
            .catch((err) => console.error("Error fetching tasks:", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTask = {
            title,
            estimated_time: `${estimatedTime || '25'} ${timeUnit}`,
            priority,
            category,
            start_date: startDateTime || new Date().toISOString(),
            completed: false
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/tasks/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask)
            });

            if (!response.ok) return;

            const data = await response.json();
            setTasks((prev) => [...prev, data]);

            setTitle('');
            setEstimatedTime('');
            setStartDateTime('');
        } catch (err) {
            console.error("Error creating task:", err);
        }
    };

    const handleToggleComplete = async (taskId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/tasks/${taskId}/toggle`, {
                method: 'PATCH'
            });
            if (!res.ok) return;

            const updatedTask = await res.json();
            setTasks((prev) =>
                prev.map((t) => (t.id === taskId ? updatedTask : t))
            );
        } catch (err) {
            console.error("Error updating task status:", err);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (!res.ok) return;
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch (err) {
            console.error("Error deleting task:", err);
        }
    };

    const filteredTasks = tasks.filter((t) => {
        const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
        const matchesStatus =
            statusFilter === 'All' ||
            (statusFilter === 'Completed' && t.completed) ||
            (statusFilter === 'Active' && !t.completed);
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesPriority && matchesStatus && matchesSearch;
    });

    const getPriorityColor = (p) => {
        switch (p?.toLowerCase()) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#64748b';
        }
    };

    return (
        <div className="tasks-page-container">
            {/* Create Task Form */}
            <div className="ui-card task-create-card">
                <h2>Create Task</h2>
                <form onSubmit={handleSubmit} className="task-form-layout">
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="task-input"
                        required
                    />

                    <div className="form-grid-2col">
                        <div className="time-est-group">
                            <input
                                type="number"
                                min="1"
                                placeholder="Est. Time"
                                value={estimatedTime}
                                onChange={(e) => setEstimatedTime(e.target.value)}
                                className="task-input"
                                style={{ flex: 1 }}
                            />
                            <select
                                value={timeUnit}
                                onChange={(e) => setTimeUnit(e.target.value)}
                                className="task-select time-unit-select"
                            >
                                <option value="mins">mins</option>
                                <option value="hours">hours</option>
                            </select>
                        </div>

                        <input
                            type="datetime-local"
                            value={startDateTime}
                            onChange={(e) => setStartDateTime(e.target.value)}
                            className="task-input datetime-input"
                        />
                    </div>

                    <div className="form-grid-2col">
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="task-select"
                        >
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>

                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="task-select"
                        >
                            <option value="Work">Work</option>
                            <option value="Study">Study</option>
                            <option value="Personal">Personal</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary task-submit-btn">
                        Add Task
                    </button>
                </form>
            </div>

            {/* Filter & Search Bar */}
            <div className="ui-card task-filter-card">
                <h3 className="filter-card-title">Filter Tasks</h3>
                <div className="task-filter-grid">
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="task-input search-input"
                    />

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="task-select"
                    >
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="task-select"
                    >
                        <option value="All">All Categories</option>
                        <option value="Work">Work</option>
                        <option value="Study">Study</option>
                        <option value="Personal">Personal</option>
                        <option value="General">General</option>
                    </select>

                    <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="task-select"
                    >
                        <option value="All">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
            </div>

            {/* Task List */}
            <div className="ui-card task-list-card">
                <h3 className="task-list-title">
                    Tasks ({filteredTasks.length})
                </h3>

                {filteredTasks.length === 0 ? (
                    <p className="page-subtitle" style={{ textAlign: 'center', padding: '20px 0' }}>
                        No tasks match your filter.
                    </p>
                ) : (
                    <ul className="task-items-list">
                        {filteredTasks.map((t) => (
                            <li
                                key={t.id}
                                className={`task-item-card ${t.completed ? 'completed' : ''}`}
                            >
                                <div className="task-item-left">
                                    <input
                                        type="checkbox"
                                        checked={!!t.completed}
                                        onChange={() => handleToggleComplete(t.id)}
                                        className="task-checkbox"
                                    />

                                    <div className="task-item-content">
                                        <strong className={`task-item-title ${t.completed ? 'completed' : ''}`}>
                                            {t.title}
                                        </strong>

                                        <div className="task-item-tags">
                                            <span className="badge-category">
                                                📁 {t.category}
                                            </span>

                                            <span
                                                className="badge-priority"
                                                style={{
                                                    backgroundColor: `${getPriorityColor(t.priority)}15`,
                                                    color: getPriorityColor(t.priority)
                                                }}
                                            >
                                                {t.priority}
                                            </span>

                                            <span className="task-est-badge">
                                                ⏱ {t.estimated_time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="task-item-actions">
                                    {t.start_date && (
                                        <span className="task-item-date">
                                            {new Date(t.start_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </span>
                                    )}
                                    <button
                                        type="button"
                                        className="task-delete-btn"
                                        onClick={() => handleDeleteTask(t.id)}
                                        title="Delete task"
                                        aria-label="Delete task"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}