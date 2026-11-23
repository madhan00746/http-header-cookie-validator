import { useState } from "react";

const STATES = [
  {
    id: "Issued",
    name: "Issued",
    type: "Initial State (q₀)",
    color: "#3b9eff",
    bg: "rgba(59,158,255,0.12)",
    desc: "Session token generated and issued by server. Awaiting initial client authentication activation.",
  },
  {
    id: "Active",
    name: "Active",
    type: "Intermediate Operational State",
    color: "#22c97d",
    bg: "rgba(34,201,125,0.12)",
    desc: "Session authenticated, active, and routinely accepting incoming requests via VALID_REQUEST transitions.",
  },
  {
    id: "Expired",
    name: "Expired",
    type: "Terminal State (F₁)",
    color: "#f5a623",
    bg: "rgba(245,166,35,0.12)",
    desc: "Session reached maximum idle or absolute lifetime (TTL). Terminal state: no outbound transitions permitted.",
  },
  {
    id: "Revoked",
    name: "Revoked",
    type: "Terminal State (F₂)",
    color: "#ff4c6a",
    bg: "rgba(255,76,106,0.12)",
    desc: "Session proactively invalidated by logout or administrative revocation. Terminal state: strictly immutable.",
  },
];

const TRANSITIONS = [
  { from: "Issued", event: "ACTIVATE", to: "Active", type: "Valid", desc: "First authenticated request from client activates session" },
  { from: "Issued", event: "REVOKE", to: "Revoked", type: "Valid", desc: "Issuance canceled before activation or token revoked by policy" },
  { from: "Active", event: "VALID_REQUEST", to: "Active", type: "Valid (Self-Loop)", desc: "Routine HTTP traffic keeps session operational and refreshed" },
  { from: "Active", event: "EXPIRE", to: "Expired", type: "Valid", desc: "Inactivity timeout or absolute token expiration triggered" },
  { from: "Active", event: "REVOKE", to: "Revoked", type: "Valid", desc: "User explicitly logs out or security breach initiates revocation" },
  { from: "Expired", event: "*", to: "REJECTED (Terminal)", type: "Blocked", desc: "Automaton halts; token is permanently dead and cannot revive" },
  { from: "Revoked", event: "*", to: "REJECTED (Terminal)", type: "Blocked", desc: "Automaton halts; revoked token is permanently blacklisted" },
];

