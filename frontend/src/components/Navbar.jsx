import { NavLink } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';

export default function Navbar() {
  const { isActive, timeLeft } = useTimer();

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⏱</span>
        <span>Focus Flow</span>
      </div>
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/timer" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            Timer
            {isActive && (
              <span className="nav-timer-badge">
                {formatTime(timeLeft)}
              </span>
            )}
          </span>
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Task Board
        </NavLink>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Analytics
        </NavLink>
      </div>
    </nav>
  );
}