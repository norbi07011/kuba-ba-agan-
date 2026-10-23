import React, { useRef } from 'react';
import { SectionTitle } from './PageHeader';
import { Reveal } from '../fx/ScrollFx';
import { PARTNERS, type Partner } from '../../data/partners';
import { isFinePointer, prefersReducedMotion } from '../../lib/motion';

/*
 * Partnerzy na stronie głównej:
 *  - duża karta sponsora głównego z obracającą się poświatą na krawędzi i światłem podążającym za kursorem,
 *  - kafle pozostałych partnerów z białymi logo, które przy najechaniu dostają poświatę w barwach marki,
 *  - pasek wszystkich logo przesuwający się bez końca.
 */

/** Światło podążające za kursorem wewnątrz karty (zmienne CSS --mx/--my). */
const useSpot = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return [ref, onMove] as const;
};

const SponsorCard: React.FC<{ p: Partner; onOpen: () => void }> = ({ p, onOpen }) => {
  const [ref, onMove] = useSpot<HTMLButtonElement>();
  return (
    <div className="sponsor-frame relative h-full overflow-hidden p-px">
      <span aria-hidden className="sponsor-spin" />
      <button
        ref={ref}
        type="button"
        onClick={onOpen}
        onPointerMove={onMove}
        data-cursor="Sponsor"
        className="spot group relative flex h-full min-h-[440px] w-full flex-col justify-between overflow-hidden bg-[#0c0b0b] p-7 text-left sm:p-10"
      >
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 60% at 85% 0%, rgba(30,140,80,.28), transparent 60%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(227,19,28,.22), transparent 60%)' }} />
        <span aria-hidden className="display outline-text pointer-events-none absolute -bottom-6 -right-4 text-[180px] leading-none opacity-40">01</span>
        <span className="relative flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5"><span className="bt-ping absolute inset-0 rounded-full bg-[#3ddc84]" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#3ddc84]" /></span>
          <span className="cond text-[13px] font-bold uppercase tracking-[.3em] text-white">Sponsor główny</span>
        </span>
        <img src={p.mono} alt={p.name} className="relative my-8 w-[86%] max-w-[560px] transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" style={{ filter: 'drop-shadow(0 10px 40px rgba(0,0,0,.6))' }} />
        <span className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
          <span>
            <span className="cond block text-[clamp(20px,2vw,26px)] font-semibold leading-snug text-white">{p.lead}</span>
            <span className="mt-3 flex flex-wrap gap-2">
              {p.tags.map(t => <span key={t} className="cond border border-white/15 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.12em] text-steel">{t}</span>)}
            </span>
          </span>
          <span className="cond inline-flex items-center gap-3 text-[14px] font-bold uppercase tracking-[.16em] text-white">
            Poznaj sponsora
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full border border-white/25 transition-all duration-500 group-hover:-rotate-45 group-hover:border-blood group-hover:bg-blood">→</span>
          </span>
        </span>
      </button>
    </div>
  );
};

const PartnerTile: React.FC<{ p: Partner; onOpen: () => void }> = ({ p, onOpen }) => {
  const [ref, onMove] = useSpot<HTMLButtonElement>();
  return (
    <button
      ref={ref}
      type="button"
      onClick={onOpen}
      onPointerMove={onMove}
      data-cursor="Partner"
      className="spot group relative flex h-full min-h-[210px] w-full flex-col justify-between overflow-hidden border border-white/10 bg-white/[.025] p-6 text-left backdrop-blur-sm transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-white/25"
      style={{ ['--glow' as string]: p.glow }}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 120%, ${p.glow}, transparent 70%)` }} />
      <span className="relative flex items-start justify-between gap-3">
        <span className="mono text-[11px] uppercase text-steel-dim">{p.role.replace('Partner · ', '')}</span>
        <span aria-hidden className="text-steel-dim transition-all duration-500 group-hover:-rotate-45 group-hover:text-white">→</span>
      </span>
      <span className="relative grid flex-1 place-items-center py-5">
        <img src={p.mono} alt="" loading="lazy" className="max-h-[72px] w-auto max-w-[78%] object-contain opacity-80 transition-all duration-700 group-hover:scale-110 group-hover:opacity-100" />
      </span>
      <span className="relative cond text-[15px] font-bold uppercase tracking-[.12em] text-white">{p.name}</span>
    </button>
  );
};

export const PartnersShowcase: React.FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const sponsor = PARTNERS.find(p => p.sponsor) ?? PARTNERS[0];
  const rest = PARTNERS.filter(p => p !== sponsor);
  const strip = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  return (
    <section aria-labelledby="partnerzy-home" className="relative overflow-hidden py-24 sm:py-32">
      <div className="wrap">
        <SectionTitle id="partnerzy-home" eyebrow="Partnerzy klubu" a="Stoją" b="w naszym narożniku" text="Firmy, które wspierają Bałagan Team – od sponsora głównego po sprzęt, suplementy, dietę, księgowość, serwis rowerowy i detailing. Kliknij, żeby poznać ich bliżej." />
        <div className="mt-14 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <Reveal className="h-full"><SponsorCard p={sponsor} onOpen={onOpen} /></Reveal>
          <div className="grid grid-cols-2 gap-4">
            {rest.map((p, i) => (
              <Reveal key={p.id} delay={80 + i * 70} className="h-full"><PartnerTile p={p} onOpen={onOpen} /></Reveal>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="relative mt-16 overflow-hidden border-y border-white/10 py-8" style={{ WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
        <div className="bt-slide flex w-max items-center gap-16 sm:gap-24" style={{ animationDuration: '40s' }}>
          {[...strip, ...strip].map((p, i) => (
            <img key={i} src={p.mono} alt="" className="h-10 w-auto max-w-[200px] object-contain opacity-45 sm:h-12" />
          ))}
        </div>
      </div>
    </section>
  );
};