export default function FSMDiagram() {
  const [selectedState, setSelectedState] = useState("Issued");

  return (
    <div>
      {/* Overview Banner */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Finite State Automaton (FSM) Specification</h3>
            <p className="panel-desc" style={{ marginBottom: 0 }}>
              Formal mathematical modeling of session lifecycle states, inputs, and determinism.
            </p>
          </div>
          <span className="tag">DFA DETERMINISTIC</span>
        </div>

        {/* 5-Tuple Definition */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "14px",
            marginTop: "20px",
          }}
        >
          <div className="stat-card blue" style={{ padding: "16px" }}>
            <span className="stat-label">SET OF STATES (Q)</span>
            <div style={{ fontSize: "14px", marginTop: "8px", color: "#e2e8f0" }}>
              <code>&#123;Issued, Active, Expired, Revoked&#125;</code>
            </div>
            <small className="stat-change">|Q| = 4 States</small>
          </div>

          <div className="stat-card green" style={{ padding: "16px" }}>
            <span className="stat-label">INPUT ALPHABET (Σ)</span>
            <div style={{ fontSize: "14px", marginTop: "8px", color: "#e2e8f0" }}>
              <code>&#123;ACTIVATE, VALID_REQ, EXPIRE, REVOKE&#125;</code>
            </div>
            <small className="stat-change">|Σ| = 4 Event Symbols</small>
          </div>

          <div className="stat-card orange" style={{ padding: "16px" }}>
            <span className="stat-label">INITIAL STATE (q₀)</span>
            <div style={{ fontSize: "14px", marginTop: "8px", color: "#e2e8f0" }}>
              <code>q₀ = Issued</code>
            </div>
            <small className="stat-change">Single entry point</small>
          </div>

          <div className="stat-card red" style={{ padding: "16px" }}>
            <span className="stat-label">TERMINAL STATES (F)</span>
            <div style={{ fontSize: "14px", marginTop: "8px", color: "#e2e8f0" }}>
              <code>F = &#123;Expired, Revoked&#125;</code>
            </div>
            <small className="stat-change">|F| = 2 Sink States</small>
          </div>
        </div>
      </div>

      {/* Visual ASCII / SVG State Diagram */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h3 className="panel-title" style={{ marginBottom: "16px" }}>State Transition Topology Diagram</h3>

        <div className="ascii-diagram" style={{ padding: "24px", background: "#060b14", borderRadius: "10px", border: "1px solid #1a273b" }}>
          <pre style={{ color: "#00d4ff", fontSize: "13px", lineHeight: "1.5", margin: 0, overflowX: "auto" }}>
{`
                               ┌──────────────────────────┐
                               │   VALID_REQUEST (Loop)   │
                               │           ▲              │
                               │           │              │
                               ▼           │              │
    ┌────────────────┐       ACTIVATE       ┌─────────────┴──┐
    │     ISSUED     │ ───────────────────▶ │     ACTIVE     │
    │  Initial (q₀)  │                      │ (Operational)  │
    └────────────────┘                      └───────┬────────┘
            │                                       │
            │ REVOKE                                │ EXPIRE
            │                                       ▼
            │                               ┌────────────────┐
            │                               │    EXPIRED     │
            │                               │  Terminal (F₁) │
            │                               └────────────────┘
            │                                       │
            ▼                                       │ REVOKE
    ┌───────────────────────────────────────────────┴┐
    │                    REVOKED                     │
    │                 Terminal (F₂)                  │
    └────────────────────────────────────────────────┘
`}
          </pre>
        </div>

        {/* Interactive State Cards */}
        <h4 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "14px", color: "#8292a6" }}>
          CLICK A STATE TO INSPECT PROPERTIES:
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
          {STATES.map((s) => {
            const isSelected = selectedState === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSelectedState(s.id)}
                style={{
                  cursor: "pointer",
                  padding: "18px",
                  borderRadius: "10px",
                  background: isSelected ? s.bg : "#0c1524",
                  border: isSelected ? `2px solid ${s.color}` : "1px solid #1a273b",
                  transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ color: s.color, margin: 0, fontSize: "17px" }}>{s.name}</h4>
                  <span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}` }}>
                    {isSelected ? "Inspecting" : "Select"}
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "#66758a", marginTop: "4px" }}>{s.type}</div>
                <p style={{ fontSize: "12px", color: "#a2afc2", margin: "10px 0 0", lineHeight: "1.5" }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* State Transition Matrix (Delta Function Table) */}
      <div className="panel">
        <h3 className="panel-title" style={{ marginBottom: "16px" }}>
          Transition Function Matrix: δ(Current State, Event) → Next State
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Current State (q ∈ Q)</th>
                <th>Input Event (σ ∈ Σ)</th>
                <th>Next State δ(q, σ)</th>
                <th>Transition Classification</th>
                <th>Semantic Explanation</th>
              </tr>
            </thead>
            <tbody>
              {TRANSITIONS.map((tr, idx) => {
                const isBlocked = tr.type === "Blocked";
                return (
                  <tr key={idx} style={{ background: tr.from === selectedState ? "rgba(0,212,255,0.04)" : "transparent" }}>
                    <td>
                      <code style={{ fontWeight: "700", color: "#e2e8f0" }}>{tr.from}</code>
                    </td>
                    <td>
                      <code style={{ color: "#00d4ff" }}>{tr.event}</code>
                    </td>
                    <td>
                      <strong style={{ color: isBlocked ? "#ff4c6a" : "#22c97d" }}>{tr.to}</strong>
                    </td>
                    <td>
                      <span className={`badge ${isBlocked ? "badge-error" : tr.type.includes("Loop") ? "badge-warning" : "badge-success"}`}>
                        {tr.type}
                      </span>
                    </td>
                    <td style={{ color: "#8292a6", fontSize: "13px" }}>{tr.desc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
