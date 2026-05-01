// @refresh reset
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

const AppContext = createContext();

export function AppProvider({ children }) {
  const { user, profile } = useAuth();

  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [activePage, setActivePage] = useState("dashboard");
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [activeSheetName, setActiveSheetName] = useState(null);
  const [activeSheetRole, setActiveSheetRole] = useState(null);

  const role = activeSheetId
    ? (activeSheetRole === "owner" ? "admin" : "viewer")
    : (profile?.role === "admin" ? "admin" : "viewer");

  useEffect(() => {
    if (user) fetchTransactions();
  }, [user, activeSheetId]);

  async function fetchTransactions() {
    setLoading(true);
    let query = supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });

    if (activeSheetId) {
      query = query.eq("sheet_id", activeSheetId);
    } else {
      query = query.eq("user_id", user.id).is("sheet_id", null);
    }

    const { data, error } = await query;
    if (error) console.error("Fetch transactions:", error.message);
    else setTxList(data || []);
    setLoading(false);
  }

  async function addTransaction(tx) {
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        description: tx.description,
        amount: Number(tx.amount),
        type: tx.type,
        category: tx.category,
        date: tx.date,
        user_id: user.id,
        sheet_id: activeSheetId || null,
      })
      .select()
      .single();

    if (error) console.error("Add transaction:", error.message);
    else if (data) setTxList(prev => [data, ...prev]);
  }

  async function editTransaction(updated) {
    const { error } = await supabase
      .from("transactions")
      .update({
        description: updated.description,
        amount: Number(updated.amount),
        type: updated.type,
        category: updated.category,
        date: updated.date,
      })
      .eq("id", updated.id);

    if (error) console.error("Edit transaction:", error.message);
    else setTxList(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
  }

  async function deleteTransaction(id) {
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) console.error("Delete transaction:", error.message);
    else setTxList(prev => prev.filter(t => t.id !== id));
  }

  const totalIncome = txList.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txList.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <AppContext.Provider value={{
      txList, loading,
      addTransaction, editTransaction, deleteTransaction, fetchTransactions,
      filterType, setFilterType,
      filterCategory, setFilterCategory,
      searchText, setSearchText,
      sortBy, setSortBy,
      activePage, setActivePage,
      activeSheetId, setActiveSheetId,
      activeSheetName, setActiveSheetName,
      activeSheetRole, setActiveSheetRole,
      totalIncome, totalExpense, balance,
      role,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}