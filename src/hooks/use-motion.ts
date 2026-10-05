import { useEffect, useRef, useState } from "react";

const reducedQuery = "(prefers-reduced-motion: reduce)";

export const usePrefersReducedMotion = () => {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia(reducedQuery).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(reducedQuery);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
};

/**
 * Marks an element as shown the first time it scrolls into view, which the
 * `.reveal` class turns into a fade/rise. CSS keeps it visible without JS.
 */
export const useReveal = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = "true";
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
};

/**
 * Writes pointer position into CSS custom properties (--mx / --my) and, when
 * `tilt` is set, a small 3D rotation (--rx / --ry). Everything goes straight to
 * the element's style, so pointer movement never re-renders React.
 */
export const usePointerVars = <T extends HTMLElement>({ tilt = 0 }: { tilt?: number } = {}) => {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
        if (tilt && !reduced) {
          el.style.setProperty("--rx", `${((0.5 - y) * tilt).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${((x - 0.5) * tilt).toFixed(2)}deg`);
          el.dataset.active = "true";
        }
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.dataset.active = "false";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [tilt, reduced]);

  return ref;
};
