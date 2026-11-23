import { useState } from "react";

import { API } from "../config";

const STATES = ["Issued", "Active", "Expired", "Revoked"];
const EVENTS = ["ACTIVATE", "VALID_REQUEST", "EXPIRE", "REVOKE"];

const STATE_CONFIG = {
  Issued: { color: "#3b9eff", bg: "rgba(59,158,255,0.12)", border: "#3b9eff", label: "Issued", desc: "Session created, awaiting activation." },
  Active: { color: "#22c97d", bg: "rgba(34,201,125,0.12)", border: "#22c97d", label: "Active", desc: "Session active and accepting requests." },
  Expired: { color: "#f5a623", bg: "rgba(245,166,35,0.12)", border: "#f5a623", label: "Expired", desc: "Session timed out (Terminal State)." },
  Revoked: { color: "#ff4c6a", bg: "rgba(255,76,106,0.12)", border: "#ff4c6a", label: "Revoked", desc: "Session revoked by user/admin (Terminal State)." },
};

const ALLOWED_TRANSITIONS = {
  Issued: ["ACTIVATE", "REVOKE"],
  Active: ["VALID_REQUEST", "EXPIRE", "REVOKE"],
  Expired: [],
  Revoked: [],
};

export default function SessionManager() {
  const [currentState, setCurrentState] = useState("Issued");
  const [event, setEvent] = useState("ACTIVATE");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionHistory, setSessionHistory] = useState([
    { id: 1, from: "—", event: "INITIALIZE", to: "Issued", success: true, time: new Date().toLocaleTimeString() }
  ]);

  async function handleTransition() {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API}/api/validation/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentState, event }),
      });
      const data = await res.json();
      setResult(data);

      const success = data.success ?? (data.state && data.state !== currentState);
      const nextState = data.toState || data.state;

      if (success && nextState) {
        setCurrentState(nextState);
        // Automatically adjust default event based on new state
        const allowed = ALLOWED_TRANSITIONS[nextState] || [];
        if (allowed.length > 0) {
          setEvent(allowed[0]);
        }
      }

      setSessionHistory((prev) => [
        {
          id: Date.now(),
          from: currentState,
          event: event,
          to: nextState || "Unchanged",
          success: Boolean(data.success),
          message: data.message,
          time: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
    } catch (e) {
      setError("Cannot connect to backend server on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  function resetSession() {
    setCurrentState("Issued");
    setEvent("ACTIVATE");
    setResult(null);
    setError(null);
    setSessionHistory([
      { id: Date.now(), from: "—", event: "RESET", to: "Issued", success: true, time: new Date().toLocaleTimeString() }
    ]);
  }

  const validEventsForCurrent = ALLOWED_TRANSITIONS[currentState] || [];
  const isTerminal = currentState === "Expired" || currentState === "Revoked";

  return (
    <div className="page-layout">
      {/* Controls & State Transition */}
      <div className="form-panel">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">FSM Session State Machine</h3>
            <button className="btn btn-secondary btn-sm" onClick={resetSession}>
              ↻ Reset to Issued
            </button>
          </div>
          <p className="panel-desc">
            Model session lifecycle using Finite State Automata. Transitions are strictly validated against the state machine graph and logged to MongoDB.
          </p>

          {/* Current State Highlight */}
          <div
            className="session-current-card"
            style={{
              padding: "18px 20px",
              borderRadius: "10px",
              background: STATE_CONFIG[currentState].bg,
              border: `1.5px solid ${STATE_CONFIG[currentState].border}`,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span style={{ fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8292a6" }}>
                CURRENT ACTIVE STATE
              </span>
              <h2 style={{ color: STATE_CONFIG[currentState].color, margin: "4px 0", fontSize: "26px", fontWeight: "700" }}>
                {currentState}
              </h2>
              <p style={{ margin: 0, fontSize: "12px", color: "#a2afc2" }}>{STATE_CONFIG[currentState].desc}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                className={`badge ${isTerminal ? "badge-error" : "badge-success"}`}
                style={{ fontSize: "12px", padding: "6px 12px" }}
              >
                {isTerminal ? "Terminal State" : "Transitionable"}
              </span>
            </div>
          </div>

          {/* State & Event Selector */}
          <div className="form-group">
            <label className="form-label">CURRENT STATE (SIMULATION OVERRIDE)</label>
            <select
              className="form-select"
              value={currentState}
              onChange={(e) => {
                setCurrentState(e.target.value);
                setResult(null);
                const allowed = ALLOWED_TRANSITIONS[e.target.value] || [];
                if (allowed.length > 0) setEvent(allowed[0]);
              }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s} {s === "Expired" || s === "Revoked" ? "(Terminal)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">TRANSITION EVENT</label>
            <select
              className="form-select"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
            >
              {EVENTS.map((ev) => {
                const isValidForNow = validEventsForCurrent.includes(ev);
                return (
                  <option key={ev} value={ev}>
                    {ev} {isValidForNow ? "✔ (Valid transition)" : "✖ (Invalid transition test)"}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Quick Event Trigger Buttons */}
          <div style={{ marginBottom: "20px" }}>
            <span className="examples-title">APPLY EVENT TO CURRENT STATE</span>
            <div className="examples-grid" style={{ marginTop: "8px" }}>
              {EVENTS.map((ev) => {
                const isValid = validEventsForCurrent.includes(ev);
                return (
                  <button
                    key={ev}
                    className="example-btn"
                    style={{
                      borderLeft: isValid ? "3px solid #22c97d" : "3px solid #ff4c6a",
                      opacity: isValid ? 1 : 0.7,
                    }}
                    onClick={() => {
                      setEvent(ev);
                    }}
                  >
                    <span>{ev}</span>
                    <small>{isValid ? "Allowed" : "Will trigger rejection"}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: "14px", fontSize: "15px" }}
            onClick={handleTransition}
            disabled={loading}
          >
            {loading ? "Evaluating Transition..." : `▶ Execute: (${currentState}) + [${event}]`}
          </button>
        </div>

        {/* Live Session Timeline */}
        <div className="panel" style={{ marginTop: "24px" }}>
          <h4 style={{ marginBottom: "12px", fontSize: "14px", letterSpacing: "1px", color: "#8292a6" }}>
            LOCAL TRANSITION RUNTIME LOG
          </h4>
          <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessionHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#0d1828",
                  borderRadius: "8px",
                  borderLeft: item.success ? "3px solid #22c97d" : "3px solid #ff4c6a",
                  fontSize: "12px",
                }}
              >
                <div>
                  <span style={{ color: "#a2afc2" }}>{item.from}</span>
                  <span style={{ color: "#00d4ff", margin: "0 8px" }}>—[{item.event}]→</span>
                  <strong style={{ color: item.success ? "#22c97d" : "#ff4c6a" }}>{item.to}</strong>
                </div>
                <span style={{ color: "#66758a", fontSize: "11px" }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result Panel & Visual Diagram */}
      <div className="result-panel">
        {error && <div className="alert alert-error">{error}</div>}

        {result && (
          <div className={`result-box ${result.success ? "success" : "error"}`}>
            <div className="result-header">
              <span className={`result-status ${result.success ? "green" : "red"}`}>
                {result.success ? "✓ TRANSITION GRANTED" : "✕ TRANSITION REJECTED"}
              </span>
              <span className="result-timestamp">{new Date().toLocaleTimeString()}</span>
            </div>

            <p className="result-message" style={{ fontSize: "14px", marginTop: "10px" }}>
              {result.message}
            </p>

            <div className="result-input" style={{ marginTop: "14px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "#8292a6", fontSize: "11px", display: "block" }}>FROM STATE</span>
                  <code>{result.fromState || currentState}</code>
                </div>
                <div>
                  <span style={{ color: "#8292a6", fontSize: "11px", display: "block" }}>EVENT APPLIED</span>
                  <code style={{ color: "#00d4ff" }}>{event}</code>
                </div>
                <div>
                  <span style={{ color: "#8292a6", fontSize: "11px", display: "block" }}>NEW STATE</span>
                  <code style={{ color: result.success ? "#22c97d" : "#ff4c6a" }}>
                    {result.toState || result.state || currentState}
                  </code>
                </div>
                <div>
                  <span style={{ color: "#8292a6", fontSize: "11px", display: "block" }}>PERSISTED IN MONGODB</span>
                  <code style={{ color: "#3b9eff" }}>{result.id ? `ID: ${result.id.slice(-6)}` : "Saved"}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State Machine Visualizer */}
        <div className="panel" style={{ marginTop: result ? "24px" : "0" }}>
          <div className="panel-header">
            <h3 className="panel-title">Finite State Automaton Graph</h3>
            <span className="tag">FSM FORMAL SPEC</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "14px",
              margin: "18px 0",
            }}
          >
            {STATES.map((s) => {
              const isCurrent = currentState === s;
              const cfg = STATE_CONFIG[s];
              return (
                <div
                  key={s}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: isCurrent ? cfg.bg : "#0c1524",
                    border: isCurrent ? `2px solid ${cfg.border}` : "1px solid #1a273b",
                    boxShadow: isCurrent ? `0 0 16px ${cfg.bg}` : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4 style={{ color: cfg.color, margin: 0, fontSize: "16px" }}>{s}</h4>
                    {isCurrent && (
                      <span className="badge badge-success" style={{ fontSize: "10px" }}>
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "11px", color: "#8292a6", margin: "8px 0 10px" }}>{cfg.desc}</p>
                  <div style={{ fontSize: "11px" }}>
                    <span style={{ color: "#66758a" }}>Transitions: </span>
                    <strong style={{ color: "#c2ccda" }}>
                      {ALLOWED_TRANSITIONS[s].length > 0 ? ALLOWED_TRANSITIONS[s].join(", ") : "None (Terminal)"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="panel info-panel" style={{ marginTop: "16px", background: "#0a1220" }}>
            <h4>Automata Mathematical Model</h4>
            <p style={{ fontSize: "12px", color: "#8292a6", lineHeight: "1.6" }}>
              Formal definition: <code>M = (Q, Σ, δ, q₀, F)</code><br />
              • Q = &#123;Issued, Active, Expired, Revoked&#125;<br />
              • Σ = &#123;ACTIVATE, VALID_REQUEST, EXPIRE, REVOKE&#125;<br />
              • q₀ = Issued | F = &#123;Expired, Revoked&#125;<br />
              Any transition not in δ triggers a 400 Bad Request rejection and is recorded as a failed transition attempt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
