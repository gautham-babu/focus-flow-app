import { useState, useEffect } from 'react';

export default function PomodoroTimer() {
    const [selectedMinutes, setSelectedMinutes] = useState('25');
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [hasSessionStarted, setHasSessionStarted] = useState(false);

    const [showLogForm, setShowLogForm] = useState(false);
    const [pendingDuration, setPendingDuration] = useState('');

    const [distraction, setDistraction] = useState('');
    const [rating, setRating] = useState(5);

    const [sessionHistory, setSessionHistory] = useState([]);

    useEffect(() => {
        fetch('http://127.0.0.1:8000/sessions/')
            .then((res) => res.json())
            .then((data) => setSessionHistory(data))
            .catch((err) => console.error("Error fetching sessions:", err));
    }, []);

    const parsedMinutes = parseInt(selectedMinutes, 10);
    const isValidDuration = !isNaN(parsedMinutes) && parsedMinutes >= 1;
    const totalSessionSeconds = (isValidDuration ? parsedMinutes : 1) * 60;

    // Handle typing: allow raw input without modifying state behind the scenes
    const handleMinutesChange = (e) => {
        const val = e.target.value;
        setSelectedMinutes(val);

        const parsed = parseInt(val, 10);
        if (!isNaN(parsed) && parsed >= 1) {
            setTimeLeft(parsed * 60);
        } else {
            setTimeLeft(0);
        }
    };

    const formatDurationText = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    // Countdown timer
    useEffect(() => {
        let interval = null;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            setHasSessionStarted(false);
            setPendingDuration(formatDurationText(totalSessionSeconds));
            setShowLogForm(true);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft, totalSessionSeconds]);

    const handleStartResume = () => {
        if (!hasSessionStarted && !isValidDuration) {
            return;
        }
        setHasSessionStarted(true);
        setIsActive(true);
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleStop = () => {
        const elapsedSeconds = totalSessionSeconds - timeLeft;
        setIsActive(false);
        setHasSessionStarted(false);

        if (elapsedSeconds > 0) {
            setPendingDuration(formatDurationText(elapsedSeconds));
            setShowLogForm(true);
        } else {
            setTimeLeft(totalSessionSeconds);
        }
    };

    const handleReset = () => {
        setIsActive(false);
        setHasSessionStarted(false);
        setShowLogForm(false);
        if (isValidDuration) {
            setTimeLeft(parsedMinutes * 60);
        } else {
            setSelectedMinutes('25');
            setTimeLeft(25 * 60);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            duration: pendingDuration,
            distraction: distraction.trim() || "None",
            rating: parseInt(rating, 10)
        };

        try {
            const res = await fetch('http://127.0.0.1:8000/sessions/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const newSession = await res.json();

            setSessionHistory((prev) => [newSession, ...prev]);

            setShowLogForm(false);
            setDistraction('');
            setRating(5);
            const parsed = parseInt(selectedMinutes, 10) || 25;
            setTimeLeft(parsed * 60);
        } catch (err) {
            console.error("Error saving session log:", err);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const timerButtonLabel = isActive ? 'Pause' : hasSessionStarted ? 'Resume' : 'Start';
    const isStartDisabled = !hasSessionStarted && !isValidDuration;

    return (
        <div className="ui-card timer-card">
            <h2>Pomodoro Timer</h2>

            {!hasSessionStarted && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <label style={{ fontSize: '0.95rem', color: '#64748b' }}>Duration (mins):</label>
                        <input
                            type="number"
                            min="1"
                            max="180"
                            value={selectedMinutes}
                            onChange={handleMinutesChange}
                            placeholder="e.g. 25"
                            style={{
                                width: '85px',
                                padding: '6px 10px',
                                textAlign: 'center',
                                borderRadius: '6px',
                                border: !isValidDuration ? '1px solid #ef4444' : '1px solid #cbd5e1',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {!isValidDuration && (
                        <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                            Enter at least 1 minute to start
                        </span>
                    )}
                </div>
            )}

            <div className="timer-display">{formatTime(timeLeft)}</div>

            <div className="timer-buttons">
                <button
                    className={`timer-btn ${isActive ? 'pause' : 'start'}`}
                    onClick={isActive ? handlePause : handleStartResume}
                    disabled={isStartDisabled}
                    style={{
                        opacity: isStartDisabled ? 0.5 : 1,
                        cursor: isStartDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    {timerButtonLabel}
                </button>

                {hasSessionStarted && (
                    <>
                        <button className="timer-btn stop" onClick={handleStop}>Stop</button>
                        <button className="timer-btn reset" onClick={handleReset}>Reset</button>
                    </>
                )}
            </div>

            {/* Log Session Form */}
            {showLogForm && (
                <div className="history-container">
                    <h3>Log Completed Session ({pendingDuration})</h3>
                    <form onSubmit={handleLogSubmit} className="session-form mt-15">
                        <input
                            type="text"
                            placeholder="Any distractions? (e.g., checked phone, email)"
                            value={distraction}
                            onChange={(e) => setDistraction(e.target.value)}
                            className="task-input"
                        />
                        <div className="rating-row">
                            <label className="rating-label">Productivity Rating (1-10):</label>
                            <select
                                value={rating}
                                onChange={(e) => setRating(e.target.value)}
                                className="task-select"
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn-primary mt-15">Save Session Log</button>
                    </form>
                </div>
            )}

            {/* Session History */}
            <div className="history-container">
                <h3 className="logs-title">Session History</h3>
                {sessionHistory.length === 0 ? (
                    <p className="page-subtitle" style={{ textAlign: 'center', marginTop: '10px' }}>
                        No sessions completed yet.
                    </p>
                ) : (
                    <ul className="task-list mt-15">
                        {sessionHistory.map((s) => (
                            <li key={s.id} className="clean-task-item">
                                <div>
                                    <strong>⏱ {s.duration} Focus Session</strong>
                                    <div className="task-meta">
                                        Distractions: {s.distraction} | Rating: {s.rating}/10
                                    </div>
                                </div>
                                <span className="task-meta">
                                    {new Date(s.created_at).toLocaleString([], {
                                        dateStyle: 'short',
                                        timeStyle: 'short'
                                    })}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}