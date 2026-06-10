import { useState, useEffect } from "react";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

const TXM: Record<string, { ic: string; label: string; bg: string; color: string }> = {
  send:       { ic: "↑", label: "Sent",     bg: "#FEF2F2", color: "#EF4444" },
  receive:    { ic: "↓", label: "Received", bg: "#ECFDF5", color: "#10B981" },
  tap_pay:    { ic: "⚡", label: "Tap Pay", bg: "#EFF6FF", color: "#2563EB" },
  card_spend: { ic: "💳", label: "Card",    bg: "#F5F3FF", color: "#7C3AED" },
  mining:     { ic: "⛏️", label: "Mining", bg: "#FFFBEB", color: "#D97706" },
};
const FILTERS = ["all", "send", "receive", "tap_pay", "mining", "card_spend"];

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter !== "all" ? `?type=${filter}` : "?limit=50";
    fetch(`${API}/api/transactions${q}`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { setTxs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-16">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Transaction History</h2>
      </div>

      {/* Filter pills */}
      <div className="up d1" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>
            {f === "all" ? "All" : TXM[f]?.label ?? f}
          </button>
        ))}
      </div>

      <div className="card card-p up d2">
        {loading ? (
          <div style={{ padding: "32px 0", display: "flex", justifyContent: "center" }}><div className="spin" /></div>
        ) : !txs.length ? (
          <div style={{ padding: "36px 0", textAlign: "center", color: "var(--text-muted)" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <div style={{ fontWeight: 600 }}>No transactions yet</div>
            <div className="sm muted mt-6">Your payment history will appear here</div>
          </div>
        ) : txs.map((tx, i) => {
          const m = TXM[tx.type] ?? TXM.receive;
          const out = ["send", "tap_pay", "card_spend"].includes(tx.type);
          return (
            <div key={tx.id} className="tx-row" style={{ animationDelay: `${i * 0.025}s` }}>
              <div className="tx-ico" style={{ background: m.bg, color: m.color }}>{m.ic}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.merchantName || m.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", display: "flex", gap: 8, marginTop: 2 }}>
                  <span>{new Date(tx.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={`bdg ${tx.status === "confirmed" ? "bdg-green" : "bdg-amber"}`} style={{ fontSize: 10, padding: "1px 7px" }}>{tx.status}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: out ? "var(--danger)" : "var(--success)" }}>
                  {out ? "−" : "+"}{tx.amount.toFixed(6)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>€{(tx.amount * 100).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
