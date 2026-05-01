// @refresh reset
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user || null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) fetchProfile(u.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error.message);
    }

    // if no profile exists yet, create one automatically
    if (!data && !error) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        const name = userData.user.user_metadata?.name
          || userData.user.email.split("@")[0];
        const { data: newProfile, error: insertErr } = await supabase
          .from("profiles")
          .insert({
            id: userData.user.id,
            name,
            email: userData.user.email,
            role: "viewer",
          })
          .select()
          .maybeSingle();

        if (insertErr) console.error("Auto profile create:", insertErr.message);
        setProfile(newProfile || null);
        setLoading(false);
        return;
      }
    }

    setProfile(data || null);
    setLoading(false);
  }

  async function signUp(email, password, name) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // store name in auth metadata too
      },
    });
    if (error) throw error;

    // insert profile — trigger will also do this but just in case
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        role: "viewer",
      }, { onConflict: "id" });
    }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  async function updateName(newName) {
    if (!user) return new Error("No user");

    const { data, error } = await supabase
      .from("profiles")
      .update({ name: newName })
      .eq("id", user.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("Update name error:", error.message);
      return error;
    }

    // update local state with the returned data from DB
    if (data) setProfile(data);
    else setProfile(prev => ({ ...prev, name: newName }));
    return null;
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error;
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signUp, signIn, signOut,
      updateName, updatePassword,
      refetchProfile: () => fetchProfile(user?.id),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}