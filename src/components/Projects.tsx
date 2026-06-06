import { Github, ExternalLink, Cloud, Lock, Users } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const projects = [
  {
    icon: Lock,
    title: "File Share Platform",
    subtitle: "Secure Cloud Sharing System",
    description: "Enterprise-grade secure file transfer system with 99% uptime, implementing OAuth2 authentication and automated infrastructure provisioning.",
    highlights: [
      "Built with AWS Lambda, EC2, S3, and API Gateway",
      "Automated infrastructure using CloudFormation templates",
      "Deployed in Docker containers with auto-scaling groups",
      "Zero-downtime deployments with CI/CD pipelines",
      "Reduced environment setup time by 50%",
    ],
    technologies: [
      "AWS Lambda",
      "EC2",
      "S3",
      "API Gateway",
      "CloudFormation",
      "OAuth2",
      "JWT",
      "Docker",
    ],
    metrics: [
      { label: "Uptime", value: "99%" },
      { label: "Setup Time", value: "-50%" },
    ],
    gradient: "from-primary to-accent",
  },
  {
    icon: Users,
    title: "ActicClass",
    subtitle: "Cross-Platform Classroom Management",
    description: "Scalable classroom management platform with real-time collaboration features, deployed on Azure Kubernetes Service with automated CI/CD.",
    highlights: [
      "Backend APIs deployed to Azure Kubernetes Service (AKS)",
      "Real-time updates using WebSockets",
      "Automated deployments reduced manual time by 70%",
      "Achieved 85%+ code coverage with JUnit and Mockito",
      "Implemented retry patterns and load balancing for resilience",
    ],
    technologies: [
      "Spring Boot",
      "React",
      "MongoDB",
      "Docker",
      "Azure AKS",
      "ACR",
      "WebSockets",
      "JUnit",
    ],
    metrics: [
      { label: "Code Coverage", value: "85%" },
      { label: "Deploy Time", value: "-70%" },
    ],
    gradient: "from-accent to-secondary",
  },
];

export const Projects = () => {
  return (
    <section id="projects" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Featured Projects
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Production-grade cloud applications with enterprise architecture
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects.map((project, idx) => {
            const Icon = project.icon;
            return (
              <Card
                key={idx}
                className="group p-8 bg-card/80 backdrop-blur-sm border-2 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 animate-fade-in"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${project.gradient} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{project.subtitle}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="hover:bg-primary/10 hover:text-primary"
                  >
                    <Github className="w-5 h-5" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {project.description}
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-primary" />
                    Key Achievements
                  </h4>
                  <ul className="space-y-2">
                    {project.highlights.map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-muted/50">
                  {project.metrics.map((metric, mIdx) => (
                    <div key={mIdx} className="text-center">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {metric.value}
                      </div>
                      <div className="text-xs text-muted-foreground">{metric.label}</div>
                    </div>
                  ))}
                </div>

                {/* Technologies */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, tIdx) => (
                      <Badge
                        key={tIdx}
                        variant="secondary"
                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full group/btn bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  View Project Details
                  <ExternalLink className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
