import { Link } from "react-router-dom";

export const Footer = ({ showCredentials = true }: { showCredentials?: boolean }) => (
  <footer className="relative z-content border-t px-5 py-10 md:px-8">
    <div className="mx-auto flex max-w-[1200px] flex-col gap-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
      <p>Copyright © 2026 Krishna Vaibhav Yadlapalli. Built with React, TypeScript, Tailwind CSS and three.js.</p>
      <div className="flex items-center gap-5">
        {showCredentials && <span>Azure Developer Associate, AWS Developer Associate</span>}
        <Link to="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
      </div>
    </div>
  </footer>
);
