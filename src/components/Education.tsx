import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";
import dalhousieShield from "@/assets/dalhousie-shield.svg";
import dalhousieGold from "@/assets/dalhousie-shield-gold.svg";
import chandigarhEmblem from "@/assets/chandigarh-emblem.webp";

const education = [
  {
    degree: "Master of Applied Computer Science",
    university: "Dalhousie University",
    period: "2023 - 2025",
    gpa: "3.9/4.0",
    logo: dalhousieShield,
    // Gold foil runs around the shield's own border.
    foil: dalhousieGold as string | undefined,
    // White plate with breathing room, like the shield's own field.
    plate: "linear-gradient(160deg, #ffffff, #f1f1f4)",
    logoPad: "p-[17%]",
    glow: "rgba(255, 212, 0, 0.55)",
  },
  {
    degree: "Bachelor of Engineering in Computer Science (Honours in Information Security)",
    university: "Chandigarh University",
    period: "2018 - 2022",
    gpa: "3.6/4.0",
    logo: chandigarhEmblem,
    foil: undefined as string | undefined,
    // The emblem's own red; the cut-out emblem floats above it.
    plate: "radial-gradient(circle at 50% 42%, #d8352b, #c7251c 55%, #a81b14)",
    logoPad: "p-[6%]",
    glow: "rgba(199, 37, 28, 0.6)",
  },
];

type Edu = (typeof education)[number];

/*
  University mark as a layered app-icon plate: the logo floats on its own plane
  (parallax as the card tilts, lifting further on hover), a specular sheen
  passes now and then, the glow is tinted to the university's colour, and the
  Dalhousie shield's gold border carries a moving foil.
*/
const UniversityMark = ({ edu }: { edu: Edu }) => (
  <div className="mark-plate relative aspect-square w-20 shrink-0 sm:w-28 md:w-32" style={{ transform: "translateZ(40px)" }}>
    <div
      aria-hidden
      className="absolute -inset-3 rounded-[40px] opacity-50 blur-2xl transition-opacity duration-700 group-hover/edu:opacity-90"
      style={{ background: edu.glow }}
    />
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden rounded-[28px]"
      style={{ background: edu.plate, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 0 0 1px rgba(0,0,0,0.07)" }}
    >
      <span className="mark-sheen absolute inset-0" />
      <span className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.3),transparent_42%)]" />
    </div>
    <div className={cn("mark-logo absolute inset-0 group-hover/edu:[transform:translateZ(36px)]", edu.logoPad)}>
      <div className="relative h-full w-full">
        <img src={edu.logo} alt={`${edu.university} logo`} loading="lazy" className="absolute inset-0 h-full w-full object-contain" />
        {edu.foil && (
          <span aria-hidden className="mark-foil absolute inset-0" style={{ "--mask": `url("${edu.foil}")` } as CSSProperties} />
        )}
      </div>
    </div>
  </div>
);

export const Education = () => {
  return (
    <section id="education" className="section">
      <div className="section-inner">
        <Reveal>
          <h2 className="headline">Education.</h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-12 [&>*]:min-w-0">
          {education.map((edu, index) => (
            <Reveal key={edu.university} index={index} className={cn(index === 0 ? "md:col-span-7" : "md:col-span-5")}>
              <TiltCard tilt={5} className="surface group/edu flex h-full flex-col justify-between gap-12 p-5 sm:p-7 md:p-9">
                <div className="flex items-start justify-between gap-4 preserve-3d sm:gap-6">
                  <UniversityMark edu={edu} />
                  <div className="text-right" style={{ transform: "translateZ(24px)" }}>
                    <p className="font-mono text-[0.8125rem] tabular text-muted-foreground">{edu.period}</p>
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
