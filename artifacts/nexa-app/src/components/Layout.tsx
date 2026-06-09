import { Link, useLocation } from "wouter";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";
import {
  LayoutDashboard,
  ArrowUpRight,
  QrCode,
  List,
  Zap,
  Store,
  CreditCard,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/send", label: "Send", icon: ArrowUpRight },
  { href: "/receive", label: "Receive", icon: QrCode },
  { href: "/transactions", label: "Transactions", icon: List },
  { href: "/tap", label: "Tap to Pay", icon: Zap },
  { href: "/merchants", label: "Merchants", icon: Store },
  { href: "/card", label: "Debit Card", icon: CreditCard },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background circuit-bg">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col w-60 shrink-0 bg-sidebar border-r border-sidebar-border transition-all duration-200 z-40",
          mobileOpen ? "fixed inset-y-0 left-0" : "hidden md:flex"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-4 py-5 border-b border-sidebar-border hover:opacity-90 transition-opacity">
          <img src={nexaLogo} alt="Nexa" className="h-8 w-8 object-contain" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-primary uppercase nexa-glow-text">NEXA</span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Payment Crypto</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== "/" && location.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150",
                  active
                    ? "bg-primary/10 text-primary border border-primary/20 nexa-border-glow"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon size={16} className={active ? "text-primary" : ""} />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Nexa Chain: Live</span>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <button onClick={() => setMobileOpen(true)} className="text-muted-foreground hover:text-foreground">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src={nexaLogo} alt="Nexa" className="h-6 w-6 object-contain" />
            <span className="text-sm font-bold text-primary tracking-widest">NEXA</span>
          </div>
          <div />
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
