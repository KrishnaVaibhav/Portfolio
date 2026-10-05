import type { CSSProperties, ElementType, ReactNode } from "react";
import { useReveal } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

type RevealProps = {
  as?: ElementType;
  index?: number;
  className?: string;
  children: ReactNode;
};

export const Reveal = ({ as: Tag = "div", index = 0, className, children }: RevealProps) => {
  const ref = useReveal<HTMLElement>();
  return (
    <Tag ref={ref} className={cn("reveal", className)} style={{ "--i": index } as CSSProperties}>
      {children}
    </Tag>
  );
};
