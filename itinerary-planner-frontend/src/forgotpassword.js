import React, { useState } from "react";
import axios from "axios";

function ForgotPassword({ goToLogin }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
      setMessage(res.data.message || "Reset email sent! Check your inbox ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Forgot Password 🔒</h2>
        <p style={{ fontSize: "13px", color: "#ddd", marginBottom: "16px" }}>
          Enter your registered email — we'll send a reset link.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && (
          <p style={{ color: "#90ee90", marginTop: "12px", fontSize: "13px" }}>
            {message}
          </p>
        )}
        {error && (
          <p style={{ color: "#ff6b6b", marginTop: "12px", fontSize: "13px" }}>
            {error}
          </p>
        )}

        <p className="auth-toggle" onClick={goToLogin}>
          ← Back to Login
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;