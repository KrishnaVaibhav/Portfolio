import { useState } from "react";
import { Code2, Cloud, Database, Wrench, TestTube, GitBranch } from "lucide-react";
import { Card } from "./ui/card";

const skillCategories = [
  {
    icon: Code2,
    title: "React & Mobile",
    color: "text-primary",
    skills: [
      { name: "React.js", level: 92 },
      { name: "React Native", level: 90 },
      { name: "Redux & State Management", level: 89 },
      { name: "TypeScript", level: 91 },
      { name: "JavaScript (ES6+)", level: 93 },
      { name: "Mobile UI/UX", level: 88 },
      { name: "Cross-Platform Development", level: 90 },
      { name: "React Hooks & Context", level: 92 },
    ],
  },
  {
    icon: Code2,
    title: "Java & Backend",
    color: "text-secondary",
    skills: [
      { name: "Java", level: 91 },
      { name: "Spring Boot", level: 90 },
      { name: "C#", level: 88 },
      { name: ".NET Core", level: 87 },
      { name: "Python", level: 82 },
      { name: "Node.js/Express", level: 89 },
      { name: "RESTful APIs", level: 92 },
      { name: "Microservices", level: 90 },
    ],
  },
  {
    icon: Cloud,
    title: "Cloud Platforms",
    color: "text-accent",
    skills: [
      { name: "Azure (App Services, AKS, ACR)", level: 92 },
      { name: "Azure Service Bus", level: 88 },
      { name: "Azure Key Vault", level: 90 },
      { name: "AWS (Lambda, EC2, S3)", level: 85 },
      { name: "Application Gateway", level: 87 },
      { name: "Container Apps", level: 89 },
    ],
  },
  {
    icon: Database,
    title: "Databases",
    color: "text-secondary",
    skills: [
      { name: "Cosmos DB", level: 88 },
      { name: "PostgreSQL", level: 86 },
      { name: "MongoDB", level: 85 },
      { name: "MySQL", level: 84 },
      { name: "Redis", level: 82 },
    ],
  },
  {
    icon: Wrench,
    title: "DevOps & CI/CD",
    color: "text-primary",
    skills: [
      { name: "Azure DevOps Pipelines", level: 90 },
      { name: "Docker", level: 92 },
      { name: "Jenkins", level: 85 },
      { name: "GitHub Actions", level: 87 },
      { name: "ARM Templates/Bicep", level: 88 },
      { name: "GitLab CI/CD", level: 84 },
    ],
  },
  {
    icon: TestTube,
    title: "Testing & Quality",
    color: "text-accent",
    skills: [
      { name: "JUnit", level: 87 },
      { name: "Jest", level: 85 },
      { name: "Postman", level: 90 },
      { name: "Selenium", level: 82 },
      { name: "Application Insights", level: 88 },
      { name: "Azure Monitor", level: 89 },
    ],
  },
  {
    icon: GitBranch,
    title: "Methodologies",
    color: "text-secondary",
    skills: [
      { name: "Agile/Scrum", level: 90 },
      { name: "Code Reviews", level: 92 },
      { name: "Automated Testing", level: 88 },
      { name: "Microservices Architecture", level: 89 },
      { name: "RESTful API Design", level: 91 },
    ],
  },
];

export const Skills = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section id="skills" className="py-20 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            Technical Expertise
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Full-stack proficiency in React, Java, and cloud technologies
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {skillCategories.map((category, idx) => {
            const Icon = category.icon;
            return (
              <Card
                key={idx}
                className={`p-6 cursor-pointer transition-all duration-300 backdrop-blur-sm border-2 ${
                  activeCategory === idx
                    ? "bg-card/90 border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card/50 border-border hover:border-primary/50 hover:shadow-md"
                }`}
                onClick={() => setActiveCategory(idx)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-6 h-6 ${category.color}`} />
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.skills.length} skills
                </p>
              </Card>
            );
          })}
        </div>

        <Card className="p-8 bg-card/80 backdrop-blur-sm border-2 border-border">
          <div className="grid gap-6">
            {skillCategories[activeCategory].skills.map((skill, idx) => (
              <div key={idx} className="space-y-2 animate-slide-in-right">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-secondary rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${skill.level}%`,
                      animation: "skill-bar 1.5s ease-out forwards",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
};
