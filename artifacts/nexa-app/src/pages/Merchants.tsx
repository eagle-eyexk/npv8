import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

const CAT_ICONS: Record<string, string> = {
  Services: "🛠️", Food: "🍕", Retail: "🛍️", Entertainment: "🎮",
  Travel: "✈️", Health: "🏥", Tech: "💻", Other: "🏪",
};

export default function Merchants() {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/api/merchants`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(d => setMerchants(Array.isArray(d) ? d : [])).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = merchants.filter(m =>
    m.businessName.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 16px" }} className="anim-up">
        <h2 className="page-title">Merchants</h2>
        <div className="text-sm text-muted mt-4">Pay with NEXA at these businesses</div>
      </div>

      <div className="anim-up anim-delay-1" style={{ marginBottom: 16 }}>
        <input className="input-field" placeholder="🔍  Search merchants…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><div className="spinner" /></div>
      ) : !filtered.length ? (
        <div className="glass-card" style={{ padding: 28, textAlign: "center", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
          {search ? "No merchants match your search" : "No merchants yet"}
        </div>
      ) : (
        <div className="anim-up anim-delay-2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((m, i) => (
            <div key={m.id} className="glass-card" style={{ padding: "16px 18px", animationDelay: `${i * 0.04}s` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: "linear-gradient(135deg,rgba(14,165,233,0.12),rgba(139,92,246,0.12))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                  {CAT_ICONS[m.category] ?? "🏪"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{m.businessName}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge-neon badge-blue" style={{ fontSize: 10 }}>{m.category}</span>
                    <span className="text-xs text-muted">{m.transactionCount} payments</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>
                    €{(m.totalVolume * 100).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted">volume</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
