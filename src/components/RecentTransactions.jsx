import React from "react";
import { useApp } from "../context/AppContext";
import { categoryColors } from "../data/transactions";

export default function RecentTransactions() {
  const { txList, setActivePage } = useApp();

  const recent = [...txList]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }

  return (
    <div className="chart-card">
      <div className="section-header">
        <h3 className="chart-title" style={{ marginBottom: 0 }}>Recent Transactions</h3>
        <button className="link-btn" onClick={() => setActivePage("transactions")}>
          View all →
        </button>
      </div>

      {recent.length === 0 ? (
        <p className="empty-msg">No transactions yet.</p>
      ) : (
        <div className="tx-list">
          {recent.map(tx => (
            <div key={tx.id} className="tx-row">
              <div
                className="tx-cat-dot"
                style={{ background: categoryColors[tx.category] || "#94a3b8" }}
              ></div>
              <div className="tx-info">
                <span className="tx-desc">{tx.desc}</span>
                <span className="tx-cat-label">{tx.category}</span>
              </div>
              <span className="tx-date">{formatDate(tx.date)}</span>
              <span className={`tx-amount ${tx.type}`}>
                {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}