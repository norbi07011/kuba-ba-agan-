import React from 'react';
import { PageHeader, NextPage } from '../components/sections/PageHeader';
import { Reveal, TiltCard, VelocityMarquee } from '../components/fx/ScrollFx';
import { MagneticLink } from '../components/fx/Kinetic';
import { PARTNERS, type PartnerLink } from '../data/partners';
import { waLink } from '../data/site';
import type { PageProps } from './types';
import { IMG } from '../data/content';

const ICON: Record<PartnerLink['type'], React.ReactNode> = {
  website: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />,
  shop: <><path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r=".6" fill="currentColor" /></>,
  facebook: <path d="M14 8h3V4.5h-3c-2.5 0-4 1.6-4 4V11H7.5v3.5H10V21h3.5v-6.5H16l.6-3.5h-3.1V8.7c0-.4.3-.7.5-.7Z" />,
  phone: <path d="M6.6 3.5 9 3l2 4.5-2 1.5a11 11 0 0 0 5.9 5.9l1.5-2L21 15l-.5 2.4A2 2 0 0 1 18.6 19C10.4 19 5 13.6 5 5.4a2 2 0 0 1 1.6-1.9Z" />,
  maps: <><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
};

const PartnerCard: React.FC<{ p: (typeof PARTNERS)[number]; i: number }> = ({ p, i }) => (
  <Reveal delay={(i % 2) * 120} className="h-full">
    <TiltCard max={6} className="group h-full">
      <article className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink-2" style={{ boxShadow: `0 40px 80px -50px ${p.glow}` }}>
        {/* poświata w barwach marki */}
        <div aria-hidden className="pointer-events-none absolute -right-1/4 -top-1/3 h-[80%] w-[90%] rounded-full opacity-60 blur-3xl transition-opacity duration-700 group-hover:opacity-100" style={{ background: `radial-gradient(circle, ${p.glow}, transparent 65%)` }} />
        {/* tabliczka z logo */}
        <div className="relative m-4 mb-0 grid h-[190px] place-items-center overflow-hidden sm:h-[220px]" style={{ background: p.plate, transform: 'translateZ(40px)' }}>
          <div aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{ background: 'linear-gradient(115deg, transparent 35%, rgba(255,255,255,.35) 50%, transparent 65%)', mixBlendMode: p.plate === '#ffffff' ? 'normal' : 'screen' }} />
          <img src={p.logo} alt={`Logo ${p.name}`} loading="lazy" className="absolute inset-0 m-auto h-[72%] w-[80%] object-contain transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.06]" />
          <span className="cond absolute left-3 top-3 bg-blood px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-white">{p.role}</span>
        </div>
        <div className="relative flex flex-1 flex-col p-6 sm:p-7" style={{ transform: 'translateZ(24px)' }}>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="display text-[clamp(32px,3.6vw,46px)] leading-[1.02] text-white">{p.name}</h2>
            {p.city && <span className="mono text-[12px] uppercase text-steel-dim">{p.city}</span>}
          </div>
          <p className="cond mt-3 text-[19px] font-semibold leading-snug text-steel">{p.lead}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-steel-dim">{p.text}</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {p.tags.map(t => <li key={t} className="cond border border-white/12 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.12em] text-steel">{t}</li>)}
          </ul>
          <div className="mt-auto pt-6">
            {p.links.length ? (
              <ul className="flex flex-col gap-1 border-t border-white/10 pt-4">
                {p.links.map(l => (
                  <li key={l.url}>
                    <a href={l.url} target={l.type === 'phone' ? undefined : '_blank'} rel="noopener noreferrer" className="group/l flex items-center gap-3 py-1.5 text-[15px] text-white transition-colors hover:text-ember">
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0 text-blood" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{ICON[l.type]}</svg>
                      <span className={l.type === 'phone' ? 'mono select-all' : ''}>{l.label}</span>
                      <span aria-hidden className="ml-auto text-steel-dim transition-transform group-hover/l:translate-x-1">→</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="border-t border-white/10 pt-4 text-[14px] text-steel-dim">Strona partnera wkrótce.</p>
            )}
          </div>
        </div>
      </article>
    </TiltCard>
  </Reveal>
);


/** Sponsor główny – szeroka karta z obracającą się poświatą na krawędzi. */
const SponsorFeature: React.FC<{ p: (typeof PARTNERS)[number] }> = ({ p }) => (
  <Reveal className="md:col-span-2">
    <div className="sponsor-frame relative overflow-hidden p-px">
      <span aria-hidden className="sponsor-spin" />
      <article className="relative grid overflow-hidden bg-[#0c0b0b] lg:grid-cols-[1fr_1fr]">
        <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 70% at 0% 0%, rgba(30,140,80,.3), transparent 60%), radial-gradient(ellipse 50% 60% at 100% 100%, rgba(227,19,28,.22), transparent 60%)' }} />
        <div className="relative grid min-h-[320px] place-items-center p-10 sm:p-14">
          <img src={p.mono} alt={`Logo ${p.name}`} className="w-full max-w-[520px]" style={{ filter: 'drop-shadow(0 12px 40px rgba(0,0,0,.6))' }} />
        </div>
        <div className="relative flex flex-col justify-center border-t border-white/10 p-8 sm:p-12 lg:border-l lg:border-t-0">
          <span className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5"><span className="bt-ping absolute inset-0 rounded-full bg-[#3ddc84]" /><span className="relative h-2.5 w-2.5 rounded-full bg-[#3ddc84]" /></span>
            <span className="cond text-[13px] font-bold uppercase tracking-[.3em] text-white">Sponsor główny</span>
          </span>
          <h2 className="display mt-5 text-[clamp(44px,5vw,76px)] leading-[.98] text-white">{p.name}</h2>
          <p className="cond mt-4 text-[clamp(19px,1.8vw,24px)] font-semibold leading-snug text-steel">{p.lead}</p>
          <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-steel-dim">{p.text}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.tags.map(t => <li key={t} className="cond border border-white/15 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.12em] text-steel">{t}</li>)}
          </ul>
          {p.links.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-3">
              {p.links.map(l => <MagneticLink key={l.url} variant="ghost" href={l.url} target="_blank" rel="noopener noreferrer">{l.label}</MagneticLink>)}
            </div>
          )}
        </div>
      </article>
    </div>
  </Reveal>
);

