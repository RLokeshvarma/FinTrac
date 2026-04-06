import React from "react";
import { useApp } from "../context/AppContext";
import { categoryColors } from "../data/transactions";

function getMonthlyTotals(txList) {
  const months = {};
  txList.forEach(tx => {
    const key = tx.date.slice(0, 7);
    if (!months[key]) months[key] = { income: 0, expense: 0 };
    if (tx.type === "income") months[key].income += tx.amount;
    else months[key].expense += tx.amount;
  });
  return Object.entries(months)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => ({
      label: new Date(key + "-01").toLocaleString("default", { month: "long", year: "numeric" }),
      shortLabel: new Date(key + "-01").toLocaleString("default", { month: "short" }),
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    }));
}

function getCategoryTotals(txList) {
  const map = {};
  txList.filter(t => t.type === "expense").forEach(t => {
    map[t.category] = (map[t.category] || 0) + t.amount;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

export default function InsightsPage() {
  const { txList, totalIncome, totalExpense } = useApp();

  const monthly = getMonthlyTotals(txList);
  const categoryTotals = getCategoryTotals(txList);
  const maxCatVal = categoryTotals.length > 0 ? categoryTotals[0][1] : 1;

  const topCategory = categoryTotals[0] || null;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0;

  const bestMonth = monthly.length > 0
    ? monthly.reduce((best, m) => m.net > best.net ? m : best, monthly[0])
    : null;
  const worstMonth = monthly.length > 0
    ? monthly.reduce((worst, m) => m.net < worst.net ? m : worst, monthly[0])
    : null;

  const avgMonthlyExpense = monthly.length > 0
    ? Math.round(monthly.reduce((s, m) => s + m.expense, 0) / monthly.length)
    : 0;

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Insights</h2>
          <p className="page-sub">Smart observations from your data</p>
        </div>
      </div>

      {/* Key insight cards */}
      <div className="insights-grid">
        <div className="insight-card highlight-green">
          <div className="insight-icon">↑</div>
          <div>
            <p className="insight-label">Savings Rate</p>
            <p className="insight-value">{savingsRate}%</p>
            <p className="insight-sub">of total income saved</p>
          </div>
        </div>

        {topCategory && (
          <div className="insight-card highlight-red">
            <div className="insight-icon">⚠</div>
            <div>
              <p className="insight-label">Highest Spending</p>
              <p className="insight-value">{topCategory[0]}</p>
              <p className="insight-sub">₹{topCategory[1].toLocaleString("en-IN")} total</p>
            </div>
          </div>
        )}

        {bestMonth && (
          <div className="insight-card highlight-blue">
            <div className="insight-icon">★</div>
            <div>
              <p className="insight-label">Best Month</p>
              <p className="insight-value">{bestMonth.shortLabel}</p>
              <p className="insight-sub">+₹{bestMonth.net.toLocaleString("en-IN")} saved</p>
            </div>
          </div>
        )}

        <div className="insight-card highlight-yellow">
          <div className="insight-icon">~</div>
          <div>
            <p className="insight-label">Avg Monthly Spend</p>
            <p className="insight-value">₹{avgMonthlyExpense.toLocaleString("en-IN")}</p>
            <p className="insight-sub">across {monthly.length} months</p>
          </div>
        </div>
      </div>

      {/* Category spending bars */}
      <div className="chart-card" style={{ marginTop: 24 }}>
        <h3 className="chart-title">Spending by Category</h3>
        <div className="category-bars">
          {categoryTotals.map(([cat, total]) => (
            <div key={cat} className="cat-bar-row">
              <span className="cat-bar-name">{cat}</span>
              <div className="cat-bar-track">
                <div
                  className="cat-bar-fill"
                  style={{
                    width: `${(total / maxCatVal) * 100}%`,
                    background: categoryColors[cat] || "#94a3b8"
                  }}
                ></div>
              </div>
              <span className="cat-bar-amt">₹{total.toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly comparison table */}
      <div className="chart-card" style={{ marginTop: 24 }}>
        <h3 className="chart-title">Monthly Comparison</h3>
        <table className="tx-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expenses</th>
              <th>Net Savings</th>
            </tr>
          </thead>
          <tbody>
            {monthly.map(m => (
              <tr key={m.label}>
                <td>{m.label}</td>
                <td className="amount-cell income">₹{m.income.toLocaleString("en-IN")}</td>
                <td className="amount-cell expense">₹{m.expense.toLocaleString("en-IN")}</td>
                <td className={`amount-cell ${m.net >= 0 ? "income" : "expense"}`}>
                  {m.net >= 0 ? "+" : ""}₹{m.net.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}