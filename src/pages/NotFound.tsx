import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { SubtleSkillIcons } from "@/components/SubtleSkillIcons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col">
      <SubtleSkillIcons />
      <Navigation />

      <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
        <Card className="text-center space-y-6 max-w-lg animated-card p-8 rounded-2xl border border-border/50 shadow-xl">
          <div className="space-y-2">
            <h1 className="text-6xl font-black text-primary glitch-effect">404</h1>
            <p className="text-2xl font-medium text-foreground">Page Not Found</p>
          </div>

          <p className="text-muted-foreground">
            The coordinates you are trying to visit seem to be lost in the digital void.
          </p>

          <Link to="/">
            <Button size="lg" className="gap-2 group">
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Return to Base
            </Button>
          </Link>
        </Card>
      </div>

      <footer className="py-8 px-4 border-t border-border bg-muted/30 z-10">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground text-sm">
            © 2025 Krishna Vaibhav Yadlapalli.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
