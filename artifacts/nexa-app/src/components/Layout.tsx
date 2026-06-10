import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const [loc] = useLocation();
  const { user } = useAuth();
  const at = (p: string) => loc === p || loc.startsWith(p + "/");

  return (
    <div className="app">
      {/* Top Header */}
      <header className="hdr">
        <div className="flex items-c gap-10" style={{ gap: 10 }}>
          <img src={nexaLogo} alt="NEXA" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--primary)" }}>NEXA Pay</span>
        </div>
        <div className="flex items-c" style={{ gap: 10 }}>
          {user?.role === "merchant" && (
            <Link href="/merchant-pos">
              <span className="bdg bdg-blue" style={{ cursor: "pointer", fontSize: 11 }}>POS Terminal</span>
            </Link>
          )}
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
            {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Bottom Nav */}
      <nav className="bnav">
        {/* Home */}
        <Link href="/dashboard"><button className={`nb ${at("/dashboard") ? "act" : ""}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={at("/dashboard") ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </button></Link>

        {/* History */}
        <Link href="/transactions"><button className={`nb ${at("/transactions") ? "act" : ""}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={at("/transactions") ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          History
        </button></Link>

        {/* Tap Pay — center prominent */}
        <Link href="/tap">
          <button className="nb-pay">
            <div className={`nb-pay-ico ${at("/tap") ? "" : ""}`} style={at("/tap") ? { background: "var(--primary-d)" } : {}}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
              </svg>
            </div>
            Pay
          </button>
        </Link>

        {/* Card */}
        <Link href="/card"><button className={`nb ${at("/card") ? "act" : ""}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={at("/card") ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Cards
        </button></Link>

        {/* Profile (logout) */}
        <Link href="/merchants"><button className={`nb ${at("/merchants") ? "act" : ""}`}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={at("/merchants") ? 2.5 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Merchants
        </button></Link>
      </nav>
    </div>
  );
}
