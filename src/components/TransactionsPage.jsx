import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { categories, categoryColors } from "../data/transactions";
import TransactionModal from "./TransactionModal";

export default function TransactionsPage() {
  const {
    txList, deleteTransaction,
    filterType, setFilterType,
    filterCategory, setFilterCategory,
    searchText, setSearchText,
    sortBy, setSortBy,
    role,
  } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null);

  function openAdd() { setEditTx(null); setShowModal(true); }
  function openEdit(tx) { setEditTx(tx); setShowModal(true); }
  function closeModal() { setShowModal(false); setEditTx(null); }

  let filtered = txList.filter(t => {
    if (filterType !== "All" && t.type !== filterType.toLowerCase()) return false;
    if (filterCategory !== "All" && t.category !== filterCategory) return false;
    if (searchText && !t.desc.toLowerCase().includes(searchText.toLowerCase())) return false;
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (sortBy === "date-desc") return new Date(b.date) - new Date(a.date);
    if (sortBy === "date-asc") return new Date(a.date) - new Date(b.date);
    if (sortBy === "amount-desc") return b.amount - a.amount;
    if (sortBy === "amount-asc") return a.amount - b.amount;
    return 0;
  });

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Transactions</h2>
          <p className="page-sub">{filtered.length} transactions found</p>
        </div>
        {role === "admin" && (
          <button className="btn-primary" onClick={openAdd}>+ Add Transaction</button>
        )}
      </div>

      <div className="filters-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
        />
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="All">All Types</option>
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
          ))}
        </select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date-desc">Date (Newest)</option>
          <option value="date-asc">Date (Oldest)</option>
          <option value="amount-desc">Amount (High)</option>
          <option value="amount-asc">Amount (Low)</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">◎</span>
          <p>No transactions match your filters.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="tx-table-wrap desktop-only">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  {role === "admin" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id}>
                    <td className="tx-date-cell">{formatDate(tx.date)}</td>
                    <td className="tx-desc-cell">{tx.desc}</td>
                    <td>
                      <span className="cat-badge" style={{ background: categoryColors[tx.category] + "22", color: categoryColors[tx.category] }}>
                        {tx.category}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge ${tx.type}`}>
                        {tx.type === "income" ? "↑ Income" : "↓ Expense"}
                      </span>
                    </td>
                    <td className={`amount-cell ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </td>
                    {role === "admin" && (
                      <td className="actions-cell">
                        <button className="btn-edit" onClick={() => openEdit(tx)}>Edit</button>
                        <button className="btn-delete" onClick={() => deleteTransaction(tx.id)}>Delete</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="tx-card-list mobile-only">
            {filtered.map(tx => (
              <div key={tx.id} className="tx-card">
                <div className="tx-card-left">
                  <div className="tx-card-dot" style={{ background: categoryColors[tx.category] || "#94a3b8" }}></div>
                  <div className="tx-card-info">
                    <span className="tx-card-desc">{tx.desc}</span>
                    <div className="tx-card-meta">
                      <span className="cat-badge" style={{ background: categoryColors[tx.category] + "22", color: categoryColors[tx.category] }}>
                        {tx.category}
                      </span>
                      <span className="tx-card-date">{formatDate(tx.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="tx-card-right">
                  <span className={`tx-card-amount ${tx.type}`}>
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                  </span>
                  {role === "admin" && (
                    <div className="tx-card-actions">
                      <button className="btn-edit" onClick={() => openEdit(tx)}>Edit</button>
                      <button className="btn-delete" onClick={() => deleteTransaction(tx.id)}>Del</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && <TransactionModal existingTx={editTx} onClose={closeModal} />}
    </div>
  );
}