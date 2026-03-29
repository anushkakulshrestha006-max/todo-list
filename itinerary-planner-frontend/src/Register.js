import React, { useState } from "react";
import axios from "axios";

function Register({ onRegister, goToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5001/auth/register", {
        username: name,
        email,
        password,
      });

      alert(res.data.message || "Registration successful 🎉");

      // ✅ Switch back to login after register
      if (onRegister) onRegister();

    } catch (error) {
      console.error(error.response || error);
      setError(error.response?.data?.message || "Registration failed ❌");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account ✨</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Enter Username"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <button type="submit">Register</button>
        </form>

        {/* ✅ Error message UI */}
        {error && <p className="auth-error">{error}</p>}

        {/* ✅ Switch without reload */}
        <p className="auth-toggle" onClick={goToLogin}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

export default Register;