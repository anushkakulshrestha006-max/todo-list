import React, { useState, useEffect } from "react";
import axios from "axios";

function Login({ onLogin, goToRegister, goToForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedCredentials, setSavedCredentials] = useState(null);

  const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

  useEffect(() => {
    const savedEmail = localStorage.getItem("saved_email");
    const savedPassword = localStorage.getItem("saved_password");
    if (savedEmail && savedPassword) {
      setSavedCredentials({ email: savedEmail, password: savedPassword });
    }
  }, []);

  const handleAutoFill = () => {
    setEmail(savedCredentials.email);
    setPassword(savedCredentials.password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${BASE_URL}/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("FULL LOGIN RESPONSE:", res.data); // 🔍 DEBUG

      // ✅ SAFELY EXTRACT TOKEN
      const token =
        res.data.token ||
        res.data.data?.token ||
        res.data.accessToken;

      if (!token) {
        throw new Error("No token received from server");
      }

      // ✅ SAVE TOKEN
      localStorage.setItem("token", token);

      // ✅ SAVE USERNAME
      const username =
        res.data.user?.name ||
        res.data.user?.username ||
        res.data.data?.user?.name ||
        "User";

      localStorage.setItem("username", username);

      // ⚠️ (Optional) REMOVE THIS FOR SECURITY
      localStorage.setItem("saved_email", email);
      localStorage.setItem("saved_password", password);

      alert("Login successful ✅");

      if (onLogin) onLogin();

    } catch (err) {
      console.error("Login Error:", err.response || err);

      if (err.message === "No token received from server") {
        setError("Server error: Token missing");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Login failed ❌");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back 👋</h2>

        {savedCredentials && (
          <div onClick={handleAutoFill} style={{
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(255,255,255,0.4)",
            borderRadius: "12px",
            padding: "10px 14px",
            marginBottom: "12px",
            cursor: "pointer",
            fontSize: "13px",
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>🔑</span>
            <span>
              Use saved account: <strong>{savedCredentials.email}</strong>
            </span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}

        <p
          style={{
            marginTop: "10px",
            fontSize: "13px",
            color: "#ddd",
            cursor: "pointer"
          }}
          onClick={goToForgotPassword}
        >
          Forgot Password?
        </p>

        <p className="auth-toggle" onClick={goToRegister}>
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;