import { useEffect, useRef } from "react";
import {
  siReact, siTypescript, siJavascript, siNodedotjs, siOpenjdk, siSpringboot, siDotnet, siPython,
  siDocker, siKubernetes, siPostgresql, siMongodb, siRedis, siMysql, siGithubactions, siJenkins,
  siGitlab, siJest, siSelenium, siPostman, siApachekafka, siGit, siRedux, siSupabase,
} from "simple-icons";
import { usePrefersReducedMotion } from "@/hooks/use-motion";

/*
  A background made of the stack. Tiny monochrome logos drift in three depth
  layers far behind the content:
    - scroll moves each layer at its own speed (parallax)
    - icons near the pointer brighten, ease away and wire up to it
    - hovering any technology on the page ([data-tech]) lights its logo in
      the accent colour and draws a thin, flowing line back to what you hovered
  One fixed canvas; scroll is read inside the animation loop, never listened to.
*/

type Glyph = { key: string; aliases: string[]; path?: Path2D; text?: string };

const g = (key: string, icon: { path: string } | null, aliases: string[], text?: string): Glyph => ({
  key,
  aliases,
  path: icon ? new Path2D(icon.path) : undefined,
  text,
});

// Order matters for matching: cloud names first (so "Azure (App Services, AKS)"
// reads as Azure), and "javascript" before "java".
const GLYPHS: Glyph[] = [
  // Azure and AWS logos are not distributed by simple-icons; use their wordmarks.
  g("azure", null, ["azure", "cosmos", "service bus", "key vault", "app service", "bicep", "arm template"], "Azure"),
  g("aws", null, ["aws", "lambda", "ec2", "s3", "fargate", "cloudformation", "api gateway", "guardduty", "rds"], "aws"),
  g("javascript", siJavascript, ["javascript"]),
  g("typescript", siTypescript, ["typescript"]),
  g("react", siReact, ["react"]),
  g("redux", siRedux, ["redux"]),
  g("node", siNodedotjs, ["node"]),
  g("java", siOpenjdk, ["java", "junit"]),
  g("spring", siSpringboot, ["spring"]),
  g("dotnet", siDotnet, [".net", "c#"]),
  g("python", siPython, ["python"]),
  g("docker", siDocker, ["docker", "container"]),
  g("kubernetes", siKubernetes, ["kubernetes", "aks"]),
  g("postgresql", siPostgresql, ["postgres"]),
  g("mongodb", siMongodb, ["mongo"]),
  g("redis", siRedis, ["redis"]),
  g("mysql", siMysql, ["mysql"]),
  g("kafka", siApachekafka, ["kafka"]),
  g("actions", siGithubactions, ["github actions"]),
  g("jenkins", siJenkins, ["jenkins"]),
  g("gitlab", siGitlab, ["gitlab"]),
  g("git", siGit, ["git", "ci/cd"]),
  g("jest", siJest, ["jest"]),
  g("selenium", siSelenium, ["selenium"]),
  g("postman", siPostman, ["postman"]),
  g("supabase", siSupabase, ["supabase"]),
];

const matchGlyph = (label: string) => {
  const t = label.toLowerCase();
  return GLYPHS.findIndex((gl) => gl.aliases.some((a) => t.includes(a)));
};

type Particle = {
  glyph: number;
  x: number;
  y: number;
  depth: number; // 0.35 far .. 1 near
  vx: number;
  vy: number;
  ox: number; // pointer push offset
  oy: number;
  glow: number; // 0..1 proximity / focus brightness
  focus: number; // 0..1 eased highlight
};

// True when nothing opaque sits over (x, y), so a logo drawn there is actually visible.
const OCCLUDERS = new Set(["P", "H1", "H2", "H3", "H4", "SPAN", "A", "BUTTON", "IMG", "LI", "DD", "DT", "KBD", "svg", "INPUT"]);
const isExposed = (x: number, y: number) => {
  const hit = document.elementFromPoint(x, y);
  if (!hit) return true;
  if (OCCLUDERS.has(hit.tagName) || hit.closest(".stack-scene, .surface, .glass, article, figure")) return false;
  const bg = getComputedStyle(hit).backgroundColor;
  return bg === "transparent" || bg.endsWith(", 0)");
};

const readToken = (name: string) =>
  `hsl(${getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).join(", ")})`;

