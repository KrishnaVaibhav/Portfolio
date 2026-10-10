import { useEffect, useState, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useLocation, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Search, UserRound, Layers, Briefcase, GraduationCap, FolderGit2, BadgeCheck, MessageCircle,
  Copy, Mail, Phone, Linkedin, Github, Radio, Lock, Users, Shield, Award, CheckCircle2, CornerDownLeft,
  Monitor, Sun, Moon,
} from "lucide-react";
import { copyToClipboard, onSpotlight } from "@/lib/island";
import { profile } from "@/data/profile";
import { navigateWithTransition } from "@/lib/view-transition";
import { setThemePref } from "@/lib/theme";

type Item = {
  label: string;
  hint: string;
  icon: LucideIcon;
  tint: string;
  keywords?: string[];
  run: () => void;
};

const openUrl = (url: string) => window.open(url, "_blank", "noopener,noreferrer");

export const Spotlight = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => onSpotlight(() => setOpen(true)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goToSection = (href: string) => {
    if (location.pathname === "/") {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigateWithTransition(navigate, "/", { state: { scrollTo: href } });
    }
  };

  const groups: { heading: string; items: Item[] }[] = [
    {
      heading: "Sections",
      items: [
        { label: "About", hint: "Section", icon: UserRound, tint: "bg-[#64d2ff]", keywords: ["bio", "who"], run: () => goToSection("#top") },
        { label: "Skills", hint: "Section", icon: Layers, tint: "bg-[#5e5ce6]", run: () => goToSection("#skills") },
        { label: "Experience", hint: "Section", icon: Briefcase, tint: "bg-[#0071e3]", keywords: ["work", "jobs", "career"], run: () => goToSection("#experience") },
        { label: "Education", hint: "Section", icon: GraduationCap, tint: "bg-[#ff9f0a]", keywords: ["degree", "university"], run: () => goToSection("#education") },
        { label: "Projects", hint: "Section", icon: FolderGit2, tint: "bg-[#30a46c]", run: () => goToSection("#projects") },
        { label: "Certifications", hint: "Section", icon: BadgeCheck, tint: "bg-[#bf5af2]", run: () => goToSection("#certifications") },
        { label: "Contact", hint: "Section", icon: MessageCircle, tint: "bg-[#e5484d]", run: () => goToSection("#contact") },
      ],
    },
    {
      heading: "Projects",
      items: [
        { label: "Daily Signals: live forecasts", hint: "Open", icon: Radio, tint: "bg-gradient-to-br from-emerald-400 to-rose-600", keywords: ["stocks", "ai", "pipeline"], run: () => navigateWithTransition(navigate, "/signals") },
        { label: "File Share Platform", hint: "GitHub", icon: Lock, tint: "bg-gradient-to-br from-sky-400 to-blue-800", keywords: ["aws", "lambda"], run: () => openUrl("https://github.com/KrishnaVaibhav/File-Share") },
        { label: "ActicClass", hint: "GitHub", icon: Users, tint: "bg-gradient-to-br from-zinc-500 to-zinc-900", keywords: ["azure", "aks", "classroom"], run: () => openUrl("https://github.com/KrishnaVaibhav/Acticlass") },
      ],
    },
    {
      heading: "Credentials",
      items: [
        { label: "Azure Developer Associate (AZ-204)", hint: "Verify", icon: Shield, tint: "bg-[#0071e3]", keywords: ["microsoft"], run: () => openUrl("https://learn.microsoft.com/api/credentials/share/en-us/KrishnaVaibhav/D4B8C34A386E99D6?sharingId=E00486C99D01BA6") },
        { label: "AWS Developer Associate (DVA-C02)", hint: "Verify", icon: Award, tint: "bg-[#1d1d1f]", keywords: ["amazon"], run: () => openUrl("https://cp.certmetrics.com/amazon/en/public/verify/credential/392466d9b23b457e8a7cf0fc0d992be8") },
        { label: "ServiceNow Certified Administrator (CSA)", hint: "Verify", icon: CheckCircle2, tint: "bg-[#62d84e]", run: () => openUrl("https://www.servicenow.com/products/certification.html") },
      ],
    },
    {
      heading: "Appearance",
      items: [
        { label: "Light mode", hint: "Appearance", icon: Sun, tint: "bg-[#ff9f0a]", keywords: ["theme", "day", "bright"], run: () => setThemePref("light") },
        { label: "Dark mode", hint: "Appearance", icon: Moon, tint: "bg-[#5e5ce6]", keywords: ["theme", "night"], run: () => setThemePref("dark") },
        { label: "System default appearance", hint: "Appearance", icon: Monitor, tint: "bg-[#636366]", keywords: ["theme", "auto", "mode", "device"], run: () => setThemePref("system") },
      ],
    },
    {
      heading: "Get in touch",
      items: [
        { label: "Copy email address", hint: profile.email, icon: Copy, tint: "bg-[#0071e3]", keywords: ["mail", "contact"], run: () => copyToClipboard(profile.email, "Email") },
        { label: "Email me", hint: "Mail", icon: Mail, tint: "bg-[#0a84ff]", run: () => { window.location.href = `mailto:${profile.email}`; } },
        { label: "Call", hint: profile.phone, icon: Phone, tint: "bg-[#30a46c]", keywords: ["phone"], run: () => { window.location.href = profile.phoneHref; } },
        { label: "LinkedIn", hint: "Profile", icon: Linkedin, tint: "bg-[#0a66c2]", run: () => openUrl(profile.linkedin) },
        { label: "GitHub", hint: "Profile", icon: Github, tint: "bg-[#24292f]", run: () => openUrl(profile.github) },
      ],
    },
  ];

  const select = (item: Item) => {
    setOpen(false);
    // Let the dialog release focus and scroll lock before moving the page.
    window.setTimeout(item.run, 60);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-overlay bg-black/25 backdrop-blur-[3px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="glass fixed left-1/2 top-[14vh] z-overlay w-[min(680px,calc(100vw-24px))] -translate-x-1/2 overflow-hidden rounded-[26px] !bg-[hsl(var(--popover)/0.92)] p-0 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] data-[state=open]:slide-in-from-top-2"
        >
          <DialogPrimitive.Title className="sr-only">Search the portfolio</DialogPrimitive.Title>
          <Command loop className="flex flex-col">
            <div className="flex items-center gap-3 px-5">
              <Search className="h-[22px] w-[22px] shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <Command.Input
                autoFocus
                placeholder="Search sections, projects, credentials"
                className="h-16 w-full bg-transparent text-[1.3125rem] tracking-[-0.015em] outline-none placeholder:text-muted-foreground"
              />
              <kbd className="hidden shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground sm:block">esc</kbd>
            </div>
            <div className="h-px bg-border" />
            <Command.List className="max-h-[min(52vh,460px)] overflow-y-auto overscroll-contain p-2 [scrollbar-width:thin]">
              <Command.Empty className="px-4 py-10 text-center text-[0.9375rem] text-muted-foreground">
                No matches. Try "azure", "projects" or "email".
              </Command.Empty>
              {groups.map((group) => (
                <Command.Group
                  key={group.heading}
                  heading={group.heading}
                  className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                >
                  {group.items.map((item) => (
                    <SpotlightItem key={item.label} item={item} onSelect={() => select(item)} />
                  ))}
                </Command.Group>
              ))}
            </Command.List>
            <div className="hidden items-center justify-between border-t px-5 py-2.5 text-xs text-muted-foreground sm:flex">
              <span>Spotlight for this portfolio</span>
              <span className="flex items-center gap-3">
                <Key>↑</Key>
                <Key>↓</Key>
                <span>to move</span>
                <Key>
                  <CornerDownLeft className="h-3 w-3" />
                </Key>
                <span>to open</span>
              </span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

const Key = ({ children }: { children: ReactNode }) => (
  <kbd className="grid h-5 min-w-5 place-items-center rounded-[5px] border bg-background/60 px-1 font-mono text-[0.6875rem]">
    {children}
  </kbd>
);

const SpotlightItem = ({ item, onSelect }: { item: Item; onSelect: () => void }) => {
  const Icon = item.icon;
  return (
    <Command.Item
      value={`${item.label} ${item.hint}`}
      keywords={item.keywords}
      onSelect={onSelect}
      className="group flex h-12 cursor-pointer items-center gap-3 rounded-[14px] px-3 text-[0.9375rem] outline-none transition-colors data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground"
    >
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] ${item.tint}`}>
        <Icon className="h-4 w-4" strokeWidth={2} />
      </span>
      <span className="flex-1 truncate">{item.label}</span>
      <span className="truncate text-[0.8125rem] text-muted-foreground group-data-[selected=true]:text-primary-foreground/80">
        {item.hint}
      </span>
    </Command.Item>
  );
};
