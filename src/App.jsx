import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider, useApp } from "./context/AppContext";
import { SheetsProvider } from "./context/SheetsContext";
import Sidebar from "./components/Sidebar";
import DashboardPage from "./components/DashboardPage";
import TransactionsPage from "./components/TransactionsPage";
import InsightsPage from "./components/InsightsPage";
import SheetsPage from "./components/SheetsPage";
import LoginPage from "./pages/LoginPage";
import "./styles.css";

function AppContent() {
  const { activePage } = useApp();

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-area">
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "sheets" && <SheetsPage />}
        {activePage === "transactions" && <TransactionsPage />}
        {activePage === "insights" && <InsightsPage />}
      </main>
    </div>
  );
}

function AppWrapper() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <span style={{ fontSize: 40, marginBottom: 12 }}>◈</span>
        <p>Loading FinTrac...</p>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppProvider>
      <SheetsProvider>
        <AppContent />
      </SheetsProvider>
    </AppProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppWrapper />
    </AuthProvider>
  );
}