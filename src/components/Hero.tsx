import { ArrowRight, ChevronRight, MapPin, Building2, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { KineticName } from "./KineticName";
import { StackHero } from "./StackHero";
import { HoloArt } from "./HoloArt";
import { TiltCard } from "./TiltCard";
import { cn } from "@/lib/utils";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

type Fact = { icon: LucideIcon; label: string; value: string; live?: boolean };

const facts: Fact[] = [
  { icon: Building2, label: "Now", value: "Cloud Developer, BMO", live: true },
  { icon: MapPin, label: "Based in", value: "Canada" },
  { icon: BadgeCheck, label: "Certified", value: "Azure, AWS, ServiceNow" },
];

const FactTile = ({ fact }: { fact: Fact }) => {
  const Icon = fact.icon;
  return (
    <TiltCard
      tilt={6}
      className={cn(
        "flex h-full flex-col justify-between gap-4 rounded-[22px] p-4 md:p-5",
        fact.live
          ? "bg-[linear-gradient(140deg,#0062c8,#0055b4_50%,#00469a)] text-white shadow-[0_24px_50px_-24px_rgba(0,98,200,0.6)]"
          : "surface",
      )}
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-[11px]", fact.live ? "bg-white/20" : "bg-secondary text-link")}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </span>
      <div>
        <p className={cn("flex items-center gap-2 text-[0.8125rem]", fact.live ? "text-white/90" : "text-muted-foreground")}>
          {fact.live && (
            <span aria-hidden className="relative grid h-2 w-2 place-items-center">
              <span className="absolute h-2 w-2 rounded-full bg-[#30d158] motion-safe:animate-ping" />
              <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            </span>
          )}
          {fact.label}
        </p>
        <p className="mt-0.5 text-[1rem] font-semibold leading-snug tracking-[-0.015em]">{fact.value}</p>
      </div>
    </TiltCard>
  );
};

/*
  The introduction, in one section: name, who and what on the left with the
  exploded stack on the right, then a band with the holographic portrait and
  the three facts. (This used to be two sections that repeated each other.)
*/
export const Hero = () => {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative isolate flex min-h-[100dvh] flex-col justify-center gap-8 overflow-hidden px-[var(--gutter)] pb-10 pt-24 md:gap-10 md:pt-28"
    >
      {/* Soft studio light behind the stack */}
      <div
        aria-hidden
        className="absolute -z-20 h-[80vh] w-[80vw] max-w-[1000px] rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.14),transparent)] blur-2xl max-md:left-1/2 max-md:top-[-14vh] max-md:-translate-x-1/2 md:right-[-12vw] md:top-[4vh]"
      />

      <div className="page grid items-center gap-6 md:grid-cols-2 md:gap-8">
        {/* Exploded view of the stack */}
        <StackHero className="relative -z-10 w-full md:order-2 md:h-[min(56vh,580px)]" />

        <div className="md:order-1">
          <h1
            className="text-[clamp(3.25rem,8.5vw,7.25rem)] leading-[0.92] tracking-[-0.05em] animate-rise-in"
            style={{ animationDelay: "120ms" }}
          >
            <KineticName lines={["Krishna", "Vaibhav"]} />
          </h1>

          <p
            className="mt-6 max-w-[46ch] text-[clamp(1.0625rem,0.95rem+0.45vw,1.3125rem)] leading-relaxed text-muted-foreground animate-rise-in"
            style={{ animationDelay: "260ms" }}
          >
            <span className="font-medium text-foreground">Cloud-native developer at BMO in Toronto</span>, shipping React,
            React Native and Java on Azure and AWS. Most of my work lives behind the interface: serverless services, event
            pipelines, CI/CD and the monitoring that keeps them healthy. Master&apos;s in Applied Computer Science, Dalhousie.
          </p>

          <div
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 animate-rise-in"
            style={{ animationDelay: "380ms" }}
          >
            <Button size="lg" className="group" onClick={() => scrollTo("projects")}>
              View projects
              <ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </Button>
            <button
              onClick={() => scrollTo("contact")}
              className="group inline-flex h-11 items-center gap-0.5 text-[1.0625rem] font-medium text-link"
            >
              Get in touch
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Portrait and facts */}
      <div className="page grid gap-4 animate-rise-in md:grid-cols-12" style={{ animationDelay: "500ms" }}>
        <div className="md:col-span-5 lg:col-span-6">
          <HoloArt compact />
        </div>
        <div className="grid gap-4 sm:grid-cols-3 md:col-span-7 lg:col-span-6">
          {facts.map((fact) => (
            <FactTile key={fact.label} fact={fact} />
          ))}
        </div>
      </div>
    </section>
  );
};
