import { useEffect, useRef } from "react";
import {
  siReact, siTypescript, siJavascript, siNodedotjs, siOpenjdk, siSpringboot, siDotnet, siPython,
  siDocker, siKubernetes, siPostgresql, siMongodb, siRedis, siMysql, siGithubactions, siJenkins,
  siGitlab, siJest, siSelenium, siPostman, siApachekafka, siGit, siRedux, siSupabase,
} from "simple-icons";
import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { isDarkResolved, onAppearanceChange } from "@/lib/theme";

/*
  A background made of the stack. Tiny grey logos drift in three depth layers
  far behind the content, and take on their brand colour only while something
  is happening to them, then fade back to grey:
    - scroll moves each layer at its own speed (parallax) and briefly tints it
    - icons near the pointer brighten, colour up, ease away and wire up to it
    - hovering any technology on the page ([data-tech]) lights its logo in its
      brand colour and draws a thin, flowing line back to what you hovered
  One fixed canvas; scroll is read inside the animation loop, never listened to.
*/

type RGB = [number, number, number];
type Glyph = { key: string; aliases: string[]; path?: Path2D; text?: string; brand: RGB };

const hexRgb = (hex: string): RGB => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

// Brand colour comes from the icon set unless overridden (OpenJDK's is black;
// Java's own orange reads far better).
const g = (key: string, icon: { path: string; hex: string } | null, aliases: string[], text?: string, hex?: string): Glyph => ({
  key,
  aliases,
  path: icon ? new Path2D(icon.path) : undefined,
  text,
  brand: hexRgb(hex ?? icon?.hex ?? "888888"),
});

