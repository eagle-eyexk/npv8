import { useState, useEffect } from "react";
import QRCode from "qrcode";

const API = import.meta.env.BASE_URL.replace(/\/$/, "");
const tok = () => localStorage.getItem("nexa_token") ?? "";

export default function Receive() {
  const [wallet, setWallet] = useState<any>(null);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/wallet`, { headers: { Authorization: `Bearer ${tok()}` } })
      .then(r => r.json()).then(setWallet).catch(() => {});
  }, []);

  useEffect(() => {
    if (wallet?.address) {
      QRCode.toDataURL(wallet.address, {
        width: 220, margin: 2, color: { dark: "#0F172A", light: "#FFFFFF" },
      }).then(setQr).catch(() => {});
    }
  }, [wallet?.address]);

  function copy() {
    if (!wallet?.address) return;
    navigator.clipboard.writeText(wallet.address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pg" style={{ paddingTop: 20 }}>
      <div className="up mb-20">
        <h2 style={{ fontWeight: 800, fontSize: 22 }}>Receive NEXA</h2>
        <div className="muted sm mt-4">Share your address or QR code</div>
      </div>

      <div className="card card-p up d1 tc mb-14">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          {qr ? (
            <div style={{ padding: 12, background: "#fff", borderRadius: 16, border: "1px solid var(--border)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <img src={qr} alt="QR Code" style={{ width: 200, height: 200, imageRendering: "pixelated", display: "block" }} />
            </div>
          ) : (
            <div style={{ width: 224, height: 224, background: "var(--bg)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="spin" style={{ width: 32, height: 32 }} />
            </div>
          )}
        </div>

        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
          Your NEXA Address
        </div>
        <div className="mono" style={{ fontSize: 12, wordBreak: "break-all", background: "var(--bg)", padding: "10px 14px", borderRadius: 10, color: "var(--text)", userSelect: "all", border: "1px solid var(--border)", marginBottom: 14 }}>
          {wallet?.address ?? "Loading…"}
        </div>
        <button className={`btn w-full ${copied ? "btn-success" : "btn-primary"}`} onClick={copy}>
          {copied ? "✓ Address Copied!" : "Copy Address"}
        </button>
      </div>

      <div className="grid2 up d2 mb-14">
        <div className="card card-p tc">
          <div className="xs muted mb-8">NEXA Price</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: "var(--primary)" }}>€100</div>
          <div className="xs muted mt-4">per NEXA</div>
        </div>
        <div className="card card-p tc">
          <div className="xs muted mb-8">Network</div>
          <div style={{ fontWeight: 800, fontSize: 20 }}>NEXA</div>
          <div className="xs muted mt-4">Mainnet</div>
        </div>
      </div>

      <div className="card card-p up d3">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ fontSize: 24 }}>💡</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 5 }}>How to receive</div>
            <div className="muted sm" style={{ lineHeight: 1.6 }}>Share your address or QR code with the sender. Transfers arrive instantly on the NEXA network.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
