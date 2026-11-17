import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * By default tailwind-merge treats any font-size class as overriding line-height (because
 * named sizes like `text-sm` set both). This codebase only uses arbitrary sizes such as
 * `text-[13px]`, which set font-size alone, so a size must not silently drop `leading-*`.
 */
const twMerge = extendTailwindMerge({
  override: { conflictingClassGroups: { 'font-size': [] } },
});

/** Joins class names and lets later Tailwind classes override earlier conflicting ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
