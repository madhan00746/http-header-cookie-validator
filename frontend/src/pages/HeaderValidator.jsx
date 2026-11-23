import { useState } from "react";

const API = "http://localhost:5000";

const EXAMPLES = [
  { name: "Content-Type",    value: "application/json" },
  { name: "Authorization",   value: "Bearer eyJhbGciOiJIUzI1NiJ9.test" },
  { name: "User-Agent",      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  { name: "Cache-Control",   value: "no-cache, no-store, must-revalidate" },
  { name: "Accept",          value: "text/html,application/json" },
  { name: "Bad\r\nHeader",   value: "CRLF-Injection-Test" },
];

export default function HeaderValidator() {
  const [name, setName] = useState("Content-Type");
  const [value, setValue] = useState("application/json");
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
      const res = await fetch(`${API}/api/validation/header`, {
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
            <h3 className="panel-title">⇄ Request Header Validator</h3>
          </div>
          <p className="panel-desc">
            Validate HTTP request header names and values using RFC 7230 compliant regular expressions.
            Detects CRLF injection, invalid characters, and security issues.
          </p>

          <div className="form-group">
            <label className="form-label">Header Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Content-Type"
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
              placeholder="e.g. application/json"
              spellCheck="false"
            />
          </div>

          <button className="btn btn-primary" onClick={validate} disabled={loading}>
            {loading ? "Validating..." : "▶ Validate Header"}
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
                  <span>{ex.name.includes("\r\n") ? "Bad\\r\\nHeader" : ex.name}</span>
                  <small>{ex.value.substring(0, 32)}{ex.value.length > 32 ? "…" : ""}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Validation Rules */}
        <div className="panel info-panel" style={{ marginTop: "20px" }}>
          <h4>Validation Rules (RFC 7230)</h4>
          <ul className="rules-list">
            <li>Name must match token: <code>[!#$%&amp;'*+\-.^_`|~0-9A-Za-z]+</code></li>
            <li>Value must be printable ASCII: <code>[\t\x20-\x7E\x80-\xFF]*</code></li>
            <li>CRLF sequences (<code>\r\n</code>) are strictly forbidden</li>
            <li>Neither name nor value may be empty</li>
            <li>Null bytes and control characters are rejected</li>
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
            {result.warnings && result.warnings.length > 0 && (
              <div className="warnings-box">
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
              <div className="empty-icon">⇄</div>
              <p>No result yet</p>
              <small>Enter a header name and value, then click Validate.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
