import { useGetCard, useListCardSpend, useUpdateMerchant } from "@workspace/api-client-react";
import { CreditCard, Lock, Unlock, ShoppingCart, Gamepad2, Music, Car, UtensilsCrossed, Package } from "lucide-react";
import { format } from "date-fns";

function categoryIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("gaming") || c.includes("game")) return <Gamepad2 size={14} className="text-violet-400" />;
  if (c.includes("entertainment") || c.includes("music")) return <Music size={14} className="text-pink-400" />;
  if (c.includes("transport")) return <Car size={14} className="text-blue-400" />;
  if (c.includes("food") || c.includes("grocer") || c.includes("restaurant")) return <UtensilsCrossed size={14} className="text-orange-400" />;
  if (c.includes("shop") || c.includes("retail")) return <ShoppingCart size={14} className="text-emerald-400" />;
  return <Package size={14} className="text-muted-foreground" />;
}

export default function Card() {
  const { data: card, isLoading: loadingCard } = useGetCard();
  const { data: spend, isLoading: loadingSpend } = useListCardSpend({ limit: 20 });

  const isFrozen = card?.status === "frozen";
  const availablePct = card ? (card.availableUsd / card.spendLimitUsd) * 100 : 0;

  const totalSpent = (spend ?? []).filter((s) => s.status !== "declined").reduce((sum, s) => sum + s.amountUsd, 0);

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Debit Card</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Spend NEXA anywhere {card?.network ?? "Visa"} is accepted</p>
      </div>

      {/* Card visual */}
      <div className={`relative rounded-2xl p-6 overflow-hidden transition-all duration-300 ${isFrozen ? "opacity-60 grayscale" : ""}`}
        style={{ background: "linear-gradient(135deg, hsl(222,47%,14%) 0%, hsl(191,60%,18%) 100%)", border: "1px solid hsl(191,100%,50%,0.3)", boxShadow: "0 0 40px hsl(191,100%,50%,0.15)" }}>
        {/* Circuit lines */}
        <div className="absolute inset-0 opacity-10 circuit-bg" />

        {loadingCard ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-8 w-12 bg-white/20 rounded" />
            <div className="h-4 w-48 bg-white/20 rounded mt-6" />
            <div className="flex justify-between mt-4">
              <div className="h-4 w-32 bg-white/20 rounded" />
              <div className="h-4 w-20 bg-white/20 rounded" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-8">
              <div className="w-10 h-7 rounded bg-yellow-400/80" style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }} />
              {isFrozen && (
                <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-400/30 flex items-center gap-1">
                  <Lock size={10} /> Frozen
                </span>
              )}
            </div>
            <div className="font-mono text-xl tracking-[0.2em] text-white mb-5">
              •••• •••• •••• {card?.last4}
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-0.5">Card Holder</div>
                <div className="text-white font-medium text-sm">NEXA USER</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-0.5">Expires</div>
                <div className="text-white font-medium text-sm">{String(card?.expiryMonth).padStart(2, "0")}/{card?.expiryYear}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider mb-0.5">Network</div>
                <div className="text-white font-medium text-sm">{card?.network}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-primary/20 nexa-border-glow rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Available</div>
          <div className="text-xl font-bold text-primary mt-1">${card?.availableUsd?.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? "—"}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Limit</div>
          <div className="text-xl font-bold text-foreground mt-1">${card?.spendLimitUsd?.toLocaleString() ?? "—"}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Spent</div>
          <div className="text-xl font-bold text-foreground mt-1">${totalSpent.toFixed(2)}</div>
        </div>
      </div>

      {/* Available limit bar */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Utilization</span>
          <span>{(100 - availablePct).toFixed(1)}% used</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${availablePct}%` }}
          />
        </div>
      </div>

      {/* Spend history */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Card Spend History</h3>
          <CreditCard size={14} className="text-muted-foreground" />
        </div>
        <div className="divide-y divide-border">
          {loadingSpend ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-20 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))
          ) : !spend?.length ? (
            <div className="px-5 py-10 text-center text-muted-foreground text-sm">No card spend yet</div>
          ) : (
            spend.map((s) => (
              <div key={s.id} className="px-5 py-3 flex items-center gap-3 hover:bg-accent/20 transition-colors">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                  {categoryIcon(s.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground">{s.merchantName}</div>
                  <div className="text-xs text-muted-foreground">{s.category} · {format(new Date(s.createdAt), "MMM d, h:mm a")}</div>
                </div>
                <div className="text-sm font-mono font-medium text-foreground">
                  -${s.amountUsd.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
