import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [sessions, setSessions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:8000/sessions/').then((r) => r.json()),
      fetch('http://127.0.0.1:8000/tasks/').then((r) => r.json())
    ])
      .then(([sessionsData, tasksData]) => {
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching analytics data:", err);
        setLoading(false);
      });
  }, []);

  // Duration parser helper
  const parseSeconds = (durationStr) => {
    let secs = 0;
    const minMatch = durationStr?.match(/(\d+)m/);
    const secMatch = durationStr?.match(/(\d+)s/);
    if (minMatch) secs += parseInt(minMatch[1], 10) * 60;
    if (secMatch) secs += parseInt(secMatch[1], 10);
    return secs;
  };

  const formatDurationText = (totalSecs) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    if (mins > 0) return `${mins}m`;
    return `${totalSecs}s`;
  };

  // 1. Total & Average Focus Time
  const totalFocusSecs = sessions.reduce((acc, s) => acc + parseSeconds(s.duration), 0);
  const avgSessionSecs = sessions.length > 0 ? Math.round(totalFocusSecs / sessions.length) : 0;

  // 2. Average Productivity Rating (1 - 10)
  const avgRating = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + (s.rating || 0), 0) / sessions.length).toFixed(1)
    : '0.0';

  // 3. Task Completion Rate
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // 4. Best Focus Hour (hour of day with highest count)
  const hourCounts = {};
  sessions.forEach((s) => {
    if (s.created_at) {
      const hour = new Date(s.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  const bestHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const formatHourString = (hour) => {
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:00 ${suffix}`;
  };
  const bestFocusHour = bestHourEntry ? formatHourString(bestHourEntry[0]) : 'None';

  // 5. Weekly Distribution (Past 7 Days)
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      name: daysOfWeek[d.getDay()],
      dateStr: d.toDateString(),
      secs: 0
    };
  });

  sessions.forEach((s) => {
    if (s.created_at) {
      const sDateStr = new Date(s.created_at).toDateString();
      const match = past7Days.find((d) => d.dateStr === sDateStr);
      if (match) match.secs += parseSeconds(s.duration);
    }
  });

  const maxDaySecs = Math.max(...past7Days.map((d) => d.secs), 1);

  // 6. Recent Distraction Insights
  const recentDistractions = sessions
    .filter((s) => s.distraction && s.distraction.toLowerCase() !== 'none')
    .map((s) => s.distraction)
    .slice(0, 6);

  if (loading) {
    return <div className="empty-state">Loading focus analytics...</div>;
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1 className="analytics-title">Focus Analytics</h1>
        <p className="analytics-subtitle">Deep dive into your session productivity, habits, and execution rates.</p>
      </div>

      {/* 4 Metric Top Row */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Completed Sessions</div>
          <div className="kpi-value">{sessions.length}</div>
          <div className="kpi-subtext">Total pomodoros</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Avg Session Length</div>
          <div className="kpi-value">{formatDurationText(avgSessionSecs)}</div>
          <div className="kpi-subtext">{formatDurationText(totalFocusSecs)} total time</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Avg Focus Rating</div>
          <div className="kpi-value">{avgRating} <span className="kpi-total-divider">/ 10</span></div>
          <div className="kpi-subtext highlight">Self-evaluation score</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Peak Focus Window</div>
          <div className="kpi-value" style={{ fontSize: '1.8rem' }}>{bestFocusHour}</div>
          <div className="kpi-subtext">Most frequent focus hour</div>
        </div>
      </div>

      {/* Breakdown Grid: Weekly Trends & Task/Distraction Insights */}
      <div className="analytics-details-grid">
        
        {/* Past 7 Days Activity */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Weekly Focus Volume</h2>
            <span className="badge-pill">Past 7 Days</span>
          </div>

          <div className="weekly-chart">
            {past7Days.map((day, idx) => (
              <div key={idx} className="chart-bar-row">
                <span className="chart-bar-label">{day.name}</span>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{ width: `${(day.secs / maxDaySecs) * 100}%` }}
                  />
                </div>
                <span className="chart-bar-value">{formatDurationText(day.secs)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution & Habit Quality */}
        <div className="panel-card">
          <div className="panel-header">
            <h2 className="panel-title">Execution & Distractions</h2>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Task Completion Rate</span>
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{completionRate}% ({completedTasks}/{tasks.length})</strong>
            </div>
            <div className="chart-bar-track" style={{ height: '10px' }}>
              <div
                className="chart-bar-fill"
                style={{
                  width: `${completionRate}%`,
                  background: '#10b981'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
              Recent Logged Distractions
            </span>

            {recentDistractions.length === 0 ? (
              <p className="page-subtitle" style={{ marginTop: '10px' }}>
                Zero logged distractions! High focus maintained.
              </p>
            ) : (
              <div className="distraction-tag-group">
                {recentDistractions.map((item, index) => (
                  <span key={index} className="distraction-chip">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}