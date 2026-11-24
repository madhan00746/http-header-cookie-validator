import { useState, useEffect } from "react";

import { API } from "../config";
import { getDefaultStatsClient } from "../utils/clientValidators";

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/validation/stats`);
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (e) {
      setStats(getDefaultStatsClient());
    } finally {
      setLoading(false);
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <span className="welcome-tag">SECURITY MONITORING SYSTEM</span>
          <h2>Welcome to HeaderGuard</h2>
          <p>Validate HTTP headers, inspect cookies, and monitor session states in one unified platform.</p>
          <div className="welcome-actions">
            <button className="btn btn-primary" onClick={() => onNavigate("header")}>▶ Start Validating</button>
            <button className="btn btn-secondary" onClick={fetchStats}>↻ Refresh Stats</button>
          </div>
        </div>
        <div className="welcome-icon">⬡</div>
      </div>

      {/* Stats Section */}
      <h3 className="section-title">Platform Statistics</h3>

      {loading && (
        <div className="loading-spinner-wrap">
          <div className="loading-spinner"></div>
          <p>Loading statistics...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          ⚠ {error}
        </div>
      )}

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card blue">
              <p className="stat-label">Total Validations</p>
              <h2 className="stat-value">{stats.total ?? 0}</h2>
              <small className="stat-change">All time</small>
            </div>
            <div className="stat-card green">
              <p className="stat-label">Successful</p>
              <h2 className="stat-value">{stats.successful ?? 0}</h2>
              <small className="stat-change">Valid results</small>
            </div>
            <div className="stat-card red">
              <p className="stat-label">Failed</p>
              <h2 className="stat-value">{stats.failed ?? 0}</h2>
              <small className="stat-change">Invalid results</small>
            </div>
            <div className="stat-card orange">
              <p className="stat-label">Invalid Headers</p>
              <h2 className="stat-value">{stats.invalidHeaders ?? 0}</h2>
              <small className="stat-change">Request headers</small>
            </div>
            <div className="stat-card orange">
              <p className="stat-label">Invalid Response Headers</p>
              <h2 className="stat-value">{stats.invalidResponseHeaders ?? 0}</h2>
              <small className="stat-change">Response headers</small>
            </div>
            <div className="stat-card red">
              <p className="stat-label">Invalid Cookies</p>
              <h2 className="stat-value">{stats.invalidCookies ?? 0}</h2>
              <small className="stat-change">Cookie validations</small>
            </div>
            <div className="stat-card green">
              <p className="stat-label">Active Sessions</p>
              <h2 className="stat-value">{stats.activeSessions ?? 0}</h2>
              <small className="stat-change">FSM → Active</small>
            </div>
            <div className="stat-card orange">
              <p className="stat-label">Expired Sessions</p>
              <h2 className="stat-value">{stats.expiredSessions ?? 0}</h2>
              <small className="stat-change">FSM → Expired</small>
            </div>
            <div className="stat-card red">
              <p className="stat-label">Revoked Sessions</p>
              <h2 className="stat-value">{stats.revokedSessions ?? 0}</h2>
              <small className="stat-change">FSM → Revoked</small>
            </div>
          </div>

          {/* Recent Activity */}
          <h3 className="section-title" style={{ marginTop: "32px" }}>Recent Validation Activity</h3>
          <div className="panel">
            {stats.recent && stats.recent.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Input Name</th>
                    <th>Input Value</th>
                    <th>Result</th>
                    <th>Message</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent.map((item, idx) => (
                    <tr key={item._id || idx}>
                      <td><span className="type-badge">{item.type}</span></td>
                      <td>{item.input?.name || "—"}</td>
                      <td className="value-cell" title={item.input?.value}>{item.input?.value || "—"}</td>
                      <td>
                        <span className={`badge ${item.valid ? "badge-success" : "badge-error"}`}>
                          {item.valid ? "✓ Valid" : "✕ Invalid"}
                        </span>
                      </td>
                      <td className="msg-cell" title={item.message}>{item.message}</td>
                      <td className="time-cell">{timeAgo(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No validation history yet.</p>
                <small>Start validating headers, cookies, or sessions to see activity here.</small>
              </div>
            )}
          </div>
        </>
      )}

      {/* Quick Access */}
      <h3 className="section-title" style={{ marginTop: "32px" }}>Quick Access</h3>
      <div className="quick-grid">
        {[
          { id: "header",   icon: "⇄", title: "Request Header Validator",  desc: "Validate HTTP request headers using RFC 7230 rules." },
          { id: "response", icon: "⇢", title: "Response Header Validator", desc: "Check security headers in HTTP responses." },
          { id: "cookie",   icon: "◉", title: "Cookie Validator",          desc: "Validate cookie name and value syntax." },
          { id: "session",  icon: "◈", title: "Session Manager (FSM)",     desc: "Manage session lifecycle with Finite State Machine." },
        ].map((item) => (
          <button key={item.id} className="quick-card" onClick={() => onNavigate(item.id)}>
            <span className="quick-icon">{item.icon}</span>
            <div className="quick-info">
              <b>{item.title}</b>
              <small>{item.desc}</small>
            </div>
            <span className="quick-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
