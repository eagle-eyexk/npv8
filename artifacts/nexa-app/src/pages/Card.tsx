import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

export default function Card() {
  const { user } = useAuth();
  const [card, setCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [freezing, setFreezing] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/card`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => { if (d.id) setCard(d); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function toggleFreeze() {
    setFreezing(true);
    const r = await fetch(`${API}/api/card/freeze`, { method: "POST", headers: { Authorization: `Bearer ${tok()}` } });
    if (r.ok) { const d = await r.json(); setCard((c: any) => ({ ...c, status: d.status })); }
    setFreezing(false);
  }

  if (loading) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spin" style={{ width: 36, height: 36 }} /></div>;

  if (!card) return (
    <div className="pg" style={{ paddingTop: 40, textAlign: "center", minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>💳</div>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 6 }}>No Card Found</div>
      <div className="muted sm">Your virtual card wasn't created. Please contact support.</div>
    </div>
  );

  const frozen = card.status === "frozen";

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-20">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Virtual Card</h2>
        <div className="muted sm mt-4">NEXA Pay Card</div>
      </div>

      {/* Card visual */}
      <div className="up d1 mb-16">
        <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB,#3B82F6)", borderRadius: 20, padding: "28px 24px", color: "#fff", position: "relative", overflow: "hidden", boxShadow: "0 12px 40px rgba(37,99,235,0.4)", opacity: frozen ? 0.7 : 1, transition: "opacity 0.3s" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, background: "rgba(255,255,255,0.08)", borderRadius: "50%" }} />
          <div style={{ width: 40, height: 30, background: "linear-gradient(135deg,#ffd700,#ffb347)", borderRadius: 5, marginBottom: 24, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" }} />
          <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 24 }}>
            •••• •••• •••• {card.last4}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Card Holder</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{user?.fullName?.toUpperCase()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 3 }}>EXPIRES</div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{String(card.expiryMonth).padStart(2,"0")}/{card.expiryYear}</div>
            </div>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{card.network}</div>
          </div>
          {frozen && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.45)", borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 48 }}>🔒</div>
                <div style={{ fontWeight: 700, marginTop: 6 }}>Card Frozen</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid2 up d2 mb-14">
        <div className="card card-p tc">
          <div className="xs muted mb-6">Available</div>
          <div style={{ fontWeight: 800, fontSize: 22, color: "var(--primary)" }}>${parseFloat(card.availableUsd).toFixed(0)}</div>
        </div>
        <div className="card card-p tc">
          <div className="xs muted mb-6">Spend Limit</div>
          <div style={{ fontWeight: 800, fontSize: 22 }}>${parseFloat(card.spendLimitUsd).toFixed(0)}</div>
        </div>
      </div>

      {/* Freeze control */}
      <div className="card card-p up d3 mb-14" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: frozen ? "var(--danger)" : "var(--success)", boxShadow: `0 0 0 3px ${frozen ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)"}` }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{frozen ? "Card Frozen" : "Card Active"}</div>
            <div className="xs muted">{frozen ? "Tap to unfreeze" : "Tap to temporarily freeze"}</div>
          </div>
        </div>
        <button className={`btn btn-sm ${frozen ? "btn-success" : "btn-ghost"}`} onClick={toggleFreeze} disabled={freezing}>
          {freezing ? <span className="spin" /> : frozen ? "🔓 Unfreeze" : "🔒 Freeze"}
        </button>
      </div>

      {/* Spend history */}
      <div className="up d4">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Spend History</div>
        <div className="card card-p">
          {!card.spendHistory?.length ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)" }}>No card transactions yet</div>
          ) : card.spendHistory.map((s: any) => (
            <div key={s.id} className="tx-row">
              <div className="tx-ico" style={{ background: "#F5F3FF", color: "#7C3AED" }}>💳</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{s.merchantName}</div>
                <div className="xs muted mt-4">{s.category} · {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ fontWeight: 700, color: "var(--danger)" }}>−${s.amountUsd}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
