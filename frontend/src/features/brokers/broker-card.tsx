import Image from 'next/image';
import { ArrowUpRight, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Broker } from './data';

const logoBackground: Record<Broker['id'], string> = {
  quotex: 'border-[#4b9dff33] bg-[#152540] text-[#90c0ff]',
  binolla: 'border-[#426efb33] bg-[#090a11]',
  xm: 'border-[#ffffff44] bg-[#f5f5f8]',
  elefin: 'border-[#a78bfa33] bg-[#221b35] text-[#c4b5fd]',
  exness: 'border-[#ffde2d55] bg-[#ffde2d] text-[#17160c]',
};

export function BrokerCard({ broker }: { broker: Broker }) {
  return (
    <article
      data-broker={broker.id}
      className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[24px] border border-[#ffffff12] bg-[linear-gradient(145deg,#181522,#0d0e16_70%)] p-7 shadow-[0_16px_45px_#00000025,inset_0_1px_0_#ffffff06] transition-[border-color,box-shadow] duration-300 hover:border-[#a78bfa55] hover:shadow-[0_20px_50px_#00000040] max-[560px]:p-5"
    >
      <div className="flex h-16 items-center justify-between gap-4">
        <span
          className={cn(
            'grid size-16 shrink-0 place-items-center overflow-hidden rounded-[18px] border shadow-[inset_0_1px_0_#ffffff0c]',
            logoBackground[broker.id],
          )}
        >
          {broker.logo ? (
            <Image
              src={broker.logo}
              alt={`${broker.name} logo`}
              width={64}
              height={64}
              unoptimized
              className={cn(
                'h-10 w-10 object-contain',
                broker.id === 'xm' && 'h-8 w-12',
                broker.id === 'binolla' && 'h-14 w-14',
              )}
            />
          ) : (
            <span
              className="font-display text-[24px] font-bold tracking-[-0.07em]"
              aria-label={broker.name}
            >
              {broker.id === 'quotex' ? 'Qx' : broker.id === 'exness' ? 'EX' : 'E'}
            </span>
          )}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium',
            broker.linkType === 'partner'
              ? 'border-[#a78bfa2b] bg-[#a78bfa0d] text-[#c2b0eb]'
              : 'border-[#22d3ee26] bg-[#22d3ee09] text-[#94dce6]',
          )}
        >
          <ExternalLink size={12} aria-hidden="true" />
          {broker.linkType === 'partner' ? 'Partner link' : 'Official website'}
        </span>
      </div>
      <div className="mt-6 min-h-[76px]">
        <h3 className="font-display text-[26px] leading-[1.2] font-semibold tracking-[-0.035em] text-[#f5f2fb]">
          {broker.name}
        </h3>
        <p className="mt-2 text-[14px] leading-[1.6] font-medium text-[#7cd5e5]">
          {broker.tagline}
        </p>
      </div>
      <p className="mt-3 min-h-[80px] flex-1 text-[15px] leading-[1.75] text-[#a7a0b8]">
        {broker.description}
      </p>
      <ul className="mt-6 grid list-none auto-rows-fr grid-cols-2 gap-2 max-[460px]:grid-cols-1">
        {broker.highlights.map((feature) => (
          <li
            key={feature}
            className="flex min-h-11 items-center gap-2 rounded-[10px] border border-[#ffffff08] bg-[#ffffff03] px-3 py-2 text-[13px] leading-[1.5] text-[#d0cbdc]"
          >
            <Check size={14} className="shrink-0 text-[#64cbd7]" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-t border-[#ffffff0c] pt-5 max-[560px]:grid-cols-1">
        <div className="max-[560px]:flex max-[560px]:items-center max-[560px]:justify-between max-[560px]:gap-3">
          <span className="block text-[12px] leading-relaxed text-[#8f879f]">Minimum deposit</span>
          <strong className="mt-1 block text-[14px] leading-relaxed font-medium text-[#e0dbe9] max-[560px]:mt-0">
            {broker.minDeposit}
          </strong>
        </div>
        <a
          href={broker.affiliateUrl}
          target="_blank"
          rel={
            broker.linkType === 'partner' ? 'noopener noreferrer sponsored' : 'noopener noreferrer'
          }
          aria-label={`Visit ${broker.name} (opens in a new tab)`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[11px] border border-[#b6f4ff44] bg-[linear-gradient(110deg,#20b9d6,#42d5e4)] px-5 py-3 text-[14px] font-semibold text-[#061e26] shadow-[0_6px_22px_#22d3ee19,inset_0_1px_0_#ffffff44] transition-[filter,box-shadow] hover:brightness-110 hover:shadow-[0_8px_26px_#22d3ee30] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan max-[560px]:w-full"
        >
          Visit broker <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-[#7e778f]">
        Registration on <span className="text-[#a79bb9]">{broker.domain}</span>
      </p>
    </article>
  );
}
