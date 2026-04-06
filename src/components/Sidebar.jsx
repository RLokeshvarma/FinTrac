import React, { useState } from "react";
import { useApp } from "../context/AppContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "transactions", label: "Transactions", icon: "⇄" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Sidebar() {
  const { activePage, setActivePage, role, setRole } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(id) {
    setActivePage(id);
    setMenuOpen(false);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(prev => !prev)}>
          <span className="hamburger-icon">{menuOpen ? "✕" : "☰"}</span>
        </button>
        <div className="mobile-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">Fintrack</span>
        </div>
        <span className={`mobile-role-badge ${role}`}>
          {role === "admin" ? "Admin" : "Viewer"}
        </span>
      </div>

      {/* Overlay when menu open on mobile */}
      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">FinTrac</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-btn ${activePage === item.id ? "active" : ""}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="role-section">
            <p className="role-label">Role</p>
            <select
              className="role-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <p className="role-hint">
              {role === "admin"
                ? "You can add and edit transactions"
                : "Read-only view"}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}