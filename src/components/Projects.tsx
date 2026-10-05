import type { LucideIcon } from "lucide-react";
import { Github, Lock, Users, ChartNoAxesCombined, Radio, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Reveal } from "./Reveal";
import { TiltCard } from "./TiltCard";
import { cn } from "@/lib/utils";

const projects = [
  {
    icon: ChartNoAxesCombined,
    title: "Daily Signals",
    subtitle: "AI-Driven Stock Forecast Pipeline",
    githubUrl: "https://github.com/KrishnaVaibhav/PipeLines/tree/main/daily-signals/stock-forecast",
    liveUrl: "/signals",
    description:
      "Automated daily pipeline that scans financial news, ranks S&P 500 tickers by mention volume, and generates confidence-scored AI forecasts cross-checked against technical indicators, with a self-scoring accuracy track record and live Supabase-backed dashboard.",
    highlights: [
      "3-provider AI fallback chain (Gemini → Groq → OpenAI) so a single dead provider never blocks a run",
      "Scans 9 financial news sources concurrently, isolating failures per-source",
      "Batches tickers per AI call and uses one batched market-data call per run to minimize API usage and runtime",
      "Self-scoring accuracy track record (hit rate by provider and confidence band) computed automatically over time",
      "ATR-based stop-loss and sector-concentration risk sizing on every actionable pick",
      "Runs unattended on GitHub Actions cron, syncs daily results to Supabase for live display",
    ],
    technologies: ["Python", "GitHub Actions", "Gemini API", "Groq API", "OpenAI API", "yfinance", "Supabase", "pandas"],
    metrics: [
      { label: "AI Providers", value: "3" },
      { label: "News Sources", value: "9" },
    ],
    // Icon tint: rise / fall, matching the Signals dashboard.
    iconClass: "from-emerald-400 via-emerald-600 to-rose-600",
    washClass: "bg-[radial-gradient(60%_80%_at_85%_20%,rgba(16,185,129,0.12),transparent_70%)]",
  },
  {
    icon: Lock,
    title: "File Share Platform",
    subtitle: "Secure Cloud Sharing System",
    githubUrl: "https://github.com/KrishnaVaibhav/File-Share",
    liveUrl: undefined as string | undefined,
    description:
      "Enterprise-grade secure file transfer system with 99% uptime, implementing OAuth2 authentication and automated infrastructure provisioning.",
    highlights: [
      "Built with AWS Lambda, EC2, S3, and API Gateway",
      "Automated infrastructure using CloudFormation templates",
      "Deployed in Docker containers with auto-scaling groups",
      "Zero-downtime deployments with CI/CD pipelines",
      "Reduced environment setup time by 50%",
    ],
    technologies: ["AWS Lambda", "EC2", "S3", "API Gateway", "CloudFormation", "OAuth2", "JWT", "Docker"],
    metrics: [
      { label: "Uptime", value: "99%" },
      { label: "Setup Time", value: "-50%" },
    ],
    iconClass: "from-sky-400 via-blue-600 to-blue-800",
    washClass: "bg-[radial-gradient(70%_70%_at_100%_0%,hsl(var(--primary)/0.10),transparent_70%)]",
  },
  {
    icon: Users,
    title: "ActicClass",
    subtitle: "Cross-Platform Classroom Management",
    githubUrl: "https://github.com/KrishnaVaibhav/Acticlass",
    liveUrl: undefined as string | undefined,
    description:
      "Scalable classroom management platform with real-time collaboration features, deployed on Azure Kubernetes Service with automated CI/CD.",
    highlights: [
      "Backend APIs deployed to Azure Kubernetes Service (AKS)",
      "Real-time updates using WebSockets",
      "Automated deployments reduced manual time by 70%",
      "Achieved 85%+ code coverage with JUnit and Mockito",
      "Implemented retry patterns and load balancing for resilience",
    ],
    technologies: ["Spring Boot", "React", "MongoDB", "Docker", "Azure AKS", "ACR", "WebSockets", "JUnit"],
    metrics: [
      { label: "Code Coverage", value: "85%" },
      { label: "Deploy Time", value: "-70%" },
    ],
    iconClass: "from-zinc-500 via-zinc-700 to-zinc-900",
    washClass: "bg-[radial-gradient(70%_70%_at_0%_100%,hsl(var(--foreground)/0.06),transparent_70%)]",
  },
];

type Project = (typeof projects)[number];

// Glossy squircle in the style of an app icon, lifted off the tile in 3D.
const AppIcon = ({ icon: Icon, className, size = "md" }: { icon: LucideIcon; className: string; size?: "md" | "lg" }) => (
  <div
    aria-hidden
    className={cn(
      "relative grid shrink-0 place-items-center bg-gradient-to-br text-white",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-8px_16px_rgba(0,0,0,0.18),0_20px_40px_-16px_rgba(0,0,0,0.45)]",
      size === "lg" ? "h-36 w-36 rounded-[36px] md:h-44 md:w-44 md:rounded-[44px]" : "h-16 w-16 rounded-[18px]",
      className,
    )}
    style={{ transform: `translateZ(${size === "lg" ? 60 : 30}px)` }}
  >
    <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_48%)]" />
    <Icon className={size === "lg" ? "relative h-16 w-16 md:h-20 md:w-20" : "relative h-7 w-7"} strokeWidth={1.5} />
  </div>
);

