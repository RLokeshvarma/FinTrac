import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./AuthContext";

const SheetsContext = createContext();

export function SheetsProvider({ children }) {
  const { user } = useAuth();
  const [sheets, setSheets] = useState([]);

  useEffect(() => {
    if (user) fetchSheets();
  }, [user]);

  async function fetchSheets() {
    const { data } = await supabase
      .from("sheets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSheets(data || []);
  }

  async function addSheet(name, budget, color, icon) {
    const { data, error } = await supabase
      .from("sheets")
      .insert({ user_id: user.id, name, budget, color, icon })
      .select()
      .single();
    if (!error && data) setSheets(prev => [data, ...prev]);
    return data;
  }

  async function updateSheet(id, updates) {
    await supabase.from("sheets").update(updates).eq("id", id);
    setSheets(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }

  async function deleteSheet(id) {
    await supabase.from("sheets").delete().eq("id", id);
    setSheets(prev => prev.filter(s => s.id !== id));
  }

  return (
    <SheetsContext.Provider value={{ sheets, fetchSheets, addSheet, updateSheet, deleteSheet }}>
      {children}
    </SheetsContext.Provider>
  );
}

export function useSheets() {
  return useContext(SheetsContext);
}