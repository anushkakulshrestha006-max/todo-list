import React, { useState } from "react";
import axios from "axios";

function Login({ onLogin, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5001/auth/login", {
        email,
        password,
      });

      // ✅ Save token + username
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);

      alert("Login successful ✅");

      // ✅ Switch to main app
      if (onLogin) onLogin();

    } catch (error) {
      console.error(error.response || error);
      setError(error.response?.data?.message || "Login failed ❌");
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

          <button type="submit">Login</button>
        </form>

        {/* ✅ Error message */}
        {error && <p className="auth-error">{error}</p>}

        {/* ✅ Switch to Register WITHOUT page reload */}
        <p className="auth-toggle" onClick={goToRegister}>
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;