export default function AboutProject() {
  const techStack = [
    { title: "React 19 & Vite 8", desc: "Modern declarative UI with reactive state management, Vite fast HMR build toolchain." },
    { title: "Node.js & Express", desc: "Non-blocking RESTful backend with RFC 7230 validation parsers and error handling." },
    { title: "MongoDB Atlas & Mongoose", desc: "Cloud NoSQL persistence storing validation audit logs, statistics, and session lifecycle." },
    { title: "RFC 7230 RegEx Engines", desc: "Formal regular expression tokens preventing invalid characters and CRLF injection vulnerabilities." },
    { title: "Finite State Machine (FSM)", desc: "Mathematical DFA automaton governing stateful session transitions and halting conditions." },
    { title: "Responsive Cyber Dark UI", desc: "Dark navy and cyan aesthetics, responsive on mobile, tablet, and desktop viewports." },
  ];

  const modules = [
    { name: "HTTP Request Header Validator", endpoint: "POST /api/validation/header", desc: "Validates header syntax using RFC 7230 regex, catches CRLF injection attempts (\\r\\n), checks Authorization schemes." },
    { name: "HTTP Response Header Validator", endpoint: "POST /api/validation/response", desc: "Inspects response headers, enforces nosniff on X-Content-Type-Options, evaluates CSP directives, checks HSTS max-age and Set-Cookie security flags." },
    { name: "Cookie Syntax & Security Validator", endpoint: "POST /api/validation/cookie", desc: "Validates cookie name/value characters per RFC 6265, rejects whitespace and semicolons, advises HttpOnly, Secure, SameSite, and __Host- / __Secure- prefixes." },
    { name: "FSM Session State Manager", endpoint: "POST /api/validation/session", desc: "Implements deterministic finite state machine (Issued -> Active -> Expired / Revoked). Rejects invalid transitions and logs state changes." },
    { name: "Audit Trail & Historical Explorer", endpoint: "GET /api/validation/history", desc: "Provides full-text search, multi-factor filtering, sorting, pagination, and administrative history purge with MongoDB persistence." },
    { name: "Dynamic Platform Analytics", endpoint: "GET /api/validation/stats", desc: "Computes real-time aggregation metrics across validations, invalid header counts, cookie anomalies, and active sessions." },
  ];

  return (
    <div>
      {/* Banner */}
      <div className="panel welcome-banner" style={{ marginBottom: "24px" }}>
        <div className="welcome-content">
          <span className="welcome-tag">ACADEMIC &amp; SECURITY PORTFOLIO PROJECT</span>
          <h2 style={{ fontSize: "28px", marginTop: "6px" }}>HTTP Header and Cookie Validation Platform</h2>
          <p style={{ maxWidth: "680px", marginTop: "10px", lineHeight: "1.6" }}>
            A comprehensive, full-stack cybersecurity platform designed to enforce HTTP protocol compliance, prevent injection vectors like CRLF, analyze security header policies, and manage session lifecycles using formal automata theory.
          </p>
        </div>
        <div className="welcome-icon">🛡️</div>
      </div>

      {/* College Project Meta Card */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <div className="panel-header">
          <h3 className="panel-title">Project Specifications &amp; Metadata</h3>
          <span className="tag">COLLEGE SUBMISSION</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginTop: "16px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "#8292a6", textTransform: "uppercase" }}>PROJECT NAME</span>
            <div style={{ color: "#e2e8f0", fontWeight: "600", marginTop: "4px" }}>HeaderGuard Validation Platform</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#8292a6", textTransform: "uppercase" }}>DOMAIN</span>
            <div style={{ color: "#00d4ff", fontWeight: "600", marginTop: "4px" }}>Cybersecurity / Web Protocol Engineering</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#8292a6", textTransform: "uppercase" }}>CORE ALGORITHMS</span>
            <div style={{ color: "#22c97d", fontWeight: "600", marginTop: "4px" }}>Regular Expressions &amp; Finite Automata</div>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "#8292a6", textTransform: "uppercase" }}>DATABASE HOST</span>
            <div style={{ color: "#f5a623", fontWeight: "600", marginTop: "4px" }}>MongoDB Atlas Cloud Cluster</div>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h3 className="panel-title" style={{ marginBottom: "16px" }}>Architectural Technology Stack</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {techStack.map((tech, idx) => (
            <div key={idx} style={{ padding: "16px", background: "#0c1524", borderRadius: "8px", border: "1px solid #1a273b" }}>
              <h4 style={{ color: "#00d4ff", margin: "0 0 6px", fontSize: "15px" }}>{tech.title}</h4>
              <p style={{ color: "#8292a6", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Functional Modules Table */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h3 className="panel-title" style={{ marginBottom: "16px" }}>Platform Functional Subsystems</h3>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Subsystem Module</th>
                <th>API Endpoint</th>
                <th>Validation Protocol &amp; Security Checks</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((m, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: "600", color: "#e2e8f0" }}>{m.name}</td>
                  <td>
                    <code>{m.endpoint}</code>
                  </td>
                  <td style={{ color: "#a2afc2", fontSize: "13px" }}>{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Principles */}
      <div className="panel" style={{ marginBottom: "24px" }}>
        <h3 className="panel-title" style={{ marginBottom: "14px" }}>Security Principles Enforced</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
          <div style={{ padding: "14px", background: "#0d1828", borderRadius: "8px", borderLeft: "3px solid #ff4c6a" }}>
            <h5 style={{ color: "#ff4c6a", margin: "0 0 4px" }}>CRLF Injection Mitigation</h5>
            <p style={{ fontSize: "12px", color: "#8292a6", margin: 0 }}>
              Checks for carriage return <code>\r</code> and line feed <code>\n</code> characters in headers to prevent HTTP response splitting and header injection.
            </p>
          </div>
          <div style={{ padding: "14px", background: "#0d1828", borderRadius: "8px", borderLeft: "3px solid #f5a623" }}>
            <h5 style={{ color: "#f5a623", margin: "0 0 4px" }}>Cookie Hardening (RFC 6265)</h5>
            <p style={{ fontSize: "12px", color: "#8292a6", margin: 0 }}>
              Validates cookie token characters and warns against missing <code>HttpOnly</code> (XSS shield), <code>Secure</code> (HTTPS restriction), and <code>SameSite</code> (CSRF defence).
            </p>
          </div>
          <div style={{ padding: "14px", background: "#0d1828", borderRadius: "8px", borderLeft: "3px solid #22c97d" }}>
            <h5 style={{ color: "#22c97d", margin: "0 0 4px" }}>State Invariance via Automata</h5>
            <p style={{ fontSize: "12px", color: "#8292a6", margin: 0 }}>
              Once a session enters terminal states (Expired or Revoked), the transition function δ strictly returns undefined, blocking replay or session revival attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
