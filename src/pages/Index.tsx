import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { Experience } from "@/components/Experience";
import { Projects } from "@/components/Projects";
import { Education } from "@/components/Education";
import { Certifications } from "@/components/Certifications";
import { Contact } from "@/components/Contact";
import { SubtleSkillIcons } from "@/components/SubtleSkillIcons";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <SubtleSkillIcons />
      <Navigation />
      <Hero />
      <Skills />
      <Experience />
      <Education />
      <Projects />

      <Certifications />
      <Contact />
      
      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-muted/30">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground text-sm">
            © 2026 Krishna Vaibhav Yadlapalli. Built with React, TypeScript & Tailwind CSS.
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            Azure Developer Associate • AWS Developer Associate
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
