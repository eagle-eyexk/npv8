import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

const TX_META: Record<string, { icon: string; label: string; bg: string; color: string }> = {
  send: { icon: "↑", label: "Sent", bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  receive: { icon: "↓", label: "Received", bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  tap_pay: { icon: "⚡", label: "Tap Pay", bg: "rgba(14,165,233,0.1)", color: "#0EA5E9" },
  card_spend: { icon: "💳", label: "Card", bg: "rgba(139,92,246,0.1)", color: "#8B5CF6" },
  mining: { icon: "⛏️", label: "Mining", bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
};

const FILTERS = ["all", "send", "receive", "tap_pay", "mining"];

export default function Transactions() {
  const [txs, setTxs] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = filter !== "all" ? `?type=${filter}` : "";
    fetch(`${API}/api/transactions${q}&limit=50`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { setTxs(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 16px" }} className="anim-up">
        <h2 className="page-title">Transaction History</h2>
      </div>

      {/* Filters */}
      <div className="anim-up anim-delay-1" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`btn ${filter === f ? "btn-primary" : "btn-secondary"}`}
            style={{ padding: "7px 16px", fontSize: 12, borderRadius: 999, whiteSpace: "nowrap", flexShrink: 0 }}>
            {f === "all" ? "All" : TX_META[f]?.label ?? f}
          </button>
        ))}
      </div>

      <div className="anim-up anim-delay-2 glass-card" style={{ padding: "0 16px" }}>
        {loading ? (
          <div style={{ padding: "32px 0", display: "flex", justifyContent: "center" }}><div className="spinner" /></div>
        ) : !txs.length ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 15 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            No transactions yet
          </div>
        ) : txs.map((tx, i) => {
          const m = TX_META[tx.type] ?? TX_META.receive;
          const isOut = ["send", "tap_pay", "card_spend"].includes(tx.type);
          return (
            <div key={tx.id} className="tx-item" style={{ animationDelay: `${i * 0.03}s` }}>
              <div className="tx-icon" style={{ background: m.bg, color: m.color, fontSize: 16 }}>{m.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.merchantName || m.label}</div>
                <div className="text-xs text-muted flex" style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <span>{new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  <span className={`badge-neon ${tx.status === "confirmed" ? "badge-green" : "badge-amber"}`} style={{ padding: "1px 8px", fontSize: 10 }}>{tx.status}</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: isOut ? "#EF4444" : "#10B981" }}>
                  {isOut ? "−" : "+"}{tx.amount.toFixed(6)}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(tx.amount * 100).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
