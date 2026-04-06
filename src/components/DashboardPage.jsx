import React from "react";
import SummaryCards from "./SummaryCards";
import BalanceTrend from "./BalanceTrend";
import SpendingBreakdown from "./SpendingBreakdown";
import RecentTransactions from "./RecentTransactions";
import { useApp } from "../context/AppContext";

export default function DashboardPage() {
  const { role } = useApp();

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h2 className="page-title">Overview</h2>
          <p className="page-sub">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="role-badge">
          <span className={`role-pill ${role}`}>{role === "admin" ? "🔐 Admin" : "👁 Viewer"}</span>
        </div>
      </div>

      <SummaryCards />

      <div className="charts-row">
        <BalanceTrend />
        <SpendingBreakdown />
      </div>

      <RecentTransactions />
    </div>
  );
}