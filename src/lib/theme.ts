import { useEffect, useState } from "react";

/*
  Appearance. A first-time visitor sees their device's mode, presented as
  plain Light or Dark. Choosing Light or Dark pins it; choosing "System
  default" (the last option) keeps following the device. Pinned choices are
  applied as <html data-theme="…">, which the CSS tokens and Tailwind's dark:
  variant respect; index.html applies a saved choice before first paint.
*/
export type ThemePref = "system" | "light" | "dark";
/** What the control shows: an explicit choice, or the device's mode before any choice. */
export type ThemeDisplay = ThemePref;

const KEY = "theme";
const EVENT = "themechange";
const BG = { light: "#fbfbfd", dark: "#09090b" };

/** The stored choice, or null when the visitor has not chosen yet. */
export const getStoredPref = (): ThemePref | null => {
  try {
    const v = localStorage.getItem(KEY);
    return v === "light" || v === "dark" || v === "system" ? v : null;
  } catch {
    return null;
  }
};

/** The behaviour in effect: an unset choice behaves like the device setting. */
export const getThemePref = (): ThemePref => getStoredPref() ?? "system";

/** What the control should show as selected. */
export const getThemeDisplay = (): ThemeDisplay => {
  const stored = getStoredPref();
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

/** Whether the page is currently showing its dark appearance. */
export const isDarkResolved = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
};

// Browser chrome (mobile address bar etc.) follows the visible appearance.
const syncThemeColor = (pref: ThemePref) => {
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]');
  metas.forEach((m) => {
    const forDark = m.media.includes("dark");
    m.content = pref === "system" ? (forDark ? BG.dark : BG.light) : BG[pref];
  });
};

const apply = (pref: ThemePref) => {
  const root = document.documentElement;
  if (pref === "system") delete root.dataset.theme;
  else root.dataset.theme = pref;
  syncThemeColor(pref);
  window.dispatchEvent(new CustomEvent<ThemePref>(EVENT, { detail: pref }));
};

type ViewTransition = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void> };
type DocWithVT = Document & { startViewTransition?: (cb: () => void) => ViewTransition };

export const setThemePref = (pref: ThemePref) => {
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* storage unavailable (private mode); the choice still applies for this visit */
  }

  const doc = document as DocWithVT;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduced || doc.visibilityState !== "visible") {
    apply(pref);
    return;
  }
  // Cross-fade the page between appearances instead of snapping.
  const root = document.documentElement;
  root.classList.add("theme-switching");
  const t = doc.startViewTransition(() => apply(pref));
  const ignore = () => undefined;
  t.ready.catch(ignore);
  t.updateCallbackDone.catch(ignore);
  t.finished.catch(ignore).finally(() => root.classList.remove("theme-switching"));
};

/** Subscribe to appearance changes, whether chosen here, in another tab, or by the device. */
export const onAppearanceChange = (handler: () => void) => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) apply(getThemePref());
  };
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", onStorage);
  mq.addEventListener("change", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", handler);
  };
};

/** [what to show as selected, whether the page is dark, setter] */
export const useThemePref = () => {
  const [display, setDisplay] = useState<ThemeDisplay>(getThemeDisplay);
  const [dark, setDark] = useState<boolean>(isDarkResolved);
  useEffect(
    () =>
      onAppearanceChange(() => {
        setDisplay(getThemeDisplay());
        setDark(isDarkResolved());
      }),
    [],
  );
  return [display, dark, setThemePref] as const;
};
