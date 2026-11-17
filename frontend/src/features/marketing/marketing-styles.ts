/** Tailwind recipes shared by several marketing pages/components. */

/** Page wrapper for marketing routes (previously .home). */
export const home = 'relative overflow-x-clip bg-bg text-fg';

/** Small mono kicker above section titles; an optional leading <span /> renders a fade line. */
export const sectionLabel =
  'inline-flex items-center gap-2.5 font-mono text-[11px] leading-[normal] font-semibold tracking-[0.16em] text-violet-2 [&>span]:h-px [&>span]:w-[22px] [&>span]:bg-[linear-gradient(90deg,transparent,#a78bfa)]';

/** Animated violet→cyan gradient text (previously .gradientText). */
export const gradientText =
  'animate-[lp-shimmer_8s_ease-in-out_infinite_alternate] bg-[linear-gradient(100deg,#e9ddff_0%,#a78bfa_38%,#8b5cf6_58%,#22d3ee_100%)] bg-[length:220%_100%] bg-clip-text text-transparent';
