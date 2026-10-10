import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion";

/**
 * Counts a metric up from zero the first time it is seen ("99%", "-50%", "3").
 * The sign and suffix stay fixed; only the number moves, in tabular figures so
 * the width never jitters. Renders the final value without JS or with reduced
 * motion, and writes to the DOM directly instead of re-rendering React.
 */
export const CountUp = ({ value, duration = 1400 }: { value: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const match = value.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!el || reduced || !match) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    let frame = 0;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4); // long ease-out, settles gently
          el.textContent = `${prefix}${(target * eased).toFixed(decimals)}${suffix}`;
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        el.textContent = `${prefix}${(0).toFixed(decimals)}${suffix}`;
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={ref} className="tabular">
      {value}
    </span>
  );
};
