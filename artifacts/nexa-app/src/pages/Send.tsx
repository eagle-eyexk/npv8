import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

export default function Send() {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => setBalance(d.balanceNexa ?? null)).catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(null); setLoading(true);
    try {
      const r = await fetch(`${API}/api/transactions`, {
        method: "POST", headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress, amount: parseFloat(amount), memo }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess(d);
      setToAddress(""); setAmount(""); setMemo("");
      setBalance(b => b !== null ? +(b - parseFloat(amount)).toFixed(8) : null);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const eur = amount ? (parseFloat(amount) * 100).toFixed(2) : null;

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 20px" }} className="anim-up">
        <h2 className="page-title">Send NEXA</h2>
        <div className="text-sm text-muted mt-4">Transfer to any NEXA address</div>
      </div>

      {balance !== null && (
        <div className="anim-up anim-delay-1 glass-card" style={{ padding: 16, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Available</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, color: "var(--primary)" }}>
              {balance.toFixed(6)} NEXA
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="text-xs text-muted">In EUR</div>
            <div style={{ fontWeight: 700, color: "var(--accent)" }}>€{(balance * 100).toFixed(2)}</div>
          </div>
        </div>
      )}

      {success ? (
        <div className="anim-in glass-card" style={{ padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Transaction Sent!</div>
          <div className="text-muted text-sm" style={{ marginBottom: 16 }}>{success.amount} NEXA · €{(success.amount * 100).toFixed(2)}</div>
          <div className="mono text-xs text-muted" style={{ wordBreak: "break-all" }}>{success.txHash}</div>
          <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => setSuccess(null)}>Send Another</button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="anim-up anim-delay-2" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="input-wrap">
            <label className="input-label">Recipient Address</label>
            <input className="input-field mono" placeholder="nexa1…" value={toAddress} onChange={e => setToAddress(e.target.value)} required />
          </div>
          <div className="input-wrap">
            <label className="input-label">Amount (NEXA)</label>
            <input className="input-field" type="number" step="0.000001" min="0.000001" placeholder="0.0000" value={amount} onChange={e => setAmount(e.target.value)} required />
            {eur && <div className="text-sm text-muted mt-4">≈ <strong style={{ color: "var(--accent)" }}>€{eur}</strong></div>}
          </div>
          <div className="input-wrap">
            <label className="input-label">Memo (optional)</label>
            <input className="input-field" placeholder="Note for recipient…" value={memo} onChange={e => setMemo(e.target.value)} />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary btn-lg w-full" disabled={loading}>
            {loading ? <span className="spinner" /> : `Send ${amount || "0"} NEXA${eur ? ` · €${eur}` : ""}`}
          </button>
        </form>
      )}
    </div>
  );
}
