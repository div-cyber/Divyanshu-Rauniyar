import { useEffect, useRef, useCallback } from "react";

/* ────────────────────────────────────────────────────────────────
   Global ParticleCanvas — covers the entire viewport (fixed).
   Particles float slowly and are attracted toward the cursor.
   Uses <canvas> + requestAnimationFrame for 60 fps performance.
   ──────────────────────────────────────────────────────────────── */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  baseOpacity: number;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  /* Create particles scaled to viewport */
  const initParticles = useCallback((w: number, h: number) => {
    // ~150 particles on a 1920×1080 screen, scales with area
    const count = Math.min(180, Math.max(80, Math.floor((w * h) / 8000)));
    const arr: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const baseOpacity = Math.random() * 0.45 + 0.1;
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.6,
        opacity: baseOpacity,
        baseOpacity,
      });
    }
    particlesRef.current = arr;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* Size canvas to window */
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (particlesRef.current.length === 0)
        initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    /* Track mouse position (global, since canvas is fixed) */
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    /* ── Animation loop ── */
    const CONNECT_DIST = 120;
    const MOUSE_RADIUS = 200;
    const ATTRACT_STRENGTH = 0.035;
    const DAMPING = 0.98;

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        /* ── Cursor attraction: gently pull particles toward mouse ── */
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS && dist > 1) {
          const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * ATTRACT_STRENGTH;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;

          /* Glow effect — brighter when near cursor */
          const glow = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          p.opacity = p.baseOpacity + glow * 0.5;

          /* Draw a soft halo around nearby particles */
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 3, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(217, 91%, 60%, ${glow * 0.2})`;
          ctx.fill();
        } else {
          /* Slowly return to base opacity */
          p.opacity += (p.baseOpacity - p.opacity) * 0.05;
        }

        /* Apply velocity with damping to prevent runaway speed */
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap edges */
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        /* Draw particle */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(210, 40%, 85%, ${p.opacity})`;
        ctx.fill();

        /* ── Connect nearby particles with faint lines ── */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const lx = p.x - q.x;
          const ly = p.y - q.y;
          const ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < CONNECT_DIST) {
            const alpha = 0.07 * (1 - ld / CONNECT_DIST);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `hsla(217, 91%, 60%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      aria-hidden="true"
    />
  );
}
