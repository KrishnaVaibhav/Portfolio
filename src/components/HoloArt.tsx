import { useEffect } from "react";
import { useReveal, usePrefersReducedMotion } from "@/hooks/use-motion";
import backplate from "@/assets/about-backplate.webp";
import figure from "@/assets/about-figure.webp";

/*
  The illustrated portrait as a layered hologram, after Apple TV's parallax
  icons: the background (with the figure inpainted out) and the cut-out figure
  sit on separate planes, the tile tilts toward the pointer (or slowly orbits on
  its own), a pulse of light runs through the artwork's own circuit traces, and
  the first time it scrolls into view a scan line renders it in. Pointer state
  goes straight to CSS variables.
*/
export const HoloArt = () => {
  const ref = useReveal<HTMLDivElement>();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    let tx = 0, ty = 0, x = 0, y = 0;
    let hovering = false;
    let running = false;
    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      if (!hovering) {
        // Idle: a slow Lissajous orbit so the depth reads even without a pointer.
        const t = (now - start) / 1000;
        tx = Math.sin(t * 0.42) * 0.32;
        ty = Math.cos(t * 0.31) * 0.22;
      }
      x += (tx - x) * 0.07;
      y += (ty - y) * 0.07;
      el.style.setProperty("--px", x.toFixed(4));
      el.style.setProperty("--py", y.toFixed(4));
      el.style.setProperty("--gx", `${(50 + x * 90).toFixed(1)}%`);
      el.style.setProperty("--gy", `${(32 + y * 80).toFixed(1)}%`);
      frame = running ? requestAnimationFrame(tick) : 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      hovering = true;
    };
    const onLeave = () => {
      hovering = false;
    };

    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running && !frame) frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, reduced]);

  return (
    <div
      ref={ref}
      className="holo relative h-full min-h-[340px] overflow-hidden rounded-[32px] bg-[#0e1027] shadow-[0_40px_100px_-40px_hsl(var(--shadow-color)/0.6)] md:min-h-[560px]"
    >
      <div className="holo-stage">
        <img
          src={backplate}
          alt="Illustrated portrait of Krishna in a hoodie, surrounded by circuit traces and code"
          loading="lazy"
          width={2048}
          height={861}
          className="holo-layer holo-back"
        />
        <img src={backplate} alt="" aria-hidden loading="lazy" className="holo-layer holo-energy" />
        <img src={figure} alt="" aria-hidden loading="lazy" className="holo-layer holo-figure" />
        <div aria-hidden className="holo-sheen pointer-events-none absolute inset-0" />
        <div aria-hidden className="holo-glare pointer-events-none absolute inset-0" />
      </div>

      {/* Boot-up scan line */}
      <div aria-hidden className="holo-scan pointer-events-none absolute inset-0">
        <div className="h-24 -translate-y-full bg-gradient-to-b from-transparent to-[#2997ff]/20" />
        <div className="h-[2px] -translate-y-24 bg-[#7cc4ff] shadow-[0_0_18px_4px_rgba(41,151,255,0.7)]" />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
    </div>
  );
};
