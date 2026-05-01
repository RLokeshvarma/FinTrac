import React from "react";
import { useApp } from "../context/AppContext";

function getMonthlyData(txList) {
  const months = {};

  txList.forEach(tx => {
    const key = tx.date.slice(0, 7); // "2025-01"
    if (!months[key]) months[key] = { income: 0, expense: 0 };
    if (tx.type === "income") months[key].income += tx.amount;
    else months[key].expense += tx.amount;
  });

  return Object.entries(months)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, val]) => ({
      label: new Date(key + "-01").toLocaleString("default", { month: "short", year: "2-digit" }),
      income: val.income,
      expense: val.expense,
      net: val.income - val.expense,
    }));
}

export default function BalanceTrend() {
  const { txList } = useApp();
  const data = getMonthlyData(txList);

  const chartW = 500;
  const chartH = 180;
  const padLeft = 50;
  const padBottom = 30;
  const padTop = 20;
  const padRight = 20;

  const innerW = chartW - padLeft - padRight;
  const innerH = chartH - padTop - padBottom;

  const allValues = data.flatMap(d => [d.income, d.expense]);
  const maxVal = Math.max(...allValues, 1);

  const barWidth = innerW / (data.length * 2.5);
  const gap = innerW / data.length;

  function barHeight(val) {
    return (val / maxVal) * innerH;
  }

  function yTicks() {
    const count = 4;
    return Array.from({ length: count + 1 }, (_, i) => {
      const val = Math.round((maxVal / count) * i);
      return { val, y: padTop + innerH - (val / maxVal) * innerH };
    });
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">Monthly Income vs Expenses</h3>
      <div className="chart-legend">
        <span className="legend-dot" style={{ background: "#22c55e" }}></span>
        <span>Income</span>
        <span className="legend-dot" style={{ background: "#ef4444", marginLeft: 12 }}></span>
        <span>Expenses</span>
      </div>
      <div className="chart-scroll">
        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="bar-chart-svg">
          {/* Y-axis ticks */}
          {yTicks().map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft} y1={tick.y}
                x2={padLeft + innerW} y2={tick.y}
                stroke="var(--border)" strokeWidth="0.5"
              />
              <text x={padLeft - 6} y={tick.y + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
                {tick.val >= 1000 ? Math.round(tick.val / 1000) + "k" : tick.val}
              </text>
            </g>
          ))}

          {/* Bars */}
          {data.map((d, i) => {
            const groupX = padLeft + i * gap;
            const incH = barHeight(d.income);
            const expH = barHeight(d.expense);

            return (
              <g key={d.label}>
                {/* Income bar */}
                <rect
                  x={groupX + gap / 2 - barWidth - 2}
                  y={padTop + innerH - incH}
                  width={barWidth}
                  height={incH}
                  fill="#22c55e"
                  rx="3"
                  opacity="0.85"
                />
                {/* Expense bar */}
                <rect
                  x={groupX + gap / 2 + 2}
                  y={padTop + innerH - expH}
                  width={barWidth}
                  height={expH}
                  fill="#ef4444"
                  rx="3"
                  opacity="0.85"
                />
                {/* Label */}
                <text
                  x={groupX + gap / 2}
                  y={chartH - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--text-muted)"
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* X axis line */}
          <line
            x1={padLeft} y1={padTop + innerH}
            x2={padLeft + innerW} y2={padTop + innerH}
            stroke="var(--border)" strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}