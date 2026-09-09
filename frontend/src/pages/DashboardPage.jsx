import { Link } from 'react-router-dom';

export default function DashboardPage() {
    return (
        <div>
            {/* Header Section */}
            <div className="dashboard-header">
                <div>
                    <h2>Good morning</h2>
                    <p className="text-subtitle">Here's your focus overview for today.</p>
                </div>
                <Link to="/tasks" className="btn-primary">+ New Task</Link>
            </div>

            {/* Top Overview Stats */}
            <div className="overview-stats">
                <div className="stat-box">
                    <div className="stat-label">Today's Focus</div>
                    <div className="stat-value">2h 15m</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Pomodoros</div>
                    <div className="stat-value">6 / 8</div>
                </div>
                <div className="stat-box">
                    <div className="stat-label">Tasks Completed</div>
                    <div className="stat-value">4 / 7</div>
                </div>
            </div>

            {/* Middle Grid: Session and Tasks */}
            <div className="dashboard-grid">

                {/* Current Session */}
                <div className="dashboard-card">
                    <h3>CURRENT SESSION</h3>
                    <div className="timer-large">🔵 24:32</div>
                    <p className="text-subtitle">Website redesign</p>
                    <div className="quick-actions-flex">
                        <Link to="/timer" className="timer-btn pause action-link-btn">Pause</Link>
                        <Link to="/timer" className="timer-btn reset action-link-btn">Reset</Link>
                    </div>
                </div>

                {/* Today's Tasks */}
                <div className="dashboard-card">
                    <h3>TODAY'S TASKS</h3>
                    <ul className="task-list-simple">
                        <li><span>✓</span> <strike>Finish homepage</strike></li>
                        <li><span>○</span> Study React</li>
                        <li><span>○</span> Fix login bug</li>
                        <li><span>○</span> Gym</li>
                    </ul>
                    <Link to="/tasks" className="view-all-link">View all →</Link>
                </div>
            </div>

            {/* Bottom Chart: Focus This Week */}
            <div className="dashboard-card">
                <h3>Focus this week</h3>
                <div className="bar-chart">
                    <div className="bar-row">
                        <div className="bar-label">Mon</div>
                        <div className="bar-fill w-40"></div>
                    </div>
                    <div className="bar-row">
                        <div className="bar-label">Tue</div>
                        <div className="bar-fill w-60"></div>
                    </div>
                    <div className="bar-row">
                        <div className="bar-label">Wed</div>
                        <div className="bar-fill w-30"></div>
                    </div>
                    <div className="bar-row">
                        <div className="bar-label">Thu</div>
                        <div className="bar-fill w-70"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}