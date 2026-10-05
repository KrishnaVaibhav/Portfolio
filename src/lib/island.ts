// Tiny event bus for the Dynamic Island in the navigation. Anything on the
// page can surface a short status message there (e.g. "Email copied").

export type IslandTone = "success" | "info";
export type IslandMessage = { id: number; text: string; tone: IslandTone };

const EVENT = "island:notify";
let seq = 0;

export const notifyIsland = (text: string, tone: IslandTone = "success") => {
  window.dispatchEvent(new CustomEvent<IslandMessage>(EVENT, { detail: { id: ++seq, text, tone } }));
};

export const onIsland = (handler: (msg: IslandMessage) => void) => {
  const listener = (e: Event) => handler((e as CustomEvent<IslandMessage>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
};

export const copyToClipboard = async (value: string, label: string) => {
  try {
    await navigator.clipboard.writeText(value);
    notifyIsland(`${label} copied`);
  } catch {
    notifyIsland(`Couldn't copy. ${value}`, "info");
  }
};

// Spotlight is opened from the nav, the keyboard and the hero.
const SPOTLIGHT = "spotlight:open";
export const openSpotlight = () => window.dispatchEvent(new Event(SPOTLIGHT));
export const onSpotlight = (handler: () => void) => {
  window.addEventListener(SPOTLIGHT, handler);
  return () => window.removeEventListener(SPOTLIGHT, handler);
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
export const spotlightShortcut = isMac ? "⌘K" : "Ctrl K";
