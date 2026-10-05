import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion";

const REST = 620;
const THIN = 520;
const HEAVY = 800;
const REACH = 280; // px of influence around the pointer

/**
 * Display name set in a variable font whose weight follows the pointer like a
 * lens: letters near the cursor thicken, distant ones thin out. On load a
 * weight wave sweeps across once, so touch devices get the moment too.
 */
export const KineticName = ({ lines }: { lines: string[] }) => {
  const root = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const letters = Array.from(el.querySelectorAll<HTMLSpanElement>("[data-letter]"));
    const current = letters.map(() => REST);

    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let idleFrames = 0;
    const introStart = performance.now();
    const INTRO = 1700;

    const tick = (now: number) => {
      const box = el.getBoundingClientRect();
      const t = (now - introStart) / INTRO;
      // During the intro a virtual pointer travels across the name.
      const source =
        t < 1 ? { x: box.left - 120 + (box.width + 240) * t, y: box.top + box.height / 2 } : pointer;

      let moving = false;
      letters.forEach((letter, i) => {
        let target = REST;
        if (source) {
          const r = letter.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - source.x, r.top + r.height / 2 - source.y);
          const k = Math.max(0, 1 - d / REACH);
          target = THIN + (HEAVY - THIN) * (k * k * (3 - 2 * k));
          if (!pointer && t >= 1) target = REST;
        }
        const next = current[i] + (target - current[i]) * 0.18;
        if (Math.abs(next - current[i]) > 0.5) moving = true;
        current[i] = next;
        letter.style.fontWeight = next.toFixed(0);
      });

      // Sleep once everything has settled; the next pointer move wakes it.
      idleFrames = moving || t < 1 ? 0 : idleFrames + 1;
      frame = idleFrames > 30 ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    };
    const onLeave = () => {
      pointer = null;
      wake();
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  return (
    <span ref={root} className="block font-['Geist_Variable',sans-serif]">
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, li) => (
        <span key={line} aria-hidden className="block whitespace-nowrap">
          {Array.from(line).map((ch, ci) => (
            <span key={ci} data-letter className="inline-block" style={{ fontWeight: REST }}>
              {ch}
            </span>
          ))}
          {li === lines.length - 1 && <span className="text-link">.</span>}
        </span>
      ))}
    </span>
  );
};
