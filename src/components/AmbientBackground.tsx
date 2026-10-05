// Page-wide backdrop: two slow-moving light pools in the accent hue plus a
// fixed film grain. Both sit on fixed, pointer-events-none layers so they
// never repaint with scrolling content.
export const AmbientBackground = () => (
  <>
    <div aria-hidden className="pointer-events-none fixed inset-0 z-base overflow-hidden">
      <div className="absolute -top-[30vh] left-[-10vw] h-[80vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,hsl(var(--primary)/0.10),transparent)] blur-2xl motion-safe:animate-[drift_28s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-35vh] right-[-15vw] h-[90vh] w-[70vw] rounded-full bg-[radial-gradient(closest-side,hsl(var(--link)/0.07),transparent)] blur-2xl motion-safe:animate-[drift_34s_ease-in-out_infinite_reverse]" />
    </div>
    <div aria-hidden className="grain" />
  </>
);
