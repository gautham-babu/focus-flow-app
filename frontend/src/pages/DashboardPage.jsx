import { useState, useEffect } from 'react';

export default function DashboardPage({ onNavigate }) {
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

    // Filter sessions that took place today
    const todayStr = new Date().toDateString();
    const todaySessions = sessions.filter(
        (s) => new Date(s.created_at).toDateString() === todayStr
    );

    // Parse duration strings (e.g., "25m 0s", "15s") to compute real focus seconds today
    const totalSecondsToday = todaySessions.reduce((acc, s) => {
        let secs = 0;
        const minMatch = s.duration?.match(/(\d+)m/);
        const secMatch = s.duration?.match(/(\d+)s/);
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

    if (loading) {
        return <div className="page-subtitle">Loading dashboard...</div>;
    }

    return (
        <div>
            <p className="page-subtitle">Here's your focus overview for today.</p>

            {/* Real Metric Cards */}
            <div className="quick-actions-flex" style={{ gap: '16px', marginTop: '16px' }}>
                <div className="ui-card" style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Today's Focus</span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: '#0f172a' }}>
                        {formatTotalTime(totalSecondsToday)}
                    </h2>
                </div>

                <div className="ui-card" style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Completed Sessions</span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: '#0f172a' }}>
                        {todaySessions.length}
                    </h2>
                </div>

                <div className="ui-card" style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total Tasks</span>
                    <h2 style={{ fontSize: '1.8rem', marginTop: '8px', color: '#0f172a' }}>
                        {tasks.length}
                    </h2>
                </div>
            </div>

            {/* Split Section: Recent Session & Actual Tasks */}
            <div className="quick-actions-flex" style={{ gap: '20px', marginTop: '24px', alignItems: 'flex-start' }}>

                {/* Latest Activity Card */}
                <div className="ui-card" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Latest Focus Session
                    </h3>
                    {sessions.length === 0 ? (
                        <p className="page-subtitle" style={{ marginTop: '16px' }}>No recorded sessions yet.</p>
                    ) : (
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e05638' }}>
                                ⏱ {sessions[0].duration}
                            </div>
                            <p className="task-meta" style={{ marginTop: '6px' }}>
                                Rating: {sessions[0].rating}/10 | Distractions: {sessions[0].distraction}
                            </p>
                            <span className="task-meta">
                                {new Date(sessions[0].created_at).toLocaleString([], {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Real Tasks from Database */}
                <div className="ui-card" style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Current Tasks
                    </h3>
                    {tasks.length === 0 ? (
                        <p className="page-subtitle" style={{ marginTop: '16px' }}>No tasks created yet.</p>
                    ) : (
                        <ul className="task-list-simple" style={{ marginTop: '12px' }}>
                            {tasks.slice(0, 5).map((t) => (
                                <li key={t.id} className="clean-task-item" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <span>• {t.title}</span>
                                    <span className="task-category-tag">{t.category}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
}