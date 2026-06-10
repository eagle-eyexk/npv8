import { useState, useEffect, useRef } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("0");
  const [charging, setCharging] = useState(false);
  const [chargeSuccess, setChargeSuccess] = useState<any>(null);
  const [claimToken, setClaimToken] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/merchants/my`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { if (d.merchant) setData(d); }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function pressKey(k: string) {
    if (k === "⌫") {
      setAmount(a => a.length <= 1 ? "0" : a.slice(0, -1));
    } else if (k === "." && amount.includes(".")) return;
    else if (k === "." && amount === "0") setAmount("0.");
    else if (amount === "0" && k !== ".") setAmount(k);
    else setAmount(a => a + k);
  }

  async function handleClaim() {
    if (!claimToken.trim()) { setError("Enter a token"); return; }
    setError(""); setCharging(true);
    try {
      const r = await fetch(`${API}/api/tap/claim`, {
        method: "POST", headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ token: claimToken }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setChargeSuccess(d); setClaimToken("");
      const mr = await fetch(`${API}/api/merchants/my`, { headers: { Authorization: `Bearer ${tok()}` } });
      if (mr.ok) setData(await mr.json());
    } catch (err: any) { setError(err.message); }
    finally { setCharging(false); }
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!data) return (
    <div className="content-wrap" style={{ paddingTop: 40, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏪</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Merchant Access Only</div>
      <div className="text-muted text-sm">Register as a merchant to access the POS system.</div>
    </div>
  );

  const m = data.merchant;
  const w = data.wallet;

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 20px" }} className="anim-up">
        <h2 className="page-title">🏪 {m.businessName}</h2>
        <span className="badge-neon badge-green text-xs">POS Terminal</span>
      </div>

      {/* Balance */}
      <div className="anim-up anim-delay-1 grid-2" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ background: "linear-gradient(135deg,rgba(14,165,233,0.08),rgba(139,92,246,0.08))" }}>
          <div className="stat-value glow-blue">{w?.balanceNexa?.toFixed(4) ?? "0"}</div>
          <div className="stat-label">NEXA Balance</div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(245,158,11,0.08))" }}>
          <div className="stat-value glow-green">€{(w?.balanceNexa * 100)?.toFixed(2) ?? "0"}</div>
          <div className="stat-label">EUR Value</div>
        </div>
      </div>

      {/* POS Keypad */}
      <div className="anim-up anim-delay-2 glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Charge Amount (NEXA)</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, color: "var(--primary)", minHeight: 52 }}>
            {amount}
            <span style={{ fontSize: 18, color: "var(--text-muted)", marginLeft: 6 }}>NEXA</span>
          </div>
          {parseFloat(amount) > 0 && (
            <div style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14, marginTop: 4 }}>
              ≈ €{(parseFloat(amount) * 100).toFixed(2)}
            </div>
          )}
        </div>
        <div className="pos-pad">
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(k => (
            <button key={k} className="pos-key" onClick={() => pressKey(k)}>{k}</button>
          ))}
        </div>
      </div>

      {/* Claim token */}
      <div className="anim-up anim-delay-3 glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚡ Claim Payment Token</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="input-field mono" placeholder="Paste token from customer…" value={claimToken} onChange={e => setClaimToken(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary" style={{ padding: "12px 18px", flexShrink: 0 }} onClick={handleClaim} disabled={charging}>
            {charging ? <span className="spinner" /> : "Claim"}
          </button>
        </div>
        {error && <div className="form-error mt-8">{error}</div>}
        {chargeSuccess && (
          <div style={{ marginTop: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: 12, fontSize: 14, color: "var(--accent)" }}>
            ✅ Received <strong>{chargeSuccess.amount} NEXA</strong> (€{(chargeSuccess.amount * 100).toFixed(2)})
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="anim-up anim-delay-4 grid-2" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-value">{m.transactionCount}</div>
          <div className="stat-label">Total Payments</div>
        </div>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-value glow-green">€{(m.totalVolume * 100).toFixed(0)}</div>
          <div className="stat-label">Total Volume</div>
        </div>
      </div>

      {/* Recent txns */}
      <div className="anim-up anim-delay-5">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Recent Payments</div>
        <div className="glass-card" style={{ padding: "0 16px" }}>
          {!data.recentTransactions?.length ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>No payments yet</div>
          ) : data.recentTransactions.map((t: any) => (
            <div key={t.id} className="tx-item">
              <div className="tx-icon" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.merchantName || "Payment"}</div>
                <div className="text-xs text-muted">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "#10B981" }}>+{t.amount.toFixed(6)} NEXA</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(t.amount * 100).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
