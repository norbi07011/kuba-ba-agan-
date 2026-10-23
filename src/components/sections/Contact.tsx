import React, { useState } from 'react';
import { MagneticLink } from '../fx/Kinetic';
import { FillText, Reveal } from '../fx/ScrollFx';
import { SITE, waLink } from '../../data/site';
import { Wordmark, NAV } from './Header';

/** Stylizowana mapa okolicy (bez zewnętrznych map) z pulsującą pinezką. */
const MapArt: React.FC = () => (
  <svg viewBox="0 0 400 300" className="h-full w-full" role="img" aria-label="Pinezka: Brugplein 2, Lelystad">
    <rect width="400" height="300" fill="#100c0c" />
    <g stroke="#2a2222" strokeWidth="10" fill="none" strokeLinecap="round">
      <path d="M-10 210C80 190 160 200 230 160S360 90 420 100" />
      <path d="M120 -10L170 310" />
      <path d="M-10 70L410 130" />
      <path d="M300 -10C280 80 300 200 260 310" />
    </g>
    <g stroke="#1d1717" strokeWidth="4" fill="none">
      <path d="M40 -10L70 310M230 -10L210 310M-10 260L410 240M360 -10L340 310" />
    </g>
    <path d="M-10 30C60 40 100 20 150 35S260 50 300 30 380 10 410 20" stroke="#1a2b3a" strokeWidth="14" fill="none" opacity=".8" />
    <g transform="translate(196 150)">
      <circle r="10" fill="#e3131c" opacity=".35" className="bt-ping" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      <path d="M0 -38C-14 -38 -24 -28 -24 -15C-24 2 0 18 0 18S24 2 24 -15C24 -28 14 -38 0 -38Z" fill="#e3131c" />
      <circle cy="-16" r="8" fill="#0b0909" />
    </g>
    <text x="196" y="196" textAnchor="middle" fontFamily="'Barlow Condensed', sans-serif" fontWeight="700" fontSize="14" letterSpacing="3" fill="#d6d8dc">BRUGPLEIN 2</text>
  </svg>
);

export const Contact: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(SITE.phone); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch {
      const el = document.getElementById('bt-phone-text');
      if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r); }
    }
  };
  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="relative py-20 sm:py-28">
      <div className="wrap grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">Dane kontaktowe</p>
          <h2 id="kontakt-title" className="display mt-3 text-[clamp(44px,6vw,80px)] leading-[.98]"><span className="chrome">Bałagan Team</span> <span className="text-blood">Lelystad</span></h2>
          <p className="mt-5 max-w-[42ch] text-steel-dim">Napisz albo zadzwoń – umówimy pierwszy trening i podpowiemy, co zabrać.</p>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="eyebrow">Adres</dt>
              <dd className="cond mt-2 text-[22px] font-bold uppercase leading-tight tracking-[.04em] text-white">{SITE.address.street}<br />{SITE.address.zip} {SITE.address.city}</dd>
              <a href={SITE.maps} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[14px] text-steel underline decoration-blood decoration-2 underline-offset-4 hover:text-white">Otwórz w Google Maps</a>
            </div>
            <div>
              <dt className="eyebrow">Telefon / WhatsApp</dt>
              <dd className="mt-2 flex flex-wrap items-center gap-3">
                <span id="bt-phone-text" className="mono select-all text-[22px] font-bold text-white">{SITE.phone}</span>
                <button type="button" onClick={copy} className="cond border border-white/15 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.16em] text-steel transition hover:border-blood hover:text-white">
                  {copied ? 'Skopiowano' : 'Kopiuj'}
                </button>
              </dd>
            </div>
            <div>
              <dt className="eyebrow">Godziny</dt>
              <dd className="mono mt-2 text-[15px] leading-7 text-white">Pon–Pt 11:00–20:30<br /><span className="text-steel-dim">ostatni trening startuje o 19:00</span><br />Sob 11:00–14:00<br /><span className="text-steel-dim">Ndz zamknięte</span></dd>
            </div>
            <div>
              <dt className="eyebrow">Social media</dt>
              <dd className="mt-2 flex flex-col gap-1 text-[15px]">
                <a href={SITE.facebook.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-ember">Facebook · {SITE.facebook.label}</a>
                <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="text-white hover:text-ember">Instagram · {SITE.instagram.label}</a>
              </dd>
            </div>
          </dl>
          <div className="mt-10 flex flex-wrap gap-3">
            <MagneticLink href={waLink('Cześć! Chcę umówić pierwszy trening w Bałagan Team.')} target="_blank" rel="noopener noreferrer">Napisz na WhatsApp</MagneticLink>
            <MagneticLink variant="ghost" href={`tel:${SITE.phoneHref}`}>Zadzwoń</MagneticLink>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <a href={SITE.maps} target="_blank" rel="noopener noreferrer" className="group relative block aspect-[4/3] max-w-full overflow-hidden border border-white/10" aria-label="Brugplein 2, Lelystad – otwórz mapę">
            <div className="h-full w-full transition-transform duration-700 group-hover:scale-105"><MapArt /></div>
            <span className="cond absolute bottom-4 left-4 bg-blood px-3 py-1.5 text-[13px] font-bold uppercase tracking-[.16em] text-white">Prowadź do sali →</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
};

export const Footer: React.FC<{ onNav: (id: string) => void }> = ({ onNav }) => (
  <footer className="relative overflow-hidden border-t border-white/10 pt-16" style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
    <div className="wrap">
      <div className="flex flex-wrap items-start justify-between gap-8">
        <Wordmark />
        <nav aria-label="Stopka" className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV.map(n => (
            <button key={n.id} type="button" onClick={() => onNav(n.id)} className="cond text-[14px] font-bold uppercase tracking-[.16em] text-steel-dim hover:text-white">{n.label}</button>
          ))}
        </nav>
      </div>
      <FillText lines={['Bałagan', 'Team']} className="mt-14 text-[clamp(88px,24vw,380px)]" />
      <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-white/10 pt-6 text-[13px] text-steel-dim">
        <span>© 2026 Bałagan Team · Brugplein 2, 8223 AJ Lelystad</span>
        <span className="cond font-bold uppercase tracking-[.2em]">Discipline · Work · Results</span>
      </div>
    </div>
  </footer>
);
