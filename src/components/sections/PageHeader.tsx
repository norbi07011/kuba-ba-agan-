import React from 'react';
import { KineticText } from '../fx/Kinetic';
import { Duo, ImageReveal, LineReveal } from '../fx/Premium';

/*
 * Kinowy nagłówek podstrony: po lewej okruszek, wielki tytuł wjeżdżający literami i wstęp,
 * po prawej wysokie zdjęcie trenującego (czerń + czerwień), odsłaniane kurtyną.
 * W tle konturowe słowo, reflektor i ziarno.
 */
export const PageHeader: React.FC<{
  eyebrow: string;
  title: string;
  accent: string;
  intro: string;
  bgWord: string;
  img?: string;
  imgAlt?: string;
  imgPos?: string;
  mono?: boolean;
  meta?: { k: string; v: string }[];
  aside?: React.ReactNode;
}> = ({ eyebrow, title, accent, intro, bgWord, img, imgAlt = '', imgPos, mono = false, meta, aside }) => (
  <header className="grain relative isolate overflow-hidden border-b border-white/10" style={{ paddingTop: 'calc(112px + env(safe-area-inset-top, 0px))' }}>
    <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 55% 70% at 85% 10%, rgba(227,19,28,.32), transparent 62%), radial-gradient(ellipse 45% 60% at 0% 100%, rgba(120,8,14,.3), transparent 60%), #0b0909' }} />
    <div aria-hidden className="bt-spot-l pointer-events-none absolute left-[62%] top-[-20%] -z-10 h-[140%] w-[30%] origin-top bg-gradient-to-b from-white/[.09] to-transparent blur-2xl" style={{ clipPath: 'polygon(42% 0, 58% 0, 100% 100%, 0 100%)' }} />
    <span aria-hidden className="display outline-text pointer-events-none absolute -bottom-[0.14em] left-[-0.02em] -z-10 whitespace-nowrap text-[24vw] leading-none opacity-50">{bgWord}</span>

    <div className={`wrap grid gap-10 pb-14 sm:pb-20 ${img ? 'lg:grid-cols-[1.15fr_.85fr] lg:items-end' : ''}`}>
      <div className="relative z-10 min-w-0">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-[2px] w-8 bg-blood" />
          Bałagan Team <span className="text-steel-dim/50">/</span> <span className="text-white">{eyebrow}</span>
        </p>
        <h1 className="display mt-6 text-[clamp(58px,10vw,150px)] leading-[.9]">
          <span className="block"><KineticText text={title} stagger={38} charClassName={() => 'chrome'} /></span>
          <span className="block text-blood" style={{ transform: 'skewX(-8deg)', transformOrigin: 'left', textShadow: '0 0 50px rgba(227,19,28,.35)' }}>
            <KineticText text={accent} stagger={38} delay={title.length * 38 + 80} />
          </span>
        </h1>
        <LineReveal text={intro} className="mt-7 max-w-[56ch] text-[17px] leading-relaxed text-steel sm:text-[19px]" delay={250} step={14} />
        {meta && (
          <dl className="mt-8 flex flex-wrap gap-px border border-white/10 bg-white/10">
            {meta.map(m => (
              <div key={m.k} className="min-w-[120px] flex-1 bg-[#0b0909]/85 px-4 py-3 backdrop-blur">
                <dt className="eyebrow text-[10px]">{m.k}</dt>
                <dd className="mono mt-1 text-[14px] font-bold text-white">{m.v}</dd>
              </div>
            ))}
          </dl>
        )}
        {aside && <div className="mt-8">{aside}</div>}
      </div>
      {img && (
        <ImageReveal className="relative aspect-[4/5] w-full max-w-full border border-white/10 lg:aspect-[3/4]" from="right" parallax={40}>
          <Duo src={img} alt={imgAlt} pos={imgPos} mono={mono} className="h-full w-full" eager />
          <span aria-hidden className="absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-blood" />
          <span aria-hidden className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-blood" />
        </ImageReveal>
      )}
    </div>
  </header>
);

/** Duży przycisk przejścia do kolejnej podstrony. */
export const NextPage: React.FC<{ label: string; title: string; onGo: () => void; img?: string }> = ({ label, title, onGo, img }) => (
  <div className="wrap pb-20 pt-6">
    <button type="button" data-cursor="Dalej" onClick={onGo} className="group relative flex w-full items-center justify-between gap-6 overflow-hidden border border-white/10 px-6 py-10 text-left transition-colors hover:border-blood sm:px-10 sm:py-14">
      {img && (
        <span aria-hidden className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100">
          <Duo src={img} alt="" fade="left" className="h-full w-full" />
        </span>
      )}
      <span className="relative">
        <span className="eyebrow block">{label}</span>
        <span className="display mt-2 block text-[clamp(48px,9vw,128px)] leading-none text-steel transition-colors duration-500 group-hover:text-white">{title}</span>
      </span>
      <span aria-hidden className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-all duration-500 group-hover:-rotate-45 group-hover:border-blood group-hover:bg-blood sm:h-24 sm:w-24">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </span>
    </button>
  </div>
);

/** Nagłówek sekcji: eyebrow + tytuł dwukolorowy + opcjonalny opis obok. */
export const SectionTitle: React.FC<{ id?: string; eyebrow: string; a: string; b: string; text?: string; className?: string }> = ({ id, eyebrow, a, b, text, className = '' }) => (
  <div className={`grid gap-6 lg:grid-cols-[1.2fr_.8fr] lg:items-end ${className}`}>
    <div>
      <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />{eyebrow}</p>
      <h2 id={id} className="display mt-4 text-[clamp(46px,7.4vw,108px)] leading-[.95]">
        <span className="chrome">{a}</span> <span className="text-blood">{b}</span>
      </h2>
    </div>
    {text && <LineReveal text={text} className="max-w-[48ch] text-[17px] leading-relaxed text-steel-dim" step={10} />}
  </div>
);
