import type { CSSProperties } from "react";
import { Award, Shield, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { usePointerVars } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

const certifications = [
  {
    title: "Microsoft Certified: Azure Developer Associate",
    issuer: "Microsoft",
    code: "AZ-204",
    icon: Shield,
    description: "Expert in developing cloud solutions on Microsoft Azure platform",
    CredentialURL: "https://learn.microsoft.com/api/credentials/share/en-us/KrishnaVaibhav/D4B8C34A386E99D6?sharingId=E00486C99D01BA6",
    passClass: "bg-gradient-to-br from-[#2b8cff] via-[#0071e3] to-[#003f8a] text-white",
  },
  {
    title: "AWS Certified Developer - Associate",
    issuer: "Amazon Web Services",
    code: "DVA-C02",
    icon: Award,
    description: "Proficient in developing and deploying applications on AWS",
    CredentialURL: "https://cp.certmetrics.com/amazon/en/public/verify/credential/392466d9b23b457e8a7cf0fc0d992be8",
    passClass: "bg-gradient-to-br from-[#3a3a3e] via-[#1d1d1f] to-[#0b0b0c] text-white",
  },
  {
    title: "ServiceNow Certified Administrator",
    issuer: "ServiceNow",
    code: "CSA",
    icon: CheckCircle2,
    description: "Skilled in ServiceNow platform administration and configuration",
    CredentialURL: "https://www.servicenow.com/products/certification.html",
    passClass: "bg-gradient-to-br from-[#f4f4f6] via-[#e3e3e8] to-[#c9c9d0] text-[#1d1d1f]",
  },
];

const achievements = [
  "Zero-downtime deployments with Docker + CI/CD at Cognizant",
  "Delivered SDLC workshops for undergraduate students",
  "Guided students in secure, cloud-ready application development",
  "Achieved 99.5% SLA uptime across distributed workloads",
];

// Fan the deck: outer passes turn inward, the middle one sits forward.
const fan = [
  { "--fan-base": "16deg", "--lift-base": "0px" },
  { "--fan-base": "0deg", "--lift-base": "40px" },
  { "--fan-base": "-16deg", "--lift-base": "0px" },
];

const Pass = ({ cert, index }: { cert: (typeof certifications)[number]; index: number }) => {
  const ref = usePointerVars<HTMLAnchorElement>({ tilt: 8 });
  const Icon = cert.icon;
  return (
    <a
      ref={ref}
      href={cert.CredentialURL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${cert.title}, ${cert.code}. Verify credential (opens in a new tab)`}
      className={cn(
        "pass group relative flex aspect-[1.58/1] w-[82vw] max-w-[380px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[24px] p-6 md:w-full",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_30px_60px_-24px_rgba(0,0,0,0.45)]",
        cert.passClass,
      )}
      style={fan[index] as CSSProperties}
    >
      {/* Specular sweep that follows the pointer */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(420px circle at var(--mx, 20%) var(--my, 0%), rgba(255,255,255,0.32), transparent 55%)",
        }}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium opacity-80">{cert.issuer}</p>
          <p className="mt-1 font-mono text-2xl font-semibold tracking-tight">{cert.code}</p>
        </div>
        <Icon className="h-7 w-7 opacity-90" strokeWidth={1.5} />
      </div>
      <div className="relative">
        <p className="text-[17px] font-semibold leading-snug tracking-[-0.015em]">{cert.title}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="max-w-[30ch] text-[13px] leading-snug opacity-75">{cert.description}</p>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-medium opacity-90">
            Verify
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

export const Certifications = () => {
  return (
    <section id="certifications" className="section overflow-hidden">
      <div className="section-inner">
        <Reveal className="max-w-3xl">
          <h2 className="headline">Certifications and achievements.</h2>
          <p className="lede">Industry-recognized credentials. Select a pass to verify it with the issuer.</p>
        </Reveal>

        <Reveal index={1}>
          <div className="-mx-5 mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:py-10 [perspective:1600px]">
            {certifications.map((cert, idx) => (
              <Pass key={cert.code} cert={cert} index={idx} />
            ))}
          </div>
        </Reveal>

        <div className="mt-16 border-t pt-12">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">Key achievements</h3>
          <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {achievements.map((achievement, idx) => (
              <Reveal as="li" key={achievement} index={idx} className="flex flex-col gap-3">
                <CheckCircle2 className="h-5 w-5 text-link" strokeWidth={1.75} aria-hidden />
                <p className="text-[15px] leading-relaxed text-foreground/85">{achievement}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
