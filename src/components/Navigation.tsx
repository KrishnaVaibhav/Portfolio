import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Github, Linkedin, Search, Check, Info } from "lucide-react";
import { usePointerVars } from "@/hooks/use-motion";
import { onIsland, openSpotlight, spotlightShortcut, type IslandMessage } from "@/lib/island";
import { profile } from "@/data/profile";
import { navigateWithTransition } from "@/lib/view-transition";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "GitHub", href: profile.github, icon: Github },
  { label: "LinkedIn", href: profile.linkedin, icon: Linkedin },
];

// Highlights the section currently in the middle band of the viewport.
const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const band = { rootMargin: "-45% 0px -50% 0px" };
    const targets = ["#top", "#about", "#skills", "#experience", "#education", "#projects", "#certifications", "#contact"]
      .map((id) => document.querySelector(id))
      .filter((el): el is Element => !!el);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = `#${entry.target.id}`;
        // Hero and About have no nav item; Education sits inside the Experience stretch.
        setActive(id === "#top" || id === "#about" ? null : id === "#education" ? "#experience" : id);
      }
    }, band);
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);

  return active;
};

// Latest island message, cleared after it has been on screen for a moment.
const useIslandMessage = () => {
  const [msg, setMsg] = useState<IslandMessage | null>(null);
  useEffect(() => {
    let timer = 0;
    const off = onIsland((m) => {
      setMsg(m);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setMsg(null), 2400);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);
  return msg;
};

const IslandToast = ({ msg }: { msg: IslandMessage }) => (
  <span className="flex items-center gap-3 whitespace-nowrap pl-2 pr-5">
    <span
      className={cn(
        "grid h-8 w-8 place-items-center rounded-full",
        msg.tone === "success" ? "bg-[#30d158] text-black" : "bg-white/15 text-white",
      )}
    >
      {msg.tone === "success" ? <Check className="h-4 w-4" strokeWidth={3} /> : <Info className="h-4 w-4" />}
    </span>
    <span className="text-[0.9375rem] font-medium tracking-[-0.01em]">{msg.text}</span>
  </span>
);

/** Monogram wrapped in a ring that fills with page scroll (CSS scroll timeline). */
const Monogram = () => (
  <span className="relative grid h-10 w-10 place-items-center">
    <svg aria-hidden viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
      <circle cx="20" cy="20" r="18.5" fill="none" strokeWidth="1.5" className="stroke-foreground/10" />
      <circle
        cx="20"
        cy="20"
        r="18.5"
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="100"
        className="scroll-ring stroke-link"
      />
    </svg>
    <span className="grid h-8 w-8 place-items-center rounded-full bg-foreground font-display text-[0.6875rem] font-semibold tracking-tight text-background">
      KV
    </span>
  </span>
);

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const active = useActiveSection(isHome);
  const msg = useIslandMessage();
  const leftRef = usePointerVars<HTMLButtonElement>();
  const rightRef = usePointerVars<HTMLDivElement>();

  // Island geometry: measure whichever layer is showing and morph to fit it.
  const linksRef = useRef<HTMLDivElement>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      const layer = msg ? toastRef.current : linksRef.current;
      if (layer) setSize({ w: layer.offsetWidth, h: msg ? 52 : 44 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (linksRef.current) ro.observe(linksRef.current);
    return () => ro.disconnect();
  }, [msg]);

  // Sliding highlight behind the active link.
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const wrap = linksRef.current;
    const btn = active ? wrap?.querySelector<HTMLElement>(`[data-href="${active}"]`) : null;
    setIndicator(btn ? { x: btn.offsetLeft, w: btn.offsetWidth } : null);
  }, [active]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // These section anchors only exist on the home page. From any other route
  // (e.g. /signals, 404) navigate home first, then scroll once it's mounted.
  const scrollToSection = (href: string) => {
    if (isHome) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigateWithTransition(navigate, "/", { state: { scrollTo: href } });
    }
    setIsOpen(false);
  };

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigateWithTransition(navigate, "/");
    }
    setIsOpen(false);
  };

  return (
    <header className="site-header fixed inset-x-0 top-0 z-nav px-3 pt-3 md:px-[var(--gutter)] md:pt-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      {/* Announce island messages to assistive tech */}
      <div className="sr-only" role="status" aria-live="polite">
        {msg?.text}
      </div>

      <nav aria-label="Primary" className="page animate-rise-in">
        {/* Desktop: three floating pieces */}
        <div className="hidden grid-cols-[1fr_auto_1fr] items-center gap-4 md:grid">
          <button
            ref={leftRef}
            onClick={goHome}
            className="glass group flex items-center gap-2.5 justify-self-start rounded-full py-1 pl-1 pr-4 transition-transform active:scale-[0.97]"
            aria-label="Krishna Vaibhav Yadlapalli, back to top"
          >
            <Monogram />
            <span className="hidden text-[0.9375rem] font-semibold tracking-[-0.02em] lg:block">Krishna Vaibhav</span>
          </button>

          {/* Dynamic Island */}
          <div
            className="relative overflow-hidden rounded-full bg-[#09090b] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] transition-[width,height] duration-500 ease-apple"
            style={size ? { width: size.w, height: size.h } : undefined}
          >
            <div
              ref={linksRef}
              className={cn(
                "flex w-max items-center p-1 transition-all duration-300",
                size && "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                msg ? "pointer-events-none scale-90 opacity-0 blur-sm" : "opacity-100",
              )}
              aria-hidden={!!msg}
            >
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-9 -translate-y-1/2 rounded-full bg-white/[0.14] transition-[transform,width,opacity] duration-500 ease-apple"
                style={{
                  width: indicator?.w ?? 0,
                  transform: `translate3d(${indicator?.x ?? 0}px, -50%, 0)`,
                  opacity: indicator ? 1 : 0,
                }}
              />
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  data-href={link.href}
                  tabIndex={msg ? -1 : 0}
                  onClick={() => scrollToSection(link.href)}
                  aria-current={active === link.href ? "true" : undefined}
                  className={cn(
                    "relative h-9 rounded-full px-4 text-sm transition-colors duration-200",
                    active === link.href ? "text-white" : "text-white/60 hover:text-white",
                  )}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div
              ref={toastRef}
              aria-hidden
              className={cn(
                "absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-apple",
                msg ? "scale-100 opacity-100 blur-0 delay-100" : "pointer-events-none scale-110 opacity-0 blur-sm",
              )}
            >
              {msg && <IslandToast msg={msg} />}
            </div>
          </div>

          <div ref={rightRef} className="glass flex items-center gap-1 justify-self-end rounded-full p-1">
            <button
              onClick={openSpotlight}
              className="flex h-10 items-center gap-2 rounded-full pl-3 pr-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              aria-label={`Search (${spotlightShortcut})`}
            >
              <Search className="h-4 w-4" strokeWidth={1.75} />
              <kbd className="hidden whitespace-nowrap rounded-md border border-foreground/10 px-1.5 font-mono text-[0.6875rem] lg:inline">{spotlightShortcut}</kbd>
            </button>
            {socials.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </a>
            ))}
          </div>
        </div>

        {/* Mobile bar */}
        <div className="glass relative flex h-14 items-center justify-between rounded-full px-1.5 md:hidden">
          <button onClick={goHome} className="rounded-full p-1" aria-label="Krishna Vaibhav Yadlapalli, back to top">
            <Monogram />
          </button>

          {/* Island toast, centred over the bar */}
          <div
            aria-hidden
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-[#09090b] py-1.5 text-white shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] transition-all duration-500 ease-apple",
              msg ? "scale-100 opacity-100" : "pointer-events-none scale-50 opacity-0",
            )}
          >
            {msg && <IslandToast msg={msg} />}
          </div>

          <div className="flex items-center">
            <button
              onClick={openSpotlight}
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-foreground/[0.06]"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-foreground/[0.06]"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            id="mobile-menu"
            className="glass mt-2 origin-top !bg-popover animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 rounded-[28px] p-2 duration-300 md:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="flex h-12 w-full items-center rounded-2xl px-4 text-[1.0625rem] font-medium tracking-[-0.01em] transition-colors hover:bg-foreground/[0.06]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2 border-t px-2 pt-3">
              {socials.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground hover:bg-foreground/[0.06] hover:text-foreground"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
