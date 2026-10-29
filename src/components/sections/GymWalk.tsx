import React, { useEffect, useRef, useState } from 'react';
import { MagneticButton, MagneticLink } from '../fx/Kinetic';
import { onScrollFrame, pinProgress } from '../../lib/scrollLoop';
import { prefersReducedMotion, useViewportWidth } from '../../lib/motion';
import { IMG } from '../../data/content';
import { PARTNERS } from '../../data/partners';
import { waLink } from '../../data/site';
import type { GymScene } from '../fx/gym3d';

/*
 * „Wejdź do klubu” – przelot kamery 3D przez salę Bałagan Team sterowany przewijaniem.
 * Scena (Three.js) ładuje się dopiero, gdy sekcja zbliża się do ekranu, i renderuje tylko wtedy, gdy jest widoczna.
 * Napisy rund przenikają się z ruchem kamery. Bez WebGL – zdjęcie sali z tymi samymi napisami.
 */

interface Chapter { from: number; to: number; round: string; title: [string, string]; text: string; cta?: boolean }
const CHAPTERS: Chapter[] = [
  { from: 0, to: 0.17, round: 'Wejście', title: ['Wejdź do', 'Bałagan Team'], text: 'Brugplein 2, Lelystad. Za tymi drzwiami zostawiasz wymówki – i zaczynasz pracę.' },
  { from: 0.19, to: 0.33, round: 'Sala', title: ['Jedna mata.', 'Jedna ekipa.'], text: 'Dzieci, dorośli, początkujący i zawodnicy. Każdy w swoim tempie, wszyscy z tym samym celem.' },
  { from: 0.37, to: 0.58, round: 'Ring', title: ['Tu rodzi się', 'charakter.'], text: 'Technika, obrona, kontrolowany sparing. Do ringu wchodzisz wtedy, gdy jesteś gotowy – nigdy wcześniej.' },
  { from: 0.62, to: 0.79, round: 'Worki', title: ['Praca.', 'Runda po rundzie.'], text: 'Kombinacje, kopnięcia, kondycja. Worek nie odda – ale pokaże, ile w Tobie zostało.' },
  { from: 0.82, to: 0.9, round: 'Ekipa', title: ['Twarze', 'naszej sali.'], text: 'Trener Kuba, młodzi zawodnicy, grupy dorosłych. Tak wygląda codzienny trening w Bałagan Team.' },
  { from: 0.93, to: 1.01, round: 'Twój ruch', title: ['Pierwszy trening?', 'Wchodzisz.'], text: 'Napisz albo zapisz się online. Pokażemy Ci salę na żywo.', cta: true },
];

