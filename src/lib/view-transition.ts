import { flushSync } from "react-dom";
import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";

type ViewTransition = {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
};

type DocumentWithTransitions = Document & {
  startViewTransition?: (update: () => void) => ViewTransition;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Navigate inside a View Transition (cross-fade with a slight depth change,
 * styled in index.css). Falls back to a plain navigation where the API is
 * missing or the visitor prefers reduced motion.
 */
export const navigateWithTransition = (navigate: NavigateFunction, to: To, options?: NavigateOptions) => {
  const doc = document as DocumentWithTransitions;
  // Transitions only run in a visible document; a background tab just navigates.
  if (!doc.startViewTransition || reducedMotion() || doc.visibilityState !== "visible") {
    navigate(to, options);
    return;
  }
  const transition = doc.startViewTransition(() => {
    flushSync(() => navigate(to, options));
  });
  // An interrupted transition (tab hidden mid-way, a second click) is harmless:
  // the navigation still happens, so don't let it surface as an error.
  const ignore = () => undefined;
  transition.ready.catch(ignore);
  transition.finished.catch(ignore);
  transition.updateCallbackDone.catch(ignore);
};
