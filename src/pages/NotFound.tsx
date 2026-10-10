import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background text-foreground">
      <AmbientBackground />
      <Navigation />

      <main id="main" className="relative z-content flex flex-1 items-center px-[var(--gutter)] pt-24">
        <div className="page">
          <p className="font-mono text-sm text-muted-foreground tabular">404</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] animate-rise-in">
            This page
            <br />
            doesn't exist<span className="text-link">.</span>
          </h1>
          <p className="mt-6 max-w-[48ch] text-lg text-muted-foreground">
            Nothing lives at <span className="font-mono text-foreground">{location.pathname}</span>. Head back to the portfolio to keep looking around.
          </p>
          <Button asChild size="lg" className="group mt-10">
            <Link to="/">
              <ArrowLeft className="transition-transform duration-300 group-hover:-translate-x-0.5" />
              Back to portfolio
            </Link>
          </Button>
        </div>
      </main>

      <Footer showCredentials={false} />
    </div>
  );
};

export default NotFound;
