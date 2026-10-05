import { Component, Suspense, lazy, type ReactNode } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import profileImg from "@/assets/profile.jpg";

const HeroScene = lazy(() => import("./three/HeroScene"));

// Static stand-in shown while three.js loads, or if WebGL is unavailable.
const SceneFallback = () => (
  <div className="grid h-full w-full place-items-center">
    <div className="h-[46%] aspect-square rounded-full bg-[radial-gradient(circle_at_35%_30%,hsl(0_0%_100%/0.5),hsl(var(--primary)/0.18)_45%,transparent_70%)] shadow-[inset_0_0_60px_hsl(var(--primary)/0.15)]" />
  </div>
);

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <SceneFallback /> : this.props.children;
  }
}

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export const Hero = () => {
  return (
    <section id="top" className="relative isolate flex min-h-[100dvh] items-center overflow-hidden px-5 pb-16 pt-24 md:px-8">
      {/* 3D scene: bleeds off the right edge on desktop, sits behind the copy on mobile */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-14 -z-10 h-[52vh] opacity-90 md:inset-y-0 md:left-auto md:right-[-8vw] md:top-0 md:h-full md:w-[62vw] md:opacity-100"
      >
        <SceneBoundary>
          <Suspense fallback={<SceneFallback />}>
            <HeroScene />
          </Suspense>
        </SceneBoundary>
      </div>

      <div className="hero-recede mx-auto grid w-full max-w-[1200px] grid-cols-1 md:grid-cols-12">
        <div className="mt-[34vh] md:col-span-7 md:mt-0 lg:col-span-6">
          <div
            className="glass inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-4 animate-rise-in"
            style={{ animationDelay: "80ms" }}
          >
            <img
              src={profileImg}
              alt="Portrait of Krishna Vaibhav Yadlapalli"
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
            <span className="text-[13px] font-medium tracking-[-0.01em]">
              Full-stack developer, Azure and AWS certified
            </span>
          </div>

          <h1
            className="mt-7 font-display text-[clamp(3.25rem,9vw,7.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] animate-rise-in"
            style={{ animationDelay: "180ms" }}
          >
            Krishna
            <br />
            Vaibhav<span className="text-link">.</span>
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
              className="group inline-flex items-center gap-0.5 text-[17px] font-medium text-link"
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
