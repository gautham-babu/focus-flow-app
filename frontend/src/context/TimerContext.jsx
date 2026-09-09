import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const TimerContext = createContext(null);

const DEFAULT_POMODORO = 25 * 60; // 25 minutes
const STORAGE_KEY = 'focus_flow_timer_state_v1';

export const formatDurationString = (totalSecs) => {
  const secs = Math.max(0, Math.round(totalSecs));
  const hours = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  const remainingSecs = secs % 60;

  if (hours > 0) {
    if (mins > 0 && remainingSecs > 0) return `${hours}h ${mins}m ${remainingSecs}s`;
    if (mins > 0) return `${hours}h ${mins}m`;
    return `${hours}h`;
  }
  if (mins > 0) {
    if (remainingSecs > 0) return `${mins}m ${remainingSecs}s`;
    return `${mins}m`;
  }
  return `${remainingSecs}s`;
};

const playCompletionChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play a friendly two-tone notification
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.2); // E5
    gain2.gain.setValueAtTime(0.15, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.7);
  } catch (err) {
    console.log('Audio playback prevented or unsupported:', err);
  }
};

export function TimerProvider({ children }) {
  // Load initial state from localStorage if available
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // If it was actively running, calculate actual remaining time based on timestamp
        if (parsed.isActive && parsed.endTime) {
          const remaining = Math.round((parsed.endTime - Date.now()) / 1000);
          if (remaining <= 0) {
            return {
              ...parsed,
              isActive: false,
              timeLeft: 0,
              endTime: null,
              completedSeconds: parsed.totalTime,
              showModal: true,
            };
          }
          return {
            ...parsed,
            timeLeft: remaining,
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved timer state:', e);
    }
    return {
      mode: 'pomodoro',
      totalTime: DEFAULT_POMODORO,
      timeLeft: DEFAULT_POMODORO,
      isActive: false,
      endTime: null,
      customMinutes: 25,
      showModal: false,
      completedSeconds: 0,
      rating: 8,
      distraction: 'None',
    };
  };

  const initial = getInitialState();

  const [mode, setMode] = useState(initial.mode);
  const [totalTime, setTotalTime] = useState(initial.totalTime);
  const [timeLeft, setTimeLeft] = useState(initial.timeLeft);
  const [isActive, setIsActive] = useState(initial.isActive);
  const [endTime, setEndTime] = useState(initial.endTime);
  const [customMinutes, setCustomMinutes] = useState(initial.customMinutes);
  const [showModal, setShowModal] = useState(initial.showModal);
  const [completedSeconds, setCompletedSeconds] = useState(initial.completedSeconds);
  const [rating, setRating] = useState(initial.rating);
  const [distraction, setDistraction] = useState(initial.distraction);
  const [sessions, setSessions] = useState([]);

  const timerRef = useRef(null);

  // Fetch session history
  const fetchSessions = useCallback(() => {
    fetch('http://127.0.0.1:8000/sessions/')
      .then((res) => res.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Error fetching sessions:', err));
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Handle natural session completion
  const triggerSessionComplete = useCallback((elapsed) => {
    setIsActive(false);
    setEndTime(null);
    clearInterval(timerRef.current);
    setCompletedSeconds(elapsed > 0 ? elapsed : totalTime);
    setShowModal(true);
    playCompletionChime();
  }, [totalTime]);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          totalTime,
          timeLeft,
          isActive,
          endTime,
          customMinutes,
          showModal,
          completedSeconds,
          rating,
          distraction,
        })
      );
    } catch (e) {
      console.warn('Failed to persist timer state:', e);
    }
  }, [mode, totalTime, timeLeft, isActive, endTime, customMinutes, showModal, completedSeconds, rating, distraction]);

  // Sync timer countdown with actual timestamps
  useEffect(() => {
    if (isActive && endTime) {
      const tick = () => {
        const remaining = Math.round((endTime - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          triggerSessionComplete(totalTime);
        } else {
          setTimeLeft(remaining);
        }
      };

      tick(); // Run immediately
      timerRef.current = setInterval(tick, 1000);

      // Instantly sync when switching back to this tab
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          tick();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        clearInterval(timerRef.current);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      clearInterval(timerRef.current);
    }
  }, [isActive, endTime, totalTime, triggerSessionComplete]);

  // Update Document Title with live countdown
  useEffect(() => {
    if (isActive) {
      const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
      const s = (timeLeft % 60).toString().padStart(2, '0');
      document.title = `(${m}:${s}) Focus Flow`;
    } else {
      document.title = 'Focus Flow - Productivity & Pomodoro';
    }
  }, [isActive, timeLeft]);

  // Controls
  const handleStart = () => {
    const targetEnd = Date.now() + timeLeft * 1000;
    setEndTime(targetEnd);
    setIsActive(true);
  };

  const handlePause = () => {
    if (isActive && endTime) {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
    setIsActive(false);
    setEndTime(null);
    clearInterval(timerRef.current);
  };

  const handleContinue = () => {
    const targetEnd = Date.now() + timeLeft * 1000;
    setEndTime(targetEnd);
    setIsActive(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setEndTime(null);
    clearInterval(timerRef.current);
    setTimeLeft(totalTime);
  };

  const handleModeSwitch = (newMode) => {
    setIsActive(false);
    setEndTime(null);
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
        setEndTime(null);
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

  const handleEndSessionEarly = () => {
    setIsActive(false);
    setEndTime(null);
    clearInterval(timerRef.current);
    const elapsed = timeLeft === 0 ? totalTime : Math.max(1, totalTime - timeLeft);
    setCompletedSeconds(elapsed);
    setShowModal(true);
  };

  const handleSaveSession = async (e) => {
    e.preventDefault();
    const durationText = formatDurationString(completedSeconds);

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

  return (
    <TimerContext.Provider
      value={{
        mode,
        totalTime,
        timeLeft,
        isActive,
        customMinutes,
        showModal,
        setShowModal,
        completedSeconds,
        rating,
        setRating,
        distraction,
        setDistraction,
        sessions,
        fetchSessions,
        handleStart,
        handlePause,
        handleContinue,
        handleReset,
        handleModeSwitch,
        handleCustomTimeChange,
        handleCustomTimeBlur,
        handleEndSessionEarly,
        handleSaveSession,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
