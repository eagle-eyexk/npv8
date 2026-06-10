import { useEffect, useRef } from "react";

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  r: number; color: string;
  pulse: number; pulseSpeed: number;
}

interface Pulse {
  from: number; to: number;
  t: number; speed: number; color: string;
}

const COLORS = ["#0EA5E9", "#8B5CF6", "#10B981", "#F59E0B", "#EC4899"];
const NEON_ALPHA = 0.55;

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const nodes: Node[] = [];
    const pulses: Pulse[] = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const COUNT = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    for (let i = 0; i < COUNT; i++) {
      nodes.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: 2 + Math.random() * 3,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.02 + Math.random() * 0.03,
      });
    }

    const MAX_DIST = 180;
    let frame = 0;

    function addPulse() {
      if (pulses.length < 30 && Math.random() < 0.08) {
        const fi = Math.floor(Math.random() * nodes.length);
        let closest = -1, minD = Infinity;
        for (let i = 0; i < nodes.length; i++) {
          if (i === fi) continue;
          const d = Math.hypot(nodes[i].x - nodes[fi].x, nodes[i].y - nodes[fi].y);
          if (d < MAX_DIST && d < minD) { minD = d; closest = i; }
        }
        if (closest !== -1) {
          pulses.push({ from: fi, to: closest, t: 0, speed: 0.008 + Math.random() * 0.012, color: COLORS[Math.floor(Math.random() * COLORS.length)] });
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy; n.pulse += n.pulseSpeed;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y);
          if (d < MAX_DIST) {
            const alpha = (1 - d / MAX_DIST) * 0.12;
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, nodes[i].color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
            grad.addColorStop(1, nodes[j].color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        const glow = 1 + 0.3 * Math.sin(n.pulse);
        const rad = n.r * glow;
        // Glow
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rad * 5);
        g.addColorStop(0, n.color + "40");
        g.addColorStop(1, n.color + "00");
        ctx.beginPath(); ctx.arc(n.x, n.y, rad * 5, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        // Core
        ctx.beginPath(); ctx.arc(n.x, n.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = n.color + Math.round(NEON_ALPHA * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }

      // Pulses
      addPulse();
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t >= 1) { pulses.splice(i, 1); continue; }
        const fn = nodes[p.from]; const tn = nodes[p.to];
        const px = fn.x + (tn.x - fn.x) * p.t;
        const py = fn.y + (tn.y - fn.y) * p.t;
        const pg = ctx.createRadialGradient(px, py, 0, px, py, 8);
        pg.addColorStop(0, p.color + "ff");
        pg.addColorStop(1, p.color + "00");
        ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#fff"; ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 0,
      }}
    />
  );
}
