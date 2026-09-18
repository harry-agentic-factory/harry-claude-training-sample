// Confettis légers (canvas), aux couleurs Harington. Durée ~1,6 s.
export function confetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = (canvas.width = canvas.clientWidth), H = (canvas.height = canvas.clientHeight);
  const colors = ["#7B9FC7", "#C187A1", "#354866", "#EBD6DD", "#E7ECF3", "#A7B3C6"];
  const parts = Array.from({ length: 90 }, () => ({
    x: W / 2 + (Math.random() - 0.5) * 80, y: H * 0.35, vx: (Math.random() - 0.5) * 9, vy: -Math.random() * 9 - 3,
    w: 5 + Math.random() * 5, h: 3 + Math.random() * 4, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    c: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  canvas.classList.add("on");
  const tick = (t: number) => {
    const k = (t - t0) / 1600;
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= 0.99;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = Math.max(0, 1 - k);
      ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    if (k < 1) requestAnimationFrame(tick); else { ctx.clearRect(0, 0, W, H); canvas.classList.remove("on"); }
  };
  requestAnimationFrame(tick);
}
