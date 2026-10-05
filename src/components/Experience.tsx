import { Briefcase, GraduationCap, Code2, Building2, Hospital } from "lucide-react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

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
      "Architected serverless microservices on AWS Lambda, AWS Fargate, and Azure Functions",
      "Implemented CI/CD pipelines with GitHub Actions",
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

// "Aug 2024 - Dec 2024" -> month indexes, so overlapping roles can be detected.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const toMonth = (s: string) => {
  const t = s.trim();
  if (t === "Present") return Number.POSITIVE_INFINITY;
  const [mon, year] = t.split(" ");
  return Number(year) * 12 + MONTHS.indexOf(mon);
};
const range = (period: string) => {
  const [from, to] = period.split(" - ");
  return { from: toMonth(from), to: toMonth(to) };
};

// A role that overlaps the one listed before it runs on a parallel branch.
const lanes = experiences.map((exp, idx) => {
  if (idx === 0) return 0;
  const a = range(exp.period);
  const b = range(experiences[idx - 1].period);
  return a.from <= b.to && b.from <= a.to ? 1 : 0;
});

const LANE_GAP = 28;

// Fork out of main at the top of the item, merge back at the bottom.
const Branch = () => (
  <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[19px] w-10 md:left-[calc(33.333%-1px)]">
    <svg className="absolute left-0 top-[-8px] h-12 w-10 overflow-visible" viewBox="0 0 40 48" fill="none">
      <path d={`M0.5 0 C0.5 26 ${LANE_GAP} 18 ${LANE_GAP} 48`} className="stroke-link/70" strokeWidth="1.5" />
    </svg>
    <div className="absolute bottom-12 top-10 w-px bg-link/70" style={{ left: LANE_GAP }} />
    <svg className="absolute bottom-0 left-0 h-12 w-10 overflow-visible" viewBox="0 0 40 48" fill="none">
      <path d={`M${LANE_GAP} 0 C${LANE_GAP} 30 0.5 22 0.5 48`} className="stroke-link/70" strokeWidth="1.5" />
    </svg>
  </div>
);

export const Experience = () => {
  return (
    <section id="experience" className="section">
      <div className="section-inner">
        <Reveal className="max-w-3xl">
          <h2 className="headline">Professional journey.</h2>
          <p className="lede">Enterprise cloud work across banking, healthcare, research and teaching.</p>
        </Reveal>

        <ol className="relative mt-24 [--rail:19px] md:mt-28 md:[--rail:calc(33.333%-0.5px)]">
          {/* Main line of the graph, filled by scroll where CSS scroll timelines are supported */}
          <div aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px bg-border md:left-[calc(33.333%-1px)]">
            <div className="scroll-fill h-full w-full bg-gradient-to-b from-primary via-primary/60 to-transparent" />
            <span className="absolute -top-9 left-1/2 -translate-x-1/2 rounded-full border bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
              main
            </span>
          </div>

          {experiences.map((exp, idx) => {
            const Icon = exp.icon;
            const lane = lanes[idx];
            return (
              <li
                key={exp.company + exp.title}
                className="relative grid gap-6 pb-20 pl-14 last:pb-0 md:grid-cols-3 md:gap-12 md:pl-0"
              >
                {lane === 1 && <Branch />}

                {/* Commit node */}
                <span
                  aria-hidden
                  className="glass absolute top-0 grid h-10 w-10 place-items-center rounded-full"
                  style={{ left: lane ? `calc(var(--rail) + ${LANE_GAP}px - 20px)` : "calc(var(--rail) - 20px)" }}
                >
                  <Icon className="h-[18px] w-[18px] text-link" strokeWidth={1.75} />
                </span>

                {/* Sticky meta column */}
                <Reveal className={cn("md:sticky md:top-28 md:self-start md:pr-12 md:text-right", lane && "pl-6 md:pl-0")}>
                  <div>
                    {lane === 1 && (
                      <p className="mb-2 font-mono text-[11px] text-link">Concurrent role</p>
                    )}
                    <p className="font-mono text-[13px] tabular text-muted-foreground">{exp.period}</p>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.02em]">{exp.company}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{exp.location}</p>
                  </div>
                </Reveal>

                <Reveal index={1} className={lane ? "pl-6 md:col-span-2 md:pl-16" : "md:col-span-2 md:pl-12"}>
                  <h3 className="font-display text-3xl font-semibold tracking-[-0.03em] md:text-4xl">{exp.title}</h3>
                  <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted-foreground">{exp.description}</p>

                  <ul className="mt-6 grid max-w-[68ch] gap-3">
                    {exp.highlights.map((highlight) => (
                      <li key={highlight} className="flex gap-3 text-[15px] leading-relaxed">
                        <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-link" />
                        <span className="text-foreground/85">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-6 flex flex-wrap gap-1.5" aria-label="Technologies">
                    {exp.tags.map((tag) => (
                      <li
                        key={tag}
                        data-tech={tag}
                        className="cursor-default rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors duration-300 hover:bg-link/15 hover:text-link"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
