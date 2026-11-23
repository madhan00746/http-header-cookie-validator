import { useState } from "react";

const API = "http://localhost:5000";

const EXAMPLES = [
  { name: "Content-Type",               value: "text/html; charset=utf-8" },
  { name: "X-Content-Type-Options",     value: "nosniff" },
  { name: "Strict-Transport-Security",  value: "max-age=31536000; includeSubDomains" },
  { name: "Content-Security-Policy",    value: "default-src 'self'" },
  { name: "Cache-Control",              value: "no-store, no-cache" },
  { name: "Set-Cookie",                 value: "session=abc123; HttpOnly; Secure; SameSite=Strict" },
  { name: "Set-Cookie",                 value: "session=abc123" },
  { name: "X-Frame-Options",            value: "DENY" },
];

export default function ResponseHeaderValidator() {
  const [name, setName] = useState("X-Content-Type-Options");
  const [value, setValue] = useState("nosniff");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function validate() {
    if (!name.trim()) {
      setError("Please enter a header name.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API}/api/validation/response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Cannot connect to backend. Ensure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") validate();
  }

  return (
    <div className="page-layout">
      {/* Left: Form Panel */}
      <div className="form-panel">
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">⇢ Response Header Validator</h3>
          </div>
          <p className="panel-desc">
            Validate HTTP response header names and values for syntax correctness and security best
            practices. Checks HSTS, CSP, cookie flags, and common security headers.
          </p>

          <div className="form-group">
            <label className="form-label">Header Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Content-Security-Policy"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Header Value</label>
            <input
              className="form-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. default-src 'self'"
              spellCheck="false"
            />
          </div>

          <button className="btn btn-primary" onClick={validate} disabled={loading}>
            {loading ? "Validating..." : "▶ Validate Response Header"}
          </button>

          <div className="examples-section">
            <p className="examples-title">Quick Examples</p>
            <div className="examples-grid">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  className="example-btn"
                  onClick={() => { setName(ex.name); setValue(ex.value); setResult(null); setError(null); }}
                >
                  <span>{ex.name}</span>
                  <small>{ex.value.substring(0, 36)}{ex.value.length > 36 ? "…" : ""}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="panel info-panel" style={{ marginTop: "20px" }}>
          <h4>Security Headers Reference</h4>
          <ul className="rules-list">
            <li><code>Strict-Transport-Security</code> — Enforce HTTPS connections</li>
            <li><code>Content-Security-Policy</code> — Prevent XSS and injection</li>
            <li><code>X-Content-Type-Options: nosniff</code> — Prevent MIME sniffing</li>
            <li><code>X-Frame-Options: DENY</code> — Prevent clickjacking</li>
            <li><code>Set-Cookie</code> should include <code>HttpOnly; Secure; SameSite</code></li>
          </ul>
        </div>
      </div>

      {/* Right: Result Panel */}
      <div className="result-panel">
        {error && <div className="alert alert-error">⚠ {error}</div>}

        {result && (
          <div className={`result-box ${result.valid ? "success" : "error"}`}>
            <div className="result-header">
              <span className={`result-status ${result.valid ? "green" : "red"}`}>
                {result.valid ? "✓ VALID" : "✕ INVALID"}
              </span>
              <span className="result-timestamp">
                {result.createdAt ? new Date(result.createdAt).toLocaleString() : new Date().toLocaleString()}
              </span>
            </div>
            <p className="result-message">{result.message}</p>

            {result.input && (
              <div className="result-input">
                <code>{result.input.name}: {result.input.value}</code>
              </div>
            )}

            {result.securityNote && (
              <div className="warnings-box" style={{ borderLeftColor: "#3b9eff" }}>
                <p className="warnings-title" style={{ color: "#3b9eff" }}>ℹ Security Note</p>
                <div className="warning-item" style={{ color: "#9baac0" }}>{result.securityNote}</div>
              </div>
            )}

            {result.warnings && result.warnings.length > 0 && (
              <div className="warnings-box" style={{ marginTop: "10px" }}>
                <p className="warnings-title">⚠ Security Warnings</p>
                {result.warnings.map((w, i) => (
                  <div key={i} className="warning-item">⚠ {w}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {!result && !error && (
          <div className="panel">
            <div className="empty-state">
              <div className="empty-icon">⇢</div>
              <p>No result yet</p>
              <small>Enter a response header name and value, then click Validate.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
