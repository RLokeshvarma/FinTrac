import React from "react";
import { useApp } from "../context/AppContext";

function formatMoney(n) {
  return "₹" + n.toLocaleString("en-IN");
}

export default function SummaryCards() {
  const { balance, totalIncome, totalExpense } = useApp();

  const cards = [
    {
      label: "Total Balance",
      value: formatMoney(balance),
      icon: "◈",
      color: "card-blue",
      sub: "All time net",
    },
    {
      label: "Total Income",
      value: formatMoney(totalIncome),
      icon: "↑",
      color: "card-green",
      sub: "All income sources",
    },
    {
      label: "Total Expenses",
      value: formatMoney(totalExpense),
      icon: "↓",
      color: "card-red",
      sub: "All spending",
    },
    {
      label: "Savings Rate",
      value: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) + "%" : "0%",
      icon: "%",
      color: "card-yellow",
      sub: "Income saved",
    },
  ];

  return (
    <div className="cards-grid">
      {cards.map(card => (
        <div key={card.label} className={`summary-card ${card.color}`}>
          <div className="card-top">
            <span className="card-label">{card.label}</span>
            <span className="card-icon-badge">{card.icon}</span>
          </div>
          <div className="card-value">{card.value}</div>
          <div className="card-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}