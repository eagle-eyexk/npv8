import { useState, useEffect } from "react";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const atk = () => localStorage.getItem("nexa_admin_token") ?? "";

function useAdm(path: string, dep: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (!atk()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api${path}`, { headers: { Authorization: `Bearer ${atk()}` } });
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [dep]);
  return { data, loading, refetch: load };
}

type Tab = "stats" | "users" | "transactions" | "merchants";

export default function Admin() {
  const [tk, setTk] = useState(() => localStorage.getItem("nexa_admin_token") ?? "");
  const [lf, setLf] = useState({ u: "", p: "" });
  const [le, setLe] = useState("");
  const [ll, setLl] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const [eb, setEb] = useState<{ id: string; v: string } | null>(null);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault(); setLe(""); setLl(true);
    try {
      const r = await fetch(`${API}/api/auth/admin/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: lf.u, password: lf.p }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      localStorage.setItem("nexa_admin_token", d.token);
      setTk(d.token);
    } catch (err: any) { setLe(err.message); }
    finally { setLl(false); }
  }

  const { data: stats } = useAdm("/admin/stats", tk);
  const { data: users, refetch: reU } = useAdm("/admin/users", tk);
  const { data: txs } = useAdm("/admin/transactions", tk);
  const { data: merchants } = useAdm("/admin/merchants", tk);

  async function freeze(id: string) {
    await fetch(`${API}/api/admin/users/${id}/freeze`, { method: "PATCH", headers: { Authorization: `Bearer ${atk()}` } });
    reU();
  }
  async function saveBalance(walletId: string, val: string) {
    await fetch(`${API}/api/admin/wallets/${walletId}/balance`, {
      method: "PATCH", headers: { Authorization: `Bearer ${atk()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ balanceNexa: parseFloat(val) }),
    });
    setEb(null); reU();
  }

  if (!tk) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "var(--surface)", borderRadius: 28, padding: "36px 32px", boxShadow: "var(--sh-md)", border: "1px solid var(--border)" }}>
        <div className="tc mb-20">
          <img src={nexaLogo} alt="NEXA" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", marginBottom: 12 }} />
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin Panel</h1>
          <p className="muted sm mt-6">Restricted access — NEXA Pay staff only</p>
        </div>
        <form onSubmit={doLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="inp-group">
            <label className="inp-label">Username</label>
            <input className="inp" placeholder="root" value={lf.u} onChange={e => setLf(f => ({ ...f, u: e.target.value }))} required autoComplete="username" />
          </div>
          <div className="inp-group">
            <label className="inp-label">Password</label>
            <input className="inp" type="password" placeholder="••••••••" value={lf.p} onChange={e => setLf(f => ({ ...f, p: e.target.value }))} required autoComplete="current-password" />
          </div>
          {le && <div className="form-err">{le}</div>}
          <button className="btn btn-primary w-full" style={{ height: 50 }} disabled={ll}>
            {ll ? <span className="spin" /> : "Enter Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );

  const TABS: { k: Tab; label: string }[] = [
    { k: "stats", label: "📊 Stats" },
    { k: "users", label: "👥 Users" },
    { k: "transactions", label: "📋 Transactions" },
    { k: "merchants", label: "🏪 Merchants" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>NEXA Pay</span>
          <span className="bdg bdg-blue" style={{ fontSize: 10 }}>Admin</span>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { localStorage.removeItem("nexa_admin_token"); setTk(""); }}>Sign Out</button>
      </header>

      <div className="adm">
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`btn btn-sm ${tab === t.k ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: 10 }}>{t.label}</button>
          ))}
        </div>

        {/* Stats */}
        {tab === "stats" && stats && (
          <div className="in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
            {[
              { label: "Total Users", val: stats.totalUsers, color: "var(--primary)", icon: "👥" },
              { label: "Merchants", val: stats.totalMerchants, color: "#7C3AED", icon: "🏪" },
              { label: "Transactions", val: stats.totalTransactions, color: "var(--success)", icon: "⚡" },
              { label: "NEXA Minted", val: `${(stats.totalNexaInCirculation ?? 0).toFixed(2)} N`, color: "#D97706", icon: "🔷" },
              { label: "Total Volume", val: `€${(stats.totalVolumeEur ?? 0).toFixed(0)}`, color: "var(--danger)", icon: "📈" },
              { label: "NEXA Price", val: `€${stats.nexaPriceEur}`, color: "var(--primary)", icon: "💱" },
            ].map(s => (
              <div key={s.label} className="card card-p">
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 24, color: s.color }}>{s.val}</div>
                <div className="xs muted" style={{ textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div className="in card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>NEXA Balance</th><th>EUR</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {(users ?? []).map((u: any) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                      <td className="muted">{u.email}</td>
                      <td><span className={`bdg ${u.role === "merchant" ? "bdg-blue" : "bdg-gray"}`}>{u.role}</span></td>
                      <td>
                        {eb?.id === u.wallet?.id ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <input style={{ width: 90, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--border)", fontSize: 13 }} value={eb.v} onChange={e => setEb(b => ({ ...b!, v: e.target.value }))} />
                            <button className="btn btn-success btn-sm" onClick={() => saveBalance(u.wallet.id, eb.v)}>✓</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setEb(null)}>✕</button>
                          </div>
                        ) : (
                          <span style={{ cursor: "pointer", color: "var(--primary)", fontWeight: 600 }} onClick={() => setEb({ id: u.wallet?.id, v: String(u.wallet?.balanceNexa ?? 0) })}>
                            {u.wallet?.balanceNexa?.toFixed(4) ?? "—"} ✏️
                          </span>
                        )}
                      </td>
                      <td style={{ color: "var(--success)" }}>€{((u.wallet?.balanceNexa ?? 0) * 100).toFixed(2)}</td>
                      <td><span className={`bdg ${u.isFrozen === "true" ? "bdg-red" : "bdg-green"}`}>{u.isFrozen === "true" ? "Frozen" : "Active"}</span></td>
                      <td>
                        <button className={`btn btn-sm ${u.isFrozen === "true" ? "btn-success" : "btn-danger"}`} style={{ padding: "4px 12px", fontSize: 11 }} onClick={() => freeze(u.id)}>
                          {u.isFrozen === "true" ? "Unfreeze" : "Freeze"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Transactions */}
        {tab === "transactions" && (
          <div className="in card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr><th>Type</th><th>Amount (NEXA)</th><th>EUR</th><th>Merchant</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {(txs ?? []).map((t: any) => (
                    <tr key={t.id}>
                      <td><span className={`bdg ${t.type === "mining" ? "bdg-amber" : t.type === "send" ? "bdg-red" : "bdg-blue"}`}>{t.type}</span></td>
                      <td style={{ fontWeight: 600 }}>{t.amount.toFixed(6)}</td>
                      <td style={{ color: "var(--success)" }}>€{t.amountEur?.toFixed(2)}</td>
                      <td className="muted">{t.merchantName ?? "—"}</td>
                      <td><span className="bdg bdg-green">{t.status}</span></td>
                      <td className="muted">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Merchants */}
        {tab === "merchants" && (
          <div className="in card" style={{ overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="tbl">
                <thead><tr><th>Business</th><th>Category</th><th>Total Volume</th><th>Transactions</th><th>Status</th></tr></thead>
                <tbody>
                  {(merchants ?? []).map((m: any) => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 600 }}>{m.businessName}</td>
                      <td><span className="bdg bdg-blue">{m.category}</span></td>
                      <td style={{ color: "var(--success)" }}>€{m.totalVolumeEur?.toFixed(2) ?? 0}</td>
                      <td>{m.transactionCount}</td>
                      <td><span className={`bdg ${m.isActive ? "bdg-green" : "bdg-red"}`}>{m.isActive ? "Active" : "Inactive"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
