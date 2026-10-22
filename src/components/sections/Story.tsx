import React, { useEffect, useRef, useState } from 'react';
import { Cutout3D } from '../fx/Cutout';
import { MODELS, octagonProductUrl } from '../../data/octagon';
import { onScrollFrame, pinProgress } from '../../lib/scrollLoop';
import { prefersReducedMotion, useViewportWidth } from '../../lib/motion';

/*
 * Sticky scroll storytelling: sekcja przypięta na ekranie, a przewijanie steruje sceną.
 * Sprzęt obraca się w 3D (z grubością – ekstruzja), na granicy kroków robi pełen obrót
 * i w połowie obrotu zamienia się w kolejny przedmiot; opisy zmieniają się razem z nim.
 */

interface Step { img: string; slug: string; product: string; label: string; title: string; text: string; facts: string[] }

const v = (model: string, variant: string) => MODELS.find(m => m.id === model)!.variants.find(x => x.id === variant)!;

/* Sprzęt Octagon jako bohater każdego kroku – zdjęcia i linki z katalogu Octagon Sport NL. */
const STEPS: Step[] = [
  {
    img: v('supreme', 'red').img, slug: v('supreme', 'red').slug, product: 'Owijki Legion Octagon Supreme', label: 'Owijki',
    title: 'Owiń dłonie',
    text: 'Pierwszy trening zaczyna się od owijek. Uczysz się chronić nadgarstki i kostki, stajesz w gardzie i poznajesz rytm sali.',
    facts: ['Rozgrzewka i mobilność', 'Postawa i garda', 'Bez presji, we własnym tempie'],
  },
  {
    img: v('kevlar-gloves', 'black').img, slug: v('kevlar-gloves', 'black').slug, product: 'Rękawice Legion Octagon Kevlar', label: 'Rękawice',
    title: 'Ręce, które myślą',
    text: 'Proste, sierpowe, podbródkowe – najpierw powoli i czysto, potem szybko na tarczach. Trener poprawia każdy ruch.',
    facts: ['Kombinacje na tarczach', 'Praca na worku', 'Obrona i uniki'],
  },
  {
    img: v('kevlar-shin', 'red').img, slug: v('kevlar-shin', 'red').slug, product: 'Ochraniacze Legion Octagon Kevlar', label: 'Ochraniacze',
    title: 'Dołóż nogi',
    text: 'W kickboxingu dochodzą low kicki, kopnięcia na korpus i kolana. Ochraniacze na piszczele i pełny zakres ruchu.',
    facts: ['Kopnięcia i kolana', 'Łączenie rąk i nóg', 'Praca na ochraniaczach'],
  },
  {
    img: v('guardox', 'red').img, slug: v('guardox', 'red').slug, product: 'Kask Legion Octagon Guardox', label: 'Kask',
    title: 'Wejdź do ringu',
    text: 'Gdy technika siedzi, przychodzi czas na sparingi. Kontrolowane, w kasku, z trenerem przy linach – bez ego.',
    facts: ['Sparingi kontrolowane', 'Taktyka i dystans', 'Przygotowanie do walki'],
  },
];

