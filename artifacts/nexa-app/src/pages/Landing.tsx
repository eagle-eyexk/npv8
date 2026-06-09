import { Link } from "wouter";
import nexaLogo from "@assets/3492540F-12E9-4FDB-83EF-D471EF90B334_1781047394056.png";
import { Zap, CreditCard, Store, Shield, ArrowRight, Wifi, Globe, Lock } from "lucide-react";

function FeatureCard({ icon: Icon, title, desc, accent = false }: { icon: any; title: string; desc: string; accent?: boolean }) {
  return (
    <div className={`bg-card border rounded-2xl p-6 space-y-3 transition-all duration-200 hover:translate-y-[-2px] ${accent ? "border-primary/40 nexa-border-glow" : "border-border hover:border-primary/20"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-primary/15 text-primary" : "bg-accent text-muted-foreground"}`}>
        <Icon size={20} />
      </div>
      <h3 className={`font-semibold text-base ${accent ? "text-primary" : "text-foreground"}`}>{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center px-6 py-4 bg-card/60 border border-border rounded-2xl backdrop-blur-sm">
      <div className="text-2xl font-bold text-primary nexa-glow-text font-mono">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background circuit-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={nexaLogo} alt="Nexa" className="h-7 w-7 object-contain" />
            <span className="text-sm font-bold tracking-widest text-primary uppercase nexa-glow-text">NEXA</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#ecosystem" className="hover:text-foreground transition-colors">Ecosystem</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Network</a>
          </div>
          <Link href="/dashboard">
            <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5">
              Open Wallet <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(ellipse, hsl(191,100%,50%) 0%, transparent 70%)" }} />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary mb-8 font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Nexa Chain — Live on Mainnet
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
          The Future of<br />
          <span className="text-primary nexa-glow-text">Crypto Payments</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Send, receive, and spend NEXA anywhere — with tap-to-pay NFC, a linked Visa debit card, and a sovereign blockchain built for speed.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity nexa-glow">
              <Zap size={16} /> Launch Wallet
            </button>
          </Link>
          <a href="#features">
            <button className="px-6 py-3 bg-card border border-border text-foreground rounded-xl font-semibold text-sm flex items-center gap-2 hover:border-primary/40 transition-colors">
              Explore Features <ArrowRight size={14} />
            </button>
          </a>
        </div>

        {/* Hero visual — animated circuit nodes */}
        <div className="relative mt-16 max-w-3xl mx-auto">
          <div className="bg-card border border-primary/20 nexa-border-glow rounded-2xl p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <img src={nexaLogo} alt="" className="h-6 w-6 object-contain" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">NEXA Wallet</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Connected
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-primary nexa-glow-text mb-1">142,500 <span className="text-lg text-muted-foreground font-normal">NEXA</span></div>
            <div className="text-muted-foreground text-sm mb-5">≈ $12,002.55 USD</div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Send", icon: "↑", color: "text-orange-400" },
                { label: "Tap Pay", icon: "⚡", color: "text-primary" },
                { label: "Card", icon: "▣", color: "text-violet-400" },
              ].map((a) => (
                <div key={a.label} className="bg-accent rounded-xl p-3 text-center">
                  <div className={`text-lg ${a.color}`}>{a.icon}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatPill value="$0.0842" label="NEXA Price" />
          <StatPill value="4,821" label="Active Wallets" />
          <StatPill value="142K+" label="Transactions" />
          <StatPill value="287" label="Merchants" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need to pay with crypto</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From NFC tap-to-pay to a physical Visa card, Nexa makes crypto payments as frictionless as tapping your phone.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard accent icon={Zap} title="Tap to Pay" desc="Hold your phone near any Nexa-enabled NFC terminal and pay instantly with a signed cryptographic token — valid for 60 seconds." />
          <FeatureCard icon={CreditCard} title="Visa Debit Card" desc="Spend NEXA anywhere Visa is accepted. Your NEXA balance is converted at point-of-sale, with no hidden fees." />
          <FeatureCard icon={Store} title="Merchant Network" desc="Thousands of merchants accept Nexa. Register your business in seconds and start receiving NEXA settlements directly to your chain address." />
          <FeatureCard icon={Shield} title="Sovereign Chain" desc="Built on Cosmos SDK with CosmWasm smart contracts. Your keys, your tokens. No central authority can freeze or reverse transactions." />
          <FeatureCard icon={Wifi} title="Real-Time Settlement" desc="Transactions finalize in under 6 seconds on the Nexa Chain. The relayer broadcasts your signed tokens directly to the blockchain." />
          <FeatureCard icon={Globe} title="IBC Compatible" desc="Transfer NEXA across any IBC-enabled chain. Connect to the broader Cosmos ecosystem with native interoperability." />
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-card border border-primary/20 nexa-border-glow rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs text-primary uppercase tracking-widest font-semibold mb-3">Nexa Ecosystem</div>
              <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">One token. Infinite utility.</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">NEXA powers every transaction in the ecosystem — from buying a coffee with a tap to settling international B2B invoices. The same sovereign token, the same immutable ledger.</p>
              <div className="space-y-3">
                {[
                  { icon: Zap, label: "Tap-to-Pay Protocol", desc: "CosmWasm smart contract for NFC authorizations" },
                  { icon: CreditCard, label: "Debit Card", desc: "Stripe Issuing — spend NEXA anywhere Visa is accepted" },
                  { icon: Store, label: "Merchant POS", desc: "Accept crypto, settle in NEXA — no bank required" },
                  { icon: Lock, label: "Non-Custodial", desc: "Your keys, your coins — always" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-0.5 w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon size={13} className="text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{label}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl opacity-20 blur-2xl"
                style={{ background: "radial-gradient(ellipse at center, hsl(191,100%,50%) 0%, transparent 70%)" }} />
              <img src={nexaLogo} alt="Nexa" className="relative mx-auto w-48 h-48 object-contain drop-shadow-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to move at the speed of light?</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Your wallet is waiting. Start sending, receiving, and spending NEXA today.</p>
        <Link href="/dashboard">
          <button className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-opacity nexa-glow flex items-center gap-2 mx-auto">
            <Zap size={16} /> Open Nexa Wallet
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src={nexaLogo} alt="Nexa" className="h-5 w-5 object-contain opacity-60" />
            <span>Nexa Payment Crypto</span>
          </div>
          <span>Built on Cosmos SDK · CosmWasm · IBC</span>
        </div>
      </footer>
    </div>
  );
}
