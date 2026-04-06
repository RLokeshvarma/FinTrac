import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/DashboardPage";
import TransactionsPage from "./components/TransactionsPage";
import InsightsPage from "./components/InsightsPage";
import "./styles.css";

function AppContent() {
  const { activePage } = useApp();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "transactions" && <TransactionsPage />}
        {activePage === "insights" && <InsightsPage />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}