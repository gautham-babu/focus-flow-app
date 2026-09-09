import { useState, useEffect } from 'react';

export default function PomodoroTimer() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let timer = null;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            alert("Pomodoro session completed!");
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="timer-card">
            <h2>Pomodoro Timer</h2>
            <div className="timer-display">
                {formatTime(timeLeft)}
            </div>
            <div className="timer-buttons">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`timer-btn ${isRunning ? 'pause' : 'start'}`}
                >
                    {isRunning ? 'Pause' : 'Start'}
                </button>
                <button
                    onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                    className="timer-btn reset"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}