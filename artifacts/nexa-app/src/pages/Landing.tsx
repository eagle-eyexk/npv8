import { Link } from "wouter";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

export default function Landing() {
  return (
    <div className="page-wrap" style={{ minHeight: "100vh" }}>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
        <div className="anim-up" style={{ marginBottom: 20 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 80, height: 80, borderRadius: 20, objectFit: "cover", boxShadow: "0 8px 32px rgba(14,165,233,0.4)" }} />
        </div>
        <div className="anim-up anim-delay-1" style={{ marginBottom: 16 }}>
          <span className="badge-neon badge-blue" style={{ fontSize: 13 }}>1 NEXA = €100 · EUR-Stable</span>
        </div>
        <h1 className="anim-up anim-delay-2" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: "clamp(36px,8vw,64px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 20, maxWidth: 700 }}>
          The Future of{" "}
          <span style={{ background: "linear-gradient(135deg,#0EA5E9,#8B5CF6,#10B981)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Digital Payments
          </span>
        </h1>
        <p className="anim-up anim-delay-3 text-muted" style={{ fontSize: 18, maxWidth: 460, marginBottom: 40, lineHeight: 1.65 }}>
          Send, receive, and tap-to-pay with NEXA — the stable crypto pegged to the Euro. Let your phone mine while you sleep.
        </p>
        <div className="anim-up anim-delay-4" style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 56 }}>
          <Link href="/register"><button className="btn btn-primary btn-lg">Get Started Free</button></Link>
          <Link href="/login"><button className="btn btn-secondary btn-lg">Sign In</button></Link>
        </div>

        {/* Prices */}
        <div className="anim-up anim-delay-5" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, maxWidth: 560, width: "100%", marginBottom: 40 }}>
          {[
            { label: "NEXA", price: "€100.00", sub: "+0.00%", color: "#0EA5E9" },
            { label: "BTC", price: "$67,500", sub: "+2.4%", color: "#F59E0B" },
            { label: "ETH", price: "$3,200", sub: "+1.8%", color: "#8B5CF6" },
            { label: "USDT", price: "$1.00", sub: "Stable", color: "#10B981" },
          ].map(c => (
            <div key={c.label} className="glass-card" style={{ padding: 16, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 4, letterSpacing: "0.06em" }}>{c.label}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 15 }}>{c.price}</div>
              <div style={{ fontSize: 11, color: c.sub.startsWith("+") ? "#10B981" : "#64748B", marginTop: 2 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, maxWidth: 760, width: "100%" }}>
          {[
            { icon: "⚡", title: "Tap-to-Pay", desc: "Pay instantly with NFC-style tokens", color: "#0EA5E9" },
            { icon: "⛏️", title: "Phone Mining", desc: "Earn NEXA every 30s while idle", color: "#10B981" },
            { icon: "🪙", title: "Multi-Crypto", desc: "NEXA, BTC, ETH & USDT in one wallet", color: "#8B5CF6" },
            { icon: "🛡️", title: "EUR-Stable", desc: "1 NEXA = €100, always", color: "#EC4899" },
          ].map(f => (
            <div key={f.title} className="glass-card" style={{ padding: 20, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6, color: f.color, fontSize: 15 }}>{f.title}</div>
              <div className="text-muted text-sm">{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40 }}>
          <Link href="/admin" style={{ color: "var(--text-light)", fontSize: 12, textDecoration: "none" }}>Admin Panel →</Link>
        </div>
      </div>
    </div>
  );
}
