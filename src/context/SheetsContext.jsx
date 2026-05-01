// @refresh reset
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
    // fetch sheets user owns
    const { data: owned, error: ownedErr } = await supabase
      .from("sheets")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (ownedErr) console.error("Fetch owned sheets:", ownedErr.message);

    // fetch memberships — get sheet_id and role only, no join to avoid recursion
    const { data: memberships, error: memErr } = await supabase
      .from("sheet_members")
      .select("sheet_id, role")
      .eq("user_id", user.id);

    if (memErr) console.error("Fetch memberships:", memErr.message);

    // fetch the actual sheet data for each membership separately
    let memberSheets = [];
    if (memberships && memberships.length > 0) {
      const memberSheetIds = memberships.map(m => m.sheet_id);
      const { data: sheetData, error: sheetErr } = await supabase
        .from("sheets")
        .select("*")
        .in("id", memberSheetIds);

      if (sheetErr) console.error("Fetch member sheets:", sheetErr.message);

      memberSheets = (sheetData || []).map(s => {
        const membership = memberships.find(m => m.sheet_id === s.id);
        return { ...s, member_role: membership?.role || "member" };
      });
    }

    const ownedWithRole = (owned || []).map(s => ({ ...s, member_role: "owner" }));

    // combine and deduplicate by id
    const seen = new Set();
    const all = [];
    [...ownedWithRole, ...memberSheets].forEach(s => {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        all.push(s);
      }
    });

    setSheets(all);
  }

  async function addSheet(name, budget, color, icon) {
    const { data, error } = await supabase
      .from("sheets")
      .insert({ owner_id: user.id, name, budget, color, icon })
      .select()
      .single();

    if (error) {
      console.error("Add sheet error:", error.message);
      return null;
    }
    if (data) setSheets(prev => [{ ...data, member_role: "owner" }, ...prev]);
    return data;
  }

  async function deleteSheet(id) {
    const { error } = await supabase
      .from("sheets")
      .delete()
      .eq("id", id);
    if (error) console.error("Delete sheet error:", error.message);
    else setSheets(prev => prev.filter(s => s.id !== id));
  }

  async function inviteMember(sheetId, email, role) {
    // find profile by email
    const { data: targetProfile, error: findErr } = await supabase
      .from("profiles")
      .select("id, name, email")
      .eq("email", email)
      .maybeSingle();

    if (findErr) return { error: findErr.message };
    if (!targetProfile) return { error: "No user found with that email. They must sign up first." };

    // check if already a member
    const { data: existing } = await supabase
      .from("sheet_members")
      .select("id")
      .eq("sheet_id", sheetId)
      .eq("user_id", targetProfile.id)
      .maybeSingle();

    if (existing) return { error: "This person is already a member of this sheet." };

    // check if they are the owner
    const { data: sheet } = await supabase
      .from("sheets")
      .select("owner_id")
      .eq("id", sheetId)
      .maybeSingle();

    if (sheet?.owner_id === targetProfile.id) {
      return { error: "This person is already the owner of this sheet." };
    }

    const { error } = await supabase
      .from("sheet_members")
      .insert({ sheet_id: sheetId, user_id: targetProfile.id, role });

    if (error) return { error: error.message };
    return { success: true, name: targetProfile.name };
  }

  async function removeMember(sheetId, userId) {
    const { error } = await supabase
      .from("sheet_members")
      .delete()
      .eq("sheet_id", sheetId)
      .eq("user_id", userId);
    if (error) console.error("Remove member error:", error.message);
  }

  async function getSheetMembers(sheetId) {
    const { data: members, error } = await supabase
      .from("sheet_members")
      .select("id, user_id, role, sheet_id")
      .eq("sheet_id", sheetId);

    if (error) {
      console.error("Get members error:", error.message);
      return [];
    }

    // fetch profiles separately to avoid RLS join issues
    if (!members || members.length === 0) return [];

    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, email")
      .in("id", userIds);

    return members.map(m => ({
      ...m,
      profiles: profiles?.find(p => p.id === m.user_id) || null,
    }));
  }

  return (
    <SheetsContext.Provider value={{
      sheets, fetchSheets,
      addSheet, deleteSheet,
      inviteMember, removeMember, getSheetMembers,
    }}>
      {children}
    </SheetsContext.Provider>
  );
}

export function useSheets() {
  return useContext(SheetsContext);
}