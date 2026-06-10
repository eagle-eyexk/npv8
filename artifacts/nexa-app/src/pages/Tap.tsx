import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

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

  async function handleTap() {
    if (!selected || !amount) return;
    setError(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/tap/quick`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), merchantId: selected.id }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess(d); setAmount("");
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="content-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="glass-card anim-in" style={{ padding: 36, textAlign: "center", maxWidth: 360 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚡</div>
        <h3 style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Payment Sent!</h3>
        <div style={{ fontWeight: 700, fontSize: 28, color: "var(--primary)", marginBottom: 4 }}>{success.amount} NEXA</div>
        <div className="text-muted">€{(success.amount * 100).toFixed(2)} · {success.merchant}</div>
        <div className="mono text-xs text-muted mt-12" style={{ wordBreak: "break-all" }}>{success.txHash}</div>
        <button className="btn btn-primary w-full mt-20" onClick={() => setSuccess(null)}>Done</button>
      </div>
    </div>
  );

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 20px" }} className="anim-up">
        <h2 className="page-title">⚡ Tap to Pay</h2>
        <div className="text-sm text-muted mt-4">Instant NEXA payments</div>
      </div>

      {/* Select merchant */}
      <div className="anim-up anim-delay-1" style={{ marginBottom: 20 }}>
        <div className="text-sm" style={{ fontWeight: 600, marginBottom: 10 }}>Select Merchant</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!merchants.length ? (
            <div className="glass-card" style={{ padding: 16, textAlign: "center", color: "var(--text-muted)" }}>No merchants available</div>
          ) : merchants.map(m => (
            <div key={m.id} onClick={() => setSelected(m)}
              className="glass-card" style={{ padding: "14px 16px", cursor: "pointer", border: selected?.id === m.id ? "2px solid var(--primary)" : "1.5px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{m.businessName}</div>
                <div className="text-xs text-muted">{m.category}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--accent)" }}>{m.transactionCount} txns</div>
                {selected?.id === m.id && <span className="badge-neon badge-blue" style={{ fontSize: 10 }}>Selected</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Amount + Tap */}
      {selected && (
        <div className="anim-up anim-delay-2" style={{ marginBottom: 20 }}>
          <div className="input-wrap" style={{ marginBottom: 16 }}>
            <label className="input-label">Amount (NEXA)</label>
            <input className="input-field" type="number" step="0.000001" min="0.000001" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
            {amount && <div className="text-sm text-muted mt-4">≈ <strong style={{ color: "var(--accent)" }}>€{(parseFloat(amount || "0") * 100).toFixed(2)}</strong></div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <button className="tap-ring" onClick={handleTap} disabled={loading || !amount}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{loading ? "⏳" : "⚡"}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginTop: 6 }}>{loading ? "Sending…" : "TAP"}</div>
              </div>
            </button>
            <div className="text-sm text-muted">Tap to pay {selected.businessName}</div>
          </div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
