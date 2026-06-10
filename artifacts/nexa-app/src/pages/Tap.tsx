import { useState, useEffect } from "react";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

export default function Tap() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/merchants`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => setMerchants(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  async function pay() {
    if (!selected || !amount) return;
    setError(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/tap/quick`, {
        method: "POST", headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), merchantId: selected.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess(d); setAmount("");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="pg in" style={{ paddingTop: 40, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "60vh", justifyContent: "center" }}>
      <div className="card card-p tc" style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--success-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 40 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Payment Successful</h2>
        <div style={{ fontWeight: 800, fontSize: 32, color: "var(--primary)", marginBottom: 4 }}>{success.amount} NEXA</div>
        <div className="muted">€{(success.amount * 100).toFixed(2)} · {success.merchant}</div>
        <div className="mono xs muted mt-12" style={{ wordBreak: "break-all", background: "var(--bg)", padding: "8px 12px", borderRadius: 8 }}>{success.txHash}</div>
        <button className="btn btn-primary w-full mt-20" onClick={() => setSuccess(null)}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-20">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Tap to Pay</h2>
        <div className="muted sm mt-4">Hold your phone near the merchant device</div>
      </div>

      {/* Merchant select */}
      <div className="up d1 mb-16">
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10 }}>Select Merchant</div>
        {!merchants.length ? (
          <div className="card card-p tc muted sm">No merchants available</div>
        ) : merchants.map(m => (
          <div key={m.id} onClick={() => setSelected(m)} className="card" style={{ padding: "14px 16px", marginBottom: 8, cursor: "pointer", border: selected?.id === m.id ? "2px solid var(--primary)" : "1px solid var(--border)", background: selected?.id === m.id ? "var(--primary-light)" : "#fff", transition: "all 0.15s", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{m.businessName}</div>
              <div className="xs muted mt-4">{m.category} · {m.transactionCount} transactions</div>
            </div>
            {selected?.id === m.id && <span className="bdg bdg-blue">Selected</span>}
          </div>
        ))}
      </div>

      {selected && (
        <div className="up d2">
          <div className="inp-group mb-20">
            <label className="inp-label">Amount (NEXA)</label>
            <input className="inp" type="number" step="0.000001" min="0.000001" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} style={{ fontSize: 24, fontWeight: 700, height: 60, textAlign: "center" }} />
            {amount && parseFloat(amount) > 0 && (
              <div className="tc sm" style={{ marginTop: 6, color: "var(--success)", fontWeight: 600 }}>
                ≈ €{(parseFloat(amount) * 100).toFixed(2)}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <button className="tap-ring" onClick={pay} disabled={loading || !amount || parseFloat(amount) <= 0}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, color: "var(--primary)" }}>{loading ? "⏳" : "📲"}</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "var(--primary)", marginTop: 6 }}>
                  {loading ? "Processing…" : "TAP TO PAY"}
                </div>
              </div>
            </button>
            <div className="muted sm">Tap to pay {selected.businessName}</div>
          </div>

          {/* How it works */}
          <div className="card card-p">
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>How it Works</div>
            <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
              {[
                { icon: "🏪", label: "Merchant enters amount" },
                { icon: "📲", label: "Customer taps phone" },
                { icon: "🔐", label: "Secure verification" },
                { icon: "✅", label: "Instant settlement" },
              ].map((s, i) => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flexShrink: 0, width: 80 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div style={{ fontSize: 10, textAlign: "center", color: "var(--text-muted)", lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {error && <div className="form-err mt-12">{error}</div>}
    </div>
  );
}
