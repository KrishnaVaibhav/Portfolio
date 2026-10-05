import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { KineticName } from "./KineticName";
import { StackHero } from "./StackHero";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const Hero = () => {
  return (
    <section
      id="top"
      aria-label="Introduction"
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden px-5 md:px-8"
    >
      {/* Soft studio light behind the stack */}
      <div
        aria-hidden
        className="absolute -z-20 h-[80vh] w-[80vw] max-w-[1000px] rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.14),transparent)] blur-2xl max-md:left-1/2 max-md:top-[-14vh] max-md:-translate-x-1/2 md:right-[-12vw] md:top-[10vh]"
      />

      {/* Exploded view of the stack */}
      <StackHero className="absolute inset-x-0 top-[10vh] -z-10 h-[46vh] md:inset-y-0 md:left-auto md:right-[2vw] md:top-0 md:h-full md:w-[50vw]" />

      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mt-[44vh] max-w-[640px] md:mt-0">
          <div
            className="inline-flex items-center gap-2.5 rounded-full border bg-secondary py-1 pl-1 pr-4 animate-rise-in"
            style={{ animationDelay: "80ms" }}
          >
            <span aria-hidden className="relative ml-1.5 grid h-2 w-2 place-items-center">
              <span className="absolute h-2 w-2 rounded-full bg-[#30d158] motion-safe:animate-ping" />
              <span className="h-2 w-2 rounded-full bg-[#30d158]" />
            </span>
            <span className="text-[0.8125rem] font-medium tracking-[-0.01em]">
              Cloud Developer at BMO<span className="hidden sm:inline">, Azure and AWS certified</span>
            </span>
          </div>

          <h1
            className="mt-7 text-[clamp(3.4rem,9.5vw,8rem)] leading-[0.92] tracking-[-0.05em] animate-rise-in"
            style={{ animationDelay: "160ms" }}
          >
            <KineticName lines={["Krishna", "Vaibhav"]} />
          </h1>

          <p
            className="mt-7 max-w-[30ch] text-xl leading-snug text-muted-foreground md:text-2xl animate-rise-in"
            style={{ animationDelay: "300ms" }}
          >
            Cloud-native application developer. React, React Native and Java, shipped on Azure and AWS.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 animate-rise-in"
            style={{ animationDelay: "420ms" }}
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
    </section>
  );
};
