import { useState, useEffect } from "react";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";
import NetworkBackground from "@/components/NetworkBackground";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

function adminTok() { return localStorage.getItem("nexa_admin_token") ?? ""; }

function useAdminFetch(path: string, dep?: any) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api${path}`, { headers: { Authorization: `Bearer ${adminTok()}` } });
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { if (adminTok()) load(); }, [dep]);
  return { data, loading, refetch: load };
}

type Tab = "stats" | "users" | "transactions" | "merchants";

export default function Admin() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("nexa_admin_token") ?? "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [logging, setLogging] = useState(false);
  const [tab, setTab] = useState<Tab>("stats");
  const [editBalance, setEditBalance] = useState<{ walletId: string; value: string } | null>(null);

  const isLoggedIn = !!adminToken;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(""); setLogging(true);
    try {
      const r = await fetch(`${API}/api/auth/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      localStorage.setItem("nexa_admin_token", d.token);
      setAdminToken(d.token);
    } catch (err: any) { setLoginError(err.message); }
    finally { setLogging(false); }
  }

  const { data: stats, refetch: refetchStats } = useAdminFetch("/admin/stats", isLoggedIn);
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useAdminFetch("/admin/users", isLoggedIn);
  const { data: transactions, loading: txLoading } = useAdminFetch("/admin/transactions", isLoggedIn);
  const { data: merchants } = useAdminFetch("/admin/merchants", isLoggedIn);

  async function freezeUser(id: string) {
    await fetch(`${API}/api/admin/users/${id}/freeze`, { method: "PATCH", headers: { Authorization: `Bearer ${adminTok()}` } });
    refetchUsers();
  }

  async function saveBalance(walletId: string, value: string) {
    await fetch(`${API}/api/admin/wallets/${walletId}/balance`, {
      method: "PATCH", headers: { Authorization: `Bearer ${adminTok()}`, "Content-Type": "application/json" },
      body: JSON.stringify({ balanceNexa: parseFloat(value) }),
    });
    setEditBalance(null); refetchUsers(); refetchStats();
  }

  if (!isLoggedIn) return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <NetworkBackground />
      <div className="auth-wrap">
        <div className="auth-card anim-up" style={{ maxWidth: 380 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <img src={nexaLogo} alt="NEXA" style={{ width: 48, height: 48, borderRadius: 12, objectFit: "cover", marginBottom: 12 }} />
            <div className="auth-title">Admin Panel</div>
            <div className="text-muted text-sm">Restricted access — NEXA staff only</div>
          </div>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="input-wrap">
              <label className="input-label">Username</label>
              <input className="input-field" placeholder="root" value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))} required autoComplete="username" />
            </div>
            <div className="input-wrap">
              <label className="input-label">Password</label>
              <input className="input-field" type="password" placeholder="••••••••" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} required autoComplete="current-password" />
            </div>
            {loginError && <div className="form-error">{loginError}</div>}
            <button className="btn btn-purple w-full" style={{ height: 48 }} disabled={logging}>
              {logging ? <span className="spinner" /> : "Enter Admin Panel"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "stats", label: "Stats", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "transactions", label: "Transactions", icon: "📋" },
    { key: "merchants", label: "Merchants", icon: "🏪" },
  ];

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      <NetworkBackground />
      <div className="page-wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src={nexaLogo} alt="NEXA" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 17 }}>NEXA Admin</span>
            <span className="badge-neon badge-purple" style={{ fontSize: 10 }}>root</span>
          </div>
          <button className="btn btn-secondary" style={{ padding: "7px 16px", fontSize: 13 }}
            onClick={() => { localStorage.removeItem("nexa_admin_token"); setAdminToken(""); }}>
            Sign Out
          </button>
        </header>

        <div className="admin-wrap">
          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`btn ${tab === t.key ? "btn-purple" : "btn-secondary"}`}
                style={{ padding: "8px 18px", fontSize: 14 }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          {tab === "stats" && stats && (
            <div className="anim-in">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Total Users", value: stats.totalUsers, color: "#0EA5E9", icon: "👥" },
                  { label: "Merchants", value: stats.totalMerchants, color: "#8B5CF6", icon: "🏪" },
                  { label: "Transactions", value: stats.totalTransactions, color: "#10B981", icon: "⚡" },
                  { label: "NEXA in Circulation", value: `${stats.totalNexaInCirculation?.toFixed(2)} N`, color: "#F59E0B", icon: "🔷" },
                  { label: "Total Volume", value: `€${(stats.totalVolumeEur ?? 0).toFixed(0)}`, color: "#EC4899", icon: "📈" },
                  { label: "NEXA Price", value: `€${stats.nexaPriceEur}`, color: "#0EA5E9", icon: "💱" },
                ].map(s => (
                  <div key={s.label} className="stat-card glass-card">
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                    <div className="stat-value" style={{ color: s.color, fontSize: 22 }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {tab === "users" && (
            <div className="anim-in glass-card" style={{ padding: 0, overflow: "hidden" }}>
              {usersLoading ? <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" /></div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr style={{ background: "rgba(14,165,233,0.04)" }}>
                        <th>Name</th><th>Email</th><th>Role</th><th>Balance (NEXA)</th><th>Balance (EUR)</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(users ?? []).map((u: any) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                          <td className="text-muted">{u.email}</td>
                          <td><span className={`badge-neon ${u.role === "merchant" ? "badge-purple" : "badge-blue"}`}>{u.role}</span></td>
                          <td>
                            {editBalance?.walletId === u.wallet?.id ? (
                              <div style={{ display: "flex", gap: 6 }}>
                                <input style={{ width: 90, padding: "4px 8px", borderRadius: 6, border: "1px solid var(--primary)", fontSize: 13 }}
                                  value={editBalance.value} onChange={e => setEditBalance(b => ({ ...b!, value: e.target.value }))} />
                                <button className="btn btn-green" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => saveBalance(u.wallet.id, editBalance.value)}>✓</button>
                                <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setEditBalance(null)}>✕</button>
                              </div>
                            ) : (
                              <span style={{ cursor: "pointer", color: "var(--primary)", fontWeight: 600 }} onClick={() => setEditBalance({ walletId: u.wallet?.id, value: String(u.wallet?.balanceNexa ?? 0) })}>
                                {u.wallet?.balanceNexa?.toFixed(4) ?? "—"} ✏️
                              </span>
                            )}
                          </td>
                          <td style={{ color: "var(--accent)" }}>€{((u.wallet?.balanceNexa ?? 0) * 100).toFixed(2)}</td>
                          <td>
                            <span className={`badge-neon ${u.isFrozen === "true" ? "badge-pink" : "badge-green"}`}>
                              {u.isFrozen === "true" ? "Frozen" : "Active"}
                            </span>
                          </td>
                          <td>
                            <button className={`btn ${u.isFrozen === "true" ? "btn-green" : "btn-red"}`} style={{ padding: "4px 12px", fontSize: 12 }} onClick={() => freezeUser(u.id)}>
                              {u.isFrozen === "true" ? "Unfreeze" : "Freeze"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Transactions */}
          {tab === "transactions" && (
            <div className="anim-in glass-card" style={{ padding: 0, overflow: "hidden" }}>
              {txLoading ? <div style={{ padding: 32, textAlign: "center" }}><div className="spinner" /></div> : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr style={{ background: "rgba(14,165,233,0.04)" }}>
                        <th>Type</th><th>Amount (NEXA)</th><th>Amount (EUR)</th><th>Merchant</th><th>Status</th><th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(transactions ?? []).map((t: any) => (
                        <tr key={t.id}>
                          <td><span className={`badge-neon ${t.type === "send" ? "badge-pink" : t.type === "mining" ? "badge-amber" : "badge-blue"}`}>{t.type}</span></td>
                          <td style={{ fontWeight: 600 }}>{t.amount.toFixed(6)}</td>
                          <td style={{ color: "var(--accent)" }}>€{t.amountEur?.toFixed(2)}</td>
                          <td className="text-muted">{t.merchantName ?? "—"}</td>
                          <td><span className="badge-neon badge-green">{t.status}</span></td>
                          <td className="text-muted">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Merchants */}
          {tab === "merchants" && (
            <div className="anim-in glass-card" style={{ padding: 0, overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-table">
                  <thead>
                    <tr style={{ background: "rgba(14,165,233,0.04)" }}>
                      <th>Business</th><th>Category</th><th>Total Volume</th><th>Transactions</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(merchants ?? []).map((m: any) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.businessName}</td>
                        <td><span className="badge-neon badge-blue">{m.category}</span></td>
                        <td style={{ color: "var(--accent)" }}>€{m.totalVolumeEur?.toFixed(2) ?? 0}</td>
                        <td>{m.transactionCount}</td>
                        <td><span className={`badge-neon ${m.isActive ? "badge-green" : "badge-pink"}`}>{m.isActive ? "Active" : "Inactive"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