export const Story: React.FC = () => {
  const root = useRef<HTMLElement>(null);
  const spin = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const idxRef = useRef(0);
  const vw = useViewportWidth();
  const small = vw < 768;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      // bez ruchu: krok zmienia się skokowo, bez obrotów
      return onScrollFrame(({ vh }) => {
        const n = Math.min(STEPS.length - 1, Math.floor(pinProgress(el, vh) * STEPS.length));
        if (n !== idxRef.current) { idxRef.current = n; setIdx(n); }
        if (bar.current) bar.current.style.transform = `scaleY(${(n + 1) / STEPS.length})`;
      });
    }
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = pinProgress(el, vh);
      const f = Math.min(p * STEPS.length, STEPS.length - 0.0001);
      const active = Math.floor(f);
      const t = f - active;
      const last = active === STEPS.length - 1;
      let yaw: number;
      let shown = active;
      if (t < 0.72 || last) yaw = -28 + 56 * Math.min(1, t / 0.72);
      else {
        const u = (t - 0.72) / 0.28;
        if (u < 0.5) yaw = 28 + 62 * (u * 2);
        else { yaw = -90 + 62 * ((u - 0.5) * 2); shown = active + 1; }
      }
      const pitch = Math.sin(p * Math.PI * 4) * 6;
      const lift = Math.sin(p * Math.PI * 6) * 10;
      if (spin.current) spin.current.style.transform = `translate3d(0, ${lift}px, 0) rotateX(${pitch}deg) rotateY(${yaw}deg)`;
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      if (glow.current) glow.current.style.opacity = String(0.55 + 0.45 * Math.cos(((yaw + 28) / 118) * Math.PI));
      if (shown !== idxRef.current) { idxRef.current = shown; setIdx(shown); }
    });
  }, []);

  const s = STEPS[idx];
  return (
    <section ref={root} aria-label="Od owijek do sparingu" className="relative" style={{ height: `${STEPS.length * 100 + 40}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at 70% 50%, #1e0a0b, #0b0909 65%)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="display outline-text whitespace-nowrap text-[30vw] leading-none opacity-50 transition-opacity duration-500" key={s.label}>
            <span className="bt-swap inline-block">{s.label}</span>
          </span>
        </div>

        <div className="wrap relative grid h-full w-full grid-rows-[1fr_auto] items-center gap-2 pt-[76px] pb-8 md:grid-cols-[1fr_1.1fr] md:grid-rows-1 md:gap-10 md:pt-0 md:pb-0">
          {/* produkt */}
          <div className="relative flex h-full max-h-[52svh] items-center justify-center md:order-2 md:max-h-none" style={{ perspective: '1200px' }}>
            <div ref={glow} aria-hidden className="absolute aspect-square w-[min(80%,520px)] max-w-full rounded-full transition-[background] duration-700" style={{ background: 'radial-gradient(circle, rgba(227,19,28,.5), transparent 62%)', filter: 'blur(20px)' }} />
            <div aria-hidden className="absolute bottom-[6%] h-6 w-[40%] rounded-[50%]" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,.8), transparent)' }} />
            <div ref={spin} className="relative" style={{ transformStyle: 'preserve-3d', width: small ? 'min(62vw, 34svh)' : 'min(34vw, 460px)', aspectRatio: '1' }}>
              <Cutout3D key={s.img} src={s.img} alt={s.product} depth={small ? 16 : 26} layers={small ? 5 : 8} className="h-full w-full" />
            </div>
          </div>

          {/* opisy */}
          <div className="relative md:order-1">
            <div className="flex items-start gap-5 md:gap-8">
              <div aria-hidden className="relative hidden w-[2px] self-stretch bg-white/10 md:block">
                <div ref={bar} className="absolute inset-x-0 top-0 h-full origin-top bg-blood" style={{ transform: 'scaleY(0)', boxShadow: '0 0 12px #e3131c' }} />
              </div>
              <div className="min-w-0" aria-live="polite">
                <p className="eyebrow">Od owijek do sparingu · krok <span className="mono text-white">{idx + 1}</span>/{STEPS.length}</p>
                <div key={idx} className="bt-swap">
                  <h2 className="display mt-3 text-[clamp(46px,7.4vw,108px)] leading-[1.12] text-white">{s.title}</h2>
                  <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-steel-dim md:text-[18px]">{s.text}</p>
                  <ul className="mt-5 hidden flex-col gap-2 sm:flex">
                    {s.facts.map(f => (
                      <li key={f} className="cond flex items-center gap-3 text-[16px] font-semibold uppercase tracking-[.1em] text-steel">
                        <span aria-hidden className="h-[2px] w-4 bg-blood" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={octagonProductUrl(s.slug)} target="_blank" rel="noopener noreferrer" className="cond mt-5 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[.16em] text-white underline decoration-blood decoration-2 underline-offset-[6px] transition hover:text-ember">
                  {s.product} · Octagon Sport NL →
                </a>
                <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
                  {STEPS.map((st, i) => (
                    <span key={st.label} className={`cond px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.16em] transition-colors duration-300 ${i === idx ? 'bg-blood text-white' : 'bg-white/5 text-steel-dim'}`}>{st.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
