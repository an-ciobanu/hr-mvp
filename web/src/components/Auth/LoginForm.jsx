import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    console.log("res: ", res);
    if (res.success) {
      queryClient.invalidateQueries(["me"]);
      navigate("/profile");
    } else {
      setError(res.error || "Login failed");
    }
  }

  return (
    <form
      className="card"
      style={{ maxWidth: 400, margin: "2rem auto" }}
      onSubmit={handleSubmit}
    >
      <h2 style={{ marginBottom: "1.5rem", fontWeight: 600 }}>Sign in</h2>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        className="btn"
        type="submit"
        disabled={loading}
        style={{ width: "100%", marginTop: "1rem" }}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      {error && (
        <div className="alert" style={{ marginTop: "1rem" }}>
          {error}
        </div>
      )}
    </form>
  );
}
