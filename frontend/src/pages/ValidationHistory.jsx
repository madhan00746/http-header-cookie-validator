import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:5000";

export default function ValidationHistory() {
  const [history, setHistory] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(15);
  const [typeFilter, setTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort: sortOrder,
      });

      if (typeFilter !== "all") params.append("type", typeFilter);
      if (resultFilter !== "all") params.append("result", resultFilter);
      if (search.trim()) params.append("search", search.trim());

      const res = await fetch(`${API}/api/validation/history?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      } else if (Array.isArray(data)) {
        setHistory(data);
        setTotal(data.length);
        setPages(1);
      }
    } catch (e) {
      setError("Failed to load validation history from MongoDB. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortOrder, typeFilter, resultFilter, search]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleClearHistory() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently clear all validation records from MongoDB? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      const res = await fetch(`${API}/api/validation/history`, {
        method: "DELETE",
      });
      const data = await res.json();
      setActionMsg(data.message || "All records removed successfully.");
      setPage(1);
      fetchHistory();
      setTimeout(() => setActionMsg(null), 4000);
    } catch (e) {
      setError("Failed to delete history: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    if (!history.length) return;
    const headers = ["Type", "Name", "Value", "Valid", "Message", "Timestamp"];
    const rows = history.map((doc) => [
      `"${doc.type}"`,
      `"${doc.input?.name || doc.fromState || ""}"`,
      `"${doc.input?.value || doc.toState || ""}"`,
      doc.valid ? "VALID" : "INVALID",
      `"${(doc.message || "").replace(/"/g, '""')}"`,
      `"${doc.createdAt || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `validation-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportJSON() {
    if (!history.length) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `validation-audit-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div>
      {/* Top action header */}
      <div className="panel" style={{ marginBottom: "20px" }}>
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Audit Trail &amp; Persistent Validation History</h3>
            <p className="panel-desc" style={{ marginBottom: 0 }}>
              All records are persisted in MongoDB Atlas and remain durable across server restarts.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" onClick={exportCSV} disabled={history.length === 0} title="Export current view to CSV">
              📥 Export CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={exportJSON} disabled={history.length === 0} title="Export current view to JSON">
              📥 Export JSON
            </button>
            <button className="btn btn-secondary btn-sm" onClick={fetchHistory} disabled={loading}>
              ↻ Refresh
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleClearHistory} disabled={loading || total === 0}>
              🗑 Clear Entire History
            </button>
          </div>
        </div>

        {actionMsg && <div className="alert alert-success" style={{ marginTop: "16px" }}>{actionMsg}</div>}
        {error && <div className="alert alert-error" style={{ marginTop: "16px" }}>{error}</div>}

        {/* Filter / Search Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1fr 1fr",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <div>
            <label className="form-label">SEARCH INPUT / MESSAGE</label>
            <input
              className="form-input"
              style={{ margin: 0 }}
              placeholder="Search by name, value, or error message..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div>
            <label className="form-label">VALIDATION TYPE</label>
            <select
              className="form-select"
              style={{ margin: 0 }}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Types</option>
              <option value="HTTP Header">HTTP Request Header</option>
              <option value="Response Header">HTTP Response Header</option>
              <option value="Cookie">Cookie</option>
              <option value="Session">Session (FSM)</option>
            </select>
          </div>

          <div>
            <label className="form-label">RESULT STATUS</label>
            <select
              className="form-select"
              style={{ margin: 0 }}
              value={resultFilter}
              onChange={(e) => {
                setResultFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Results</option>
              <option value="valid">Valid / Success</option>
              <option value="invalid">Invalid / Failed</option>
            </select>
          </div>

          <div>
            <label className="form-label">SORT ORDER</label>
            <select
              className="form-select"
              style={{ margin: 0 }}
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Data Table */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <span style={{ fontSize: "13px", color: "#8292a6" }}>
            Showing <strong>{history.length}</strong> of <strong>{total}</strong> records
          </span>
          {pages > 1 && (
            <span style={{ fontSize: "12px", color: "#00d4ff" }}>
              Page {page} of {pages}
            </span>
          )}
        </div>

        {loading ? (
          <div className="loading-spinner-wrap" style={{ padding: "40px 0" }}>
            <div className="loading-spinner"></div>
            <p>Querying MongoDB Atlas...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#e2e8f0" }}>No records match your criteria.</p>
            <small style={{ color: "#8292a6" }}>
              Try adjusting your search terms or filters, or execute new validations from the sidebar modules.
            </small>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "130px" }}>Type</th>
                  <th style={{ width: "160px" }}>Input Name / State</th>
                  <th>Input Value / Event</th>
                  <th style={{ width: "110px" }}>Result</th>
                  <th>Message / Warnings</th>
                  <th style={{ width: "170px" }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {history.map((doc) => {
                  const isSuccess = Boolean(doc.valid);
                  const inputName = doc.input?.name || doc.fromState || "—";
                  const inputValue = doc.input?.value || doc.toState || "—";
                  return (
                    <tr key={doc._id}>
                      <td>
                        <span className="type-badge" style={{ fontSize: "11px" }}>
                          {doc.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: "600", color: "#e2e8f0" }}>
                        <code>{inputName}</code>
                      </td>
                      <td className="value-cell" style={{ maxWidth: "260px" }}>
                        <code style={{ color: "#a2afc2" }}>{inputValue}</code>
                      </td>
                      <td>
                        <span className={`badge ${isSuccess ? "badge-success" : "badge-error"}`}>
                          {isSuccess ? "✓ Valid" : "✕ Invalid"}
                        </span>
                      </td>
                      <td className="msg-cell" style={{ maxWidth: "340px" }}>
                        <div style={{ color: isSuccess ? "#e2e8f0" : "#ff8090" }}>{doc.message}</div>
                        {doc.warnings && doc.warnings.length > 0 && (
                          <div style={{ marginTop: "4px", fontSize: "11px", color: "#f5a623" }}>
                            ⚠ {doc.warnings.length} warning(s)
                          </div>
                        )}
                      </td>
                      <td className="time-cell" style={{ fontSize: "12px", color: "#8292a6" }}>
                        {formatDate(doc.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #1a273b",
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              ◀ Previous
            </button>

            {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  className={`btn btn-sm ${page === pNum ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setPage(pNum)}
                  style={{ minWidth: "36px" }}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages || loading}
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