export const TechField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let particles: Particle[] = [];
    let ink = readToken("--foreground");
    let accent = readToken("--link");
    let dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const pointer = { x: -9999, y: -9999, active: false };
    let focusGlyph = -1;
    let focusEl: Element | null = null;
    let dash = 0;
    let target = -1;
    let frameCount = 0;
    const lastPos: { x: number; y: number }[] = [];

    const seed = () => {
      const count = Math.round(Math.min(48, Math.max(GLYPHS.length, (W * H) / 36000)));
      // Every technology appears at least once, in a scrambled order.
      const order = Array.from({ length: count }, (_, i) => i % GLYPHS.length).sort(() => Math.random() - 0.5);
      particles = order.map((glyph, i) => {
        const depth = [0.35, 0.6, 1][i % 3];
        const angle = Math.random() * Math.PI * 2;
        const speed = (0.04 + Math.random() * 0.06) * depth;
        return {
          glyph,
          x: Math.random() * W,
          y: Math.random() * H,
          depth,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          ox: 0,
          oy: 0,
          glow: 0,
          focus: 0,
        };
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      if (!particles.length) seed();
    };

    const drawGlyph = (gl: Glyph, size: number) => {
      if (gl.path) {
        const s = size / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fill(gl.path);
      } else if (gl.text) {
        ctx.font = `700 ${Math.round(size * 0.58)}px "Geist Variable", system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(gl.text, 0, 0);
      }
    };

    let frame = 0;
    const tick = () => {
      const scrollY = window.scrollY;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // Where the hovered element is, for the connector line.
      let anchor: { x: number; y: number } | null = null;
      if (focusEl && focusGlyph >= 0) {
        const r = focusEl.getBoundingClientRect();
        if (r.bottom > 0 && r.top < H) anchor = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }

      // Light the nearest *visible* instance of the focused technology. The choice
      // is re-checked every few frames and kept while it stays uncovered.
      if (!anchor) {
        target = -1;
      } else if (target < 0 || particles[target].glyph !== focusGlyph || frameCount % 12 === 0) {
        const current = target >= 0 && particles[target].glyph === focusGlyph ? lastPos[target] : null;
        if (!current || !isExposed(current.x, current.y)) {
          let best = Infinity;
          let fallback = -1;
          let fallbackD = Infinity;
          particles.forEach((p, i) => {
            if (p.glyph !== focusGlyph || !lastPos[i]) return;
            const { x, y } = lastPos[i];
            const d = Math.hypot(x - anchor!.x, y - anchor!.y);
            if (d < fallbackD) {
              fallbackD = d;
              fallback = i;
            }
            if (d < best && x > 0 && x < W && y > 0 && y < H && isExposed(x, y)) {
              best = d;
              target = i;
            }
          });
          if (best === Infinity) target = fallback;
        }
      }
      frameCount++;

      const base = dark ? 0.075 : 0.085;
      const R = 200;
      const positions: { x: number; y: number; p: Particle; i: number }[] = [];

      particles.forEach((p, i) => {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
        }
        // Parallax: deeper layers trail the scroll.
        const par = reduced ? 0 : scrollY * (0.06 + 0.22 * p.depth);
        const m = 40;
        let x = ((p.x % (W + m * 2)) + W + m * 2) % (W + m * 2) - m;
        let y = (((p.y - par) % (H + m * 2)) + H + m * 2) % (H + m * 2) - m;

        // Pointer field: push away gently and brighten.
        let near = 0;
        if (pointer.active && !reduced) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          near = Math.max(0, 1 - dist / R);
          const push = near * near * 22 * p.depth;
          p.ox += ((dx / dist) * push - p.ox) * 0.08;
          p.oy += ((dy / dist) * push - p.oy) * 0.08;
        } else {
          p.ox *= 0.92;
          p.oy *= 0.92;
        }
        x += p.ox;
        y += p.oy;
        p.glow += (near - p.glow) * 0.1;
        p.focus += ((i === target ? 1 : 0) - p.focus) * 0.12;
        positions.push({ x, y, p, i });
      });

      positions.forEach(({ x, y }, i) => (lastPos[i] = { x, y }));

      // Network lines from the pointer to nearby icons.
      if (pointer.active && !reduced) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = ink;
        for (const { x, y, p } of positions) {
          if (p.glow < 0.05) continue;
          ctx.globalAlpha = p.glow * 0.32 * p.depth;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }

      // Connector from the hovered technology to its logo, with flowing dashes.
      if (anchor && target >= 0) {
        const t = positions[target];
        if (t.p.focus > 0.05) {
          dash = reduced ? 0 : dash - 0.6;
          ctx.save();
          ctx.globalAlpha = 0.5 * t.p.focus;
          ctx.strokeStyle = accent;
          ctx.lineWidth = 1.25;
          ctx.setLineDash([3, 5]);
          ctx.lineDashOffset = dash;
          ctx.beginPath();
          ctx.moveTo(anchor.x, anchor.y);
          const cx = (anchor.x + t.x) / 2;
          const cy = Math.min(anchor.y, t.y) - 60;
          ctx.quadraticCurveTo(cx, cy, t.x, t.y);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Icons.
      for (const { x, y, p } of positions) {
        const focus = p.focus;
        const size = (12 + p.depth * 13) * (1 + focus * 0.7 + p.glow * 0.15);
        ctx.save();
        ctx.translate(x, y);
        if (focus > 0.02) {
          const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.6);
          halo.addColorStop(0, accent);
          halo.addColorStop(1, "transparent");
          ctx.globalAlpha = 0.18 * focus;
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(0, 0, size * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = Math.min(1, base * (0.6 + p.depth) + p.glow * 0.55 * p.depth + focus * 0.85);
        ctx.fillStyle = focus > 0.3 ? accent : ink;
        drawGlyph(GLYPHS[p.glyph], size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    // Any element marked with data-tech lights its logo while hovered or focused.
    const onOver = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-tech]");
      if (!el) return;
      const idx = matchGlyph(el.getAttribute("data-tech") || el.textContent || "");
      focusGlyph = idx;
      focusEl = idx >= 0 ? el : null;
    };
    const onOut = (e: Event) => {
      const el = (e.target as Element | null)?.closest?.("[data-tech]");
      const to = (e as PointerEvent).relatedTarget as Element | null;
      if (el && (!to || !el.contains(to))) {
        focusGlyph = -1;
        focusEl = null;
      }
    };
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      dark = mq.matches;
      ink = readToken("--foreground");
      accent = readToken("--link");
    };

    resize();
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("focusin", onOver);
    document.addEventListener("focusout", onOut);
    mq.addEventListener("change", onScheme);
    // Fonts arrive after first paint; refresh the wordmarks once they do.
    document.fonts?.ready.then(onScheme).catch(() => undefined);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("focusin", onOver);
      document.removeEventListener("focusout", onOut);
      mq.removeEventListener("change", onScheme);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-base" />;
};
