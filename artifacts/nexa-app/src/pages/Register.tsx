import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

function downloadSecurityFile(data: {
  address: string; email: string; fullName: string;
  recoveryPhrase: string; createdAt: string;
}) {
  const content = {
    version: "1.0",
    product: "NEXA Pay",
    network: "NEXA Mainnet",
    walletAddress: data.address,
    accountName: data.fullName,
    email: data.email,
    recoveryPhrase: data.recoveryPhrase,
    createdAt: data.createdAt,
    instructions: [
      "1. Store this file in a secure, offline location (USB drive, printed paper safe).",
      "2. Your recovery phrase is the ONLY way to restore your wallet if you lose access.",
      "3. Never share this file or your recovery phrase with anyone.",
      "4. NEXA Pay cannot recover your wallet without this information.",
    ],
    WARNING: "ANYONE with this file and recovery phrase can access your wallet funds.",
  };
  const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `nexa-wallet-${data.address.slice(0, 16)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function Register() {
  const { register } = useAuth();
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "", fullName: "", role: "user" as "user" | "merchant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [securityData, setSecurityData] = useState<any>(null);
  const [downloaded, setDownloaded] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const API = import.meta.env.BASE_URL.replace(/\/$/, "");
      const r = await fetch(`${API}/api/auth/register`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Registration failed");

      // Store security info for download step
      setSecurityData({
        address: data.wallet.address,
        email: form.email,
        fullName: form.fullName,
        recoveryPhrase: data.recoveryPhrase,
        createdAt: new Date().toISOString(),
        token: data.token,
        user: data.user,
        walletId: data.wallet?.id,
        merchantId: data.merchant?.id ?? null,
      });
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  function handleDownload() {
    downloadSecurityFile(securityData);
    setDownloaded(true);
  }

  function handleContinue() {
    localStorage.setItem("nexa_token", securityData.token);
    window.location.href = import.meta.env.BASE_URL.replace(/\/$/, "") + "/dashboard";
  }

  // Step 2: Download security file
  if (securityData) return (
    <div className="auth-pg">
      <div className="auth-card up" style={{ maxWidth: 480 }}>
        <div className="tc mb-20">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Secure Your Wallet</h1>
          <p className="muted sm">Download your wallet security file before continuing. This is the only time you'll receive your recovery phrase.</p>
        </div>

        {/* Security banner */}
        <div className="sec-banner" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🛡️ Your Recovery Phrase</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 2, letterSpacing: "0.04em", background: "rgba(255,255,255,0.15)", padding: "10px 14px", borderRadius: 10, wordBreak: "break-word" }}>
            {securityData.recoveryPhrase}
          </div>
          <div style={{ fontSize: 11, marginTop: 10, opacity: 0.8 }}>Write these 12 words down and store them safely.</div>
        </div>

        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#92400E", lineHeight: 1.6 }}>
          ⚠️ <strong>Warning:</strong> If you lose your recovery phrase and this file, your funds cannot be recovered. NEXA Pay has no access to your private keys.
        </div>

        <div style={{ display: "flex", gap: 10, flexDirection: "column" }}>
          <button className="btn btn-primary w-full btn-lg" onClick={handleDownload}>
            {downloaded ? "✓ Downloaded — Download Again" : "⬇️ Download Wallet Security File"}
          </button>
          <button
            className={`btn w-full btn-lg ${downloaded ? "btn-success" : "btn-ghost"}`}
            onClick={handleContinue} disabled={!downloaded}
            style={!downloaded ? { opacity: 0.4 } : {}}>
            {downloaded ? "Continue to Wallet →" : "Download file to continue"}
          </button>
        </div>

        {downloaded && (
          <div style={{ marginTop: 12, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
            File saved as <code style={{ fontSize: 11 }}>nexa-wallet-{securityData.address.slice(0, 16)}.json</code>
          </div>
        )}
      </div>
    </div>
  );

  // Step 1: Register form
  return (
    <div className="auth-pg">
      <div className="auth-card up">
        <div className="tc mb-20">
          <img src={nexaLogo} alt="NEXA" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", marginBottom: 12, boxShadow: "0 4px 16px rgba(37,99,235,0.25)" }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Create Wallet</h1>
          <p className="muted sm">Your NEXA Pay wallet starts with 0 NEXA</p>
        </div>

        {/* Role */}
        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          {(["user", "merchant"] as const).map(r => (
            <button key={r} type="button"
              onClick={() => setForm(f => ({ ...f, role: r }))}
              style={{
                flex: 1, padding: "11px 0", borderRadius: 10, border: form.role === r ? `2px solid var(--primary)` : "1.5px solid var(--border)",
                background: form.role === r ? "var(--primary-light)" : "var(--surface)",
                color: form.role === r ? "var(--primary)" : "var(--text-muted)",
                fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.15s",
              }}>
              {r === "user" ? "👤 Personal" : "🏪 Merchant"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          <div className="inp-group">
            <label className="inp-label">Full Name</label>
            <input className="inp" placeholder="John Smith" value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          </div>
          <div className="inp-group">
            <label className="inp-label">Email address</label>
            <input className="inp" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="inp-group">
            <label className="inp-label">Password (6+ characters)</label>
            <input className="inp" type="password" placeholder="Choose a strong password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
          </div>

          <div style={{ background: "var(--primary-light)", border: "1px solid var(--primary-border)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "var(--primary)", fontWeight: 500 }}>
            🔐 A wallet security file will be generated — keep it safe!
          </div>

          {error && <div className="form-err">{error}</div>}
          <button className="btn btn-primary w-full" style={{ height: 50, fontSize: 15, marginTop: 4 }} disabled={loading}>
            {loading ? <span className="spin" /> : "Create Wallet"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--text-muted)" }}>
          Already have a wallet?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
