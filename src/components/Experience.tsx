import { Briefcase, GraduationCap, Code2, Building2, Hospital } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

const experiences = [
  {
    type: "work",
    icon: Building2,
    title: "Cloud Developer",
    company: "BMO Financial Group",
    period: "Mar 2026 - Present",
    location: "Toronto, ON",
    description: "Design and implement cloud-native solutions on Azure and AWS for banking applications.",
    highlights: [
      "Architected serverless microservices on AWS Lambda, AWS Fargate, and Azure Functions...",
      "Implemented CI/CD pipelines GitHub Actions",
      "Optimized cloud costs by 25% through resource right-sizing and reserved instances",
      "Enhanced security posture with AWS GuardDuty",
      "Collaborated with cross-functional teams using Agile methodologies",
    ],
    tags: ["AWS", "Serverless", "CI/CD", "Cloud Security", "Kafka", "Redis", "React", "Node.js", "TypeScript", "Javascript"],
  },
  {
    type: "work",
    icon: Hospital,
    title: "OPOR Support Consultant",
    company: "Nova Scotia Health",
    period: "Nov 2025 - Mar 2026",
    location: "Halifax, NS",
    description: "Provide operational support for OPOR (One Person One Record) systems, ensuring seamless integration and performance across healthcare applications.",
    highlights: [
      "Optimized Node.js services and REST APIs using Kafka and Redis.",
      "Built complex UIs with React, Material-UI, and AG-Grid.",
      "Deployed scalable AWS services (EC2, RDS, Lambda) with Sentry monitoring.",
      "Maintained full-stack test coverage with Jest, Cypress, and Playwright.",
      "Accelerated development using AI coding tools.",
    ],
    tags: ["Node.js", "TypeScript", "React", "AWS", "Kafka", "Redis"],
  },
  {
    type: "work",
    icon: Briefcase,
    title: "R&D Project Assistant",
    company: "MY tech Lab / Cistel Technologies",
    period: "Aug 2024 - Dec 2024",
    location: "Halifax, NS",
    description: "Designed scalable cloud-native simulation platform in Azure Container Apps",
    highlights: [
      "Increased computational throughput by 40% through microservice orchestration",
      "Developed Python APIs with Azure Key Vault integration",
      "Automated deployment using Azure Bicep templates reducing setup by 60%",
      "Implemented Service Bus partitioning improving capacity by 35%",
      "Maintained 99.5% SLA uptime with Application Insights monitoring",
    ],
    tags: ["Azure", "Docker", "Python", "DevOps", "Bicep"],
  },
  {
    type: "work",
    icon: GraduationCap,
    title: "Teaching Assistant",
    company: "Dalhousie University",
    period: "Aug 2024 - Dec 2024",
    location: "Halifax, NS",
    description: "Mentored 50+ graduate students in full-stack development",
    highlights: [
      "Taught React, Node.js, and Spring Boot with focus on security",
      "Guided containerized application deployment on AWS with Docker",
      "Led CI/CD pipelines and Agile SDLC practices workshops",
    ],
    tags: ["Teaching", "React", "Node.js", "Spring Boot", "AWS"],
  },
  {
    type: "work",
    icon: Code2,
    title: "Programmer Analyst",
    company: "Cognizant Technology Solutions",
    period: "Mar 2022 - Nov 2022",
    location: "India",
    description: "Developed RESTful APIs and Azure-based microservices",
    highlights: [
      "Reduced integration errors by 30% with .NET Core microservices",
      "Migrated legacy services to Azure App Services with Docker",
      "Achieved 25% faster response times with Application Gateway",
      "Cut deployment cycles from 2 weeks to 3 days with Azure DevOps",
      "Improved MTTR by 50% using comprehensive monitoring",
    ],
    tags: ["C#", ".NET Core", "Azure", "Docker", "DevOps"],
  },
];

export const Experience = () => {
  return (
    <section id="experience" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Professional Journey
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Building enterprise-grade cloud solutions across industry and academia
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-accent to-secondary" />

          <div className="space-y-12">
            {experiences.map((exp, idx) => {
              const Icon = exp.icon;
              const isLeft = idx % 2 === 0;
              const borderClass = isLeft ? "border-primary/60" : "border-secondary/60";
              const bgClass = "bg-card/95"; // slightly more prominent than background
              const elevationClass = "shadow-lg hover:shadow-2xl ring-1 ring-primary/5";

              return (
                <div
                  key={idx}
                  className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"} gap-8`}
                >
                  {/* Timeline Node */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-card border-4 border-primary items-center justify-center z-10 animate-glow">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content Card */}
                  <Card
                    className={`flex-1 p-6 ${bgClass} backdrop-blur-sm border-2 ${borderClass} hover:border-primary/70 transition-all duration-300 ${elevationClass} animate-fade-in ${isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"} w-full md:max-w-[calc(50%-3rem)]`}>
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 border-2 border-primary">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">
                          {exp.title}
                        </h3>
                        <p className="text-primary font-semibold mb-1">
                          {exp.company}
                        </p>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>{exp.period}</span>
                          <span>•</span>
                          <span>{exp.location}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{exp.description}</p>

                    <ul className="space-y-2 mb-4">
                      {exp.highlights.map((highlight, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span className="text-muted-foreground">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-2">
                      {exp.tags.map((tag, tIdx) => (
                        <Badge
                          key={tIdx}
                          variant="secondary"
                          className="bg-primary/10 text-primary hover:bg-primary/20"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
