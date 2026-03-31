import React, { useState } from "react";
import axios from "axios";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = "https://energetic-wisdom-production-dda6.up.railway.app";

  // ✅ Extract token from URL: /reset-password?token=xxx
  const token = new URLSearchParams(window.location.search).get("token");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirm) {
      setError("Passwords do not match ❌");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setMessage(res.data.message || "Password reset successful ✅ You can now login.");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Reset Password 🔑</h2>

        {!token ? (
          <p style={{ color: "#ff6b6b" }}>Invalid or expired reset link.</p>
        ) : (
          <form onSubmit={handleReset}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

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
      </div>
    </div>
  );
}

export default ResetPassword;