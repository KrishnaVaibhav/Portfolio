import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Certifications } from "@/components/Certifications";
import { Contact } from "@/components/Contact";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Footer } from "@/components/Footer";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation sets this when a header link is clicked from another route
  // (e.g. /signals), since the section anchors only exist on this page.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;

    const frame = requestAnimationFrame(() => {
      document.querySelector(scrollTo)?.scrollIntoView({ behavior: "smooth" });
    });
    // Clear the state so refreshing or navigating back doesn't re-trigger it.
    navigate(location.pathname, { replace: true, state: {} });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-background text-foreground">
      <AmbientBackground />
      <Navigation />
      <main id="main" className="relative z-content">
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Education />
        <Projects />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
