import { forwardRef, type MouseEvent } from "react";
import { Link, useNavigate, type LinkProps } from "react-router-dom";
import { navigateWithTransition } from "@/lib/view-transition";

/**
 * A router Link whose plain left-clicks run inside a View Transition. Modified
 * clicks (new tab, new window) and non-primary buttons keep normal behaviour.
 */
export const TransitionLink = forwardRef<HTMLAnchorElement, LinkProps>(({ to, onClick, replace, state, ...rest }, ref) => {
  const navigate = useNavigate();
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigateWithTransition(navigate, to, { replace, state });
  };
  return <Link ref={ref} to={to} replace={replace} state={state} onClick={handleClick} {...rest} />;
});
TransitionLink.displayName = "TransitionLink";
