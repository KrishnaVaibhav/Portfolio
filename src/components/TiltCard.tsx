import type { ElementType, ReactNode } from "react";
import { usePointerVars } from "@/hooks/use-motion";
import { cn } from "@/lib/utils";

type TiltCardProps = {
  as?: ElementType;
  tilt?: number;
  className?: string;
  children: ReactNode;
};

/** Surface that tilts toward the pointer in 3D and lights its rim under the cursor. */
export const TiltCard = ({ as: Tag = "div", tilt = 6, className, children }: TiltCardProps) => {
  const ref = usePointerVars<HTMLElement>({ tilt });
  return (
    <Tag ref={ref} className={cn("tilt spotlight", className)}>
      {children}
    </Tag>
  );
};
