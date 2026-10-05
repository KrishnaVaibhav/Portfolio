import type { CSSProperties } from "react";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import { Reveal } from "./Reveal";
import { usePointerVars } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";
import microsoftLogo from "@/assets/certs/microsoft.svg";
import azureMark from "@/assets/certs/azure.svg";
import awsLogo from "@/assets/certs/aws-white.svg";
import servicenowWordmark from "@/assets/certs/servicenow-white.svg";
import servicenowMark from "@/assets/certs/servicenow-mark.svg";

/*
  Each pass wears its issuer's identity: the issuer's own logo and mark, its
  brand palette for the card, and an accent tuned to stay above 4.5:1 for the
  small text on that card.
*/
const certifications = [
  {
    title: "Microsoft Certified: Azure Developer Associate",
    issuer: "Microsoft",
    issuerLogo: microsoftLogo,
    issuerLogoClass: "h-4 w-4",
    showIssuerText: true,
    mark: azureMark,
    markClass: "h-11 w-11",
    code: "AZ-204",
    description: "Expert in developing cloud solutions on Microsoft Azure platform",
    CredentialURL: "https://learn.microsoft.com/api/credentials/share/en-us/KrishnaVaibhav/D4B8C34A386E99D6?sharingId=E00486C99D01BA6",
    background:
      "radial-gradient(120% 90% at 88% 0%, rgba(80,230,255,0.22), transparent 55%), linear-gradient(145deg, #0b3a6e 0%, #082a52 55%, #051b36 100%)",
    accent: "#50e6ff",
  },
  {
    title: "AWS Certified Developer - Associate",
    issuer: "Amazon Web Services",
    issuerLogo: undefined as string | undefined,
    issuerLogoClass: "",
    showIssuerText: true,
    mark: awsLogo,
    markClass: "h-9 w-auto",
    code: "DVA-C02",
    description: "Proficient in developing and deploying applications on AWS",
    CredentialURL: "https://cp.certmetrics.com/amazon/en/public/verify/credential/392466d9b23b457e8a7cf0fc0d992be8",
    background:
      "radial-gradient(120% 90% at 88% 0%, rgba(255,98,0,0.2), transparent 55%), linear-gradient(145deg, #2a3647 0%, #161d26 55%, #0c1117 100%)",
    accent: "#ff8a3d",
  },
  {
    title: "ServiceNow Certified Administrator",
    issuer: "ServiceNow",
    issuerLogo: servicenowWordmark,
    issuerLogoClass: "h-[15px] w-auto",
    showIssuerText: false,
    mark: servicenowMark,
    markClass: "h-10 w-10",
    code: "CSA",
    description: "Skilled in ServiceNow platform administration and configuration",
    CredentialURL: "https://www.servicenow.com/products/certification.html",
    background:
      "radial-gradient(120% 90% at 88% 0%, rgba(129,181,161,0.25), transparent 55%), linear-gradient(145deg, #34504f 0%, #293e40 50%, #1a2829 100%)",
    accent: "#9fd1bd",
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
  return (
    <a
      ref={ref}
      href={cert.CredentialURL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${cert.title}, ${cert.code}, issued by ${cert.issuer}. Verify credential (opens in a new tab)`}
      className={cn(
        "pass group relative flex aspect-[1.58/1] w-[82vw] max-w-[380px] shrink-0 snap-center flex-col justify-between rounded-[24px] p-6 text-white md:w-full",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_0_0_1px_rgba(255,255,255,0.08),0_30px_60px_-24px_rgba(0,0,0,0.5)]",
      )}
      style={{ ...(fan[index] as CSSProperties), background: cert.background }}
    >
      {/* Specular light that follows the pointer, clipped to the card */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span
          className="absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-100"
          style={{ background: "radial-gradient(420px circle at var(--mx, 20%) var(--my, 0%), rgba(255,255,255,0.22), transparent 55%)" }}
        />
      </span>

      <div className="relative flex items-start justify-between gap-4 preserve-3d">
        <div>
          <p className="flex items-center gap-2 text-[0.8125rem] font-semibold tracking-[-0.01em]">
            {cert.issuerLogo && <img src={cert.issuerLogo} alt="" aria-hidden className={cert.issuerLogoClass} />}
            {cert.showIssuerText ? cert.issuer : <span className="sr-only">{cert.issuer}</span>}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight" style={{ color: cert.accent }}>
            {cert.code}
          </p>
        </div>
        {/* Issuer mark, lifted off the card in 3D */}
        <img
          src={cert.mark}
          alt=""
          aria-hidden
          className={cn(cert.markClass, "shrink-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-apple [transform:translateZ(30px)] group-hover:[transform:translateZ(52px)]")}
        />
      </div>

      <div className="relative">
        <p className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.015em]">{cert.title}</p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="max-w-[30ch] text-[0.8125rem] leading-snug text-white/85">{cert.description}</p>
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[0.8125rem] font-semibold" style={{ color: cert.accent }}>
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
                <p className="text-[0.9375rem] leading-relaxed text-foreground/85">{achievement}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
