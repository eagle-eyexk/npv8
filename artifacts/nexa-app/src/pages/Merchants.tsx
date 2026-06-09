import { useState } from "react";
import { useListMerchants, useCreateMerchant, useUpdateMerchant, getListMerchantsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Store, Plus, ToggleLeft, ToggleRight, TrendingUp } from "lucide-react";

const categories = ["Food & Beverage", "Retail", "Entertainment", "Transport", "Restaurant", "Technology", "Services", "Other"];

export default function Merchants() {
  const { data: merchants, isLoading } = useListMerchants();
  const createMerchant = useCreateMerchant();
  const updateMerchant = useUpdateMerchant();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ businessName: "", settlementAddress: "", category: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.businessName || !form.settlementAddress || !form.category) return;
    setSubmitting(true);
    createMerchant.mutate(
      { data: form },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getListMerchantsQueryKey() });
          setForm({ businessName: "", settlementAddress: "", category: "" });
          setShowForm(false);
          setSubmitting(false);
        },
        onError: () => setSubmitting(false),
      }
    );
  }

  function toggleActive(id: string, current: boolean) {
    updateMerchant.mutate(
      { id, data: { isActive: !current } },
      { onSuccess: () => qc.invalidateQueries({ queryKey: getListMerchantsQueryKey() }) }
    );
  }

  const total = merchants?.length ?? 0;
  const active = merchants?.filter((m) => m.isActive).length ?? 0;
  const totalVol = merchants?.reduce((s, m) => s + m.totalVolume, 0) ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Merchants</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registered Nexa payment acceptors</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> Register Merchant
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Merchants", value: String(total) },
          { label: "Active", value: String(active), accent: true },
          { label: "Total Volume", value: `${totalVol.toLocaleString()} NEXA` },
        ].map((s) => (
          <div key={s.label} className={`bg-card border rounded-xl p-4 ${s.accent ? "border-primary/30 nexa-border-glow" : "border-border"}`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
            <div className={`text-xl font-bold mt-1 ${s.accent ? "text-primary" : "text-foreground"}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Registration form */}
      {showForm && (
        <div className="bg-card border border-primary/20 nexa-border-glow rounded-xl p-5">
          <h3 className="font-semibold mb-4">Register New Merchant</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              value={form.businessName}
              onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
              placeholder="Business Name"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <input
              value={form.settlementAddress}
              onChange={(e) => setForm((f) => ({ ...f, settlementAddress: e.target.value }))}
              placeholder="Settlement Address (nexa1...)"
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-accent text-foreground rounded-lg text-sm hover:bg-accent/80 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Merchant list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-2.5 text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
          <span>Merchant</span>
          <span className="text-right">Volume (NEXA)</span>
          <span className="text-right">Txns</span>
          <span className="text-center">Category</span>
          <span className="text-center">Active</span>
        </div>
        <div className="divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-4 items-center">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-52 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                <div className="h-5 w-20 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-10 bg-muted animate-pulse rounded" />
              </div>
            ))
          ) : !merchants?.length ? (
            <div className="px-5 py-10 text-center">
              <Store className="mx-auto text-muted-foreground mb-2" size={28} />
              <p className="text-muted-foreground text-sm">No merchants registered yet</p>
            </div>
          ) : (
            merchants.map((m) => (
              <div key={m.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 px-5 py-4 items-center hover:bg-accent/20 transition-colors">
                <div>
                  <div className="text-sm font-medium text-foreground">{m.businessName}</div>
                  <div className="text-xs font-mono text-muted-foreground truncate max-w-[260px]">{m.settlementAddress}</div>
                </div>
                <div className="text-right font-mono text-sm text-foreground">
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp size={12} className="text-primary" />
                    {m.totalVolume.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">{m.transactionCount.toLocaleString()}</div>
                <div className="text-center">
                  <span className="text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground">{m.category}</span>
                </div>
                <div className="flex justify-center">
                  <button onClick={() => toggleActive(m.id, m.isActive)} className="text-muted-foreground hover:text-primary transition-colors">
                    {m.isActive ? <ToggleRight size={22} className="text-primary" /> : <ToggleLeft size={22} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
