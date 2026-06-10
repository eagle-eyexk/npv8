import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

export default function Card() {
  const { user } = useAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [freezing, setFreezing] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/card`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { if (d.id) setCard(d); }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function toggleFreeze() {
    setFreezing(true);
    const r = await fetch(`${API}/api/card/freeze`, { method: "POST", headers: { Authorization: `Bearer ${tok()}` } });
    if (r.ok) { const d = await r.json(); setCard((c: any) => ({ ...c, status: d.status })); }
    setFreezing(false);
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!card) return <div className="content-wrap" style={{ paddingTop: 40, textAlign: "center", color: "var(--text-muted)" }}>No card found</div>;

  const frozen = card.status === "frozen";

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 20px" }} className="anim-up">
        <h2 className="page-title">Virtual Card</h2>
      </div>

      {/* 3D Card */}
      <div className="anim-up anim-delay-1" style={{ marginBottom: 24 }}>
        <div className={`nexa-card`} style={frozen ? { filter: "grayscale(0.5) opacity(0.8)" } : {}}>
          <div className="card-chip" />
          <div style={{ fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, letterSpacing: "0.12em", marginBottom: 20 }}>
            •••• •••• •••• {card.last4}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Card Holder</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.fullName?.toUpperCase()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Expires</div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}</div>
            </div>
          </div>
          <div style={{ position: "absolute", top: 20, right: 20, fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{card.network}</div>
          {frozen && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.35)", borderRadius: 20 }}><span style={{ fontSize: 42 }}>🔒</span></div>}
        </div>
      </div>

      {/* Stats */}
      <div className="anim-up anim-delay-2 grid-2" style={{ marginBottom: 20 }}>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-value" style={{ color: "var(--primary)" }}>${parseFloat(card.availableUsd).toFixed(0)}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card" style={{ textAlign: "center" }}>
          <div className="stat-value" style={{ color: "var(--text-muted)" }}>${parseFloat(card.spendLimitUsd).toFixed(0)}</div>
          <div className="stat-label">Limit</div>
        </div>
      </div>

      {/* Status + Controls */}
      <div className="anim-up anim-delay-3 glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="flex-between">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: frozen ? "#EF4444" : "#10B981", boxShadow: frozen ? "0 0 8px rgba(239,68,68,0.5)" : "0 0 8px rgba(16,185,129,0.5)" }} />
            <span style={{ fontWeight: 600, fontSize: 15 }}>{frozen ? "Card Frozen" : "Card Active"}</span>
          </div>
          <button className={`btn ${frozen ? "btn-green" : "btn-secondary"}`} style={{ padding: "8px 18px", fontSize: 13 }} onClick={toggleFreeze} disabled={freezing}>
            {freezing ? <span className="spinner" /> : frozen ? "🔓 Unfreeze" : "🔒 Freeze"}
          </button>
        </div>
      </div>

      {/* Spend history */}
      <div className="anim-up anim-delay-4">
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>Spend History</div>
        <div className="glass-card" style={{ padding: "0 16px" }}>
          {!card.spendHistory?.length ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>No transactions yet</div>
          ) : card.spendHistory.map((s: any) => (
            <div key={s.id} className="tx-item">
              <div className="tx-icon" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6" }}>💳</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.merchantName}</div>
                <div className="text-xs text-muted">{s.category} · {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ fontWeight: 700, color: "#EF4444" }}>−${s.amountUsd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
