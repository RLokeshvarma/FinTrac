import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setSuccessMsg("");
    if (!email || !password) return setError("Please fill all fields.");
    if (isSignUp && !name) return setError("Please enter your name.");
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, name);
        setSuccessMsg("Account created! Check your email to confirm, then sign in.");
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  function handleKey(e) {
    if (e.key === "Enter") handleSubmit();
  }

  function switchMode() {
    setIsSignUp(p => !p);
    setError("");
    setSuccessMsg("");
  }

  return (
    <div className="login-page">
      <div className="login-box">
        <div className="login-logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">FinTrac</span>
        </div>

        <h2 className="login-title">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
        <p className="login-sub">
          {isSignUp ? "Start tracking your finances today" : "Sign in to your account"}
        </p>

        {isSignUp && (
          <label className="form-label">
            Your Name
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Durga"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
            />
          </label>
        )}

        <label className="form-label">
          Email
          <input
            className="form-input"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKey}
          />
        </label>

        <label className="form-label">
          Password
          <input
            className="form-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
          />
        </label>

        {error && <p className="login-error">⚠ {error}</p>}
        {successMsg && <p className="login-success">✓ {successMsg}</p>}

        <button
          className="btn-primary login-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
        </button>

        <p className="login-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button className="link-btn" onClick={switchMode}>
            {isSignUp ? " Sign In" : " Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}