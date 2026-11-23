import { useState } from "react";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import HeaderValidator from "./pages/HeaderValidator";
import ResponseHeaderValidator from "./pages/ResponseHeaderValidator";
import CookieValidator from "./pages/CookieValidator";
import SessionManager from "./pages/SessionManager";
import ValidationHistory from "./pages/ValidationHistory";
import FSMDiagram from "./pages/FSMDiagram";
import AboutProject from "./pages/AboutProject";

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "header", label: "Request Header Validator", icon: "⇄" },
  { id: "response", label: "Response Header Validator", icon: "⇢" },
  { id: "cookie", label: "Cookie Validator", icon: "◉" },
  { id: "session", label: "Session Manager", icon: "◈" },
  { id: "history", label: "Validation History", icon: "▤" },
  { id: "fsm", label: "FSM Diagram", icon: "⬡" },
  { id: "about", label: "About Project", icon: "ℹ" },
];

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const current = PAGES.find((p) => p.id === page);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={setPage} />;
      case "header": return <HeaderValidator />;
      case "response": return <ResponseHeaderValidator />;
      case "cookie": return <CookieValidator />;
      case "session": return <SessionManager />;
      case "history": return <ValidationHistory />;
      case "fsm": return <FSMDiagram />;
      case "about": return <AboutProject />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">◈</span>
          {sidebarOpen && (
            <div>
              <h2>HeaderGuard</h2>
              <p className="logo-sub">SECURITY PLATFORM</p>
            </div>
          )}
        </div>

        {sidebarOpen && <p className="menu-title">MAIN MENU</p>}

        <nav className="sidebar-nav">
          {PAGES.map((p) => (
            <button
              key={p.id}
              className={`nav-item ${page === p.id ? "active" : ""}`}
              onClick={() => setPage(p.id)}
              title={p.label}
            >
              <span className="nav-icon">{p.icon}</span>
              {sidebarOpen && <span className="nav-label">{p.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className="status-dot"></span>
          {sidebarOpen && "System Operational"}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? "◀" : "▶"}
            </button>
            <div>
              <p className="breadcrumb">SECURITY / {current?.label?.toUpperCase()}</p>
              <h1 className="page-title">{current?.label}</h1>
            </div>
          </div>
          <div className="topbar-right">
            <div className="admin-badge">● Admin</div>
          </div>
        </header>

        <div className="page-content">
          {renderPage()}
        </div>

        <footer className="app-footer">
          HeaderGuard © 2026 | HTTP Header &amp; Cookie Validation Platform | College Project
        </footer>
      </main>
    </div>
  );
}
