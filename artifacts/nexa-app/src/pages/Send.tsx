import { useState } from "react";
import { useGetWallet, useCreateTransaction, getListTransactionsQueryKey, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const NEXA_PRICE = 0.0842;

export default function Send() {
  const { data: wallet } = useGetWallet();
  const createTx = useCreateTransaction();
  const qc = useQueryClient();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [step, setStep] = useState<"form" | "confirm" | "success" | "error">("form");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const numAmount = parseFloat(amount) || 0;
  const usdValue = numAmount * NEXA_PRICE;
  const fee = 200; // unexa
  const valid = to.length > 10 && numAmount > 0 && numAmount <= (wallet?.balanceNexa ?? 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setStep("confirm");
  }

  function handleConfirm() {
    createTx.mutate(
      { data: { toAddress: to, amount: numAmount, memo } },
      {
        onSuccess: (tx) => {
          setTxHash(tx.txHash ?? null);
          setStep("success");
          qc.invalidateQueries({ queryKey: getListTransactionsQueryKey() });
          qc.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
        },
        onError: () => {
          setErr("Transaction failed. Please try again.");
          setStep("error");
        },
      }
    );
  }

  function reset() {
    setTo(""); setAmount(""); setMemo(""); setStep("form"); setTxHash(null); setErr("");
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Send NEXA</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Transfer tokens to any Nexa address</p>
      </div>

      {/* Balance */}
      <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Available Balance</span>
        <div className="text-right">
          <div className="font-mono font-bold text-primary">{wallet?.balanceNexa?.toLocaleString()} NEXA</div>
          <div className="text-xs text-muted-foreground">${wallet?.balanceUsd?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Recipient Address</label>
            <input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="nexa1..."
              className="w-full bg-card border border-input rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Amount (NEXA)</label>
            <div className="relative">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                className="w-full bg-card border border-input rounded-lg px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors pr-28"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ≈ ${usdValue.toFixed(2)} USD
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAmount(String(wallet?.balanceNexa ?? 0))}
              className="text-xs text-primary hover:underline"
            >
              Use max
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Memo (optional)</label>
            <input
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="Payment for..."
              className="w-full bg-card border border-input rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between"><span>Network fee</span><span className="font-mono">{fee} unexa</span></div>
            <div className="flex justify-between"><span>You send</span><span className="font-mono text-foreground">{numAmount.toLocaleString()} NEXA</span></div>
          </div>

          <button
            type="submit"
            disabled={!valid}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowUpRight size={16} /> Review Transaction
          </button>
        </form>
      )}

      {step === "confirm" && (
        <div className="space-y-4">
          <div className="bg-card border border-primary/30 nexa-border-glow rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-foreground">Confirm Transfer</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-xs text-foreground truncate max-w-[200px]">{to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-mono font-bold text-primary">{numAmount.toLocaleString()} NEXA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">USD Value</span>
                <span className="font-mono">${usdValue.toFixed(2)}</span>
              </div>
              {memo && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memo</span>
                  <span>{memo}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("form")} className="flex-1 py-3 bg-accent text-foreground rounded-xl font-semibold text-sm hover:bg-accent/80 transition-colors">
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={createTx.isPending}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {createTx.isPending ? <Loader2 size={16} className="animate-spin" /> : null}
              {createTx.isPending ? "Sending..." : "Confirm & Send"}
            </button>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="bg-card border border-emerald-500/30 rounded-xl p-6 text-center space-y-3">
          <CheckCircle className="mx-auto text-emerald-400" size={40} />
          <h3 className="font-bold text-foreground text-lg">Transaction Sent</h3>
          <p className="text-sm text-muted-foreground">Your NEXA is on its way.</p>
          {txHash && (
            <div className="bg-muted rounded-lg p-2 text-xs font-mono text-muted-foreground break-all">
              {txHash}
            </div>
          )}
          <button onClick={reset} className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Send Another
          </button>
        </div>
      )}

      {step === "error" && (
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center space-y-3">
          <AlertCircle className="mx-auto text-destructive" size={40} />
          <h3 className="font-bold text-foreground text-lg">Transaction Failed</h3>
          <p className="text-sm text-muted-foreground">{err}</p>
          <button onClick={reset} className="w-full py-2.5 bg-accent text-foreground rounded-xl text-sm font-semibold hover:bg-accent/80 transition-colors">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
