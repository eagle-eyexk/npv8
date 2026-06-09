import { useGetWallet } from "@workspace/api-client-react";
import { Copy, CheckCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";

function QRCode({ value }: { value: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !value) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple visual QR-like pattern (representative placeholder)
    ctx.fillStyle = "hsl(222,44%,11%)";
    ctx.fillRect(0, 0, size, size);

    const moduleSize = 8;
    const modules = size / moduleSize;

    // Generate deterministic pattern from value
    const hash = value.split("").reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);

    for (let row = 0; row < modules; row++) {
      for (let col = 0; col < modules; col++) {
        const seed = (row * 31 + col * 17 + hash) % 100;
        const inCorner =
          (row < 7 && col < 7) ||
          (row < 7 && col >= modules - 7) ||
          (row >= modules - 7 && col < 7);
        const borderCorner =
          (row < 8 && col < 8) ||
          (row < 8 && col >= modules - 8) ||
          (row >= modules - 8 && col < 8);

        let fill = false;
        if (inCorner) {
          // Finder patterns
          const r = row < 7 ? row : row - (modules - 7);
          const c = col < 7 ? col : col - (modules - 7);
          fill = (r === 0 || r === 6 || c === 0 || c === 6) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        } else if (!borderCorner) {
          fill = seed > 45;
        }

        if (fill) {
          ctx.fillStyle = "hsl(191,100%,50%)";
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize - 1, moduleSize - 1);
        }
      }
    }
  }, [value]);

  return (
    <div className="p-4 bg-card border border-primary/20 rounded-2xl nexa-border-glow">
      <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
    </div>
  );
}

export default function Receive() {
  const { data: wallet } = useGetWallet();
  const [copied, setCopied] = useState(false);
  const address = wallet?.address ?? "";

  function handleCopy() {
    navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6 max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receive NEXA</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Share your address to receive tokens</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-5">
        {address ? <QRCode value={address} /> : (
          <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded-xl" />
        )}

        <div className="w-full space-y-2">
          <div className="text-xs text-muted-foreground text-center uppercase tracking-wider">Your Nexa Address</div>
          <div
            onClick={handleCopy}
            className="w-full bg-muted rounded-lg p-3 font-mono text-xs text-foreground break-all text-center cursor-pointer hover:bg-accent transition-colors"
          >
            {address || "Loading..."}
          </div>
          <button
            onClick={handleCopy}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {copied ? <><CheckCheck size={15} /> Copied!</> : <><Copy size={15} /> Copy Address</>}
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 space-y-2">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network Info</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground text-xs">Chain</div>
            <div className="font-medium">Nexa Chain</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Token</div>
            <div className="font-medium">NEXA (unexa)</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Prefix</div>
            <div className="font-mono text-xs">nexa1...</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">KYC Status</div>
            <div className={`font-medium capitalize ${wallet?.kycStatus === "approved" ? "text-emerald-400" : "text-orange-400"}`}>
              {wallet?.kycStatus ?? "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
