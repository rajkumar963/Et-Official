/** Fixed, decorative page background: two drifting colour orbs over a fading dot grid. */
export function AmbientBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-1 overflow-hidden" aria-hidden="true">
      <i className="absolute top-[-260px] left-[18%] h-[520px] w-[680px] animate-[ambient-drift_24s_ease-in-out_infinite_alternate] rounded-full bg-[radial-gradient(circle,#7c3aed,transparent_65%)] opacity-[0.32] blur-[110px]" />
      <i className="absolute right-[-120px] bottom-[-260px] h-[460px] w-[560px] animate-[ambient-drift_30s_ease-in-out_infinite_alternate-reverse] rounded-full bg-[radial-gradient(circle,#0891b2,transparent_65%)] opacity-[0.22] blur-[110px]" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:26px_26px] [mask-image:radial-gradient(ellipse_80%_60%_at_60%_0%,#000_10%,transparent_70%)]" />
    </div>
  );
}
