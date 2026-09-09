import { useState } from 'react';

export default function SessionLogger() {
    const [distraction, setDistraction] = useState('');
    const [rating, setRating] = useState('5');
    const [logs, setLogs] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!distraction.trim()) return;

        const newLog = {
            id: Date.now(),
            distraction,
            rating
        };

        setLogs([newLog, ...logs]);
        setDistraction('');
        setRating('5');
    };

    return (
        <div className="session-card">
            <h2>Log Focus Session</h2>
            <form onSubmit={handleSubmit} className="session-form">
                <input
                    type="text"
                    placeholder="Any distractions? (e.g., checked phone, email)"
                    value={distraction}
                    onChange={(e) => setDistraction(e.target.value)}
                    className="task-input"
                />
                <div className="rating-row">
                    <label className="rating-label">Productive Rating (1-10):</label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)} className="task-select">
                        {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="timer-btn start session-submit-btn">Log Session</button>
            </form>

            {logs.length > 0 && (
                <div className="logs-container">
                    <h3 className="logs-title">Recent Session Logs:</h3>
                    <ul className="task-list">
                        {logs.map(log => (
                            <li key={log.id} className="task-item">
                                <span>Distraction: {log.distraction}</span>
                                <span className="task-meta">Rating: {log.rating}/10</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}