// Order matters for matching: cloud names first (so "Azure (App Services, AKS)"
// reads as Azure), and "javascript" before "java".
const GLYPHS: Glyph[] = [
  // Azure and AWS logos are not distributed by simple-icons; use their wordmarks.
  g("azure", null, ["azure", "cosmos", "service bus", "key vault", "app service", "bicep", "arm template"], "Azure", "0078D4"),
  g("aws", null, ["aws", "lambda", "ec2", "s3", "fargate", "cloudformation", "api gateway", "guardduty", "rds"], "aws", "FF9900"),
  g("javascript", siJavascript, ["javascript"]),
  g("typescript", siTypescript, ["typescript"]),
  g("react", siReact, ["react"]),
  g("redux", siRedux, ["redux"]),
  g("node", siNodedotjs, ["node"]),
  g("java", siOpenjdk, ["java", "junit"], undefined, "E76F00"),
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
  lit: boolean; // currently "ignited" (in colour), for the one-off pulse
  pop: number; // spring scale kick when it ignites
  popV: number;
  rot: number; // tilt from the pointer's push
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

// A token like "240 3% 12%" as RGB, so grey can blend into a brand colour.
const readTokenRgb = (name: string): RGB => {
  const [h, sat, l] = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim()
    .split(/\s+/)
    .map((v) => parseFloat(v));
  const S = sat / 100, L = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0) * 255, f(8) * 255, f(4) * 255];
};

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgb = (c: RGB) => `rgb(${c[0] | 0}, ${c[1] | 0}, ${c[2] | 0})`;
const luma = ([r, gr, b]: RGB) => (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;

// Keep every brand colour legible on the current background: very dark brands
// (Kafka) lift on dark, very pale ones (JavaScript yellow) deepen on light.
const brandFor = (gl: Glyph, dark: boolean): RGB => {
  const L = luma(gl.brand);
  if (dark && L < 0.25) return mix(gl.brand, [255, 255, 255], 0.6);
  if (!dark && L > 0.6) return mix(gl.brand, [0, 0, 0], 0.3);
  return gl.brand;
};

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
    let inkRgb = readTokenRgb("--foreground");
    let dark = isDarkResolved();
    let brands = GLYPHS.map((gl) => brandFor(gl, dark));
    // Scroll activity 0..1: rises while the page moves, decays when it stops.
    let lastScroll = window.scrollY;
    // Ignition pulses: a brand-coloured ring that ripples out once when an icon lights up.
    let rings: { i: number; start: number; colour: string }[] = [];
    let activity = 0;

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
          lit: false,
          pop: 0,
          popV: 0,
          rot: 0,
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
      const speed = Math.abs(scrollY - lastScroll);
      lastScroll = scrollY;
      activity += (Math.min(1, speed / 30) - activity) * (speed > 0.5 ? 0.15 : 0.04);
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
        for (const { x, y, p } of positions) {
          if (p.glow < 0.05) continue;
          ctx.strokeStyle = rgb(mix(inkRgb, brands[p.glyph], Math.min(1, p.glow * 1.6)));
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
          ctx.strokeStyle = rgb(brands[t.p.glyph]);
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

      // Ignition rings, under the icons.
      const now = performance.now();
      rings = rings.filter((r) => now - r.start < 950);
      for (const r of rings) {
        const at = positions[r.i];
        if (!at) continue;
        const t = (now - r.start) / 950;
        const e = 1 - Math.pow(1 - t, 3);
        const size = 12 + at.p.depth * 13;
        ctx.globalAlpha = Math.pow(1 - t, 2) * (dark ? 0.6 : 0.5);
        ctx.strokeStyle = r.colour;
        ctx.lineWidth = 0.6 + 1.4 * (1 - t);
        ctx.beginPath();
        ctx.arc(at.x, at.y, size * (0.75 + 1.9 * e), 0, Math.PI * 2);
        ctx.stroke();
      }

      // Icons.
      for (const { x, y, p, i } of positions) {
        const focus = p.focus;
        // How much brand colour shows: full when focused, strong near the
        // pointer, a gentle tint while scrolling, grey when nothing happens.
        // Eased so colour arrives quickly and saturated rather than muddy.
        const raw = Math.min(1, Math.max(focus, p.glow * 2, activity * 0.55 * p.depth));
        const colour = 1 - Math.pow(1 - raw, 2);
        const brand = brands[p.glyph];

        // Ignite once on the way up (hysteresis stops flicker at the edge):
        // a ring ripples out and the logo gets a small spring kick.
        if (!reduced) {
          if (!p.lit && raw > 0.6) {
            p.lit = true;
            p.popV += 0.32;
            if (rings.length < 12) rings.push({ i, start: now, colour: rgb(brand) });
          } else if (p.lit && raw < 0.2) {
            p.lit = false;
          }
          p.popV += -p.pop * 0.2;
          p.popV *= 0.76;
          p.pop += p.popV;
          // Lean away from the pointer's push, like a leaf in a breeze.
          p.rot += (Math.max(-0.35, Math.min(0.35, p.ox * 0.025)) - p.rot) * 0.1;
        }

        const size = (12 + p.depth * 13) * (1 + focus * 0.7 + p.glow * 0.18 + p.pop * 0.5);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(p.rot);

        // Soft brand glow behind any coloured icon; strongest when focused.
        const haloA = Math.max(focus * 0.24, colour * (dark ? 0.2 : 0.14) * p.depth);
        if (haloA > 0.01) {
          const reach = size * (1.5 + colour * 0.5);
          const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
          halo.addColorStop(0, rgb(brand));
          halo.addColorStop(1, "transparent");
          ctx.globalAlpha = haloA;
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(0, 0, reach, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.globalAlpha = Math.min(
          1,
          base * (0.6 + p.depth) + p.glow * 0.55 * p.depth + focus * 0.85 + activity * 0.12 * p.depth +
            // Colour gets real presence; a little more on a light background.
            colour * (dark ? 0.3 : 0.45) * p.depth,
        );
        ctx.fillStyle = colour > 0.01 ? rgb(mix(inkRgb, brand, colour)) : ink;
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
    // Follows the visible appearance: the visitor's choice or, by default, the device.
    const onScheme = () => {
      dark = isDarkResolved();
      ink = readToken("--foreground");
      inkRgb = readTokenRgb("--foreground");
      brands = GLYPHS.map((gl) => brandFor(gl, dark));
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
    const offAppearance = onAppearanceChange(onScheme);
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
      offAppearance();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-base" />;
};
