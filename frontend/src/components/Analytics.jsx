export default function Analytics() {
  // Mock analytics data matching project requirements
  const stats = {
    completedPomodoros: 4,
    avgSessionLength: "25 mins",
    bestFocusHour: "10:00 AM"
  };

  return (
    <div className="analytics-card">
      <h2>Focus Analytics</h2>
      <div className="analytics-grid">
        <div className="stat-box">
          <div className="stat-label">Completed Pomodoros</div>
          <div className="stat-value">{stats.completedPomodoros}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Avg Session Length</div>
          <div className="stat-value">{stats.avgSessionLength}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Best Focus Hour</div>
          <div className="stat-value">{stats.bestFocusHour}</div>
        </div>
      </div>
    </div>
  );
}