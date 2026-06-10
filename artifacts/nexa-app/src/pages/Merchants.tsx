import { useState, useEffect } from "react";
const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

const CAT: Record<string, string> = {
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
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-16">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Merchants</h2>
        <div className="muted sm mt-4">Pay with NEXA at these businesses</div>
      </div>

      <div className="up d1 mb-14">
        <input className="inp" placeholder="🔍  Search merchants…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}><div className="spin" /></div>
      ) : !filtered.length ? (
        <div className="card card-p tc" style={{ padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
          <div style={{ fontWeight: 600 }}>{search ? "No results" : "No merchants yet"}</div>
          <div className="sm muted mt-6">Merchants will appear here once they register</div>
        </div>
      ) : (
        <div className="up d2" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((m, i) => (
            <div key={m.id} className="card" style={{ padding: "16px", animationDelay: `${i * 0.04}s`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {CAT[m.category] ?? "🏪"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{m.businessName}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                  <span className="bdg bdg-blue xs">{m.category}</span>
                  <span className="xs muted">{m.transactionCount} payments</span>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "var(--success)" }}>€{(m.totalVolume * 100).toFixed(0)}</div>
                <div className="xs muted">volume</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
