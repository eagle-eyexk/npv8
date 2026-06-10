import { useState, useEffect } from "react";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

export default function Send() {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<any>(null);
  const [error, setError] = useState("");
  const FEE = 0.001;

  useEffect(() => {
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => setBalance(d.balanceNexa ?? null)).catch(() => {});
  }, []);

  async function send(e: React.FormEvent) {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/transactions`, {
        method: "POST", headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ toAddress: to, amount: parseFloat(amount), memo }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setSuccess(d); setTo(""); setAmount(""); setMemo("");
      setBalance(b => b !== null ? +(b - parseFloat(amount) - FEE).toFixed(8) : null);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const num = parseFloat(amount || "0");
  const eur = num > 0 ? (num * 100).toFixed(2) : null;
  const total = num > 0 ? (num + FEE).toFixed(6) : null;

  if (success) return (
    <div className="pg" style={{ paddingTop: 40, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "60vh", justifyContent: "center" }}>
      <div className="card card-p in tc" style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sent Successfully</h2>
        <div style={{ fontWeight: 800, fontSize: 28, color: "var(--primary)", marginBottom: 4 }}>{success.amount} NEXA</div>
        <div className="muted sm">€{(success.amount * 100).toFixed(2)}</div>
        <div className="mono xs muted mt-12" style={{ wordBreak: "break-all", padding: "8px 12px", background: "var(--bg)", borderRadius: 8 }}>{success.txHash}</div>
        <button className="btn btn-primary w-full mt-20" onClick={() => setSuccess(null)}>Send Another</button>
      </div>
    </div>
  );

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-20">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Send NEXA</h2>
        <div className="muted sm mt-4">Transfer to any NEXA wallet address</div>
      </div>

      {balance !== null && (
        <div className="card card-p up d1 mb-16" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="xs muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>Available Balance</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)", marginTop: 3 }}>{balance.toFixed(6)} NEXA</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="xs muted">EUR Value</div>
            <div style={{ fontWeight: 700, color: "var(--success)", marginTop: 3 }}>€{(balance * 100).toFixed(2)}</div>
          </div>
        </div>
      )}

      <form onSubmit={send} className="up d2" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="inp-group">
          <label className="inp-label">Recipient Address</label>
          <div className="inp-icon">
            <input className="inp mono" placeholder="nexa1…" value={to} onChange={e => setTo(e.target.value)} required />
          </div>
        </div>

        <div className="inp-group">
          <label className="inp-label">You send (NEXA)</label>
          <input className="inp" type="number" step="0.000001" min="0.000001" placeholder="0.000000" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>

        <div className="inp-group">
          <label className="inp-label">Memo (optional)</label>
          <input className="inp" placeholder="Add a note…" value={memo} onChange={e => setMemo(e.target.value)} />
        </div>

        {/* Summary box */}
        {num > 0 && (
          <div className="card" style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
              <span className="muted">You send</span><span style={{ fontWeight: 600 }}>{num.toFixed(6)} NEXA</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8 }}>
              <span className="muted">Network Fee</span><span style={{ fontWeight: 600 }}>{FEE.toFixed(3)} NEXA</span>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15 }}>
              <span style={{ fontWeight: 700 }}>Total</span>
              <span style={{ fontWeight: 800, color: "var(--primary)" }}>{total} NEXA · €{((num + FEE) * 100).toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && <div className="form-err">{error}</div>}
        <button className="btn btn-primary btn-lg w-full" disabled={loading}>
          {loading ? <span className="spin" /> : `Review Payment${eur ? ` · €${eur}` : ""}`}
        </button>
      </form>
    </div>
  );
}
