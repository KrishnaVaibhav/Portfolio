import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Monitor, Moon, Sun } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useThemePref, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OptionRow = ({
  selected,
  onSelect,
  icon: Icon,
  label,
  hint,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: typeof Sun;
  label: string;
  hint?: string;
}) => (
  <button
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={cn(
      "flex min-h-10 w-full items-center gap-3 rounded-[12px] px-2.5 py-1.5 text-left transition-colors touch:min-h-11",
      selected ? "text-foreground" : "text-foreground/80 hover:bg-foreground/[0.06]",
    )}
  >
    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
    <span className="flex-1">
      <span className="block text-[0.9375rem]">{label}</span>
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </span>
    {selected && <Check className="h-4 w-4 shrink-0 text-link" strokeWidth={2.25} />}
  </button>
);

/*
  Appearance control, a split button on its own glass pill:
  - the sun / moon flips Light <-> Dark in one click (the common case);
  - the small chevron opens the full menu: Light, Dark, then "System default"
    last, for anyone who wants the page to keep following their device.
  A first-time visitor sees their device's mode shown as Light or Dark.
  Pass the pill height via className (e.g. "h-12").
*/
export const AppearanceButton = ({ className }: { className?: string }) => {
  const [display, dark, setPref] = useThemePref();
  const choose = (pref: ThemePref) => () => setPref(pref);
  const Icon = dark ? Moon : Sun;
  const next = dark ? "light" : "dark";

  return (
    <Popover>
      <PopoverPrimitive.Anchor asChild>
        <div className={cn("glass flex h-11 shrink-0 items-center rounded-full p-1", className)}>
          <button
            onClick={choose(next)}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
            className="grid aspect-square h-full place-items-center rounded-full text-foreground/80 transition-[color,background-color,transform] duration-300 hover:bg-foreground/[0.06] hover:text-foreground active:scale-90"
          >
            <Icon
              key={dark ? "moon" : "sun"}
              className="h-[18px] w-[18px] animate-in fade-in-0 spin-in-45 zoom-in-75 duration-500"
              strokeWidth={1.75}
            />
          </button>
          <PopoverTrigger
            aria-label="More appearance options"
            title="Appearance options"
            className="group grid h-full w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground data-[state=open]:text-foreground"
          >
            <ChevronDown
              className="h-3.5 w-3.5 transition-transform duration-300 ease-apple group-data-[state=open]:rotate-180"
              strokeWidth={2}
            />
          </PopoverTrigger>
        </div>
      </PopoverPrimitive.Anchor>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="glass z-overlay w-60 rounded-[18px] border-0 !bg-[hsl(var(--popover)/0.92)] p-1.5"
      >
        <p className="px-2.5 pb-1 pt-1.5 text-xs font-medium text-muted-foreground">Appearance</p>
        <div role="radiogroup" aria-label="Appearance">
          <OptionRow selected={display === "light"} onSelect={choose("light")} icon={Sun} label="Light" />
          <OptionRow selected={display === "dark"} onSelect={choose("dark")} icon={Moon} label="Dark" />
          <div aria-hidden className="mx-2.5 my-1 h-px bg-border" />
          <OptionRow
            selected={display === "system"}
            onSelect={choose("system")}
            icon={Monitor}
            label="System default"
            hint="Matches your device"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