export const GymWalk: React.FC<{ onSignup: () => void; onSchedule: () => void }> = ({ onSignup, onSchedule }) => {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const chapterEls = useRef<(HTMLDivElement | null)[]>([]);
  const hint = useRef<HTMLDivElement>(null);
  const gym = useRef<GymScene | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'fallback'>('idle');
  const [round, setRound] = useState(0);
  const roundRef = useRef(0);
  const vw = useViewportWidth();
  const mobile = vw < 768;

  // leniwe ładowanie sceny, gdy sekcja jest blisko
  useEffect(() => {
    const el = root.current, c = canvas.current;
    if (!el || !c) return;
    let cancelled = false;
    let visible = false;
    const near = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting || gym.current || cancelled) return;
      near.disconnect();
      setStatus('loading');
      try {
        const test = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
        if (!test) throw new Error('no webgl');
        const { createGym } = await import('../fx/gym3d');
        const scene = await createGym(c, {
          logo: IMG.logo,
          photos: [IMG.mitts, IMG.kickPads, IMG.kidsMitts, IMG.coachTalk, IMG.tire],
          partners: PARTNERS.map(p => p.mono),
        }, { mobile: window.innerWidth < 768, reduced: prefersReducedMotion() });
        if (cancelled) { scene.dispose(); return; }
        gym.current = scene;
        scene.setProgress(pinProgress(el, window.innerHeight));
        if (visible) scene.start();
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('fallback');
      }
    }, { rootMargin: '150% 0px' });
    near.observe(el);
    const vis = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (!gym.current) return;
      if (visible) gym.current.start(); else gym.current.stop();
    }, { rootMargin: '5% 0px' });
    vis.observe(el);
    const onResize = () => gym.current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true; near.disconnect(); vis.disconnect();
      window.removeEventListener('resize', onResize);
      gym.current?.dispose(); gym.current = null;
    };
  }, []);

  // przewijanie → kamera + napisy
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const p = pinProgress(el, vh);
      gym.current?.setProgress(p);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (hint.current) hint.current.style.opacity = String(Math.max(0, 1 - p * 14));
      let active = 0;
      CHAPTERS.forEach((c, i) => {
        const node = chapterEls.current[i];
        if (!node) return;
        const fadeIn = Math.min(1, (p - c.from) / 0.035), fadeOut = Math.min(1, (c.to - p) / 0.035);
        const o = Math.max(0, Math.min(fadeIn, fadeOut));
        if (o > 0.5) active = i;
        const enter = 1 - Math.max(0, Math.min(1, fadeIn));
        const leave = 1 - Math.max(0, Math.min(1, fadeOut));
        node.style.opacity = String(o);
        node.style.visibility = o < 0.01 ? 'hidden' : 'visible';
        if (!reduced) {
          node.style.transform = `translate3d(0, ${(enter * 40 - leave * 40).toFixed(1)}px, 0)`;
          node.style.filter = o < 0.999 ? `blur(${((1 - o) * 10).toFixed(1)}px)` : 'none';
        }
      });
      if (active !== roundRef.current) { roundRef.current = active; setRound(active); }
    });
  }, []);

  return (
    <section ref={root} aria-label="Wejdź do sali Bałagan Team – wirtualny spacer" className="relative bg-[#050404]" style={{ height: mobile ? '760svh' : '880svh' }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* tło zastępcze (zanim scena się wczyta / bez WebGL) */}
        <div aria-hidden className={`absolute inset-0 transition-opacity duration-1000 ${status === 'ready' ? 'opacity-0' : 'opacity-100'}`}>
          <img src={IMG.punchSponsors} alt="" className="h-full w-full object-cover opacity-40" style={{ filter: 'grayscale(.3) contrast(1.1)' }} />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 60%, transparent, #050404 75%)' }} />
          {status === 'loading' && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="cond flex items-center gap-3 text-[13px] font-bold uppercase tracking-[.3em] text-steel"><span className="bt-pulse h-2 w-2 rounded-full bg-blood" />Otwieramy salę…</span>
            </div>
          )}
        </div>
        <canvas ref={canvas} aria-hidden className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`} />

        {/* winieta + ziarno + przyciemnienie pod tekstem */}
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 85% 75% at 60% 50%, transparent 45%, rgba(0,0,0,.75) 100%)' }} />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-full md:w-[58%]" style={{ background: mobile ? 'linear-gradient(0deg, rgba(5,4,4,.85) 0%, rgba(5,4,4,.2) 45%, transparent 70%)' : 'linear-gradient(90deg, rgba(5,4,4,.82) 0%, rgba(5,4,4,.35) 55%, transparent 100%)' }} />
        <div aria-hidden className="duo-grain pointer-events-none absolute inset-0" />

        {/* napisy rund */}
        <div className="wrap relative flex h-full flex-col justify-end pb-24 md:justify-center md:pb-0">
          <div className="relative min-h-[300px] max-w-[620px] md:min-h-[360px]">
            {CHAPTERS.map((c, i) => (
              <div key={c.round} ref={el => { chapterEls.current[i] = el; }} className="absolute inset-x-0 bottom-0 md:bottom-auto md:top-0" style={{ opacity: i === 0 ? 1 : 0, visibility: i === 0 ? 'visible' : 'hidden' }}>
                <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Runda {String(i + 1).padStart(2, '0')} — {c.round}</p>
                <h2 className="display mt-4 text-[clamp(52px,8.4vw,128px)] leading-[.9]" style={{ textShadow: '0 8px 40px rgba(0,0,0,.85)' }}>
                  <span className="chrome block">{c.title[0]}</span>
                  <span className="block text-blood" style={{ transform: 'skewX(-8deg)', transformOrigin: 'left' }}>{c.title[1]}</span>
                </h2>
                <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-steel sm:text-[18px]" style={{ textShadow: '0 2px 16px rgba(0,0,0,.9)' }}>{c.text}</p>
                {c.cta && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <MagneticButton onClick={onSignup}>Zapisz się</MagneticButton>
                    <MagneticLink variant="ghost" href={waLink('Cześć! Chcę przyjść na pierwszy trening do Bałagan Team.')} target="_blank" rel="noopener noreferrer">Napisz na WhatsApp</MagneticLink>
                    <button type="button" onClick={onSchedule} className="cond px-2 text-[13px] font-bold uppercase tracking-[.16em] text-steel underline decoration-blood decoration-2 underline-offset-[6px] hover:text-white">Grafik</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* licznik rund + pasek postępu */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0" style={{ paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="wrap flex items-center gap-4">
            <span className="mono shrink-0 text-[12px] text-white"><span className="text-blood">R{round + 1}</span> / {CHAPTERS.length}</span>
            <div className="h-[2px] flex-1 bg-white/10"><div ref={bar} className="h-full origin-left bg-blood" style={{ transform: 'scaleX(0)', boxShadow: '0 0 12px #e3131c' }} /></div>
            <span className="cond hidden shrink-0 text-[11px] font-bold uppercase tracking-[.24em] text-steel-dim sm:inline">Wirtualny spacer · Brugplein 2</span>
          </div>
        </div>

        {/* podpowiedź na starcie */}
        <div ref={hint} aria-hidden className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          <span className="relative h-12 w-7 rounded-full border-2 border-white/50"><span className="bt-scroll-dot absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white" /></span>
          <span className="cond text-[11px] font-bold uppercase tracking-[.3em] text-steel [writing-mode:vertical-rl]">Przewijaj, aby wejść</span>
        </div>
      </div>
    </section>
  );
};
