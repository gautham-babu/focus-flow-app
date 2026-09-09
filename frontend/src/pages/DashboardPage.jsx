import { useState, useEffect } from 'react';

export default function DashboardPage() {
    const [tasks, setTasks] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch('http://127.0.0.1:8000/tasks/').then((res) => res.json()),
            fetch('http://127.0.0.1:8000/sessions/').then((res) => res.json())
        ])
            .then(([tasksData, sessionsData]) => {
                setTasks(Array.isArray(tasksData) ? tasksData : []);
                setSessions(Array.isArray(sessionsData) ? sessionsData : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching dashboard data:", err);
                setLoading(false);
            });
    }, []);

    // Format today's date (e.g., "Sep 9")
    const todayFormatted = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const todayStr = new Date().toDateString();
    const todaySessions = sessions.filter(
        (s) => new Date(s.created_at).toDateString() === todayStr
    );

    const totalSecondsToday = todaySessions.reduce((acc, s) => {
        let secs = 0;
        const hourMatch = s.duration?.match(/(\d+)h/);
        const minMatch = s.duration?.match(/(\d+)m/);
        const secMatch = s.duration?.match(/(\d+)s/);
        if (hourMatch) secs += parseInt(hourMatch[1], 10) * 3600;
        if (minMatch) secs += parseInt(minMatch[1], 10) * 60;
        if (secMatch) secs += parseInt(secMatch[1], 10);
        return acc + secs;
    }, 0);

    const formatTotalTime = (totalSecs) => {
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        if (minutes > 0) return `${minutes}m`;
        return `${totalSecs}s`;
    };

    const completedTasksCount = tasks.filter((t) => t.completed).length;

    if (loading) {
        return <div className="empty-state">Loading dashboard metrics...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Overview</h1>
                    <p className="dashboard-subtitle">
                        Here is your real-time focus activity and progress for today.
                    </p>
                </div>
                <div className="dashboard-date-badge">
                    {todayFormatted}
                </div>
            </div>

            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-label">Today's Focus</div>
                    <div className="kpi-value">{formatTotalTime(totalSecondsToday)}</div>
                    <div className="kpi-subtext highlight">● Active today</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-label">Completed Sessions</div>
                    <div className="kpi-value">{todaySessions.length}</div>
                    <div className="kpi-subtext">{sessions.length} total logged</div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-label">Tasks Completed</div>
                    <div className="kpi-value">
                        {completedTasksCount} <span className="kpi-total-divider">/ {tasks.length}</span>
                    </div>
                    <div className="kpi-subtext">{tasks.length - completedTasksCount} pending</div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="panel-card">
                    <div className="panel-header">
                        <h2 className="panel-title">Latest Focus Session</h2>
                        <span className="badge-pill">Most Recent</span>
                    </div>

                    {sessions.length === 0 ? (
                        <div className="empty-state">No sessions completed yet. Start the timer to log one!</div>
                    ) : (
                        <div className="session-summary-box">
                            <div className="session-main-stat">
                                <span className="session-icon">⏱</span>
                                <div>
                                    <div className="session-duration">{sessions[0].duration}</div>
                                    <div className="session-date">
                                        {new Date(sessions[0].created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                    </div>
                                </div>
                            </div>

                            <div className="session-meta-row top-border">
                                <span className="session-meta-label">Productivity Rating:</span>
                                <strong>{sessions[0].rating} / 10</strong>
                            </div>

                            <div className="session-meta-row">
                                <span className="session-meta-label">Distraction Note:</span>
                                <strong className={sessions[0].distraction === 'None' ? 'session-note-clean' : 'session-note-distracted'}>
                                    {sessions[0].distraction || 'None'}
                                </strong>
                            </div>
                        </div>
                    )}
                </div>

                <div className="panel-card">
                    <div className="panel-header">
                        <h2 className="panel-title">Active Tasks</h2>
                        <span className="open-tasks-count">
                            {tasks.filter((t) => !t.completed).length} open
                        </span>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-state">No tasks created yet. Head to Task Board to add one.</div>
                    ) : (
                        <ul className="task-items-list">
                            {tasks.slice(0, 5).map((t) => (
                                <li key={t.id} className={`task-board-row ${t.completed ? 'completed' : ''}`}>
                                    <div className="task-title-group">
                                        <span className={`status-dot ${t.completed ? 'completed' : ''}`} />
                                        <span className={`task-name ${t.completed ? 'completed' : ''}`}>
                                            {t.title}
                                        </span>
                                    </div>
                                    <span className="badge-category">{t.category || 'General'}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}