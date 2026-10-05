import { MapPin, Building2, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { usePointerVars } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";
import illustration from "@/assets/about-illustration.webp";

type Fact = { icon: LucideIcon; label: string; value: string; live?: boolean };

const facts: Fact[] = [
  { icon: Building2, label: "Now", value: "Cloud Developer, BMO", live: true },
  { icon: MapPin, label: "Based in", value: "Canada" },
  { icon: BadgeCheck, label: "Certified", value: "Azure, AWS, ServiceNow" },
];

const FactTile = ({ fact, index }: { fact: Fact; index: number }) => {
  const Icon = fact.icon;
  return (
    <Reveal index={index + 2} className="h-full">
      <TiltCard
        tilt={6}
        className={cn(
          "flex h-full flex-col justify-between gap-6 rounded-[24px] p-5",
          fact.live
            ? "bg-[linear-gradient(140deg,#2b8cff,#0071e3_50%,#0057c2)] text-white shadow-[0_24px_50px_-24px_rgba(0,113,227,0.6)]"
            : "surface",
        )}
      >
        <span
          className={cn(
            "grid h-10 w-10 place-items-center rounded-[12px]",
            fact.live ? "bg-white/20" : "bg-secondary text-link",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className={cn("flex items-center gap-2 text-[13px]", fact.live ? "text-white/75" : "text-muted-foreground")}>
            {fact.live && (
              <span aria-hidden className="relative grid h-2 w-2 place-items-center">
                <span className="absolute h-2 w-2 rounded-full bg-[#30d158] motion-safe:animate-ping" />
                <span className="h-2 w-2 rounded-full bg-[#30d158]" />
              </span>
            )}
            {fact.label}
          </p>
          <p className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.015em]">{fact.value}</p>
        </div>
      </TiltCard>
    </Reveal>
  );
};

/*
  About, as a bento: the illustrated portrait in a tall tile, the introduction
  beside it, and three fact tiles underneath.
*/
export const About = () => {
  const art = usePointerVars<HTMLDivElement>();

  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <div className="section-inner grid gap-5 md:grid-cols-12">
        {/* Artwork */}
        <Reveal className="md:col-span-6 md:row-span-2 lg:col-span-7">
          <div
            ref={art}
            className="relative isolate h-full min-h-[340px] overflow-hidden rounded-[32px] bg-[#111329] shadow-[0_40px_100px_-40px_hsl(var(--shadow-color)/0.6)] md:min-h-[560px]"
          >
            <img
              src={illustration}
              alt="Illustrated portrait of Krishna in a hoodie, surrounded by circuit traces and code"
              loading="lazy"
              width={2048}
              height={861}
              className="view-zoom absolute inset-0 h-full w-full object-cover object-[50%_35%]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-screen"
              style={{
                background: "radial-gradient(380px circle at var(--mx, 55%) var(--my, 35%), rgba(120,170,255,0.2), transparent 60%)",
              }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
          </div>
        </Reveal>

        {/* Introduction */}
        <Reveal index={1} className="md:col-span-6 lg:col-span-5">
          <div className="surface flex h-full flex-col justify-center rounded-[32px] p-8 md:p-10">
            <h2 id="about-title" className="font-display text-5xl font-semibold leading-[1] tracking-[-0.045em] md:text-6xl">
              Hi, I'm Krishna<span className="text-link">.</span>
            </h2>
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
              I'm a cloud developer at BMO in Toronto, with a Master's in Applied Computer Science from Dalhousie.
              Most of my work lives behind the interface: serverless services, event pipelines, CI/CD, and the
              monitoring that keeps them healthy.
            </p>
          </div>
        </Reveal>

        {/* Facts */}
        <div className="grid gap-5 sm:grid-cols-3 md:col-span-6 lg:col-span-5">
          {facts.map((fact, i) => (
            <FactTile key={fact.label} fact={fact} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};
