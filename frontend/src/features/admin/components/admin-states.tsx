import { RotateCw } from 'lucide-react';
import { buttonClass } from '@/components/ui/button';
import { errorBox } from '@/components/ui/form';
import { cn } from '@/lib/cn';

/** Recoverable load error with a retry button. */
export function LoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className={cn(errorBox, 'w-full')} role="alert">
        {message}
      </p>
      <button className={buttonClass({ variant: 'secondary', size: 'sm' })} onClick={onRetry}>
        <RotateCw size={14} /> Try again
      </button>
    </div>
  );
}
