'use client';

import { useRef, useState, type FormEvent } from 'react';
import { CheckCircle2, ChevronDown, LoaderCircle, Send } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/cn';
import { contactCard } from './contact-styles';

const field = 'grid gap-2 text-[14px] font-semibold text-[#dedbea]';
const control =
  'w-full min-w-0 rounded-[10px] border border-[#ffffff17] bg-[#080a12] font-sans text-[16px] leading-[1.5] font-normal text-[#f4f2fa] outline-none transition-[border-color,box-shadow] placeholder:text-[#777389] focus:border-[#8b5cf6aa] focus:shadow-[0_0_0_3px_#8b5cf620]';
const singleLine = cn(control, 'min-h-12 px-3');

export function ContactForm({
  defaultTopic = 'Journal support',
  defaultMessage = '',
}: {
  defaultTopic?: string;
  defaultMessage?: string;
}) {
  const [status, setStatus] = useState('');
  const [outcome, setOutcome] = useState<'success' | 'error' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const values = {
      name: fields.get('name'),
      email: fields.get('email'),
      topic: fields.get('topic'),
      message: fields.get('message'),
    };
    inFlight.current = true;
    setSubmitting(true);
    setStatus('');
    setOutcome(null);
    try {
      const result = await api<{ message: string }>(
        '/contact',
        {
          method: 'POST',
          body: JSON.stringify(values),
          signal: AbortSignal.timeout(30000),
        },
        false,
      );
      if (!result?.message) throw new Error('Delivery was not confirmed');
      setStatus(result.message);
      setOutcome('success');
      form.reset();
    } catch (error) {
      setStatus(
        error instanceof ApiError && error.status > 0
          ? error.message
          : 'We could not confirm delivery. Please try again later or use one of our contact links.',
      );
      setOutcome('error');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form
      className={cn(contactCard, 'grid gap-[17px] p-7 max-[560px]:p-[21px]')}
      onSubmit={handleSubmit}
      aria-busy={submitting}
    >
      <div>
        <h2 className="font-display text-[24px] font-semibold tracking-[-0.03em]">
          Send us a message
        </h2>
        <p className="mt-2 text-[14px] leading-[1.6] text-[#a6a2b7]">
          Tell us what you need. We’ll reply to your email.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <label className={field}>
          <span>Your name</span>
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Name"
            className={singleLine}
          />
        </label>
        <label className={field}>
          <span>Email address</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
            className={singleLine}
          />
        </label>
      </div>
      <label className={field}>
        <span>What can we help with?</span>
        <span className="relative">
          <select
            name="topic"
            defaultValue={defaultTopic}
            className={cn(singleLine, 'appearance-none pr-11')}
          >
            <option>Journal support</option>
            <option>Courses</option>
            <option>E-books</option>
            <option>Something else</option>
          </select>
          <ChevronDown
            size={18}
            className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#a6a2b7]"
            aria-hidden="true"
          />
        </span>
      </label>
      <label className={field}>
        <span>Your message</span>
        <textarea
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={5000}
          defaultValue={defaultMessage}
          placeholder="Tell us a little about it..."
          className={cn(control, 'min-h-[130px] resize-y p-3')}
        />
      </label>
      <button
        className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#a78bfa66] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] text-[14px] font-semibold text-white transition-[filter,opacity] enabled:hover:brightness-110 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-2"
        type="submit"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            <Send size={16} aria-hidden="true" /> Send message
          </>
        )}
      </button>
      <p
        className={cn(
          '-mt-1 flex items-start gap-2 text-[14px] leading-[1.6]',
          outcome === 'success'
            ? 'text-[#86efac]'
            : outcome === 'error'
              ? 'text-[#fda4af]'
              : 'text-[#9691aa]',
        )}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {outcome === 'success' && (
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
        )}
        {status || 'Your details will only be used to respond to your enquiry.'}
      </p>
    </form>
  );
}
