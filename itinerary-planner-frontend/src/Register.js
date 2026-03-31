import React, { useState } from "react";
import axios from "axios";

function Register({ onRegister, goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ Railway backend URL
  const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/auth/register`,
        {
          username: name,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      // ✅ Save token + username safely
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "username",
        res.data.user?.name || res.data.user?.username || name
      );

      // Redirect to login or app
      if (onRegister) onRegister();

    } catch (err) {
      console.error("Register Error:", err.response || err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <p className="auth-toggle" onClick={goToLogin}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

export default Register;