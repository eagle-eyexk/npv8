import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

function useDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const r = await fetch(`${API}/api/dashboard`, { headers: { Authorization: `Bearer ${tok()}` } });
      if (r.ok) setData(await r.json());
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  return { data, loading, refetch: load };
}

const TX_ICONS: Record<string, { icon: string; bg: string; color: string }> = {
  send:       { icon: "↑", bg: "rgba(239,68,68,0.1)",    color: "#EF4444" },
  receive:    { icon: "↓", bg: "rgba(16,185,129,0.1)",   color: "#10B981" },
  tap_pay:    { icon: "⚡", bg: "rgba(14,165,233,0.1)",  color: "#0EA5E9" },
  card_spend: { icon: "💳", bg: "rgba(139,92,246,0.1)",  color: "#8B5CF6" },
  mining:     { icon: "⛏️", bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data, loading, refetch } = useDashboard();

  const [mining, setMining] = useState(false);
  const [sessionEarned, setSessionEarned] = useState(0);
  const [claimCount, setClaimCount] = useState(0);
  const [miningError, setMiningError] = useState("");
  const miningRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function claimMining() {
    const r = await fetch(`${API}/api/mining/claim`, {
      method: "POST", headers: { Authorization: `Bearer ${tok()}` },
    });
    const d = await r.json();
    if (r.ok) {
      setSessionEarned(e => +(e + d.reward).toFixed(8));
      setClaimCount(c => c + 1);
      setMiningError("");
      refetch();
    } else if (r.status === 429) {
      setMiningError(`Next claim in ${d.retryAfter}s`);
    }
  }

  function startMining() {
    setMining(true);
    setMiningError("");
    claimMining();
    miningRef.current = setInterval(claimMining, 30000);
  }

  function stopMining() {
    setMining(false);
    setMiningError("");
    if (miningRef.current) clearInterval(miningRef.current);
  }

  useEffect(() => () => { if (miningRef.current) clearInterval(miningRef.current); }, []);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const w = data?.wallet;
  const nexa = w?.balanceNexa ?? 0;
  const btc  = w?.balanceBtc ?? 0;
  const eth  = w?.balanceEth ?? 0;
  const usdt = w?.balanceUsdt ?? 0;
  const btcPrice  = w?.btcPriceUsd ?? 0;
  const ethPrice  = w?.ethPriceUsd ?? 0;
  const nexaEur   = nexa * 100;
  const totalUsd  = w?.balanceUsd ?? 0;

  return (
    <div className="content-wrap">
      {/* Greeting */}
      <div style={{ padding: "24px 0 8px" }} className="anim-up">
        <div className="text-muted text-sm">Good day,</div>
        <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 700 }}>
          {user?.fullName?.split(" ")[0]} 👋
        </h2>
      </div>

      {/* Main balance card */}
      <div className="anim-up anim-delay-1" style={{ marginBottom: 20 }}>
        <div className="nexa-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Portfolio</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 32, fontWeight: 800 }}>
                €{nexaEur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>
                ≈ ${totalUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
              </div>
            </div>
            <span className="badge-neon" style={{ background: "rgba(255,255,255,0.2)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}>
              1 NEXA = €100
            </span>
          </div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 700, opacity: 0.95 }}>
            {nexa.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 8 })} NEXA
          </div>
          <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4, fontFamily: "monospace" }}>{w?.address?.slice(0, 22)}…</div>
          <div style={{ position: "absolute", top: -30, right: -30, width: 180, height: 180, background: "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="anim-up anim-delay-2" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Send",    href: "/send",    icon: "↑",  color: "#0EA5E9", bg: "rgba(14,165,233,0.1)" },
          { label: "Receive", href: "/receive", icon: "↓",  color: "#10B981", bg: "rgba(16,185,129,0.1)" },
          { label: "Tap Pay", href: "/tap",     icon: "⚡", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)" },
          { label: "Card",    href: "/card",    icon: "💳", color: "#EC4899", bg: "rgba(236,72,153,0.1)" },
        ].map(a => (
          <Link key={a.href} href={a.href}>
            <div className="glass-card" style={{ padding: "14px 8px", textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: a.bg, color: a.color, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px" }}>{a.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)" }}>{a.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Crypto balances — prices from API */}
      <div className="anim-up anim-delay-3" style={{ marginBottom: 20 }}>
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Balances</div>
          <span className="badge-neon badge-blue" style={{ fontSize: 11 }}>Live</span>
        </div>
        <div className="grid-2" style={{ gap: 10 }}>
          {[
            { label: "NEXA",     balance: nexa, sub: `€${nexaEur.toFixed(2)}`,                  icon: "🔷", color: "#0EA5E9", fmt: (n: number) => n.toFixed(6) },
            { label: "Bitcoin",  balance: btc,  sub: `$${(btc * btcPrice).toFixed(2)}`,          icon: "🟡", color: "#F59E0B", fmt: (n: number) => n.toFixed(8) },
            { label: "Ethereum", balance: eth,  sub: `$${(eth * ethPrice).toFixed(2)}`,          icon: "🟣", color: "#8B5CF6", fmt: (n: number) => n.toFixed(6) },
            { label: "USDT",     balance: usdt, sub: `$${usdt.toFixed(2)}`,                      icon: "🟢", color: "#10B981", fmt: (n: number) => n.toFixed(2) },
          ].map(c => (
            <div key={c.label} className="stat-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: c.color }}>{c.label}</span>
              </div>
              <div className="stat-value" style={{ fontSize: 18, color: "var(--text)" }}>{c.fmt(c.balance)}</div>
              <div className="stat-label" style={{ color: c.color, fontSize: 11, marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mining */}
      <div className="anim-up anim-delay-4" style={{ marginBottom: 20 }}>
        <div className="mining-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {mining
                ? <div className="mining-pulse" />
                : <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--text-light)" }} />}
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>⛏️ Phone Mining</div>
                <div className="text-xs text-muted">{mining ? "Active · claiming every 30s" : "Idle"}</div>
              </div>
            </div>
            <button
              className={`btn ${mining ? "btn-red" : "btn-green"}`}
              style={{ padding: "8px 18px", fontSize: 13, borderRadius: 10 }}
              onClick={mining ? stopMining : startMining}>
              {mining ? "Stop" : "Start Mining"}
            </button>
          </div>

          {mining && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>Session Earned</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>
                  {sessionEarned.toFixed(7)} NEXA
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>≈ €{(sessionEarned * 100).toFixed(4)}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.5)", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>Claims This Session</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>
                  {claimCount}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>0.0001 NEXA each</div>
              </div>
            </div>
          )}

          {miningError && (
            <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>{miningError}</div>
          )}

          {!mining && (
            <div className="text-sm text-muted">
              Earn <strong style={{ color: "var(--accent)" }}>0.0001 NEXA (€0.01)</strong> every 30 seconds — just run the app.
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="anim-up anim-delay-5">
        <div className="flex-between" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Recent Activity</div>
          <Link href="/transactions" style={{ color: "var(--primary)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>See all →</Link>
        </div>
        <div className="glass-card" style={{ padding: "0 16px" }}>
          {!data?.recentTransactions?.length ? (
            <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No transactions yet</div>
          ) : data.recentTransactions.map((tx: any) => {
            const t = TX_ICONS[tx.type] ?? TX_ICONS.receive;
            const isOut = ["send", "tap_pay", "card_spend"].includes(tx.type);
            return (
              <div key={tx.id} className="tx-item">
                <div className="tx-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.merchantName || (tx.type === "mining" ? "Mining Reward" : tx.type.replace("_", " "))}</div>
                  <div className="text-xs text-muted">{new Date(tx.createdAt).toLocaleDateString()}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: isOut ? "#EF4444" : "#10B981" }}>
                    {isOut ? "−" : "+"}{tx.amount.toFixed(6)} NEXA
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(tx.amount * 100).toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button className="btn btn-secondary" style={{ fontSize: 13, padding: "8px 20px" }} onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
