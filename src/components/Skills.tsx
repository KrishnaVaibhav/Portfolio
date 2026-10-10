import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Reveal } from "./Reveal";
import { SkillGlobe } from "./SkillGlobe";
import { cn } from "@/lib/utils";

const skillCategories = [
  {
    title: "React & Mobile",
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
    title: "Java & Backend",
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
    title: "Cloud Platforms",
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
    title: "Databases",
    skills: [
      { name: "Cosmos DB", level: 88 },
      { name: "PostgreSQL", level: 86 },
      { name: "MongoDB", level: 85 },
      { name: "MySQL", level: 84 },
      { name: "Redis", level: 82 },
    ],
  },
  {
    title: "DevOps & CI/CD",
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
    title: "Testing & Quality",
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
    title: "Methodologies",
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
  const tabsRef = useRef<HTMLDivElement>(null);

  const tags = useMemo(
    () =>
      skillCategories.flatMap((category, group) =>
        category.skills.map((skill) => ({ name: skill.name, group })),
      ),
    [],
  );

  // Arrow keys move between tabs, per the WAI-ARIA tabs pattern.
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (activeCategory + step + skillCategories.length) % skillCategories.length;
    setActiveCategory(next);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const active = skillCategories[activeCategory];

  return (
    <section id="skills" className="section">
      <div className="section-inner grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <h2 className="headline">Technical expertise.</h2>
            <p className="lede">Full-stack work across React, Java and the cloud, from mobile UI to the pipeline that ships it.</p>
          </Reveal>

          {/* Segmented control */}
          <Reveal index={1} className="mt-10">
            <div
              ref={tabsRef}
              role="tablist"
              aria-label="Skill categories"
              className="glass flex flex-wrap gap-1 rounded-[24px] p-1.5"
            >
              {skillCategories.map((category, idx) => (
                <button
                  key={category.title}
                  role="tab"
                  id={`skill-tab-${idx}`}
                  aria-selected={activeCategory === idx}
                  aria-controls="skill-panel"
                  tabIndex={activeCategory === idx ? 0 : -1}
                  onClick={() => setActiveCategory(idx)}
                  onKeyDown={onTabKey}
                  className={cn(
                    "h-9 whitespace-nowrap rounded-full px-3.5 text-[0.8125rem] font-medium transition-all duration-300 touch:h-11",
                    activeCategory === idx
                      ? "bg-card text-foreground shadow-[0_1px_2px_hsl(var(--shadow-color)/0.12),0_4px_12px_-4px_hsl(var(--shadow-color)/0.2)] dark:bg-white/[0.12]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {category.title}
                </button>
              ))}
            </div>
          </Reveal>

          <div
            id="skill-panel"
            role="tabpanel"
            aria-labelledby={`skill-tab-${activeCategory}`}
            className="mt-8 grid gap-x-10 sm:grid-cols-2"
          >
            {active.skills.map((skill, idx) => (
              <div
                key={`${activeCategory}-${skill.name}`}
                data-tech={skill.name}
                className="flex items-center justify-between gap-4 border-b py-4 animate-in fade-in-0 slide-in-from-bottom-2 fill-mode-both duration-500"
                style={{ animationDelay: `${idx * 45}ms` }}
              >
                <span className="text-[1.0625rem] tracking-[-0.01em]">{skill.name}</span>
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="h-[3px] rounded-full bg-link/70"
                    style={{ width: `${(skill.level - 70) * 1.6}px` }}
                  />
                  <span className="w-7 text-right font-mono text-sm tabular text-muted-foreground">
                    {skill.level}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Self-assessed proficiency out of 100.</p>
        </div>

        <Reveal index={2} className="mx-auto w-full max-w-[min(100%,680px)] lg:col-span-5">
          <SkillGlobe tags={tags} activeGroup={activeCategory} />
        </Reveal>
      </div>
    </section>
  );
};
