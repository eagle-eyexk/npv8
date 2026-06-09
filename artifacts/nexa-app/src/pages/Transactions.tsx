import { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { ArrowUpRight, ArrowDownLeft, Zap, CreditCard, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type TxType = "send" | "receive" | "tap_pay" | "card_spend" | undefined;

const filters: { label: string; value: TxType }[] = [
  { label: "All", value: undefined },
  { label: "Send", value: "send" },
  { label: "Receive", value: "receive" },
  { label: "Tap Pay", value: "tap_pay" },
  { label: "Card", value: "card_spend" },
];

function txIcon(type: string) {
  switch (type) {
    case "send": return <ArrowUpRight size={15} className="text-orange-400" />;
    case "receive": return <ArrowDownLeft size={15} className="text-emerald-400" />;
    case "tap_pay": return <Zap size={15} className="text-primary" />;
    case "card_spend": return <CreditCard size={15} className="text-violet-400" />;
    default: return null;
  }
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20",
    cleared: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize font-medium ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

export default function Transactions() {
  const [activeType, setActiveType] = useState<TxType>(undefined);
  const { data: txs, isLoading } = useListTransactions(activeType ? { type: activeType, limit: 50 } : { limit: 50 });

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Full history of your NEXA activity</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={String(f.value)}
            onClick={() => setActiveType(f.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeType === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
          <span>Type</span>
          <span>Details</span>
          <span className="text-right">Amount</span>
          <span className="text-right">USD</span>
          <span className="text-right">Status</span>
        </div>

        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-3.5 items-center">
                <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-3 w-40 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-24 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 w-14 bg-muted animate-pulse rounded" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
              </div>
            ))
          ) : !txs?.length ? (
            <div className="px-5 py-10 text-center text-muted-foreground text-sm">No transactions yet</div>
          ) : (
            txs.map((tx) => (
              <div key={tx.id} className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-x-4 px-5 py-3.5 items-center hover:bg-accent/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  {txIcon(tx.type)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-foreground truncate">
                    {tx.merchantName ?? (tx.toAddress ? `→ ${tx.toAddress.slice(0, 14)}...` : tx.fromAddress ? `← ${tx.fromAddress.slice(0, 14)}...` : tx.type)}
                  </div>
                  <div className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, h:mm a")}</div>
                </div>
                <div className="text-right font-mono text-sm text-foreground">{Number(tx.amount).toLocaleString()} <span className="text-muted-foreground text-xs">NEXA</span></div>
                <div className="text-right font-mono text-sm text-muted-foreground">${Number(tx.amountUsd).toFixed(2)}</div>
                <div className="text-right">{statusBadge(tx.status)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
