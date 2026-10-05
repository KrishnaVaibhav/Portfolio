import type { CSSProperties } from "react";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { cn } from "@/lib/utils";

const education = [
  {
    degree: "Master of Applied Computer Science",
    university: "Dalhousie University",
    period: "2023 - 2025",
    gpa: "3.9/4.0",
    letter: "DU",
    color: "#fdf91cff",
  },
  {
    degree: "Bachelor of Engineering in Computer Science (Honours in Information Security)",
    university: "Chandigarh University",
    period: "2018 - 2022",
    gpa: "3.6/4.0",
    letter: "CU",
    color: "#da1111ff",
  },
];

// Extruded monogram: stacked text-shadows build depth, translateZ lifts it off the tile.
const Monogram = ({ letter, color }: { letter: string; color: string }) => (
  <div
    aria-hidden
    className="relative grid aspect-square w-28 place-items-center rounded-[28px] md:w-32"
    style={
      {
        "--tint": color.slice(0, 7),
        background: "linear-gradient(145deg, color-mix(in srgb, var(--tint) 30%, hsl(var(--card))), color-mix(in srgb, var(--tint) 6%, hsl(var(--card))))",
        boxShadow:
          "inset 0 1px 0 hsl(0 0% 100% / 0.35), 0 18px 40px -18px color-mix(in srgb, var(--tint) 55%, transparent)",
        transform: "translateZ(40px)",
      } as CSSProperties
    }
  >
    <span
      className="font-display text-5xl font-bold tracking-[-0.05em] text-foreground md:text-6xl"
      style={{
        textShadow: Array.from({ length: 6 }, (_, i) => `0 ${i + 1}px 0 color-mix(in srgb, ${color.slice(0, 7)} ${40 - i * 5}%, hsl(var(--foreground) / 0.5))`)
          .concat("0 14px 18px hsl(var(--shadow-color) / 0.35)")
          .join(", "),
      }}
    >
      {letter}
    </span>
  </div>
);

export const Education = () => {
  return (
    <section id="education" className="section">
      <div className="section-inner">
        <Reveal>
          <h2 className="headline">Education.</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-12">
          {education.map((edu, index) => (
            <Reveal key={edu.university} index={index} className={cn(index === 0 ? "md:col-span-7" : "md:col-span-5")}>
              <TiltCard tilt={5} className="surface flex h-full flex-col justify-between gap-12 p-7 md:p-9">
                <div className="flex items-start justify-between gap-6 preserve-3d">
                  <Monogram letter={edu.letter} color={edu.color} />
                  <div className="text-right" style={{ transform: "translateZ(24px)" }}>
                    <p className="font-mono text-[13px] tabular text-muted-foreground">{edu.period}</p>
                    <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.03em] tabular">{edu.gpa}</p>
                    <p className="text-xs text-muted-foreground">GPA</p>
                  </div>
                </div>
                <div style={{ transform: "translateZ(16px)" }}>
                  <p className="text-sm font-medium text-link">{edu.university}</p>
                  <h3 className="mt-2 max-w-[28ch] text-2xl font-semibold leading-tight tracking-[-0.025em] md:text-[1.75rem]">
                    {edu.degree}
                  </h3>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
