import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  const [prices, setPrices] = useState<any>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/prices`).then(r => r.ok ? r.json() : null).then(d => d && setPrices(d)).catch(() => {});
  }, []);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>

      {/* Nav */}
      <nav className="land-nav">
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 28, height: 28, borderRadius: 7, objectFit: "cover" }} />
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--primary)" }}>NEXA Pay</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="nav-links">
          {["Features", "For Business", "Pricing", "About"].map(l => (
            <a key={l} href="#" style={{ fontSize: 14, color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginLeft: 24 }}>
          <Link href="/login"><button className="btn btn-ghost btn-sm">Log in</button></Link>
          <Link href="/register"><button className="btn btn-primary btn-sm">Get Started</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "80px clamp(20px,5vw,80px) 60px", maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 60, alignItems: "center" }}>
        {/* Left */}
        <div style={{ maxWidth: 520 }}>
          <div className="bdg bdg-blue" style={{ marginBottom: 20, display: "inline-flex" }}>
            🔷 1 NEXA = €100 — EUR-Pegged Stablecoin
          </div>
          <h1 style={{ fontSize: "clamp(42px,6vw,68px)", fontWeight: 800, lineHeight: 1.08, color: "#0F172A", marginBottom: 16 }}>
            Tap. Pay.<br />
            <span style={{ color: "var(--primary)" }}>Instantly.</span>
          </h1>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.65, marginBottom: 36, maxWidth: 440 }}>
            The next generation of crypto payments. Fast. Secure. Borderless. Accept and send NEXA anywhere in the world.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 48 }}>
            <Link href="/register"><button className="btn btn-primary btn-lg">Start Paying</button></Link>
            <Link href="/login"><button className="btn btn-outline btn-lg">Log In</button></Link>
          </div>
          {/* Trust row */}
          <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
            {[["🔒", "Bank-grade security"], ["⚡", "Instant settlement"], ["🌍", "Works worldwide"]].map(([ic, tx]) => (
              <div key={tx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                <span>{ic}</span>{tx}
              </div>
            ))}
          </div>
        </div>

        {/* Right: phone mockup */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div className="phone-frame">
            <div className="phone-notch"><div className="phone-notch-pill" /></div>
            <div className="phone-screen" style={{ padding: "0 0 8px" }}>
              {/* Balance card */}
              <div style={{ margin: "8px 10px", background: "linear-gradient(135deg,#1E3A8A,#2563EB)", borderRadius: 14, padding: "16px 16px 14px", color: "#fff" }}>
                <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 4 }}>Total Balance</div>
                <div style={{ fontWeight: 800, fontSize: 24, marginBottom: 2 }}>€0.00</div>
                <div style={{ fontSize: 10, opacity: 0.65 }}>NEXA Wallet</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginTop: 14 }}>
                  {["Tap Up","Send","Receive","More"].map(a => (
                    <div key={a} style={{ textAlign: "center" }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 4px", fontSize: 13 }}>
                        {a === "Tap Up" ? "⬆️" : a === "Send" ? "↑" : a === "Receive" ? "↓" : "•••"}
                      </div>
                      <div style={{ fontSize: 8, opacity: 0.8 }}>{a}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Wallets */}
              <div style={{ padding: "10px 12px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A" }}>Wallets</span>
                  <span style={{ fontSize: 10, color: "var(--primary)" }}>See All</span>
                </div>
                {[
                  { icon: "🔷", name: "NEXA", sub: "NEXA Pay", bal: "0 NEXA", usd: "€0.00" },
                  { icon: "₿", name: "Bitcoin", sub: "BTC", bal: "0 BTC", usd: prices ? `$${prices.btc.usd.toLocaleString()}` : "—" },
                  { icon: "Ξ", name: "Ethereum", sub: "ETH", bal: "0 ETH", usd: prices ? `$${prices.eth.usd.toFixed(0)}` : "—" },
                ].map(w => (
                  <div key={w.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: "1px solid #F1F5F9" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{w.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{w.name}</div>
                      <div style={{ fontSize: 9, color: "#94A3B8" }}>{w.sub}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#0F172A" }}>{w.bal}</div>
                      <div style={{ fontSize: 9, color: "#94A3B8" }}>{w.usd}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live prices ticker */}
      <section style={{ background: "#F8FAFC", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "16px clamp(20px,5vw,80px)" }}>
        <div style={{ display: "flex", gap: 32, overflowX: "auto", maxWidth: 1280, margin: "0 auto", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", flexShrink: 0 }}>LIVE PRICES</span>
          {[
            { sym: "NEXA", price: "€100.00", change: "+0.00%", col: "#2563EB" },
            { sym: "BTC", price: prices ? `$${prices.btc.usd.toLocaleString()}` : "—", change: "live", col: "#F59E0B" },
            { sym: "ETH", price: prices ? `$${prices.eth.usd.toFixed(2)}` : "—", change: "live", col: "#8B5CF6" },
            { sym: "USDT", price: "$1.00", change: "stable", col: "#10B981" },
          ].map(c => (
            <div key={c.sym} style={{ display: "flex", align: "center", gap: 8, flexShrink: 0, padding: "0 16px", borderRight: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: c.col }}>{c.sym}</span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.price || <span className="spin" style={{ width: 12, height: 12, display: "inline-block" }} />}</span>
                <span style={{ fontSize: 11, color: c.change === "live" ? "#10B981" : "var(--text-muted)" }}>
                  {c.change === "live" ? "● Live" : c.change === "stable" ? "● Stable" : c.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ padding: "72px clamp(20px,5vw,80px)", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20 }}>
          {[
            { icon: "⚡", title: "Tap to Pay", desc: "Pay in-store using your phone. Fast, easy and secure.", color: "#2563EB", bg: "#EFF6FF" },
            { icon: "🏦", title: "Instant Settlement", desc: "Real-time crypto settlement 24/7. No waiting.", color: "#7C3AED", bg: "#F5F3FF" },
            { icon: "🔒", title: "Secure & Private", desc: "Your assets are protected with top-tier security.", color: "#059669", bg: "#ECFDF5" },
          ].map(f => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 20, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for everyone */}
      <section style={{ background: "#F8FAFC", padding: "72px clamp(20px,5vw,80px)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Built for Everyone</h2>
          <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 48 }}>Powering payments for people and businesses around the world.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 24 }}>
            {[
              { icon: "👤", title: "Users", desc: "Pay anywhere instantly" },
              { icon: "🏪", title: "Merchants", desc: "Accept crypto with ease" },
              { icon: "💻", title: "Developers", desc: "Powerful APIs and SDKs" },
              { icon: "🏢", title: "Businesses", desc: "Scale global with NEXA" },
            ].map(a => (
              <div key={a.title} style={{ padding: "28px 20px", background: "#fff", borderRadius: 16, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{a.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{a.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{a.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: "72px clamp(20px,5vw,80px)", maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>How it Works</h2>
        <p style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 48 }}>Three simple steps to start paying with crypto.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
          {[
            { num: "01", title: "Create Wallet", desc: "Register and get your NEXA wallet instantly with a security backup file." },
            { num: "02", title: "Fund Account", desc: "Receive NEXA or exchange crypto into your wallet." },
            { num: "03", title: "Tap & Pay", desc: "Tap your phone on any NEXA POS terminal to pay instantly." },
          ].map(s => (
            <div key={s.num} style={{ padding: 28, background: "#fff", borderRadius: 20, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--primary)", letterSpacing: "0.1em", marginBottom: 12 }}>STEP {s.num}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: "0 clamp(20px,5vw,80px) 72px", maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ background: "linear-gradient(135deg,#1E3A8A,#2563EB)", borderRadius: 28, padding: "52px 48px", textAlign: "center", color: "#fff" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Safe. Fast. Borderless.</h2>
          <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 32 }}>Experience the future of payments with NEXA Pay.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register"><button className="btn btn-lg" style={{ background: "#fff", color: "var(--primary)", fontWeight: 700 }}>Create Free Wallet</button></Link>
            <Link href="/login"><button className="btn btn-lg btn-outline" style={{ border: "1.5px solid rgba(255,255,255,0.4)", color: "#fff" }}>Sign In</button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0F172A", color: "#94A3B8", padding: "48px clamp(20px,5vw,80px) 32px", borderTop: "1px solid #1E293B" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 32, marginBottom: 40, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <img src={nexaLogo} alt="NEXA" style={{ width: 26, height: 26, borderRadius: 7, objectFit: "cover" }} />
                <span style={{ fontWeight: 800, color: "#fff", fontSize: 16 }}>NEXA Pay</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7 }}>The next generation of crypto payments. Fast, secure, and borderless.</p>
              <p style={{ fontSize: 12, marginTop: 12 }}>© 2026 NEXA Pay. All rights reserved.</p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Roadmap"] },
              { title: "Company", links: ["About Us", "Careers", "Blog", "Contact"] },
              { title: "Resources", links: ["Developers", "Docs", "Help Center", "Community"] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 14 }}>{col.title}</div>
                {col.links.map(l => <div key={l} style={{ fontSize: 13, marginBottom: 8, cursor: "pointer" }}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #1E293B", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12 }}>Trusted by forward-thinking companies worldwide.</span>
            <Link href="/admin" style={{ fontSize: 12, color: "#475569", textDecoration: "none" }}>Admin Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
