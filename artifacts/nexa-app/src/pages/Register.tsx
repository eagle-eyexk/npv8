import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

export default function Register() {
  const { register } = useAuth();
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "user" as "user" | "merchant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      nav("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card anim-up" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 52, height: 52, borderRadius: 14, objectFit: "cover", marginBottom: 14, boxShadow: "0 4px 20px rgba(14,165,233,0.3)" }} />
          <div className="auth-title">Join NEXA</div>
          <div className="text-muted text-sm">Create your crypto wallet in seconds</div>
        </div>

        {/* Role select */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {(["user", "merchant"] as const).map(r => (
            <button key={r} type="button"
              className={`role-pill ${form.role === r ? `selected-${r}` : ""}`}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => setForm(f => ({ ...f, role: r }))}>
              {r === "user" ? "👤 Personal" : "🏪 Merchant"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="input-wrap">
            <label className="input-label">Full Name</label>
            <input className="input-field" placeholder="John Smith" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>
          <div className="input-wrap">
            <label className="input-label">Email</label>
            <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="input-wrap">
            <label className="input-label">Password (6+ chars)</label>
            <input className="input-field" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>

          {/* Bonus banner */}
          <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "10px 14px", fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
            🎁 {form.role === "merchant" ? "Merchants receive 5 NEXA (€500) on signup" : "You'll receive 10 NEXA (€1,000) on signup!"}
          </div>

          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary w-full" style={{ height: 50, fontSize: 16 }} disabled={loading}>
            {loading ? <span className="spinner" /> : `Create ${form.role === "merchant" ? "Merchant" : ""} Account`}
          </button>
        </form>

        <div className="divider" style={{ margin: "18px 0" }}>or</div>
        <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
