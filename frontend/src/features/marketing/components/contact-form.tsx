'use client';

import { useState, type FormEvent } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT_EMAIL as contactEmail } from '@/config/env';
import { cn } from '@/lib/cn';
import { contactCard } from './contact-styles';

const field = 'grid gap-2 text-[11px] font-semibold text-[#dedbea]';
const control =
  'w-full min-w-0 rounded-[10px] border border-[#ffffff17] bg-[#080a12] font-sans text-[12px] leading-[normal] font-normal text-[#f4f2fa] outline-none [transition:border-color_0.2s,box-shadow_0.2s] placeholder:text-[#666479] focus:border-[#8b5cf6aa] focus:shadow-[0_0_0_3px_#8b5cf620]';
const singleLine = cn(control, 'min-h-[43px] px-3');

export function ContactForm({
  defaultTopic = 'Journal support',
  defaultMessage = '',
}: {
  defaultTopic?: string;
  defaultMessage?: string;
}) {
  const [status, setStatus] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contactEmail) {
      setStatus('The contact email has not been configured yet.');
      return;
    }

    const values = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`ET Trader enquiry: ${values.get('topic')}`);
    const body = encodeURIComponent(
      `Name: ${values.get('name')}\nEmail: ${values.get('email')}\n\n${values.get('message')}`,
    );
    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    setStatus('Your email app is opening with your message. Send it there to complete delivery.');
  }

  return (
    <form
      className={cn(contactCard, 'grid gap-[17px] p-7 max-[560px]:p-[21px]')}
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-2 gap-[14px] max-[560px]:grid-cols-1">
        <label className={field}>
          <span>Your name</span>
          <input
            name="name"
            autoComplete="name"
            required
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
            placeholder="you@example.com"
            className={singleLine}
          />
        </label>
      </div>
      <label className={field}>
        <span>What can we help with?</span>
        <select name="topic" defaultValue={defaultTopic} className={singleLine}>
          <option>Journal support</option>
          <option>Courses</option>
          <option>E-books</option>
          <option>Something else</option>
        </select>
      </label>
      <label className={field}>
        <span>Your message</span>
        <textarea
          name="message"
          rows={6}
          required
          defaultValue={defaultMessage}
          placeholder="Tell us a little about it..."
          className={cn(control, 'min-h-[130px] resize-y p-3')}
        />
      </label>
      <button
        className="inline-flex min-h-[45px] cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-[#a78bfa66] bg-[linear-gradient(110deg,#6d28d9,#8b5cf6)] text-[12px] font-bold text-white [transition:transform_0.2s,translate_0.2s,filter_0.2s] enabled:hover:-translate-y-px enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-[0.58]"
        type="submit"
        disabled={!contactEmail}
      >
        Prepare email <ArrowUpRight size={16} />
      </button>
      <p className="-mt-1.5 text-[10px] leading-[1.5] text-[#858198]" aria-live="polite">
        {status ||
          (contactEmail
            ? 'Your email app will open with the message ready to send.'
            : 'Email delivery will be enabled when the contact address is added.')}
      </p>
    </form>
  );
}
