import { useState, useEffect } from "react";
import { useListMerchants, useGenerateTapToken } from "@workspace/api-client-react";
import { Zap, CheckCircle, Timer, Wifi } from "lucide-react";

export default function Tap() {
  const { data: merchants } = useListMerchants();
  const generateToken = useGenerateTapToken();

  const [amount, setAmount] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [step, setStep] = useState<"form" | "active" | "expired">("form");
  const [token, setToken] = useState<{ token: string; expiresAt: string; nonce: number; amount: number } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(60);

  useEffect(() => {
    if (step !== "active" || !token) return;
    const end = new Date(token.expiresAt).getTime();
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(tick);
        setStep("expired");
      }
    }, 500);
    return () => clearInterval(tick);
  }, [step, token]);

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !merchantId) return;
    generateToken.mutate(
      { data: { amount: parseFloat(amount), merchantId } },
      {
        onSuccess: (t) => {
          setToken(t);
          setSecondsLeft(60);
          setStep("active");
        },
      }
    );
  }

  const activeMerchants = (merchants ?? []).filter((m) => m.isActive);
  const progress = (secondsLeft / 60) * 100;
  const isUrgent = secondsLeft <= 15;

  return (
    <div className="p-6 max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tap to Pay</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Generate a one-time payment token for NFC</p>
      </div>

      {step === "form" && (
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Select Merchant</label>
            <select
              value={merchantId}
              onChange={(e) => setMerchantId(e.target.value)}
              className="w-full bg-card border border-input rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Choose a merchant...</option>
              {activeMerchants.map((m) => (
                <option key={m.id} value={m.id}>{m.businessName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount (NEXA)</label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              min="1"
              step="any"
              placeholder="0.00"
              className="w-full bg-card border border-input rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-4 text-xs text-muted-foreground space-y-1">
            <div className="flex items-center gap-1.5 text-foreground font-medium text-sm mb-2">
              <Wifi size={14} className="text-primary" /> How it works
            </div>
            <p>Generate a signed token valid for 60 seconds. Hold your device near the merchant NFC terminal to complete payment.</p>
          </div>

          <button
            type="submit"
            disabled={!merchantId || !amount || generateToken.isPending}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Zap size={16} /> {generateToken.isPending ? "Generating..." : "Generate Token"}
          </button>
        </form>
      )}

      {step === "active" && token && (
        <div className="space-y-5">
          {/* Animated tap indicator */}
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="relative">
              <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${isUrgent ? "bg-orange-400" : "bg-primary"}`} style={{ animationDuration: "1.2s" }} />
              <div className={`absolute inset-[-8px] rounded-full animate-ping opacity-15 ${isUrgent ? "bg-orange-400" : "bg-primary"}`} style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center ${isUrgent ? "bg-orange-500/20 border-2 border-orange-500/50" : "bg-primary/10 border-2 border-primary/40 nexa-border-glow"}`}>
                <Wifi size={36} className={isUrgent ? "text-orange-400" : "text-primary"} />
              </div>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold font-mono ${isUrgent ? "text-orange-400" : "text-primary nexa-glow-text"}`}>
                {secondsLeft}s
              </div>
              <div className="text-sm text-muted-foreground mt-1">Hold near NFC terminal</div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isUrgent ? "bg-orange-400" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Token details */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono font-bold text-primary">{token.amount.toLocaleString()} NEXA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Merchant</span>
              <span>{activeMerchants.find((m) => m.id === merchantId)?.businessName ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nonce</span>
              <span className="font-mono text-xs">{token.nonce}</span>
            </div>
          </div>

          <button
            onClick={() => { setStep("form"); setToken(null); }}
            className="w-full py-2.5 bg-accent text-foreground rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {step === "expired" && (
        <div className="bg-card border border-orange-500/30 rounded-xl p-6 text-center space-y-3">
          <Timer className="mx-auto text-orange-400" size={40} />
          <h3 className="font-bold text-foreground text-lg">Token Expired</h3>
          <p className="text-sm text-muted-foreground">The 60-second window has passed. Generate a new token.</p>
          <button
            onClick={() => { setStep("form"); setToken(null); }}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Generate New Token
          </button>
        </div>
      )}
    </div>
  );
}
