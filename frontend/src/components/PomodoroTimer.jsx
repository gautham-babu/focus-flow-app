import { useState, useEffect, useRef } from 'react';

const DEFAULT_POMODORO = 25 * 60; // 25 minutes

export default function TimerPage() {
  const [mode, setMode] = useState('pomodoro');
  const [totalTime, setTotalTime] = useState(DEFAULT_POMODORO);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_POMODORO);
  const [isActive, setIsActive] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(25);

  // Session Reflection Modal
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(8);
  const [distraction, setDistraction] = useState('None');
  const [completedSeconds, setCompletedSeconds] = useState(0);

  // Persistent History
  const [sessions, setSessions] = useState([]);

  const timerRef = useRef(null);

  const fetchSessions = () => {
    fetch('http://127.0.0.1:8000/sessions/')
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching sessions:', err));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Timer Countdown Engine
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleSessionComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
  };

  const handleContinue = () => {
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setTimeLeft(totalTime);
  };

  const handleModeSwitch = (newMode) => {
    setIsActive(false);
    clearInterval(timerRef.current);
    setMode(newMode);
    const parsedMins = parseInt(customMinutes, 10) || 25;
    const secs = newMode === 'pomodoro' ? DEFAULT_POMODORO : parsedMins * 60;
    setTotalTime(secs);
    setTimeLeft(secs);
  };

  const handleCustomTimeChange = (mins) => {
    setCustomMinutes(mins);

    const parsed = parseInt(mins, 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (mode === 'timer') {
        setIsActive(false);
        setTotalTime(parsed * 60);
        setTimeLeft(parsed * 60);
      }
    }
  };

  const handleCustomTimeBlur = () => {
    const parsed = parseInt(customMinutes, 10);
    const fallback = !isNaN(parsed) && parsed > 0 ? parsed : 1;
    setCustomMinutes(fallback);
    if (mode === 'timer') {
      setTotalTime(fallback * 60);
      setTimeLeft(fallback * 60);
    }
  };

  const handleSessionComplete = () => {
    setIsActive(false);
    clearInterval(timerRef.current);
    const elapsed = totalTime - timeLeft || totalTime;
    setCompletedSeconds(elapsed);
    setShowModal(true);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    const durationText = `${Math.ceil(completedSeconds / 60)}m`;

    try {
      const res = await fetch('http://127.0.0.1:8000/sessions/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration: durationText,
          rating: Number(rating),
          distraction: distraction.trim() || 'None',
        }),
      });

      if (res.ok) {
        setShowModal(false);
        handleReset();
        fetchSessions();
      }
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  // Circular Dial Progress calculation
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - timeLeft / totalTime);

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="timer-page-container">
      {/* 1. Pomodoro Timer Box */}
      <div className="circular-timer-card">

        {/* Switcher Pill */}
        <div className="timer-mode-switcher">
          <button
            type="button"
            className={`mode-btn ${mode === 'pomodoro' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('pomodoro')}
          >
            ⏱ Pomodoro
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'timer' ? 'active' : ''}`}
            onClick={() => handleModeSwitch('timer')}
          >
            ⏲ Timer
          </button>
        </div>

        {mode === 'timer' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Duration:</span>
            <input
              type="number"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => handleCustomTimeChange(e.target.value)}
              onBlur={handleCustomTimeBlur}
              className="task-input"
              style={{ width: '80px', padding: '4px 8px' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>minutes</span>
          </div>
        )}

        {/* Circular Dial Display */}
        <div className="timer-dial-wrapper">
          <svg className="dial-svg" viewBox="0 0 240 240">
            <circle
              className="dial-track"
              cx="120"
              cy="120"
              r={radius}
            />
            <circle
              className="dial-progress"
              cx="120"
              cy="120"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>

          <div className="dial-content">
            <div className="dial-time-text">{formatTime(timeLeft)}</div>
            <div className="dial-status-text">
              {isActive ? 'FOCUSING' : timeLeft === totalTime ? 'READY TO FOCUS' : 'PAUSED'}
            </div>
          </div>
        </div>

        {/* Controls: Start / Pause / Continue / End / Reset */}
        <div className="timer-action-group">
          {/* IDLE: Not started yet */}
          {!isActive && timeLeft === totalTime && (
            <button type="button" className="btn-lime-start" onClick={handleStart}>
              ▶ Start
            </button>
          )}

          {/* RUNNING: Active ticking */}
          {isActive && (
            <>
              <button type="button" className="btn-amber-pause" onClick={handlePause}>
                ⏸ Pause
              </button>
              <button type="button" className="btn-red-end" onClick={handleSessionComplete}>
                ⏹ End
              </button>
            </>
          )}

          {/* PAUSED: In-progress but stopped */}
          {!isActive && timeLeft < totalTime && timeLeft > 0 && (
            <>
              <button type="button" className="btn-lime-start" onClick={handleContinue}>
                ▶ Continue
              </button>
              <button type="button" className="btn-red-end" onClick={handleSessionComplete}>
                ⏹ End
              </button>
            </>
          )}

          {/* Reset Action */}
          <button type="button" className="btn-reset-round" onClick={handleReset} title="Reset Timer">
            ↺
          </button>
        </div>
      </div>

      {/* 2. Separate Session History Box */}
      <div className="panel-card">
        <div className="panel-header">
          <h2 className="panel-title">Session History</h2>
          <span className="badge-pill">{sessions.length} Logged</span>
        </div>

        {sessions.length === 0 ? (
          <div className="empty-state">No focus sessions completed yet.</div>
        ) : (
          <ul className="task-items-list">
            {sessions.map((s) => (
              <li key={s.id} className="task-board-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '1.2rem' }}>⏱</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#0f172a' }}>
                      {s.duration} focus
                    </div>
                    <div className="session-date">
                      {new Date(s.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="badge-category">Rating: {s.rating}/10</span>
                  <span
                    className={s.distraction === 'None' ? 'session-note-clean' : 'session-note-distracted'}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {s.distraction === 'None' ? 'No distractions' : s.distraction}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Session Reflection Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div className="panel-card" style={{ width: '90%', maxWidth: '440px' }}>
            <h2 className="panel-title" style={{ marginBottom: '12px' }}>Session Reflection</h2>
            <p className="dashboard-subtitle" style={{ marginBottom: '16px' }}>
              Logged ~{Math.ceil(completedSeconds / 60)} min session. How was your focus?
            </p>

            <form onSubmit={handleSaveSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="rating-label">Focus Rating (1 - 10): {rating}</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div>
                <label className="rating-label">Any distractions?</label>
                <input
                  type="text"
                  placeholder="e.g. phone, noisy room, None"
                  value={distraction}
                  onChange={(e) => setDistraction(e.target.value)}
                  className="task-input"
                  style={{ width: '100%', marginTop: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Save Session
                </button>
                <button
                  type="button"
                  className="btn-reset-round"
                  style={{ borderRadius: '6px', width: 'auto', padding: '0 16px' }}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}