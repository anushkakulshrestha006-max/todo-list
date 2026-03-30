import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      // ✅ Save token + user info safely
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "username",
        res.data.user?.name || res.data.user?.username || "User"
      );

      alert("Login successful ✅");

      if (onLogin) onLogin();

    } catch (err) {
      console.error("Login Error:", err.response || err);

      if (err.response?.data?.message) {
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

        <p className="auth-toggle" onClick={goToRegister}>
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;