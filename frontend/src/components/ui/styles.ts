/**
 * Shared Tailwind class recipes. Prefer these (or the components in this folder) over
 * re-typing the same utilities, so the design stays consistent.
 *
 * Note: use arbitrary font sizes like text-[13px] rather than text-sm/text-xs — the named
 * sizes also set line-height, which the original design does not.
 */

/** Monospace, tabular figures — numbers, prices, codes. */
export const mono = 'font-mono tabular-nums';

/** Small uppercase mono label above headings/values. */
export const eyebrow =
  'font-mono tabular-nums text-[10px] font-semibold uppercase tracking-[0.1em]';

/** Semantic text tones (previously .purple/.green/.red/.amber/.cyan/.muted). */
export const tone = {
  purple: 'text-violet-3',
  green: 'text-gain',
  red: 'text-loss',
  amber: 'text-amber',
  cyan: 'text-cyan',
  muted: 'text-muted',
} as const;
export type ToneName = keyof typeof tone;

/** Glass panel surface shared by panels and stat cards. */
export const surface =
  'relative min-w-0 rounded-[20px] border border-line [background:linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012)),var(--color-panel)] shadow-[inset_0_1px_0_#ffffff0a,0_20px_50px_#00000030] backdrop-blur-[14px]';

/** Muted footnote under charts and settings sections. */
export const note = 'mt-4 text-[11px] leading-[1.7] text-[#7f7a92]';
