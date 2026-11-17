'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { iconButtonClass } from './button';
import { PanelHeader } from './panel';
import { eyebrow } from './styles';

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const before = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = before;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="m-auto max-h-[90vh] w-[min(660px,calc(100vw-28px))] overflow-y-auto rounded-[24px] border border-[#a78bfa33] p-0 text-fg shadow-[0_40px_120px_#000000cc,0_0_0_1px_#00000080,inset_0_1px_0_#ffffff12] [background:radial-gradient(120%_60%_at_0%_0%,#8b5cf61c,transparent_60%),linear-gradient(180deg,#17142a,#0f0e19)] open:animate-[modal-in_0.45s_cubic-bezier(0.2,0.9,0.3,1.15)_both] [&_table]:text-[12px]"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="p-7 max-[700px]:px-4 max-[700px]:py-[22px]">
        <PanelHeader className="items-start">
          <div>
            <span className={cn(eyebrow, 'text-violet-3')}>YOUR TRADING JOURNAL</span>
            <h2 className="mt-1.5 font-display text-[24px] tracking-[-0.04em] max-[700px]:text-[21px]">
              {title}
            </h2>
          </div>
          <button className={iconButtonClass()} aria-label="Close dialog" onClick={onClose}>
            <X size={20} />
          </button>
        </PanelHeader>
        {children}
      </div>
    </dialog>
  );
}
