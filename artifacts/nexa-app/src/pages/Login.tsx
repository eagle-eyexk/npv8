import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

export default function Login() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try { await login(form.email, form.password); nav("/dashboard"); }
    catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="auth-pg">
      <div className="auth-card up">
        <div className="tc mb-20">
          <img src={nexaLogo} alt="NEXA" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", marginBottom: 12, boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Welcome back</h1>
          <p className="muted sm">Sign in to your NEXA Pay wallet</p>
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="inp-group">
            <label className="inp-label">Email address</label>
            <input className="inp" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoComplete="email" />
          </div>
          <div className="inp-group">
            <label className="inp-label">Password</label>
            <div className="inp-icon">
              <input className="inp" type={show ? "text" : "password"} placeholder="Enter your password"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required autoComplete="current-password" />
              <button type="button" className="inp-icon-btn" onClick={() => setShow(s => !s)} style={{ fontSize: 14 }}>
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && <div className="form-err">{error}</div>}
          <button className="btn btn-primary w-full" style={{ height: 50, fontSize: 15, marginTop: 4 }} disabled={loading}>
            {loading ? <span className="spin" /> : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text-muted)" }}>
          Don't have an account?{" "}
          <Link href="/register" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Create wallet</Link>
        </div>
      </div>
    </div>
  );
}
