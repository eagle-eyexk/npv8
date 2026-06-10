import { useState, useEffect } from "react";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

export default function MerchantDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("0");
  const [claimToken, setClaimToken] = useState("");
  const [charging, setCharging] = useState(false);
  const [claimResult, setClaimResult] = useState<any>(null);
  const [error, setError] = useState("");

  const load = () => {
    fetch(`${API}/api/merchants/my`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { if (d.merchant) setData(d); }).catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  function key(k: string) {
    if (k === "⌫") { setAmount(a => a.length <= 1 ? "0" : a.slice(0, -1)); return; }
    if (k === "." && amount.includes(".")) return;
    if (k === "." && amount === "0") { setAmount("0."); return; }
    setAmount(a => a === "0" ? k : a + k);
  }

  async function claim() {
    if (!claimToken.trim()) { setError("Enter a token"); return; }
    setError(""); setCharging(true);
    try {
      const r = await fetch(`${API}/api/tap/claim`, {
        method: "POST", headers: { Authorization: `Bearer ${tok()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ token: claimToken }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setClaimResult(d); setClaimToken(""); load();
    } catch (err: any) { setError(err.message); }
    finally { setCharging(false); }
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" style={{ width: 36, height: 36 }} /></div>;

  if (!data) return (
    <div className="pg" style={{ paddingTop: 40, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🏪</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>Merchant Access Only</div>
      <div className="muted sm">Register as a merchant to access the POS terminal.</div>
    </div>
  );

  const m = data.merchant;
  const w = data.wallet;

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-16" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 20 }}>NEXA POS</h2>
          <div className="muted sm mt-4">{m.businessName}</div>
        </div>
        <span className="bdg bdg-green">● Active</span>
      </div>

      {/* Balance */}
      <div className="grid2 up d1 mb-14">
        <div className="bal-card" style={{ padding: "16px 18px" }}>
          <div style={{ fontSize: 11, opacity: 0.75, marginBottom: 4 }}>NEXA Balance</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>{w?.balanceNexa?.toFixed(4) ?? "0"}</div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>NEXA</div>
        </div>
        <div className="card card-p tc">
          <div className="xs muted mb-6">EUR Value</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "var(--success)" }}>€{(w?.balanceNexa * 100)?.toFixed(2) ?? "0.00"}</div>
          <div className="xs muted mt-4">{m.transactionCount} payments</div>
        </div>
      </div>

      {/* POS Keypad */}
      <div className="card card-p up d2 mb-14">
        <div className="tc mb-14">
          <div className="xs muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Enter Amount</div>
          <div style={{ fontWeight: 800, fontSize: 44, color: "var(--primary)", letterSpacing: "-0.02em" }}>
            {amount}
            <span style={{ fontSize: 18, color: "var(--text-muted)", marginLeft: 6 }}>NEXA</span>
          </div>
          {parseFloat(amount) > 0 && (
            <div style={{ color: "var(--success)", fontWeight: 600, fontSize: 15, marginTop: 4 }}>
              ≈ €{(parseFloat(amount) * 100).toFixed(2)}
            </div>
          )}
        </div>
        <div className="pos-pad">
          {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map(k => (
            <button key={k} className="pos-key" onClick={() => key(k)}>{k}</button>
          ))}
        </div>
      </div>

      {/* Claim token */}
      <div className="card card-p up d3 mb-14">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>⚡ Claim Payment Token</div>
        <div style={{ display: "flex", gap: 10 }}>
          <input className="inp mono" placeholder="Paste token from customer…" value={claimToken}
            onChange={e => setClaimToken(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-primary" style={{ flexShrink: 0 }} onClick={claim} disabled={charging}>
            {charging ? <span className="spin" /> : "Claim"}
          </button>
        </div>
        {error && <div className="form-err mt-8">{error}</div>}
        {claimResult && (
          <div style={{ marginTop: 10, background: "var(--success-bg)", border: "1px solid #BBF7D0", borderRadius: 10, padding: "10px 14px", fontSize: 14, color: "var(--success)" }}>
            ✅ Received <strong>{claimResult.amount} NEXA</strong> · €{(claimResult.amount * 100).toFixed(2)}
          </div>
        )}
      </div>

      {/* Recent txns */}
      <div className="up d4">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Recent Payments</div>
        <div className="card card-p">
          {!data.recentTransactions?.length ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>No payments yet</div>
          ) : data.recentTransactions.map((t: any) => (
            <div key={t.id} className="tx-row">
              <div className="tx-ico" style={{ background: "#ECFDF5", color: "var(--success)" }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Payment Received</div>
                <div className="xs muted mt-4">{new Date(t.createdAt).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, color: "var(--success)" }}>+{t.amount.toFixed(6)}</div>
                <div className="xs muted">€{(t.amount * 100).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