export const PartnersPage: React.FC<PageProps> = ({ go }) => (
  <>
    <PageHeader
      eyebrow="Partnerzy klubu"
      title="Nasi"
      accent="partnerzy"
      bgWord="PARTNERZY"
      img={IMG.kickSponsors}
      imgPos="62% 30%"
      imgAlt="Trening na sali Bałagan Team, w tle banery partnerów klubu"
      intro="Bałagan Team to nie tylko sala. To ludzie i firmy, które stoją za nami w narożniku – od sprzętu, suplementów i diety po księgowość, rowery i detailing. Wspierają klub, a my polecamy ich z czystym sumieniem. Poznaj ich bliżej i odwiedź ich strony."
      aside={
        <dl className="grid grid-cols-2 gap-px border border-white/10 bg-white/10">
          <div className="bg-ink/90 p-5"><dt className="eyebrow">Sponsor główny</dt><dd className="display mt-2 text-[34px] leading-none text-white">STAX Afbouw</dd></div>
          <div className="bg-ink/90 p-5"><dt className="eyebrow">Branże</dt><dd className="cond mt-2 text-[15px] font-bold uppercase leading-snug tracking-[.06em] text-steel">Budowa · sprzęt · suplementy · dieta · księgowość · rowery · detailing</dd></div>
        </dl>
      }
    />
    <div className="overflow-hidden border-b border-white/10 py-5">
      <VelocityMarquee items={PARTNERS.map(p => p.name)} outline className="text-[clamp(40px,7vw,84px)]" />
    </div>
    <section aria-label="Lista partnerów" className="py-16 sm:py-24">
      <div className="wrap grid gap-6 md:grid-cols-2 xl:gap-8">
        {PARTNERS.filter(p => p.sponsor).map(p => <SponsorFeature key={p.id} p={p} />)}
        {PARTNERS.filter(p => !p.sponsor).map((p, i) => <PartnerCard key={p.id} p={p} i={i} />)}
      </div>
    </section>
    <section aria-labelledby="zostan-partnerem" className="pb-20">
      <div className="wrap">
        <Reveal>
          <div className="relative overflow-hidden border border-blood/40 p-8 sm:p-14" style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(227,19,28,.3), transparent 55%), #141010' }}>
            <p className="eyebrow">Współpraca</p>
            <h2 id="zostan-partnerem" className="display mt-3 text-[clamp(44px,7vw,96px)] leading-[.98]"><span className="chrome">Zostań</span> <span className="text-blood">partnerem</span></h2>
            <p className="mt-5 max-w-[56ch] text-[17px] text-steel-dim">Twoja firma przy ringu, na stronie i w social mediach klubu. Napisz do nas – opowiemy, jak możemy się nawzajem wspierać.</p>
            <div className="mt-8"><MagneticLink href={waLink('Cześć! Chcę porozmawiać o współpracy z Bałagan Team.')} target="_blank" rel="noopener noreferrer">Napisz na WhatsApp</MagneticLink></div>
          </div>
        </Reveal>
      </div>
    </section>
    <NextPage label="Następna strona" title="Kontakt" onGo={() => go('kontakt')} img={IMG.teamMat} />
  </>
);
