import { useState, useEffect } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
function tok() { return localStorage.getItem("nexa_token") ?? ""; }

function QRCode({ value }: { value: string }) {
  const size = 160;
  const cells = 21;
  const cell = size / cells;
  const hash = value.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const grid = Array.from({ length: cells }, (_, i) =>
    Array.from({ length: cells }, (_, j) => {
      if (i < 7 && j < 7) return true;
      if (i < 7 && j >= cells - 7) return true;
      if (i >= cells - 7 && j < 7) return true;
      const seed = (i * cells + j + Math.abs(hash)) % 3;
      return seed === 0;
    })
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 12 }}>
      <rect width={size} height={size} fill="white" />
      {grid.map((row, i) => row.map((dark, j) => dark ? (
        <rect key={`${i}-${j}`} x={j * cell} y={i * cell} width={cell} height={cell} fill="#0F172A" />
      ) : null))}
    </svg>
  );
}

export default function Receive() {
  const [wallet, setWallet] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(setWallet).catch(() => {});
  }, []);

  function copy() {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="content-wrap">
      <div style={{ padding: "24px 0 20px" }} className="anim-up">
        <h2 className="page-title">Receive NEXA</h2>
        <div className="text-sm text-muted mt-4">Share your address to receive funds</div>
      </div>

      <div className="anim-up anim-delay-1 glass-card" style={{ padding: 28, textAlign: "center" }}>
        <div style={{ marginBottom: 20 }}>
          {wallet?.address ? <QRCode value={wallet.address} /> : <div style={{ width: 160, height: 160, background: "rgba(148,163,184,0.1)", borderRadius: 12, margin: "0 auto" }} />}
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="text-xs text-muted" style={{ textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Your NEXA Address</div>
          <div className="mono" style={{ fontSize: 12, wordBreak: "break-all", background: "rgba(14,165,233,0.06)", padding: "10px 14px", borderRadius: 10, color: "var(--text)" }}>
            {wallet?.address ?? "Loading…"}
          </div>
        </div>

        <button className={`btn ${copied ? "btn-green" : "btn-primary"} w-full`} onClick={copy}>
          {copied ? "✓ Copied!" : "Copy Address"}
        </button>
      </div>

      <div className="anim-up anim-delay-2" style={{ marginTop: 20 }}>
        <div className="grid-2">
          <div className="stat-card" style={{ textAlign: "center" }}>
            <div className="text-xs text-muted mb-4">NEXA Price</div>
            <div className="stat-value glow-blue">€100</div>
            <div className="stat-label">Per 1 NEXA</div>
          </div>
          <div className="stat-card" style={{ textAlign: "center" }}>
            <div className="text-xs text-muted mb-4">Network</div>
            <div className="stat-value glow-purple">NEXA</div>
            <div className="stat-label">Chain · L1</div>
          </div>
        </div>
      </div>

      <div className="anim-up anim-delay-3 glass-card mt-20" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 20 }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>How to receive</div>
            <div className="text-sm text-muted">Share your address or QR code. Transfers confirm instantly on the NEXA network. 1 NEXA = €100.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
