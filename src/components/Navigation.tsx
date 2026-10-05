import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Github, Linkedin } from "lucide-react";
import { usePointerVars } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Certifications", href: "#certifications" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  { label: "GitHub", href: "https://github.com/KrishnaVaibhav", icon: Github },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/krishna-vaibhav-y/", icon: Linkedin },
];

// Highlights the section currently in the middle band of the viewport.
const useActiveSection = (enabled: boolean) => {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const targets = ["#skills", "#experience", "#education", "#projects", "#certifications", "#contact"]
      .map((id) => document.querySelector(id))
      .filter((el): el is Element => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = `#${entry.target.id}`;
            // Education sits between Experience and Projects but has no nav item.
            setActive(id === "#education" ? "#experience" : id);
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((el) => io.observe(el));

    // Clear the highlight while the hero is on screen.
    const hero = document.querySelector("#top");
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(null), {
      rootMargin: "-45% 0px -50% 0px",
    });
    if (hero) heroIo.observe(hero);

    return () => {
      io.disconnect();
      heroIo.disconnect();
    };
  }, [enabled]);

  return active;
};

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const active = useActiveSection(isHome);
  const barRef = usePointerVars<HTMLDivElement>();

  // Sliding glass indicator behind the active link.
  const linksRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  useLayoutEffect(() => {
    const wrap = linksRef.current;
    if (!wrap || !active) {
      setIndicator(null);
      return;
    }
    const btn = wrap.querySelector<HTMLElement>(`[data-href="${active}"]`);
    if (btn) setIndicator({ x: btn.offsetLeft, w: btn.offsetWidth });
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
      navigate("/", { state: { scrollTo: href } });
    }
    setIsOpen(false);
  };

  const goHome = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
    setIsOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-nav px-3 pt-3 md:px-6 md:pt-4">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <nav
        aria-label="Primary"
        className="mx-auto max-w-[1200px] animate-rise-in"
      >
        <div
          ref={barRef}
          className={cn(
            "glass flex h-14 items-center justify-between gap-4 rounded-full pl-2 pr-2 md:pl-2.5",
            isOpen && "rounded-[28px]",
          )}
        >
          {/* Monogram */}
          <button
            onClick={goHome}
            className="group flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3"
            aria-label="Krishna Vaibhav Yadlapalli, back to top"
          >
            <span className="grid h-9 w-9 place-items-center rounded-[12px] bg-foreground font-display text-[13px] font-semibold tracking-tight text-background transition-transform duration-300 group-hover:rotate-[-6deg] group-active:scale-95">
              KV
            </span>
            <span className="hidden text-[15px] font-semibold tracking-[-0.02em] sm:block">
              Krishna Vaibhav
            </span>
          </button>

          {/* Desktop links */}
          <div ref={linksRef} className="relative hidden items-center md:flex">
            <span
              aria-hidden
              className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-foreground/[0.07] shadow-[inset_0_1px_0_hsl(0_0%_100%/0.12)] transition-[transform,width,opacity] duration-500 ease-apple dark:bg-white/[0.09]"
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
                onClick={() => scrollToSection(link.href)}
                aria-current={active === link.href ? "true" : undefined}
                className={cn(
                  "relative h-9 rounded-full px-4 text-sm transition-colors duration-200",
                  active === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Socials (desktop) */}
          <div className="hidden items-center gap-1 md:flex">
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

          {/* Mobile toggle */}
          <button
            className="grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-foreground/[0.06] md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
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
                    className="flex h-12 w-full items-center rounded-2xl px-4 text-[17px] font-medium tracking-[-0.01em] transition-colors hover:bg-foreground/[0.06]"
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
