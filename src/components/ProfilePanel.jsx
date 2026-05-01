import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePanel({ onClose }) {
  const { profile, user, updateName, updatePassword, signOut } = useAuth();
  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(profile?.name || "");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSaveName() {
    if (!name.trim()) return setErr("Name cannot be empty.");
    setSaving(true); setErr(""); setMsg("");
    const error = await updateName(name.trim());
    if (error) {
      setErr("Failed to save: " + error.message);
    } else {
      setMsg("Name updated successfully!");
    }
    setSaving(false);
  }

  async function handleChangePassword() {
    setErr(""); setMsg("");
    if (!newPw || !confirmPw) return setErr("Please fill all fields.");
    if (newPw.length < 6) return setErr("Password must be at least 6 characters.");
    if (newPw !== confirmPw) return setErr("Passwords do not match.");
    setSaving(true);
    const error = await updatePassword(newPw);
    if (error) setErr("Failed: " + error.message);
    else {
      setMsg("Password changed successfully!");
      setNewPw(""); setConfirmPw("");
    }
    setSaving(false);
  }

  function switchTab(t) {
    setTab(t);
    setErr("");
    setMsg("");
  }

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={e => e.stopPropagation()}>
        <div className="profile-panel-header">
          <h3>My Profile</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Hero */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">
            {profile?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="profile-hero-name">{profile?.name}</p>
            <p className="profile-hero-email">{user?.email}</p>
            <span className={`profile-role-badge ${profile?.role}`}>
              {profile?.role || "viewer"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === "profile" ? "active" : ""}`}
            onClick={() => switchTab("profile")}
          >
            Edit Profile
          </button>
          <button
            className={`profile-tab ${tab === "password" ? "active" : ""}`}
            onClick={() => switchTab("password")}
          >
            Change Password
          </button>
        </div>

        {/* Profile tab */}
        {tab === "profile" && (
          <div className="profile-tab-content">
            <label className="form-label">
              Display Name
              <input
                className="form-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
              />
            </label>
            <label className="form-label">
              Email (cannot be changed)
              <input
                className="form-input"
                type="email"
                value={user?.email || ""}
                disabled
                style={{ opacity: 0.5, cursor: "not-allowed" }}
              />
            </label>
            {err && <p className="login-error">⚠ {err}</p>}
            {msg && <p className="login-success">✓ {msg}</p>}
            <button
              className="btn-primary"
              onClick={handleSaveName}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Password tab */}
        {tab === "password" && (
          <div className="profile-tab-content">
            <label className="form-label">
              New Password
              <input
                className="form-input"
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="At least 6 characters"
              />
            </label>
            <label className="form-label">
              Confirm New Password
              <input
                className="form-input"
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
              />
            </label>
            {err && <p className="login-error">⚠ {err}</p>}
            {msg && <p className="login-success">✓ {msg}</p>}
            <button
              className="btn-primary"
              onClick={handleChangePassword}
              disabled={saving}
            >
              {saving ? "Changing..." : "Change Password"}
            </button>
          </div>
        )}

        {/* Sign out */}
        <div className="profile-signout">
          <button className="sign-out-btn profile-signout-btn" onClick={signOut}>
            <span>⎋</span> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}