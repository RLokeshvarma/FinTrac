import React, { useState, useEffect } from "react";
import { useSheets } from "../context/SheetsContext";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase";

const iconOptions = [
  { val: "✈️", label: "Trip" },
  { val: "💍", label: "Wedding" },
  { val: "🎉", label: "Event" },
  { val: "🏠", label: "Home" },
  { val: "📅", label: "Monthly" },
  { val: "🎓", label: "Education" },
  { val: "💼", label: "Business" },
  { val: "🏥", label: "Medical" },
  { val: "🎁", label: "Gifts" },
  { val: "🍽️", label: "Food" },
];

export default function SheetsPage() {
  const { sheets, addSheet, deleteSheet, inviteMember, removeMember, getSheetMembers } = useSheets();
  const { setActivePage, setActiveSheetId, setActiveSheetName, setActiveSheetRole } = useApp();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [icon, setIcon] = useState("✈️");
  const [sheetTotals, setSheetTotals] = useState({});

  // Manage members modal
  const [managingSheet, setManagingSheet] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteErr, setInviteErr] = useState("");

  useEffect(() => {
    if (sheets.length > 0) fetchTotals();
  }, [sheets]);

  async function fetchTotals() {
    const ids = sheets.map(s => s.id);
    const { data } = await supabase
      .from("transactions")
      .select("sheet_id, amount, type")
      .in("sheet_id", ids);

    const totals = {};
    (data || []).forEach(tx => {
      if (!totals[tx.sheet_id]) totals[tx.sheet_id] = { spent: 0, count: 0 };
      if (tx.type === "expense") totals[tx.sheet_id].spent += tx.amount;
      totals[tx.sheet_id].count += 1;
    });
    setSheetTotals(totals);
  }

  async function handleCreate() {
    if (!name.trim()) return alert("Please enter a sheet name.");
    await addSheet(name.trim(), Number(budget) || 0, "#3b6ff0", icon);
    setName(""); setBudget(""); setIcon("✈️"); setShowForm(false);
  }

  function openSheet(sheet) {
    setActiveSheetId(sheet.id);
    setActiveSheetName(sheet.name);
    setActiveSheetRole(sheet.member_role); // "owner" or "member"
    setActivePage("transactions");
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this sheet? Transactions will not be deleted.")) return;
    await deleteSheet(id);
  }

  async function openManageMembers(e, sheet) {
    e.stopPropagation();
    setManagingSheet(sheet);
    setInviteMsg(""); setInviteErr(""); setInviteEmail("");
    const data = await getSheetMembers(sheet.id);
    setMembers(data);
  }

  async function handleInvite() {
    setInviteMsg(""); setInviteErr("");
    if (!inviteEmail.trim()) return setInviteErr("Enter an email address.");
    const result = await inviteMember(managingSheet.id, inviteEmail.trim(), inviteRole);
    if (result.error) setInviteErr(result.error);
    else {
      setInviteMsg(`${result.name} added as ${inviteRole}!`);
      setInviteEmail("");
      const data = await getSheetMembers(managingSheet.id);
      setMembers(data);
    }
  }

  async function handleRemoveMember(userId) {
    await removeMember(managingSheet.id, userId);
    setMembers(prev => prev.filter(m => m.user_id !== userId));
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Expense Sheets</h2>
          <p className="page-sub">Budget tracker for trips, events and group expenses</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Sheet</button>
      </div>

      {showForm && (
        <div className="sheet-form-card">
          <h3>Create New Sheet</h3>
          <p className="sheet-form-hint">Pick an icon</p>
          <div className="icon-picker">
            {iconOptions.map(opt => (
              <button
                key={opt.val}
                className={`icon-btn ${icon === opt.val ? "icon-btn-active" : ""}`}
                onClick={() => setIcon(opt.val)}
                title={opt.label}
              >
                {opt.val}
              </button>
            ))}
          </div>
          <label className="form-label">Sheet Name
            <input className="form-input" type="text"
              placeholder="e.g. Trip to Goa, Anniversary..."
              value={name} onChange={e => setName(e.target.value)} />
          </label>
          <label className="form-label">Total Budget (₹) — optional
            <input className="form-input" type="number" placeholder="e.g. 20000"
              value={budget} onChange={e => setBudget(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-save" onClick={handleCreate}>Create Sheet</button>
          </div>
        </div>
      )}

      {sheets.length === 0 && !showForm ? (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <p>No expense sheets yet. Create one for your next trip or event.</p>
        </div>
      ) : (
        <div className="sheets-grid">
          {sheets.map(sheet => {
            const totals = sheetTotals[sheet.id] || { spent: 0, count: 0 };
            const remaining = sheet.budget - totals.spent;
            const exceeded = sheet.budget > 0 && remaining < 0;
            const pct = sheet.budget > 0 ? Math.min((totals.spent / sheet.budget) * 100, 100) : 0;
            const isOwner = sheet.member_role === "owner";

            return (
              <div key={sheet.id} className="sheet-card" onClick={() => openSheet(sheet)}>
                <div className="sheet-card-top">
                  <span className="sheet-icon">{sheet.icon}</span>
                  <div className="sheet-card-info">
                    <p className="sheet-name">{sheet.name}</p>
                    <div className="sheet-meta-row">
                      {sheet.budget > 0 && (
                        <p className="sheet-budget">Budget: ₹{sheet.budget.toLocaleString("en-IN")}</p>
                      )}
                      <span className={`sheet-role-tag ${isOwner ? "owner" : "member"}`}>
                        {isOwner ? "Owner" : "Member"}
                      </span>
                    </div>
                  </div>
                  <div className="sheet-actions" onClick={e => e.stopPropagation()}>
                    {isOwner && (
                      <>
                        <button className="btn-edit sheet-action-btn"
                          onClick={e => openManageMembers(e, sheet)}
                          title="Manage members">
                          👥
                        </button>
                        <button className="btn-delete sheet-delete"
                          onClick={e => handleDelete(e, sheet.id)}
                          title="Delete sheet">
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {sheet.budget > 0 && (
                  <>
                    <div className="sheet-progress-track">
                      <div className="sheet-progress-fill"
                        style={{ width: `${pct}%`, background: exceeded ? "#ef4444" : "#3b6ff0" }}>
                      </div>
                    </div>
                    <p className="sheet-pct-label">{Math.round(pct)}% of budget used</p>
                  </>
                )}

                <div className="sheet-stats">
                  <div className="sheet-stat">
                    <p className="sheet-stat-label">Total Spent</p>
                    <p className="sheet-stat-val expense">₹{totals.spent.toLocaleString("en-IN")}</p>
                  </div>
                  {sheet.budget > 0 && (
                    <div className="sheet-stat">
                      <p className="sheet-stat-label">{exceeded ? "⚠ Exceeded" : "Remaining"}</p>
                      <p className={`sheet-stat-val ${exceeded ? "expense" : "income"}`}>
                        ₹{Math.abs(remaining).toLocaleString("en-IN")}
                      </p>
                    </div>
                  )}
                  <div className="sheet-stat">
                    <p className="sheet-stat-label">Entries</p>
                    <p className="sheet-stat-val">{totals.count}</p>
                  </div>
                </div>
                <p className="sheet-tap-hint">Tap to view transactions →</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Members Modal */}
      {managingSheet && (
        <div className="modal-overlay" onClick={() => setManagingSheet(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>👥 Manage Members — {managingSheet.name}</h3>
              <button className="close-btn" onClick={() => setManagingSheet(null)}>✕</button>
            </div>
            <div className="modal-form">
              <p className="members-section-label">Invite someone by their email</p>
              <div className="invite-row">
                <input
                  className="form-input invite-input"
                  type="email"
                  placeholder="friend@email.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <select className="filter-select invite-role"
                  value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="member">Member (view only)</option>
                  <option value="owner">Owner (can edit)</option>
                </select>
                <button className="btn-save invite-btn" onClick={handleInvite}>Add</button>
              </div>
              {inviteErr && <p className="login-error" style={{ marginTop: 8 }}>⚠ {inviteErr}</p>}
              {inviteMsg && <p className="login-success" style={{ marginTop: 8 }}>✓ {inviteMsg}</p>}

              <p className="members-section-label" style={{ marginTop: 20 }}>
                Current Members ({members.length})
              </p>
              {members.length === 0 ? (
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No members yet. Invite someone above.</p>
              ) : (
                <div className="members-list">
                  {members.map(m => (
                    <div key={m.id} className="member-row">
                      <div className="member-avatar">
                        {m.profiles?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="member-info">
                        <p className="member-name">{m.profiles?.name}</p>
                        <p className="member-email">{m.profiles?.email}</p>
                      </div>
                      <span className={`sheet-role-tag ${m.role}`}>{m.role}</span>
                      <button className="btn-delete"
                        onClick={() => handleRemoveMember(m.user_id)}
                        title="Remove member">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}