import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { categoryColors } from "../data/transactions";

function getSpendingByCategory(txList) {
  const map = {};
  txList
    .filter(t => t.type === "expense")
    .forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, total]) => ({ cat, total }));
}

function buildDonutPaths(data) {
  const total = data.reduce((s, d) => s + d.total, 0);
  const cx = 80, cy = 80, r = 60, inner = 35;
  let angle = -Math.PI / 2;
  const paths = [];

  data.forEach(d => {
    const slice = (d.total / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + slice);
    const y2 = cy + r * Math.sin(angle + slice);
    const ix1 = cx + inner * Math.cos(angle);
    const iy1 = cy + inner * Math.sin(angle);
    const ix2 = cx + inner * Math.cos(angle + slice);
    const iy2 = cy + inner * Math.sin(angle + slice);
    const large = slice > Math.PI ? 1 : 0;

    const path = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${large} 0 ${ix1} ${iy1} Z`;
    paths.push({ ...d, path, pct: Math.round((d.total / total) * 100) });
    angle += slice;
  });

  return paths;
}

export default function SpendingBreakdown() {
  const { txList } = useApp();
  const data = getSpendingByCategory(txList);
  const paths = buildDonutPaths(data);
  const [hovered, setHovered] = useState(null);

  const total = data.reduce((s, d) => s + d.total, 0);
  const activeItem = hovered ? data.find(d => d.cat === hovered) : null;

  return (
    <div className="chart-card">
      <h3 className="chart-title">Spending by Category</h3>
      <div className="donut-layout">
        <div className="donut-wrap">
          <svg viewBox="0 0 160 160" className="donut-svg">
            {paths.map(p => (
              <path
                key={p.cat}
                d={p.path}
                fill={categoryColors[p.cat] || "#94a3b8"}
                opacity={hovered && hovered !== p.cat ? 0.3 : 1}
                onMouseEnter={() => setHovered(p.cat)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              />
            ))}
            <text x="80" y="75" textAnchor="middle" fontSize="10" fill="var(--text-muted)">
              {activeItem ? activeItem.cat : "Total"}
            </text>
            <text x="80" y="91" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)">
              {activeItem
                ? "₹" + activeItem.total.toLocaleString("en-IN")
                : "₹" + total.toLocaleString("en-IN")}
            </text>
          </svg>
        </div>
        <div className="donut-legend">
          {paths.slice(0, 6).map(p => (
            <div
              key={p.cat}
              className="legend-row"
              onMouseEnter={() => setHovered(p.cat)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: hovered && hovered !== p.cat ? 0.4 : 1 }}
            >
              <span className="legend-dot" style={{ background: categoryColors[p.cat] || "#94a3b8" }}></span>
              <span className="legend-name">{p.cat}</span>
              <span className="legend-pct">{p.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}