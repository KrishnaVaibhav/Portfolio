import { Cloud, Code2, Database, Cpu } from "lucide-react";
import { Button } from "./ui/button";
import heroBg from "@/assets/hero-bg.jpg";
import profileImg from "@/assets/profile.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background" />
      </div>

      {/* Floating Tech Icons */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        <Cloud className="absolute top-20 left-[10%] w-16 h-16 text-primary/30 animate-float" />
        <Database className="absolute top-40 right-[15%] w-12 h-12 text-accent/40 animate-float-slow" />
        <Code2 className="absolute bottom-32 left-[20%] w-14 h-14 text-secondary/30 animate-float" />
        <Cpu className="absolute bottom-20 right-[25%] w-16 h-16 text-primary/40 animate-float-slow" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 animate-fade-in">
          {/* Profile Image with Cutout Style */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-secondary rounded-full opacity-75 blur-2xl group-hover:opacity-100 transition duration-500 animate-glow" />
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-accent rounded-full opacity-50 animate-pulse" />
              <img 
                src={profileImg} 
                alt="Krishna Vaibhav Yadlapalli"
                className="relative w-64 h-64 lg:w-80 lg:h-80 object-cover rounded-full border-4 border-background shadow-2xl transform group-hover:scale-105 transition duration-500"
                style={{
                  clipPath: "circle(50% at 50% 50%)",
                }}
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-card border-2 border-primary rounded-full shadow-lg whitespace-nowrap">
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Full Stack Developer
              </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary">Azure & AWS Certified Developer</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              KRISHNA VAIBHAV<br />
            </h1>
          
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Cloud-Native Application Developer
            </p>
            
            <p className="text-lg text-muted-foreground/80 mb-8">
              Specializing in React, React Native, Java & Cloud Solutions
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground group"
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Projects
                <Code2 className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get In Touch
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start items-center mt-12 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-primary" />
                <span>Canada 🍁</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent" />
                <span>React • Java • Mobile</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-primary rounded-full" />
        </div>
      </div>
    </section>
  );
};
