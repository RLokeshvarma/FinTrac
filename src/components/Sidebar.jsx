import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ProfilePanel from "./ProfilePanel";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "sheets", label: "Expense Sheets", icon: "📁" },
  { id: "transactions", label: "Transactions", icon: "⇄" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Sidebar() {
  const {
    activePage, setActivePage,
    activeSheetName, setActiveSheetId, setActiveSheetName, setActiveSheetRole,
    role,
  } = useApp();
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleNavClick(id) {
    setActivePage(id);
    if (id !== "transactions") {
      setActiveSheetId(null);
      setActiveSheetName(null);
      setActiveSheetRole(null);
    }
    setMenuOpen(false);
  }

  function clearSheet() {
    setActiveSheetId(null);
    setActiveSheetName(null);
    setActiveSheetRole(null);
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
        <button className="mobile-avatar-btn" onClick={() => setProfileOpen(true)}>
          {profile?.name?.charAt(0).toUpperCase() || "U"}
        </button>
      </div>

      {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} />}

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

        {/* Active sheet indicator */}
        {activeSheetName && activePage === "transactions" && (
          <div className="active-sheet-tag">
            <span>📁 {activeSheetName}</span>
            <button onClick={clearSheet}>✕</button>
          </div>
        )}

        {/* Profile button at bottom */}
        <div className="sidebar-bottom">
          <button className="profile-trigger-btn" onClick={() => setProfileOpen(true)}>
            <div className="user-avatar">
              {profile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-info">
              <p className="user-name">{profile?.name || "User"}</p>
              <p className="user-role">{role === "admin" ? "Admin" : "Viewer"}</p>
            </div>
            <span className="profile-chevron">›</span>
          </button>
        </div>
      </aside>

      {/* Profile panel */}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </>
  );
}