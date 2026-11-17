/** Form styling recipes (previously global label/input/.form/.form-grid/.error rules). */

/** <label> wrapping its text and control in a column. */
export const label = 'flex flex-col gap-2 text-[12.5px] font-medium text-[#cdc6dd]';

/** Secondary hint text inside a label, e.g. "(comma separated)". */
export const labelHint = 'text-[11px] font-normal text-muted';

/** Text inputs, selects and textareas. Add `font-mono` for number/date inputs. */
export const input =
  'w-full min-w-0 rounded-[11px] border border-line-strong bg-[#0a0a12cc] px-[13px] py-[11px] text-[#ece8f6] outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[#6f697d] hover:border-[#ffffff26] focus:border-violet focus:bg-[#0d0b18] focus:shadow-[0_0_0_1px_var(--color-violet),0_0_22px_#8b5cf63a] disabled:opacity-60';

export const textarea = `${input} resize-y`;

/** Vertical form layout. */
export const form = 'flex flex-col gap-[18px] [&>p]:text-[13px]';

/** Two-column field grid that collapses on phones. */
export const formGrid = 'grid grid-cols-2 gap-4 max-[700px]:grid-cols-1 max-[700px]:gap-3.5';

/** Right-aligned action row at the bottom of forms and dialogs. */
export const formFooter = 'mt-[22px] flex items-center justify-end gap-2.5';

/** Inline error message (role="alert"). */
export const errorBox =
  'animate-[shake_0.4s] rounded-[11px] border border-[#ff5c6c40] bg-[#ff5c6c14] px-[13px] py-[11px] text-[12.5px] text-[#ffadb5]';
