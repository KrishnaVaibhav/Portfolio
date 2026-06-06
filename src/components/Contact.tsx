import { Mail, Phone, MapPin, Linkedin, Github, Send } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "krishnavaibhav.y@gmail.com",
    href: "mailto:krishnavaibhav.y@gmail.com",
    color: "text-primary",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (782) 882-7776",
    href: "tel:+17828827776",
    color: "text-accent",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Canada 🍁",
    href: "#",
    color: "text-secondary",
  },
];

const socialLinks = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/krishna-vaibhav-y/",
    color: "hover:text-primary",
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/KrishnaVaibhav",
    color: "hover:text-accent",
  },
];

export const Contact = () => {
  return (
    <section id="contact" className="py-20 px-4 relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Open to exciting opportunities in cloud development and DevOps
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Info Card */}
          <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border space-y-6 animate-fade-in">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Get In Touch
              </h3>
              <p className="text-muted-foreground">
                I'm always interested in discussing new projects, creative ideas, or opportunities.
              </p>
            </div>

            <div className="space-y-4">
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <a
                    key={idx}
                    href={info.href}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:translate-x-2 group"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-background flex items-center justify-center ${info.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{info.label}</p>
                      <p className="font-medium text-foreground">{info.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Connect with me</p>
              <div className="flex gap-4">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <Button
                      key={idx}
                      size="icon"
                      variant="outline"
                      className={`border-2 ${social.color} transition-all duration-300 hover:scale-110`}
                      asChild
                    >
                      <a href={social.href} target="_blank" rel="noopener noreferrer">
                        <Icon className="w-5 h-5" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* CTA Card */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 backdrop-blur-sm border-2 border-primary/30 flex flex-col justify-center items-center text-center animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6 animate-glow">
              <Send className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to Build Something Great?
            </h3>
            
            <p className="text-muted-foreground mb-8 max-w-md">
              Whether you're looking for a cloud architect, full-stack developer, or DevOps engineer, let's discuss how I can contribute to your team.
            </p>
            
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary via-accent to-secondary hover:opacity-90 text-white px-8 py-6 text-lg group"
              asChild
            >
              <a href="mailto:krishnavaibhav.y@gmail.com">
                Send Message
                <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>

            <div className="mt-8 pt-8 border-t border-border/50 w-full">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Masters in Applied Computer Science</strong> at Dalhousie University
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Graduated: May 2025
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
