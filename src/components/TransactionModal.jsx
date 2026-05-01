import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { categories } from "../data/transactions";

const expenseCategories = categories.filter(c => c !== "All" && c !== "Income");

export default function TransactionModal({ existingTx, onClose }) {
  const { addTransaction, editTransaction } = useApp();

  const [form, setForm] = useState({
    date: "",
    description: "",
    amount: "",
    category: "Food",
    type: "expense",
  });

  useEffect(() => {
    if (existingTx) {
      setForm({
        date: existingTx.date,
        description: existingTx.description,
        amount: existingTx.amount,
        category: existingTx.category,
        type: existingTx.type,
      });
    }
  }, [existingTx]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit() {
    if (!form.date || !form.description || !form.amount) return alert("Please fill all fields.");

    const tx = {
      ...form,
      amount: Number(form.amount),
      category: form.type === "income" ? "Income" : form.category,
    };

    if (existingTx) {
      await editTransaction({ ...tx, id: existingTx.id });
    } else {
      await addTransaction(tx);
    }
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{existingTx ? "Edit Transaction" : "Add Transaction"}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-form">
          <label>Date
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </label>
          <label>Description
            <input type="text" name="description" value={form.description} onChange={handleChange} placeholder="e.g. Salary, Swiggy..." />
          </label>
          <label>Amount (₹)
            <input type="number" name="amount" value={form.amount} onChange={handleChange} placeholder="0" min="1" />
          </label>
          <label>Type
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>
          {form.type === "expense" && (
            <label>Category
              <select name="category" value={form.category} onChange={handleChange}>
                {expenseCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          )}

          <div className="modal-actions">
            <button className="btn-cancel" onClick={onClose}>Cancel</button>
            <button className="btn-save" onClick={handleSubmit}>
              {existingTx ? "Save Changes" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}