const Metrics = ({ metrics, large }: { metrics: Project["metrics"]; large?: boolean }) => (
  <dl className="grid grid-cols-2 gap-6">
    {metrics.map((metric) => (
      <div key={metric.label}>
        <dt className="text-sm text-muted-foreground">{metric.label}</dt>
        <dd
          className={cn(
            "mt-1 font-display font-semibold tracking-[-0.04em] tabular",
            large ? "text-6xl md:text-7xl" : "text-5xl",
          )}
        >
          {metric.value}
        </dd>
      </div>
    ))}
  </dl>
);

const Highlights = ({ items, visible }: { items: string[]; visible: number }) => {
  const shown = items.slice(0, visible);
  const rest = items.slice(visible);
  const row = (h: string) => (
    <li key={h} className="flex gap-3 text-[15px] leading-relaxed">
      <span aria-hidden className="mt-[0.7em] h-px w-3 shrink-0 bg-link" />
      <span className="text-foreground/85">{h}</span>
    </li>
  );
  return (
    <div>
      <ul className="grid gap-2.5">{shown.map(row)}</ul>
      {rest.length > 0 && (
        <details className="group mt-2.5">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-link [&::-webkit-details-marker]:hidden">
            {rest.length} more
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <ul className="mt-2.5 grid gap-2.5">{rest.map(row)}</ul>
        </details>
      )}
    </div>
  );
};

const TechList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
    {items.map((tech) => (
      <li key={tech} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
        {tech}
      </li>
    ))}
  </ul>
);

const Actions = ({ project }: { project: Project }) => (
  <div className="flex flex-wrap gap-3">
    {project.liveUrl && (
      <Button asChild className="group">
        <Link to={project.liveUrl}>
          <Radio className="text-emerald-300 group-hover:animate-pulse" />
          View live data
        </Link>
      </Button>
    )}
    <Button asChild variant={project.liveUrl ? "outline" : "default"}>
      <a href={project.githubUrl} target="_blank" rel="noreferrer">
        <Github />
        View on GitHub
      </a>
    </Button>
  </div>
);

export const Projects = () => {
  const [featured, ...rest] = projects;

  return (
    <section id="projects" className="section">
      <div className="section-inner">
        <Reveal className="max-w-3xl">
          <h2 className="headline">Featured projects.</h2>
          <p className="lede">Production-grade cloud applications, built end to end.</p>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {/* Feature tile */}
          <Reveal className="md:col-span-2">
            <TiltCard tilt={2.5} as="article" className="surface relative overflow-hidden p-7 md:p-12">
              <div aria-hidden className={cn("pointer-events-none absolute inset-0", featured.washClass)} />
              <div className="relative grid gap-12 lg:grid-cols-12 lg:gap-16 preserve-3d">
                <div className="lg:col-span-7">
                  <p className="text-sm font-medium text-link">{featured.subtitle}</p>
                  <h3 className="mt-2 font-display text-4xl font-semibold tracking-[-0.035em] md:text-5xl">
                    {featured.title}
                  </h3>
                  <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">
                    {featured.description}
                  </p>
                  <div className="mt-8">
                    <Highlights items={featured.highlights} visible={4} />
                  </div>
                  <div className="mt-8">
                    <TechList items={featured.technologies} />
                  </div>
                  <div className="mt-10">
                    <Actions project={featured} />
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-12 preserve-3d lg:col-span-5 lg:items-end">
                  <AppIcon icon={featured.icon} className={featured.iconClass} size="lg" />
                  <div className="w-full lg:max-w-[340px]">
                    <Metrics metrics={featured.metrics} large />
                  </div>
                </div>
              </div>
            </TiltCard>
          </Reveal>

          {rest.map((project, idx) => (
            <Reveal key={project.title} index={idx + 1}>
              <TiltCard tilt={4} as="article" className="surface relative flex h-full flex-col overflow-hidden p-7 md:p-9">
                <div aria-hidden className={cn("pointer-events-none absolute inset-0", project.washClass)} />
                <div className="relative flex items-start justify-between gap-6 preserve-3d">
                  <div>
                    <p className="text-sm font-medium text-link">{project.subtitle}</p>
                    <h3 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em]">{project.title}</h3>
                  </div>
                  <AppIcon icon={project.icon} className={project.iconClass} />
                </div>
                <p className="relative mt-5 text-[17px] leading-relaxed text-muted-foreground">{project.description}</p>
                <div className="relative mt-8">
                  <Metrics metrics={project.metrics} />
                </div>
                <div className="relative mt-8">
                  <Highlights items={project.highlights} visible={3} />
                </div>
                <div className="relative mt-8">
                  <TechList items={project.technologies} />
                </div>
                <div className="relative mt-auto pt-10">
                  <Actions project={project} />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
