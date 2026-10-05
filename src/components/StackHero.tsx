import { useEffect, useRef, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

/*
  Exploded view of the stack, in the spirit of Apple's product teardowns:
  four glass layers (cloud, data, services, interface) float apart, with
  request and deploy packets travelling between them. Pure CSS 3D, so labels
  stay crisp. Hover spreads the stack, the pointer tilts it, and scrolling
  away compresses it (CSS scroll timeline, where supported).
*/

type Layer = { name: string; techs: string[]; accent?: boolean };

// Bottom to top.
const layers: Layer[] = [
  { name: "Cloud", techs: ["Azure", "AWS", "Docker", "AKS"] },
  { name: "Data", techs: ["Cosmos DB", "PostgreSQL", "MongoDB", "Redis"] },
  { name: "Services", techs: ["Java", "Spring Boot", "Node.js", ".NET"] },
  { name: "Interface", techs: ["React", "React Native", "TypeScript"], accent: true },
];

// Where the links between layers sit on each plate (percent), and which way traffic flows.
const vias = [
  { x: 22, y: 30, up: true, delay: 0 },
  { x: 74, y: 62, up: false, delay: 0.9 },
  { x: 48, y: 82, up: true, delay: 1.7 },
];

const Plate = ({ layer, index }: { layer: Layer; index: number }) => (
  <div className="stack-layer group/layer" style={{ "--i": index } as CSSProperties}>
    {/* Edge: a darker slab under the face gives the plate thickness */}
    <div
      className="absolute inset-0 rounded-[30px] bg-[hsl(var(--foreground)/0.12)] dark:bg-black/60"
      style={{ transform: "translateZ(-12px)" }}
    />
    {/* Face */}
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[30px] border p-[9%] transition-[box-shadow,border-color] duration-500",
        layer.accent
          ? "border-white/25 bg-[linear-gradient(140deg,#2b8cff,#0071e3_45%,#0050b0)] text-white shadow-[0_30px_60px_-20px_rgba(0,113,227,0.55)]"
          : "border-foreground/10 bg-[linear-gradient(140deg,hsl(var(--card)),hsl(var(--muted)))] shadow-[0_30px_60px_-30px_hsl(var(--shadow-color)/0.5)] group-hover/layer:border-link/50",
      )}
    >
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.22),transparent_45%)]" />
      <div className="relative grid h-full grid-cols-2 content-end gap-[5%]">
        {layer.techs.map((tech) => (
          <span
            key={tech}
            className={cn(
              "whitespace-nowrap rounded-[12px] px-1.5 py-[8%] text-center text-[clamp(10px,0.95vw,14px)] font-semibold tracking-[-0.01em]",
              layer.accent ? "bg-white/15" : "bg-foreground/[0.06]",
            )}
          >
            {tech}
          </span>
        ))}
      </div>
    </div>

    {/* Callout, counter-rotated to face the viewer */}
    <div
      className="pointer-events-none absolute left-full top-[46%] whitespace-nowrap"
      style={{ transform: "translateX(14%) rotateZ(38deg) rotateX(-56deg)", transformOrigin: "left center" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-px w-8 bg-foreground/25 transition-colors duration-500 group-hover/layer:bg-link" />
        <span className="text-sm font-semibold tracking-[-0.01em] transition-colors duration-500 group-hover/layer:text-link">
          {layer.name}
        </span>
      </div>
    </div>

    {/* Links up to the next layer, with packets travelling along them */}
    {index < layers.length - 1 &&
      vias.map((via, v) => (
        <div
          key={v}
          className="stack-via bg-gradient-to-b from-link/50 to-link/10"
          style={{ left: `${via.x}%`, top: `${via.y}%` }}
        >
          <span
            className="stack-packet bg-link shadow-[0_0_12px_2px_hsl(var(--link)/0.7)]"
            style={{
              animationDelay: `${via.delay + index * 0.45}s`,
              animationDirection: via.up ? "normal" : "reverse",
            }}
          />
        </div>
      ))}
  </div>
);

export const StackHero = ({ className }: { className?: string }) => {
  const scene = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Ease the tilt toward the pointer without re-rendering React.
  useEffect(() => {
    const el = scene.current;
    if (!el || reduced) return;
    let tx = 0,
      ty = 0,
      gx = 0,
      gy = 0,
      frame = 0;
    const tick = () => {
      tx += (gx - tx) * 0.06;
      ty += (gy - ty) * 0.06;
      el.style.setProperty("--tx", tx.toFixed(2));
      el.style.setProperty("--ty", ty.toFixed(2));
      frame = Math.abs(gx - tx) + Math.abs(gy - ty) > 0.01 ? requestAnimationFrame(tick) : 0;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      gx = (e.clientX / window.innerWidth - 0.5) * 14;
      gy = (e.clientY / window.innerHeight - 0.5) * -8;
      if (!frame) frame = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div aria-hidden className={cn("stack-stage grid place-items-center", className)}>
      <div className="stack-offset">
        <div className="stack-float">
          <div ref={scene} className="stack-scene">
            {layers.map((layer, i) => (
              <Plate key={layer.name} layer={layer} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
