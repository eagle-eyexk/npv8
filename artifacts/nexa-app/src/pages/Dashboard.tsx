import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

function useDash() {
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

const TXM: Record<string, { ic: string; bg: string; color: string }> = {
  send:       { ic: "↑", bg: "#FEF2F2", color: "#EF4444" },
  receive:    { ic: "↓", bg: "#ECFDF5", color: "#10B981" },
  tap_pay:    { ic: "⚡", bg: "#EFF6FF", color: "#2563EB" },
  card_spend: { ic: "💳", bg: "#F5F3FF", color: "#7C3AED" },
  mining:     { ic: "⛏️", bg: "#FFFBEB", color: "#D97706" },
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { data, loading, refetch } = useDash();

  const [mining, setMining] = useState(false);
  const [earned, setEarned] = useState(0);
  const [claims, setClaims] = useState(0);
  const [mineMsg, setMineMsg] = useState("");
  const mineRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function claim() {
    const r = await fetch(`${API}/api/mining/claim`, { method: "POST", headers: { Authorization: `Bearer ${tok()}` } });
    const d = await r.json();
    if (r.ok) { setEarned(e => +(e + d.reward).toFixed(8)); setClaims(c => c + 1); setMineMsg(""); refetch(); }
    else if (r.status === 429) setMineMsg(`Next in ${d.retryAfter}s`);
  }

  function startMine() { setMining(true); setMineMsg(""); claim(); mineRef.current = setInterval(claim, 30000); }
  function stopMine() { setMining(false); if (mineRef.current) clearInterval(mineRef.current); }
  useEffect(() => () => { if (mineRef.current) clearInterval(mineRef.current); }, []);

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spin" style={{ width: 36, height: 36 }} />
    </div>
  );

  const w = data?.wallet ?? {};
  const nexa = w.balanceNexa ?? 0;
  const btc  = w.balanceBtc ?? 0;
  const eth  = w.balanceEth ?? 0;
  const usdt = w.balanceUsdt ?? 0;
  const btcP = w.btcPriceUsd ?? 0;
  const ethP = w.ethPriceUsd ?? 0;

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      {/* Greeting */}
      <div className="up" style={{ marginBottom: 16 }}>
        <div className="muted sm" style={{ marginBottom: 2 }}>Hello, {user?.fullName?.split(" ")[0]} 👋</div>
        <div style={{ fontWeight: 800, fontSize: 22 }}>My Wallet</div>
      </div>

      {/* Balance card */}
      <div className="bal-card up d1" style={{ marginBottom: 16 }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6, letterSpacing: "0.05em" }}>TOTAL BALANCE</div>
          <div style={{ fontWeight: 800, fontSize: 34, marginBottom: 4 }}>
            €{(nexa * 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 20 }}>
            {nexa.toFixed(8)} NEXA · ≈${w.balanceUsd?.toFixed(2) ?? "0.00"} USD
          </div>
          {/* Quick actions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { label: "Tap Up", href: "/receive", icon: "⬆️" },
              { label: "Send", href: "/send", icon: "↑" },
              { label: "Receive", href: "/receive", icon: "↓" },
              { label: "More", href: "/merchants", icon: "···" },
            ].map(a => (
              <Link key={a.label} href={a.href}>
                <div style={{ textAlign: "center", cursor: "pointer" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", fontSize: 16, transition: "all 0.15s" }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 600 }}>{a.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Wallets */}
      <div className="card card-p up d2" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Wallets</span>
          <Link href="/transactions" style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>See All</Link>
        </div>
        {[
          { ic: "🔷", name: "NEXA Wallet", sub: "NEXA Pay", bal: `${nexa.toFixed(6)} NEXA`, fiat: `€${(nexa * 100).toFixed(2)}` },
          { ic: "₿", name: "Bitcoin", sub: "BTC", bal: `${btc.toFixed(8)} BTC`, fiat: `$${(btc * btcP).toFixed(2)}` },
          { ic: "Ξ", name: "Ethereum", sub: "ETH", bal: `${eth.toFixed(6)} ETH`, fiat: `$${(eth * ethP).toFixed(2)}` },
          { ic: "💵", name: "USDT", sub: "Tether", bal: `${usdt.toFixed(2)} USDT`, fiat: `$${usdt.toFixed(2)}` },
        ].map(w => (
          <div key={w.name} className="wlt-row">
            <div className="wlt-ico" style={{ background: "var(--primary-light)", fontSize: 18 }}>{w.ic}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{w.name}</div>
              <div style={{ fontSize: 11, color: "var(--text-light)", marginTop: 1 }}>{w.sub}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{w.bal}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{w.fiat}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mining */}
      <div className="mine-card up d3" style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: mining ? 14 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {mining ? <div className="mine-dot" /> : <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--text-light)" }} />}
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>⛏️ Phone Mining</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{mining ? "Active · +0.0001 NEXA / 30s" : "Idle — earn NEXA passively"}</div>
            </div>
          </div>
          <button className={`btn btn-sm ${mining ? "btn-danger" : "btn-success"}`} onClick={mining ? stopMine : startMine}>
            {mining ? "Stop" : "Start"}
          </button>
        </div>
        {mining && (
          <div className="grid2">
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>Earned</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--success)" }}>{earned.toFixed(7)} NEXA</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(earned * 100).toFixed(4)}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 3 }}>Claims</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--primary)" }}>{claims}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)" }}>0.0001 NEXA each</div>
            </div>
          </div>
        )}
        {mineMsg && <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)", textAlign: "center" }}>{mineMsg}</div>}
      </div>

      {/* Recent activity */}
      <div className="card card-p up d4">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</span>
          <Link href="/transactions" style={{ color: "var(--primary)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>See All</Link>
        </div>
        {!data?.recentTransactions?.length ? (
          <div style={{ padding: "24px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 14 }}>No transactions yet</div>
        ) : data.recentTransactions.map((tx: any) => {
          const m = TXM[tx.type] ?? TXM.receive;
          const out = ["send", "tap_pay", "card_spend"].includes(tx.type);
          return (
            <div key={tx.id} className="tx-row">
              <div className="tx-ico" style={{ background: m.bg, color: m.color }}>{m.ic}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{tx.merchantName || (tx.type === "mining" ? "Mining Reward" : tx.type)}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: out ? "var(--danger)" : "var(--success)" }}>
                  {out ? "−" : "+"}{tx.amount.toFixed(6)} NEXA
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>€{(tx.amount * 100).toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
}
