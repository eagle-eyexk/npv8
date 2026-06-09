import { useGetDashboardSummary, useGetRecentActivity, useGetVolumeChart } from "@workspace/api-client-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Zap, CreditCard, Activity, Users } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

function StatCard({ label, value, sub, icon: Icon, accent = false }: { label: string; value: string; sub?: string; icon: any; accent?: boolean }) {
  return (
    <div className={`bg-card border rounded-xl p-5 flex flex-col gap-3 ${accent ? "border-primary/30 nexa-border-glow" : "border-border"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className={`p-2 rounded-lg ${accent ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground"}`}>
          <Icon size={14} />
        </div>
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${accent ? "text-primary nexa-glow-text" : "text-foreground"}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function txTypeIcon(type: string) {
  switch (type) {
    case "send": return <ArrowUpRight size={14} className="text-orange-400" />;
    case "receive": return <ArrowDownLeft size={14} className="text-emerald-400" />;
    case "tap_pay": return <Zap size={14} className="text-primary" />;
    case "card_spend": return <CreditCard size={14} className="text-violet-400" />;
    default: return <Activity size={14} />;
  }
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: activity, isLoading: loadingActivity } = useGetRecentActivity({ limit: 8 });
  const { data: volume, isLoading: loadingVolume } = useGetVolumeChart();

  const priceUp = (summary?.priceChange24h ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your Nexa wallet at a glance</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-muted-foreground">NEXA</span>
          <span className="font-mono font-bold text-foreground">${summary?.nexaPriceUsd?.toFixed(4) ?? "—"}</span>
          <span className={`flex items-center gap-0.5 ${priceUp ? "text-emerald-400" : "text-red-400"}`}>
            {priceUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(summary?.priceChange24h ?? 0).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Balance + Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="col-span-2 bg-card border border-primary/30 nexa-border-glow rounded-xl p-6">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total Balance</div>
          {loadingSummary ? (
            <div className="h-10 w-48 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <div className="text-4xl font-bold text-primary nexa-glow-text font-mono">
                {summary?.balanceNexa?.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-lg text-muted-foreground">NEXA</span>
              </div>
              <div className="text-lg text-muted-foreground mt-1">${summary?.balanceUsd?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </>
          )}
          <div className="flex gap-3 mt-4">
            <Link href="/send">
              <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5">
                <ArrowUpRight size={14} /> Send
              </button>
            </Link>
            <Link href="/receive">
              <button className="px-4 py-1.5 bg-accent text-foreground rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors flex items-center gap-1.5">
                <ArrowDownLeft size={14} /> Receive
              </button>
            </Link>
          </div>
        </div>

        <StatCard label="Merchants" value={String(summary?.activeMerchants ?? "—")} sub="Active on Nexa Chain" icon={Users} />
        <StatCard label="Transactions" value={String(summary?.transactionCount ?? "—")} sub="Total processed" icon={Activity} />
      </div>

      {/* Volume chart */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-4">30-Day Volume (NEXA)</h2>
        {loadingVolume ? (
          <div className="h-40 bg-muted animate-pulse rounded" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={volume ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(191,100%,50%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(191,100%,50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 10, fill: "hsl(215,20%,45%)" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(215,20%,45%)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(222,44%,11%)", border: "1px solid hsl(222,30%,18%)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(210,40%,70%)" }}
                itemStyle={{ color: "hsl(191,100%,50%)" }}
              />
              <Area type="monotone" dataKey="volume" stroke="hsl(191,100%,50%)" strokeWidth={2} fill="url(#volGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Flow stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sent" value={`$${(summary?.totalSent ?? 0).toFixed(0)}`} icon={ArrowUpRight} />
        <StatCard label="Received" value={`$${(summary?.totalReceived ?? 0).toFixed(0)}`} icon={ArrowDownLeft} />
        <StatCard label="Tap Payments" value={`$${(summary?.totalTapPay ?? 0).toFixed(0)}`} icon={Zap} accent />
        <StatCard label="Card Spend" value={`$${(summary?.totalCardSpend ?? 0).toFixed(0)}`} icon={CreditCard} />
      </div>

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Activity</h2>
          <Link href="/transactions" className="text-xs text-primary hover:underline">View all</Link>
        </div>
        <div className="divide-y divide-border">
          {loadingActivity ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))
          ) : (
            (activity ?? []).map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/30 transition-colors">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                  {txTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground truncate">{item.description}</div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(item.createdAt), "MMM d, h:mm a")}
                  </div>
                </div>
                {item.amount != null && (
                  <div className="text-sm font-mono text-muted-foreground shrink-0">
                    {item.amount.toFixed(2)} NEXA
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
