import { cn } from '@/lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'destructive';
type ButtonSize = 'md' | 'sm';

const base =
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-[11px] border border-transparent px-[17px] py-[11px] text-[13px] leading-[1.4] font-semibold';

const variants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-[linear-gradient(135deg,#8b5cf6_0%,#6d28d9_60%,#5b21b6_100%)] shadow-[0_0_0_1px_#c4b5fd40_inset,0_1px_0_#ffffff35_inset,0_8px_26px_#7c3aed55] after:absolute after:inset-0 after:content-[''] after:bg-[linear-gradient(110deg,transparent_30%,#ffffff40_50%,transparent_70%)] after:-translate-x-[120%] after:transition-transform after:duration-700 after:ease-smooth hover:-translate-y-px hover:shadow-[0_0_0_1px_#ddd6fe70_inset,0_1px_0_#ffffff40_inset,0_12px_34px_#7c3aed88] hover:after:translate-x-[120%] active:translate-y-0 active:scale-[0.98]",
  secondary:
    'border-line-strong bg-[#ffffff08] text-[#e2dfee] hover:border-[#a78bfa66] hover:bg-[#a78bfa14] hover:text-white',
  destructive:
    'border-[#ff5c6c55] bg-[#ff5c6c1c] text-[#ff98a2] hover:border-[#ff5c6c99] hover:bg-[#ff5c6c2c] hover:shadow-[0_8px_26px_#ff5c6c30]',
};

const sizes: Record<ButtonSize, string> = {
  md: '',
  sm: 'rounded-[9px] px-3 py-2 text-[12px]',
};

/** Classes for a <button>, <Link> or <a> styled as a button (previously .button.*). */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);
}

/** Square icon-only button (previously .icon-button, .danger, .bordered). */
export function iconButtonClass({
  danger = false,
  bordered = false,
  className,
}: { danger?: boolean; bordered?: boolean; className?: string } = {}) {
  return cn(
    'inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] border-0 bg-transparent text-[#b2adc3] hover:bg-[#ffffff0d] hover:text-fg',
    danger && 'hover:bg-[#ff5c6c18] hover:text-loss',
    bordered &&
      'border border-line-strong bg-[#ffffff05] hover:border-[#a78bfa66] hover:bg-[#ffffff05]',
    className,
  );
}

/** Inline violet text link whose arrow icon nudges on hover (previously .text-link). */
export const textLinkClass =
  'inline-flex items-center gap-[5px] border-0 bg-transparent p-0 text-[12px] font-semibold text-violet-3 hover:text-white [&_svg]:transition-transform [&_svg]:duration-[250ms] [&_svg]:ease-smooth hover:[&_svg]:translate-x-0.5 hover:[&_svg]:-translate-y-0.5';
