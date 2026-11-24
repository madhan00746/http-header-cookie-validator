import { useState } from "react";

import { API } from "../config";
import { validateCookieClient } from "../utils/clientValidators";

const EXAMPLES = [
  { name: "sessionId",    value: "abc123xyz" },
  { name: "__Host-token", value: "securevalue" },
  { name: "__Secure-id",  value: "abc" },
  { name: "bad cookie",   value: "has spaces" },
  { name: "name",         value: "val;ue" },
  { name: "JSESSIONID",   value: "ABCDE12345FGHIJ67890" },
  { name: "csrfToken",    value: "xK9mP2qR" },
];

export default function CookieValidator() {
  const [name, setName] = useState("sessionId");
  const [value, setValue] = useState("abc123xyz");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function validate() {
    if (!name.trim()) {
      setError("Please enter a cookie name.");
      return;
    }
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch(`${API}/api/validation/cookie`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      const fallbackResult = validateCookieClient(name, value);
      setResult({ ...fallbackResult, input: { name, value }, createdAt: new Date().toISOString() });
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
            <h3 className="panel-title">◉ Cookie Validator</h3>
          </div>
          <p className="panel-desc">
            Validate HTTP cookie name and value syntax per RFC 6265. Detects invalid characters,
            reserved name prefixes, and security issues.
          </p>

          <div className="form-group">
            <label className="form-label">Cookie Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. sessionId"
              spellCheck="false"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cookie Value</label>
            <input
              className="form-input"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. abc123xyz"
              spellCheck="false"
            />
          </div>

          <button className="btn btn-primary" onClick={validate} disabled={loading}>
            {loading ? "Validating..." : "▶ Validate Cookie"}
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
                  <small>{ex.value.substring(0, 32)}{ex.value.length > 32 ? "…" : ""}</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="panel info-panel" style={{ marginTop: "20px" }}>
          <h4>Cookie Validation Rules (RFC 6265)</h4>
          <ul className="rules-list">
            <li>Name: US-ASCII printable chars except separators: <code>[!#-'*+\-.0-9A-Z^-z|~]+</code></li>
            <li>Value: printable ASCII without spaces, commas, semicolons, backslash</li>
            <li><code>__Host-</code> prefix: must be Secure, Path=/, no Domain</li>
            <li><code>__Secure-</code> prefix: must be sent over HTTPS with Secure flag</li>
            <li>Control characters (<code>\x00-\x1F</code>) and DEL (<code>\x7F</code>) are forbidden</li>
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
                <code>{result.input.name}={result.input.value}</code>
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
              <div className="empty-icon">◉</div>
              <p>No result yet</p>
              <small>Enter a cookie name and value, then click Validate.</small>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
