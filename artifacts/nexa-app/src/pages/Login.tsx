import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

export default function Login() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card anim-up">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", marginBottom: 14, boxShadow: "0 4px 20px rgba(14,165,233,0.3)" }} />
          <div className="auth-title">Welcome Back</div>
          <div className="text-muted text-sm">Sign in to your NEXA wallet</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="input-wrap">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          </div>
          <div className="input-wrap">
            <label className="input-label">Password</label>
            <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary w-full" style={{ marginTop: 4, height: 50, fontSize: 16 }} disabled={loading}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>

        <div className="divider" style={{ margin: "20px 0" }}>or</div>
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
