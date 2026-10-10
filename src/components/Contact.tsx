import { Mail, Phone, MapPin, Linkedin, Github, Send, ChevronRight, Copy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Reveal } from "./Reveal";
import { ScrollText } from "./ScrollText";
import { usePointerVars } from "@/hooks/use-motion";
import profileImg from "@/assets/profile-900.webp";
import { profile } from "@/data/profile";
import { copyToClipboard } from "@/lib/island";

type Row = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  copy?: boolean;
  tint: string;
};

const contactInfo: Row[] = [
  {
    icon: Mail,
    label: "Email",
    value: profile.email,
    copy: true,
    tint: "bg-[#0071e3]",
  },
  {
    icon: Phone,
    label: "Phone",
    value: profile.phone,
    href: profile.phoneHref,
    tint: "bg-[#30a46c]",
  },
  {
    icon: MapPin,
    label: "Location",
    value: profile.location,
    tint: "bg-[#e5484d]",
  },
];

const socialLinks: Row[] = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "krishna-vaibhav-y",
    href: profile.linkedin,
    external: true,
    tint: "bg-[#0a66c2]",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "KrishnaVaibhav",
    href: profile.github,
    external: true,
    tint: "bg-[#24292f] dark:bg-[#3a3a3e]",
  },
];

// One row of an iOS-style inset grouped list.
const ListRow = ({ row }: { row: Row }) => {
  const Icon = row.icon;
  const body = (
    <>
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] text-white ${row.tint}`}>
        <Icon className="h-[17px] w-[17px]" strokeWidth={2} />
      </span>
      <span className="flex min-w-0 flex-1 items-center justify-between gap-4 border-b py-3.5 group-last/list:border-b-0">
        <span className="text-[1.0625rem]">{row.label}</span>
        <span className="flex min-w-0 items-center gap-1 text-[0.9375rem] text-muted-foreground">
          <span className="truncate">{row.value}</span>
          {row.copy ? (
            <Copy className="h-4 w-4 shrink-0 opacity-60" />
          ) : (
            row.href && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
          )}
        </span>
      </span>
    </>
  );

  return (
    <li className="group/list">
      {row.copy ? (
        <button
          onClick={() => copyToClipboard(row.value, row.label)}
          aria-label={`Copy ${row.label.toLowerCase()} ${row.value}`}
          className="flex w-full items-center gap-4 px-4 text-left transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08]"
        >
          {body}
        </button>
      ) : row.href ? (
        <a
          href={row.href}
          {...(row.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="flex items-center gap-4 px-4 transition-colors hover:bg-foreground/[0.04] active:bg-foreground/[0.08]"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-center gap-4 px-4">{body}</div>
      )}
    </li>
  );
};

const Group = ({ title, rows }: { title: string; rows: Row[] }) => (
  <div>
    <h3 className="px-4 pb-2 text-[0.8125rem] text-muted-foreground">{title}</h3>
    <ul className="surface overflow-hidden">
      {rows.map((row) => (
        <ListRow key={row.label} row={row} />
      ))}
    </ul>
  </div>
);

export const Contact = () => {
  const portraitRef = usePointerVars<HTMLElement>({ tilt: 9 });

  return (
    <section id="contact" className="section">
      <div className="section-inner grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Portrait card: tilts in 3D with a sheen that follows the pointer */}
        <Reveal className="mx-auto w-full max-w-[420px] lg:col-span-5 lg:mx-0 lg:max-w-[min(100%,560px)]">
          <figure ref={portraitRef} className="tilt group relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[36px] shadow-[0_50px_100px_-40px_hsl(var(--shadow-color)/0.7)]">
              <img
                src={profileImg}
                alt="Krishna Vaibhav Yadlapalli in a suit, outdoors on the Dalhousie University campus"
                loading="lazy"
                width={900}
                height={900}
                className="h-full w-full scale-[1.08] object-cover object-[50%_20%] transition-transform duration-700 ease-apple group-hover:scale-[1.12]"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.22) calc(var(--mx, 30%) - 10%), transparent calc(var(--mx, 30%) + 15%))",
                }}
              />
              <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15" />
            </div>
          </figure>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="headline">Let's connect.</h2>
            <p className="lede font-medium text-foreground">
              <ScrollText text="Open to opportunities in cloud development and DevOps. Whether you need a cloud architect, a full-stack developer or a DevOps engineer, let's talk about how I can help your team." />
            </p>

            <div className="mt-8">
              <Button size="lg" asChild className="group">
                <a href={`mailto:${profile.email}`}>
                  <Send className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Email me
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal index={1} className="mt-8 grid max-w-xl gap-8">
            <Group title="Contact" rows={contactInfo} />
            <Group title="Profiles" rows={socialLinks} />
          </Reveal>
        </div>
      </div>
    </section>
  );
};
