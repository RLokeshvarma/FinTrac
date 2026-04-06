import React, { createContext, useContext, useState } from "react";
import { transactions as defaultData } from "../data/transactions";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [role, setRole] = useState("viewer");
  const [txList, setTxList] = useState(defaultData);
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [activePage, setActivePage] = useState("dashboard");

  function addTransaction(tx) {
    const newTx = { ...tx, id: Date.now() };
    setTxList(prev => [newTx, ...prev]);
  }

  function editTransaction(updated) {
    setTxList(prev => prev.map(t => (t.id === updated.id ? updated : t)));
  }

  function deleteTransaction(id) {
    setTxList(prev => prev.filter(t => t.id !== id));
  }

  const totalIncome = txList
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = txList
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <AppContext.Provider value={{
      role, setRole,
      txList, addTransaction, editTransaction, deleteTransaction,
      filterType, setFilterType,
      filterCategory, setFilterCategory,
      searchText, setSearchText,
      sortBy, setSortBy,
      activePage, setActivePage,
      totalIncome, totalExpense, balance
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}