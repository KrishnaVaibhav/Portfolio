import { useEffect, useMemo, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

type Tag = { name: string; group: number };

/**
 * A CSS-3D tag sphere. Tags are distributed on a Fibonacci sphere and
 * projected every frame by writing transforms directly to the DOM, so
 * rotation never touches React state. Drag to spin; it eases back to a
 * slow idle drift. Decorative: the skill list next to it carries the content.
 */
export const SkillGlobe = ({ tags, activeGroup }: { tags: Tag[]; activeGroup: number }) => {
  const stage = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  const points = useMemo(() => {
    const n = tags.length;
    const golden = Math.PI * (3 - Math.sqrt(5));
    // Tags arrive grouped by category; a coprime stride scatters each group
    // across the whole sphere instead of one latitude band.
    let stride = Math.max(2, Math.round(n * 0.38));
    const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
    while (gcd(stride, n) !== 1) stride++;
    return tags.map((_, t) => {
      const i = (t * stride) % n;
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
    });
  }, [tags]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;

    let rotX = -0.25;
    let rotY = 0;
    let velX = 0;
    let velY = reduced ? 0 : 0.0035;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let frame = 0;
    let running = false;

    const render = () => {
      const radius = el.clientWidth * 0.42;
      const cx = Math.cos(rotX), sx = Math.sin(rotX);
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      points.forEach((p, i) => {
        const node = nodes.current[i];
        if (!node) return;
        // Rotate around Y, then X.
        const x1 = p.x * cy + p.z * sy;
        const z1 = -p.x * sy + p.z * cy;
        const y2 = p.y * cx - z1 * sx;
        const z2 = p.y * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 back, 1 front
        const scale = 0.62 + depth * 0.5;
        node.style.transform = `translate3d(${(x1 * radius).toFixed(1)}px, ${(y2 * radius).toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
        node.style.opacity = (0.18 + depth * 0.82).toFixed(3);
        node.style.zIndex = String(Math.round(depth * 100));
      });
    };

    const tick = () => {
      if (!dragging) {
        // Ease toward idle drift.
        velY += ((reduced ? 0 : 0.0035) - velY) * 0.02;
        velX += (0 - velX) * 0.04;
      }
      rotY += velY;
      rotX = Math.max(-1.1, Math.min(1.1, rotX + velX));
      render();
      frame = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      start();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      velY = (e.clientX - lastX) * 0.004;
      velX = -(e.clientY - lastY) * 0.004;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));
    io.observe(el);
    render();

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      stop();
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [points, reduced]);

  return (
    <div
      ref={stage}
      aria-hidden
      className="relative aspect-square w-full cursor-grab touch-none select-none active:cursor-grabbing"
    >
      {/* Glass sphere body */}
      <div className="absolute inset-[9%] rounded-full bg-[radial-gradient(circle_at_32%_28%,hsl(0_0%_100%/0.55),hsl(var(--card)/0.3)_38%,hsl(var(--primary)/0.07)_70%,transparent_72%)] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.3),inset_0_-30px_60px_hsl(var(--primary)/0.06)] dark:bg-[radial-gradient(circle_at_32%_28%,hsl(0_0%_100%/0.12),hsl(var(--card)/0.25)_40%,hsl(var(--primary)/0.10)_70%,transparent_72%)]" />
      <div className="absolute inset-[9%] rounded-full border border-foreground/[0.06]" />
      <div className="absolute left-1/2 top-1/2">
        {tags.map((tag, i) => (
          <span
            key={tag.name}
            ref={(n) => {
              nodes.current[i] = n;
            }}
            className={cn(
              "absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium tracking-[-0.01em] transition-[background-color,color,box-shadow] duration-500",
              tag.group === activeGroup
                ? "bg-primary text-primary-foreground shadow-[0_6px_20px_-6px_hsl(var(--primary)/0.6)]"
                : "text-muted-foreground",
            )}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
};
