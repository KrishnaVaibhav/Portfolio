import { TransitionLink } from "./TransitionLink";

export const Footer = () => (
  <footer className="relative z-content border-t px-[var(--gutter)] py-8">
    <div className="page flex flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
      <p>Copyright © 2026 Krishna Vaibhav Yadlapalli. Built with React, TypeScript and Tailwind CSS.</p>
      <div className="flex items-center gap-5">
        <TransitionLink to="/" className="-mx-2 -my-2 px-2 py-2 transition-colors hover:text-foreground touch:-my-3.5 touch:py-3.5">
          Home
        </TransitionLink>
      </div>
    </div>
  </footer>
);
