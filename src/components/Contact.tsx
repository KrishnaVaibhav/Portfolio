import { Mail, Phone, MapPin, Linkedin, Github, Send, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Reveal } from "./Reveal";
import { usePointerVars } from "@/hooks/use-motion";
import profileImg from "@/assets/profile.jpg";

type Row = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  external?: boolean;
  tint: string;
};

const contactInfo: Row[] = [
  {
    icon: Mail,
    label: "Email",
    value: "krishnavaibhav.y@gmail.com",
    href: "mailto:krishnavaibhav.y@gmail.com",
    tint: "bg-[#0071e3]",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (782) 882-7776",
    href: "tel:+17828827776",
    tint: "bg-[#30a46c]",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "Canada",
    tint: "bg-[#e5484d]",
  },
];

const socialLinks: Row[] = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "krishna-vaibhav-y",
    href: "https://www.linkedin.com/in/krishna-vaibhav-y/",
    external: true,
    tint: "bg-[#0a66c2]",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "KrishnaVaibhav",
    href: "https://github.com/KrishnaVaibhav",
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
        <span className="text-[17px]">{row.label}</span>
        <span className="flex min-w-0 items-center gap-1 text-[15px] text-muted-foreground">
          <span className="truncate">{row.value}</span>
          {row.href && <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />}
        </span>
      </span>
    </>
  );

  return (
    <li className="group/list">
      {row.href ? (
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
    <h3 className="px-4 pb-2 text-[13px] text-muted-foreground">{title}</h3>
    <ul className="glass overflow-hidden rounded-[20px]">
      {rows.map((row) => (
        <ListRow key={row.label} row={row} />
      ))}
    </ul>
  </div>
);

export const Contact = () => {
  const portraitRef = usePointerVars<HTMLDivElement>({ tilt: 10 });

  return (
    <section id="contact" className="section">
      <div className="section-inner grid gap-16 lg:grid-cols-12 lg:gap-12">
        <Reveal className="lg:col-span-6">
          <h2 className="headline">Let's connect.</h2>
          <p className="lede">
            Open to opportunities in cloud development and DevOps. Whether you need a cloud architect, a full-stack developer or a DevOps engineer, let's talk about how I can help your team.
          </p>

          <div className="mt-10">
            <Button size="lg" asChild className="group">
              <a href="mailto:krishnavaibhav.y@gmail.com">
                <Send className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                Email me
              </a>
            </Button>
          </div>

          <div ref={portraitRef} className="tilt mt-14 flex max-w-sm items-center gap-5">
            <img
              src={profileImg}
              alt="Krishna Vaibhav Yadlapalli"
              loading="lazy"
              width={88}
              height={88}
              className="h-[88px] w-[88px] rounded-[26px] object-cover shadow-[0_18px_40px_-16px_hsl(var(--shadow-color)/0.5)]"
              style={{ transform: "translateZ(30px)" }}
            />
            <div>
              <p className="font-semibold tracking-[-0.01em]">Masters in Applied Computer Science</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Dalhousie University, graduated May 2025</p>
            </div>
          </div>
        </Reveal>

        <Reveal index={1} className="flex flex-col gap-8 lg:col-span-5 lg:col-start-8 lg:pt-4">
          <Group title="Contact" rows={contactInfo} />
          <Group title="Profiles" rows={socialLinks} />
        </Reveal>
      </div>
    </section>
  );
};
