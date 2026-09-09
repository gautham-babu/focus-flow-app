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
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Create Task Form */}
            <div className="ui-card" style={{ marginBottom: '24px' }}>
                <h2>Create Task</h2>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <input
                        type="text"
                        placeholder="What needs to be done?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="task-input"
                        required
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
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
                                className="task-select"
                                style={{ width: '90px' }}
                            >
                                <option value="mins">mins</option>
                                <option value="hours">hours</option>
                            </select>
                        </div>

                        <input
                            type="datetime-local"
                            value={startDateTime}
                            onChange={(e) => setStartDateTime(e.target.value)}
                            className="task-input"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                        Add Task
                    </button>
                </form>
            </div>

            {/* Filter & Search Bar */}
            <div className="ui-card" style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1rem', color: '#475569', marginBottom: '12px' }}>Filter Tasks</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="task-input"
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
            <div className="ui-card">
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '16px' }}>
                    Tasks ({filteredTasks.length})
                </h3>

                {filteredTasks.length === 0 ? (
                    <p className="page-subtitle" style={{ textAlign: 'center', padding: '20px 0' }}>
                        No tasks match your filter.
                    </p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {filteredTasks.map((t) => (
                            <li
                                key={t.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '12px 14px',
                                    borderBottom: '1px solid #f1f5f9',
                                    opacity: t.completed ? 0.6 : 1
                                }}
                            >
                                {/* Complete Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={!!t.completed}
                                    onChange={() => handleToggleComplete(t.id)}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                />

                                <div style={{ flex: 1 }}>
                                    <strong style={{
                                        fontSize: '1rem',
                                        color: '#0f172a',
                                        textDecoration: t.completed ? 'line-through' : 'none'
                                    }}>
                                        {t.title}
                                    </strong>

                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                                        <span style={{
                                            backgroundColor: '#f1f5f9',
                                            color: '#475569',
                                            fontSize: '0.75rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px'
                                        }}>
                                            📁 {t.category}
                                        </span>

                                        <span style={{
                                            backgroundColor: `${getPriorityColor(t.priority)}15`,
                                            color: getPriorityColor(t.priority),
                                            fontSize: '0.75rem',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontWeight: '600'
                                        }}>
                                            {t.priority}
                                        </span>

                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                            ⏱ {t.estimated_time}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {t.start_date ? new Date(t.start_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}