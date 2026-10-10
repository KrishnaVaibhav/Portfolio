import type { LucideIcon } from "lucide-react";
import { Github, Lock, Users, ChartNoAxesCombined, Radio, ChevronDown } from "lucide-react";
import { TransitionLink } from "./TransitionLink";
import { CountUp } from "./CountUp";
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

// Glossy squircle in the style of an app icon, lifted off the card in 3D.
const AppIcon = ({ icon: Icon, className }: { icon: LucideIcon; className: string }) => (
  <div
    aria-hidden
    className={cn(
      "relative grid h-14 w-14 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br text-white md:h-16 md:w-16 md:rounded-[18px]",
      "shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-8px_16px_rgba(0,0,0,0.18),0_16px_32px_-14px_rgba(0,0,0,0.45)]",
      className,
    )}
    style={{ transform: "translateZ(30px)" }}
  >
    <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent_48%)]" />
    <Icon className="relative h-7 w-7" strokeWidth={1.5} />
  </div>
);

const Metrics = ({ metrics }: { metrics: Project["metrics"] }) => (
  <dl className="grid grid-cols-2 gap-5">
    {metrics.map((metric) => (
      <div key={metric.label}>
        <dt className="text-[0.8125rem] text-muted-foreground">{metric.label}</dt>
        <dd className="mt-0.5 font-display text-4xl font-semibold tracking-[-0.04em] tabular xl:text-[2.75rem]">
          <CountUp value={metric.value} />
        </dd>
      </div>
    ))}
  </dl>
);

const Highlights = ({ items, visible }: { items: string[]; visible: number }) => {
  const shown = items.slice(0, visible);
  const rest = items.slice(visible);
  const row = (h: string) => (
    <li key={h} className="flex gap-3 text-[0.9375rem] leading-snug">
      <span aria-hidden className="mt-[0.6em] h-px w-3 shrink-0 bg-link" />
      <span className="text-foreground/85">{h}</span>
    </li>
  );
  return (
    <div>
      <ul className="grid gap-2">{shown.map(row)}</ul>
      {rest.length > 0 && (
        <details className="group mt-2">
          <summary className="-my-1.5 inline-flex cursor-pointer list-none items-center gap-1 py-1.5 text-sm font-medium text-link touch:-my-3 touch:py-3 [&::-webkit-details-marker]:hidden">
            {rest.length} more
            <ChevronDown className="h-4 w-4 transition-transform duration-300 group-open:rotate-180" />
          </summary>
          <ul className="mt-2 grid gap-2">{rest.map(row)}</ul>
        </details>
      )}
    </div>
  );
};

const TechList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
    {items.map((tech) => (
      <li key={tech} data-tech={tech} className="cursor-default rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors duration-300 hover:bg-link/15 hover:text-link">
        {tech}
      </li>
    ))}
  </ul>
);

const Actions = ({ project }: { project: Project }) => (
  <div className="flex flex-wrap gap-2.5">
    {project.liveUrl && (
      <Button asChild size="sm" className="group">
        <TransitionLink to={project.liveUrl}>
          <Radio className="text-emerald-300 group-hover:animate-pulse" />
          View live data
        </TransitionLink>
      </Button>
    )}
    <Button asChild size="sm" variant={project.liveUrl ? "outline" : "default"}>
      <a href={project.githubUrl} target="_blank" rel="noreferrer">
        <Github />
        View on GitHub
      </a>
    </Button>
  </div>
);

/*
  One dense row per project, like an App Store listing. Wide screens read
  across four columns (icon, story, highlights, numbers and actions); tablets
  wrap highlights and numbers under the story; phones stack. Every column is
  sized by its own content, so nothing is stretched to fill empty space.
*/
const ProjectRow = ({ project }: { project: Project }) => (
  <TiltCard tilt={1.5} as="article" className="surface relative overflow-hidden p-5 sm:p-6 xl:p-7">
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", project.washClass)} />
    <div className="relative grid gap-5 preserve-3d md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-6 xl:grid-cols-[auto_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,15rem)] xl:gap-x-8">
      <AppIcon icon={project.icon} className={project.iconClass} />

      <div>
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-link">
          {project.subtitle}
          {project.liveUrl && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-emerald-600 dark:text-emerald-400">
              <span aria-hidden className="relative grid h-1.5 w-1.5 place-items-center">
                <span className="absolute h-1.5 w-1.5 rounded-full bg-emerald-500 motion-safe:animate-ping" />
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          )}
        </p>
        <h3 className="mt-1 font-display text-2xl font-semibold tracking-[-0.035em] md:text-[1.75rem]">{project.title}</h3>
        <p className="mt-2 max-w-[62ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{project.description}</p>
        <div className="mt-4">
          <TechList items={project.technologies} />
        </div>
      </div>

      <div className="md:col-start-2 xl:col-start-auto xl:border-l xl:pl-8">
        <Highlights items={project.highlights} visible={3} />
      </div>

      <div className="flex flex-col gap-5 md:col-start-2 md:flex-row md:items-end md:justify-between xl:col-start-auto xl:flex-col xl:items-stretch xl:justify-between xl:border-l xl:pl-8">
        <Metrics metrics={project.metrics} />
        <Actions project={project} />
      </div>
    </div>
  </TiltCard>
);

export const Projects = () => (
  <section id="projects" className="section">
    <div className="section-inner">
      <Reveal className="max-w-3xl">
        <h2 className="headline">Featured projects.</h2>
        <p className="lede">Production-grade cloud applications, built end to end.</p>
      </Reveal>

      <div className="mt-8 grid gap-4">
        {projects.map((project, idx) => (
          <Reveal key={project.title} index={idx}>
            <ProjectRow project={project} />
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);
