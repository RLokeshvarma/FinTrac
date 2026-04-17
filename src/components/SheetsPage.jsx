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
  const { sheets, addSheet, deleteSheet } = useSheets();
  const { setActivePage, setActiveSheetId, setActiveSheetName, role } = useApp();
  const { user } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [icon, setIcon] = useState("✈️");
  const [sheetTotals, setSheetTotals] = useState({});

  useEffect(() => {
    if (sheets.length > 0) fetchTotals();
  }, [sheets]);

  async function fetchTotals() {
    const ids = sheets.map(s => s.id);
    const { data } = await supabase
      .from("transactions")
      .select("sheet_id, amount, type")
      .eq("user_id", user.id)
      .in("sheet_id", ids);

    const totals = {};
    (data || []).forEach(tx => {
      if (!totals[tx.sheet_id]) totals[tx.sheet_id] = { spent: 0, income: 0, count: 0 };
      if (tx.type === "expense") totals[tx.sheet_id].spent += tx.amount;
      else totals[tx.sheet_id].income += tx.amount;
      totals[tx.sheet_id].count += 1;
    });
    setSheetTotals(totals);
  }

  async function handleCreate() {
    if (!name.trim()) return alert("Please enter a sheet name.");
    await addSheet(name.trim(), Number(budget) || 0, "#3b6ff0", icon);
    setName(""); setBudget(""); setIcon("✈️");
    setShowForm(false);
  }

  function openSheet(sheet) {
    setActiveSheetId(sheet.id);
    setActiveSheetName(sheet.name);
    setActivePage("transactions");
  }

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this sheet? Transactions in it will not be deleted.")) return;
    await deleteSheet(id);
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Expense Sheets</h2>
          <p className="page-sub">Budget tracker for trips, events and occasions</p>
        </div>
        {role === "admin" && (
          <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Sheet</button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="sheet-form-card">
          <h3>Create New Sheet</h3>
          <p className="sheet-form-hint">Pick an icon for your occasion</p>
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
          <label className="form-label">
            Sheet Name
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Trip to Goa, Anniversary Dinner..."
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          <label className="form-label">
            Total Budget (₹) — leave blank if no limit
            <input
              className="form-input"
              type="number"
              placeholder="e.g. 20000"
              value={budget}
              onChange={e => setBudget(e.target.value)}
            />
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
          <p>No expense sheets yet.</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>
            Create one for your next trip, event or occasion to track spending against a budget.
          </p>
        </div>
      ) : (
        <div className="sheets-grid">
          {sheets.map(sheet => {
            const totals = sheetTotals[sheet.id] || { spent: 0, count: 0 };
            const remaining = sheet.budget - totals.spent;
            const exceeded = sheet.budget > 0 && remaining < 0;
            const pct = sheet.budget > 0
              ? Math.min((totals.spent / sheet.budget) * 100, 100)
              : 0;

            return (
              <div key={sheet.id} className="sheet-card" onClick={() => openSheet(sheet)}>
                <div className="sheet-card-top">
                  <span className="sheet-icon">{sheet.icon}</span>
                  <div className="sheet-card-info">
                    <p className="sheet-name">{sheet.name}</p>
                    {sheet.budget > 0 && (
                      <p className="sheet-budget">
                        Budget: ₹{sheet.budget.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                  {role === "admin" && (
                    <button
                      className="btn-delete sheet-delete"
                      onClick={e => handleDelete(e, sheet.id)}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {sheet.budget > 0 && (
                  <>
                    <div className="sheet-progress-track">
                      <div
                        className="sheet-progress-fill"
                        style={{
                          width: `${pct}%`,
                          background: exceeded ? "#ef4444" : "#3b6ff0",
                        }}
                      ></div>
                    </div>
                    <p className="sheet-pct-label">
                      {Math.round(pct)}% of budget used
                    </p>
                  </>
                )}

                <div className="sheet-stats">
                  <div className="sheet-stat">
                    <p className="sheet-stat-label">Total Spent</p>
                    <p className="sheet-stat-val expense">
                      ₹{totals.spent.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {sheet.budget > 0 && (
                    <div className="sheet-stat">
                      <p className="sheet-stat-label">
                        {exceeded ? "⚠ Exceeded by" : "Remaining"}
                      </p>
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
    </div>
  );
}