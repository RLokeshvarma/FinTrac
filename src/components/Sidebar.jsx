import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "sheets", label: "Expense Sheets", icon: "📁" },
  { id: "transactions", label: "Transactions", icon: "⇄" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Sidebar() {
  const {
    activePage, setActivePage,
    activeSheetName, setActiveSheetId, setActiveSheetName,
    role,
  } = useApp();
  const { profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(id) {
    setActivePage(id);
    if (id !== "transactions") {
      setActiveSheetId(null);
      setActiveSheetName(null);
    }
    setMenuOpen(false);
  }

  function clearSheet() {
    setActiveSheetId(null);
    setActiveSheetName(null);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button className="hamburger-btn" onClick={() => setMenuOpen(p => !p)}>
          <span className="hamburger-icon">{menuOpen ? "✕" : "☰"}</span>
        </button>
        <div className="mobile-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">FinTrac</span>
        </div>
        <span className={`mobile-role-badge ${role}`}>
          {role === "admin" ? "Admin" : "Viewer"}
        </span>
      </div>

      {menuOpen && (
        <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">FinTrac</span>
        </div>

        {/* User info */}
        {profile && (
          <div className="sidebar-user">
            <div className="user-avatar">
              {profile.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <p className="user-name">{profile.name}</p>
              <p className="user-role">{profile.role}</p>
            </div>
          </div>
        )}

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

        {/* Active sheet tag */}
        {activeSheetName && activePage === "transactions" && (
          <div className="active-sheet-tag">
            <span>📁 {activeSheetName}</span>
            <button onClick={clearSheet}>✕</button>
          </div>
        )}

        <div className="sidebar-bottom">
          <button className="sign-out-btn" onClick={signOut}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}