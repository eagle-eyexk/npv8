import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

const navItems = [
  { path: "/dashboard", label: "Home", icon: (a: boolean) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { path: "/send", label: "Send", icon: (a: boolean) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )},
  { path: "/tap", label: "Tap", icon: (a: boolean) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
  )},
  { path: "/transactions", label: "History", icon: (a: boolean) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )},
  { path: "/card", label: "Card", icon: (a: boolean) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={a ? 2.5 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )},
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="page-wrap">
      {/* Header */}
      <header className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 18, background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            NEXA
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {user?.role === "merchant" && (
            <Link href="/merchant-pos">
              <span className="badge-neon badge-purple" style={{ cursor: "pointer" }}>POS</span>
            </Link>
          )}
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#0EA5E9,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        </div>
      </header>

      {/* Content */}
      <main>{children}</main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {navItems.map(item => {
          const active = location === item.path || location.startsWith(item.path + "/");
          return (
            <Link key={item.path} href={item.path}>
              <button className={`nav-item ${active ? "active" : ""}`}>
                {item.icon(active)}
                {item.label}
                {active && <span className="nav-dot" />}
              </button>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
