import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage, SectionTitle } from '../components/sections/PageHeader';
import { ShaderStage } from '../components/fx/ShaderStage';
import { KineticText, MagneticButton, RollingNumber } from '../components/fx/Kinetic';
import { Reveal, TiltCard, VelocityMarquee } from '../components/fx/ScrollFx';
import { LineReveal } from '../components/fx/Premium';
import { Embers, Garment3D, Loupe, ScanReveal } from '../components/fx/Wear';
import { EDITIONS, GARMENTS, priceLabel, type Garment } from '../data/apparel';
import { SITE, waLink } from '../data/site';
import { isFinePointer, prefersReducedMotion, useViewportWidth } from '../lib/motion';
import { onScrollFrame, pinProgress } from '../lib/scrollLoop';
import type { PageProps } from './types';

const byId = (id: string) => GARMENTS.find(g => g.id === id)!;

/* ================= HERO: koszulka 3D w centrum, reszta kolekcji lewituje wokół ================= */
const Hero: React.FC<{ onOrder: () => void; onBrowse: () => void }> = ({ onOrder, onBrowse }) => {
  const root = useRef<HTMLElement>(null);
  const vw = useViewportWidth();
  const small = vw < 768;
  // parallax warstw za myszą
  useEffect(() => {
    const el = root.current;
    if (!el || !isFinePointer() || prefersReducedMotion()) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>('[data-depth]'));
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layers.forEach(l => { const d = Number(l.dataset.depth); l.style.translate = `${cx * d}px ${cy * d}px`; });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002 ? requestAnimationFrame(loop) : 0;
    };
    const move = (e: PointerEvent) => { tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; if (!raf) raf = requestAnimationFrame(loop); };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { window.removeEventListener('pointermove', move); cancelAnimationFrame(raf); };
  }, []);

  const jersey = byId('jersey');
  const floaters = [
    { g: byId('hoodie'), img: byId('hoodie').back, cls: 'left-[-2%] top-[6%] w-[30%]', d: 26, dur: 5.6, r: [-10, -4] },
    { g: byId('rashguard'), img: byId('rashguard').front, cls: 'right-[-2%] top-[2%] w-[27%]', d: -22, dur: 6.2, r: [8, 2] },
    { g: byId('set'), img: byId('set').extra!.front, cls: 'left-[2%] bottom-[4%] w-[25%]', d: 34, dur: 4.8, r: [-6, 6] },
    { g: byId('storm'), img: byId('storm').back, cls: 'right-[0%] bottom-[8%] w-[26%]', d: -30, dur: 5.2, r: [6, -4] },
  ];

  return (
    <header ref={root} className="relative isolate overflow-hidden border-b border-white/10" style={{ paddingTop: 'calc(100px + env(safe-area-inset-top, 0px))' }}>
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse 60% 70% at 70% 45%, #3a0a0d, #0b0909 70%)' }}>
        <ShaderStage color="#e3131c" mode="hero" className="absolute inset-0" />
      </div>
      <Embers className="-z-[5]" />
      <span aria-hidden className="display outline-text pointer-events-none absolute bottom-[-0.12em] left-[-0.02em] -z-[6] whitespace-nowrap text-[24vw] leading-none opacity-50">WEAR</span>

      <div className="wrap grid items-center gap-6 pb-14 lg:grid-cols-[.95fr_1.05fr] lg:pb-20">
        <div className="relative z-10 order-2 lg:order-1">
          <p className="eyebrow flex items-center gap-3"><span className="h-[2px] w-8 bg-blood" />Bałagan Team <span className="text-steel-dim/50">/</span> <span className="text-white">Kolekcja</span></p>
          <h1 className="display mt-5 text-[clamp(64px,11vw,160px)] leading-[.88]">
            <span className="block"><KineticText text="Wear" stagger={50} charClassName={() => 'chrome'} /></span>
            <span className="block text-blood" style={{ transform: 'skewX(-9deg)', transformOrigin: 'left', textShadow: '0 0 50px rgba(227,19,28,.4)' }}><KineticText text="the Team" stagger={50} delay={220} /></span>
          </h1>
          <LineReveal text="Koszulki, rashguard, bluzy, komplety i dres w barwach klubu. To, w czym trenujemy na sali, jeździmy na zawody i wychodzimy do ringu. Obróć każdy ciuch, zobacz tył i detale. Komplet koszulka + spodenki za 45 €, dres za 70 € – zamów przez WhatsApp i odbierz na sali." className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-steel sm:text-[19px]" delay={250} step={12} />
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton onClick={onOrder}>Zamów swój rozmiar</MagneticButton>
            <MagneticButton variant="ghost" onClick={onBrowse}>Zobacz kolekcję</MagneticButton>
          </div>
          <dl className="mt-10 flex flex-wrap gap-px border border-white/10 bg-white/10">
            {[['Komplet', '€45'], ['Dres', '€70'], ['Odbiór', 'na sali']].map(([k, v]) => (
              <div key={k} className="min-w-[110px] flex-1 bg-[#0b0909]/85 px-4 py-3 backdrop-blur">
                <dt className="eyebrow text-[10px]">{k}</dt>
                <dd className="mono mt-1 text-[14px] font-bold text-white">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative order-1 mx-auto aspect-square w-full max-w-[640px] lg:order-2">
          <div aria-hidden className="absolute inset-[12%] rounded-full" style={{ background: `radial-gradient(circle, ${jersey.glow}, transparent 65%)`, filter: 'blur(30px)' }} />
          <div aria-hidden className="absolute bottom-[6%] left-1/2 h-8 w-[46%] -translate-x-1/2 rounded-[50%]" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,.85), transparent)' }} />
          <div aria-hidden className="absolute bottom-[4%] left-1/2 h-[16%] w-[70%] -translate-x-1/2 rounded-[50%] border border-white/10" style={{ boxShadow: '0 0 40px rgba(227,19,28,.25), inset 0 0 40px rgba(227,19,28,.2)' }} />
          {floaters.map((f, i) => (
            <div key={i} data-depth={f.d} aria-hidden className={`absolute z-0 ${f.cls}`}>
              <div className="bt-float" style={{ ['--dur' as string]: `${f.dur}s`, ['--delay' as string]: `${-i * 1.1}s`, ['--r0' as string]: `${f.r[0]}deg`, ['--r1' as string]: `${f.r[1]}deg` }}>
                <img src={f.img} alt="" className="w-full opacity-80 drop-shadow-[0_24px_24px_rgba(0,0,0,.7)]" style={{ filter: 'blur(.4px) brightness(.8)' }} />
              </div>
            </div>
          ))}
          <div data-depth="10" className="absolute inset-[10%] z-10">
            <div className="bt-float h-full w-full" style={{ ['--dur' as string]: '6s', ['--r0' as string]: '0deg', ['--r1' as string]: '0deg' }}>
              <Garment3D front={jersey.front} back={jersey.back} alt={`${jersey.name} – przód i tył`} auto drag depth={small ? 14 : 22} layers={small ? 4 : 6} className="h-full w-full" />
            </div>
          </div>
          <p className="cond pointer-events-none absolute bottom-0 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-[12px] font-bold uppercase tracking-[.24em] text-steel-dim">
            {isFinePointer() ? 'Przeciągnij, aby obrócić' : 'Przesuń palcem, aby obrócić'}
          </p>
        </div>
      </div>
    </header>
  );
};

/* ================= STICKY: przód → tył w rytmie przewijania ================= */
const Showcase: React.FC<{ onOrder: (id: string) => void }> = ({ onOrder }) => {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [ang, setAng] = useState(-25);
  const idxRef = useRef(0);
  const vw = useViewportWidth();
  const small = vw < 768;
  const list = GARMENTS;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduced = prefersReducedMotion();
    return onScrollFrame(({ vh }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const p = pinProgress(el, vh);
      const f = Math.min(p * list.length, list.length - 0.0001);
      const i = Math.floor(f);
      const t = f - i;
      if (bar.current) bar.current.style.transform = `scaleY(${p})`;
      if (i !== idxRef.current) { idxRef.current = i; setIdx(i); }
      // każdy ciuch: od lekkiego skosu przodem, przez pełny obrót, do tyłu
      setAng(reduced ? (t < 0.5 ? 0 : 180) : -25 + 205 * Math.min(1, Math.max(0, (t - 0.12) / 0.7)));
    });
  }, [list.length]);

  const g = list[idx];
  const showingBack = ((ang % 360) + 360) % 360 > 90 && ((ang % 360) + 360) % 360 < 270;
  return (
    <section ref={root} aria-label="Przód i tył kolekcji" className="relative" style={{ height: `${list.length * 90 + 30}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden" style={{ background: 'radial-gradient(ellipse at 68% 50%, #210b0c, #0b0909 65%)' }}>
        <span aria-hidden key={g.id} className="bt-swap display outline-text pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[22vw] leading-none opacity-40">{showingBack ? 'BACK' : 'FRONT'}</span>
        <div className="wrap relative grid h-full w-full grid-rows-[1fr_auto] items-center gap-2 pb-8 pt-[76px] md:grid-cols-[1fr_1.1fr] md:grid-rows-1 md:gap-10 md:pb-0 md:pt-0">
          <div className="relative flex h-full max-h-[52svh] items-center justify-center md:order-2 md:max-h-none">
            <div aria-hidden className="absolute aspect-square w-[min(80%,520px)] max-w-full rounded-full transition-[background] duration-700" style={{ background: `radial-gradient(circle, ${g.glow}, transparent 62%)`, filter: 'blur(24px)' }} />
            <div aria-hidden className="absolute bottom-[6%] h-6 w-[40%] rounded-[50%]" style={{ background: 'radial-gradient(closest-side, rgba(0,0,0,.8), transparent)' }} />
            <div className="relative" style={{ width: small ? 'min(70vw, 38svh)' : 'min(36vw, 500px)', aspectRatio: '1' }}>
              <Garment3D key={g.id} front={g.front} back={g.back} alt={`${g.name}`} angle={ang} depth={small ? 14 : 22} layers={small ? 4 : 6} className="h-full w-full" />
            </div>
          </div>
          <div className="relative md:order-1">
            <div className="flex items-start gap-5 md:gap-8">
              <div aria-hidden className="relative hidden w-[2px] self-stretch bg-white/10 md:block">
                <div ref={bar} className="absolute inset-x-0 top-0 h-full origin-top bg-blood" style={{ transform: 'scaleY(0)', boxShadow: '0 0 12px #e3131c' }} />
              </div>
              <div className="min-w-0" aria-live="polite">
                <p className="eyebrow">Przód · tył · detal — <span className="mono text-white">{String(idx + 1).padStart(2, '0')}</span>/{String(list.length).padStart(2, '0')}</p>
                <div key={g.id} className="bt-swap">
                  <p className="mono mt-4 text-[12px] uppercase text-ember">{g.type} · {g.tag}{g.price ? ` · €${g.price}` : ''}</p>
                  <h2 className="display mt-2 text-[clamp(44px,6.6vw,96px)] leading-[1.02] text-white">{g.name}</h2>
                  <p className="cond mt-4 max-w-[44ch] text-[clamp(18px,1.8vw,22px)] font-semibold leading-snug text-steel">{g.lead}</p>
                  <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
                    {g.features.map(f => <li key={f} className="cond border border-white/15 px-2.5 py-1 text-[12px] font-bold uppercase tracking-[.12em] text-steel">{f}</li>)}
                  </ul>
                  <button type="button" onClick={() => onOrder(g.id)} className="cond mt-6 inline-flex items-center gap-2 text-[14px] font-bold uppercase tracking-[.16em] text-white underline decoration-blood decoration-2 underline-offset-[6px] hover:text-ember">Zamów ten model →</button>
                </div>
                <div className="mt-6 flex flex-wrap gap-2" aria-hidden>
                  {list.map((x, i) => <span key={x.id} className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-8 bg-blood' : 'w-1.5 bg-white/25'}`} />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================= GRID: karta odwraca się na tył po najechaniu / dotknięciu ================= */
const Card: React.FC<{ g: Garment; i: number; onOrder: (id: string) => void }> = ({ g, i, onOrder }) => {
  const [back, setBack] = useState(false);
  const fine = isFinePointer();
  return (
    <Reveal delay={(i % 3) * 90} className="h-full">
      <TiltCard max={6} className="group h-full">
        <article
          className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-ink-2"
          onPointerEnter={() => fine && setBack(true)}
          onPointerLeave={() => fine && setBack(false)}
          style={{ boxShadow: `0 40px 80px -55px ${g.glow}` }}
        >
          <div className="relative aspect-square max-w-full overflow-hidden" style={{ background: `radial-gradient(circle at 50% 60%, ${g.glow.replace(/[\d.]+\)$/, '.35)')}, transparent 65%), #110c0c` }}>
            <ScanReveal className="absolute inset-[8%]" delay={(i % 3) * 120}>
              <Garment3D front={g.front} back={g.back} alt={g.name} angle={back ? 180 : -14} depth={14} layers={4} className="h-full w-full [&>div]:transition-transform [&>div]:duration-[1.1s] [&>div]:ease-[cubic-bezier(.16,1,.3,1)]" />
            </ScanReveal>
            <span className="cond absolute left-4 top-4 bg-blood px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-white">{g.tag}</span>
            <button type="button" onClick={() => setBack(b => !b)} className="cond absolute bottom-4 right-4 border border-white/25 bg-black/50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.16em] text-white backdrop-blur transition hover:border-blood" aria-pressed={back}>
              {back ? '↺ Przód' : '↻ Tył'}
            </button>
          </div>
          <div className="flex flex-1 flex-col p-6 sm:p-7">
            <p className="eyebrow">{g.type}</p>
            <h3 className="display mt-2 text-[clamp(32px,3vw,42px)] leading-[1.02] text-white">{g.name}</h3>
            <p className="mt-3 flex-1 text-[15px] leading-relaxed text-steel-dim">{g.text}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {g.features.map(f => <li key={f} className="cond border border-white/12 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.12em] text-steel">{f}</li>)}
            </ul>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <span className="flex flex-col">
                <span className={`display text-[30px] leading-none ${g.price ? 'text-white' : 'text-[18px] text-steel'}`}>{priceLabel(g)}</span>
                <span className="mono text-[12px] text-steel-dim">Rozmiary {g.sizes[0]} – {g.sizes[g.sizes.length - 1]}</span>
              </span>
              <button type="button" onClick={() => onOrder(g.id)} className="cond inline-flex items-center gap-2 bg-blood px-4 py-2.5 text-[13px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-ember">Zamów →</button>
            </div>
          </div>
        </article>
      </TiltCard>
    </Reveal>
  );
};

/* ================= EDYCJE: Lightning Set w 4 kolorach ================= */
const Editions: React.FC<{ onOrder: (id: string, edition: string) => void }> = ({ onOrder }) => {
  const set = byId('set');
  const [ed, setEd] = useState(EDITIONS[0]);
  const [wipe, setWipe] = useState<{ key: number; color: string; x: string; y: string } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const vw = useViewportWidth();
  const small = vw < 768;
  const pick = (e: React.MouseEvent, x: (typeof EDITIONS)[number]) => {
    if (x.id === ed.id) return;
    const r = stage.current?.getBoundingClientRect();
    const b = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const px = r ? `${((b.left + b.width / 2 - r.left) / r.width) * 100}%` : '50%';
    const py = r ? `${((b.top + b.height / 2 - r.top) / r.height) * 100}%` : '100%';
    setWipe({ key: Date.now(), color: x.color, x: px, y: py });
    setEd(x);
  };
  return (
    <section aria-labelledby="edycje" className="relative overflow-hidden border-y border-white/10 py-24 sm:py-32">
      <div className="wrap">
        <SectionTitle id="edycje" eyebrow="Lightning Set" a="Wybierz" b="swoją edycję" text="Ten sam komplet, cztery kolory. Kliknij edycję – koszulka i spodenki przemalują się na żywo. Najedź na zestaw, a rozsunie się na części." />
      </div>
      <div ref={stage} className="wrap mt-12 grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
        <div className="relative isolate aspect-[4/3.6] w-full max-w-full overflow-hidden border border-white/10">
          <div aria-hidden className="absolute inset-0 -z-10 transition-[background] duration-700" style={{ background: `radial-gradient(ellipse at 50% 55%, ${ed.color}55, #0b0909 70%)` }} />
          <ShaderStage color={ed.color} mode="stage" pulseKey={ed.id} className="absolute inset-0 -z-10" />
          {wipe && <span key={wipe.key} aria-hidden className="ed-wipe pointer-events-none absolute inset-0 z-30 mix-blend-color" style={{ background: wipe.color, ['--ex' as string]: wipe.x, ['--ey' as string]: wipe.y, opacity: 0.35 }} onAnimationEnd={() => setWipe(null)} />}
          <Embers color={ed.id === 'blue' ? '80,140,255' : ed.id === 'green' ? '90,230,110' : ed.id === 'gray' ? '220,220,230' : '255,74,61'} density={0.6} />
          <div className="explode absolute inset-0 grid grid-rows-[1.15fr_.85fr] place-items-center p-[6%]">
            <div className="explode-top h-full w-[62%]">
              <div className="bt-float h-full" style={{ ['--dur' as string]: '5s', ['--r0' as string]: '-2deg', ['--r1' as string]: '2deg' }}>
                <Garment3D front={set.front} back={set.back} alt="Lightning Set – koszulka" auto drag depth={small ? 12 : 18} layers={4} filter={ed.filter} className="h-full w-full" />
              </div>
            </div>
            <div className="explode-bottom h-full w-[46%]">
              <div className="bt-float h-full" style={{ ['--dur' as string]: '5s', ['--delay' as string]: '-1.2s', ['--r0' as string]: '2deg', ['--r1' as string]: '-2deg' }}>
                <Garment3D front={set.extra!.front} back={set.extra!.back} alt="Lightning Set – spodenki" auto drag depth={small ? 10 : 14} layers={4} filter={ed.filter} className="h-full w-full" />
              </div>
            </div>
          </div>
          <span key={ed.id} className="bt-swap display absolute bottom-4 left-5 z-20 text-[clamp(30px,4vw,54px)] leading-none" style={{ color: ed.color, textShadow: '0 4px 30px rgba(0,0,0,.8)' }}>{ed.name}</span>
        </div>
        <div>
          <div role="radiogroup" aria-label="Edycja kolorystyczna" className="grid grid-cols-2 gap-3">
            {EDITIONS.map(x => (
              <button
                key={x.id}
                type="button"
                role="radio"
                aria-checked={x.id === ed.id}
                onClick={e => pick(e, x)}
                className={`group relative flex items-center gap-3 overflow-hidden border px-4 py-4 text-left transition-all duration-300 ${x.id === ed.id ? 'border-white/60 bg-white/[.06]' : 'border-white/12 hover:border-white/35'}`}
              >
                <span className="relative h-9 w-9 shrink-0 rounded-full ring-2 ring-white/20" style={{ background: `conic-gradient(from 200deg, #0b0909 0 30%, ${x.color} 30% 62%, #f2f2f2 62% 72%, #0b0909 72%)` }} />
                <span className="cond text-[15px] font-bold uppercase tracking-[.1em] text-white">{x.name}</span>
                {x.id === ed.id && <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: x.color }} />}
              </button>
            ))}
          </div>
          <p className="mt-6 text-steel-dim">{set.text}</p>
          <ul className="mt-5 grid grid-cols-2 gap-2">
            {set.features.map(f => <li key={f} className="cond flex items-center gap-2.5 text-[14px] font-bold uppercase tracking-[.08em] text-steel"><span aria-hidden className="h-[2px] w-3" style={{ background: ed.color }} />{f}</li>)}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <span className="display text-[56px] leading-none text-white">€{set.price}</span>
            <MagneticButton onClick={() => onOrder('set', ed.name)}>Zamów {ed.name}</MagneticButton>
          </div>
          <p className="mono mt-3 text-[12px] text-steel-dim">Komplet: koszulka + spodenki · odbiór na sali</p>
        </div>
      </div>
    </section>
  );
};

/* ================= DETALE z lupą ================= */
const Details: React.FC = () => {
  const items = useMemo(() => {
    const seen = new Set<string>();
    return GARMENTS.flatMap(g => g.details.map(d => ({ ...d, of: g.name }))).filter(d => (seen.has(d.img) ? false : (seen.add(d.img), true)));
  }, []);
  return (
    <section aria-labelledby="detale" className="py-24 sm:py-32">
      <div className="wrap">
        <SectionTitle id="detale" eyebrow="Z bliska" a="Diabeł tkwi" b="w detalach" text="Haftowane naszywki, monogramy na rękawach, siatka wentylacyjna i tkanina rashguard. Najedź albo przytrzymaj palec, żeby przyjrzeć się z bliska." />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {items.map((d, i) => (
            <Reveal key={d.img} delay={(i % 4) * 80}>
              <figure className="flex flex-col gap-3">
                <Loupe src={d.img} alt={`${d.label} – ${d.of}`} className="aspect-square w-full max-w-full border border-white/10" />
                <figcaption>
                  <span className="cond block text-[15px] font-bold uppercase tracking-[.1em] text-white">{d.label}</span>
                  <span className="mono text-[11px] uppercase text-steel-dim">{d.of}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ================= ZAMÓWIENIE: mini koszyk → gotowa wiadomość na WhatsApp, odbiór na sali ================= */
interface Line { key: number; id: string; size: string; qty: number; edition: string }
const newLine = (id = 'set', edition = EDITIONS[0].name): Line => ({ key: Date.now() + Math.random(), id, size: 'M', qty: 1, edition });

const Order: React.FC<{ pre: { id: string; edition?: string; n: number } }> = ({ pre }) => {
  const [lines, setLines] = useState<Line[]>(() => [newLine('set')]);
  const [active, setActive] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [when, setWhen] = useState('');
  const [err, setErr] = useState('');
  const [ready, setReady] = useState(false);
  const firstPre = useRef(true);

  // „Zamów” z innej sekcji: ustaw model w aktywnej pozycji (albo dodaj nową, jeśli ten model już jest)
  useEffect(() => {
    if (firstPre.current) { firstPre.current = false; return; }
    setReady(false);
    setLines(ls => {
      const i = ls.findIndex(l => l.id === pre.id && (!pre.edition || l.edition === pre.edition));
      if (i >= 0) { setActive(i); return ls; }
      if (ls.length === 1 && ls[0].qty === 1) { setActive(0); return [{ ...ls[0], id: pre.id, edition: pre.edition ?? ls[0].edition }]; }
      setActive(ls.length);
      return [...ls, newLine(pre.id, pre.edition)];
    });
  }, [pre]);

  const upd = (i: number, patch: Partial<Line>) => { setReady(false); setLines(ls => ls.map((l, k) => (k === i ? { ...l, ...patch } : l))); };
  const total = lines.reduce((s, l) => s + (byId(l.id).price ?? 0) * l.qty, 0);
  const unpriced = lines.some(l => !byId(l.id).price);
  const pieces = lines.reduce((s, l) => s + l.qty, 0);
  const cur = lines[Math.min(active, lines.length - 1)];
  const g = byId(cur.id);

  const msg = useMemo(() => {
    const items = lines.map(l => {
      const x = byId(l.id);
      const ed = l.id === 'set' ? `, ${l.edition}` : '';
      const pr = x.price ? ` – ${l.qty} × €${x.price} = €${x.price * l.qty}` : ' – cena na zapytanie';
      return `• ${l.qty} szt. ${x.name} (${x.type}${ed}), rozmiar ${l.size}${pr}`;
    }).join('\n');
    return [
      `Cześć! Z tej strony ${name.trim() || '…'}.`,
      `Chciał(a)bym zamówić z kolekcji Bałagan Team:`,
      items,
      '',
      total ? `Razem: €${total}${unpriced ? ' + pozycje z ceną na zapytanie' : ''}` : '',
      `Odbiór: na sali treningowej, Brugplein 2, Lelystad${when.trim() ? ` – ${when.trim()}` : ''}.`,
      phone.trim() ? `Mój telefon: ${phone.trim()}` : '',
      '',
      'Dziękuję! 👊',
    ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  }, [lines, name, phone, when, total, unpriced]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) { setErr('Wpisz swoje imię – trener musi wiedzieć, dla kogo przygotować zamówienie.'); document.getElementById('wear-name')?.focus(); return; }
    setErr('');
    setReady(true);
  };

  return (
    <section id="zamow" aria-labelledby="zamow-title" className="border-t border-white/10 py-24 sm:py-32" style={{ scrollMarginTop: 80 }}>
      <div className="wrap">
        <SectionTitle id="zamow-title" eyebrow="Zamów i odbierz na sali" a="Twoje" b="zamówienie" text="Wybierz model, rozmiar i ilość – możesz dodać kilka pozycji. Ułożymy gotową wiadomość do trenera, a Ty wyślesz ją jednym kliknięciem na WhatsApp. Płacisz i odbierasz na sali treningowej." />

        {/* cennik */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {[byId('set'), byId('tracksuit')].map(x => (
            <button key={x.id} type="button" onClick={() => { const i = lines.findIndex(l => l.id === x.id); if (i >= 0) setActive(i); else { setLines(ls => [...ls, newLine(x.id)]); setActive(lines.length); } setReady(false); }}
              className="group relative flex items-center gap-5 overflow-hidden border border-white/10 bg-ink-2 p-4 text-left transition hover:border-blood sm:p-5">
              <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `radial-gradient(circle at 15% 50%, ${x.glow}, transparent 60%)` }} />
              <img src={x.front} alt="" className="relative h-20 w-20 shrink-0 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-24 sm:w-24" />
              <span className="relative min-w-0 flex-1">
                <span className="eyebrow block">{x.type}</span>
                <span className="cond mt-1 block text-[18px] font-bold uppercase tracking-[.06em] text-white">{x.name}</span>
              </span>
              <span className="relative display text-[clamp(40px,4vw,56px)] leading-none text-white">€{x.price}</span>
            </button>
          ))}
        </div>

        <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          {/* podgląd aktywnej pozycji */}
          <div className="lg:sticky lg:top-24">
            <div className="relative grid aspect-square w-full max-w-[460px] place-items-center overflow-hidden border border-white/10" style={{ background: `radial-gradient(circle at 50% 60%, ${g.glow}, transparent 65%), #110c0c` }}>
              <div key={cur.id + cur.edition} className="bt-swap absolute inset-[10%]">
                <Garment3D front={g.front} back={g.back} alt={g.name} auto drag depth={16} layers={5} filter={cur.id === 'set' ? EDITIONS.find(e => e.name === cur.edition)?.filter : undefined} className="h-full w-full" />
              </div>
              <span className="cond absolute left-4 top-4 bg-blood px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.16em] text-white">Pozycja {Math.min(active, lines.length - 1) + 1}</span>
              <span className="display absolute bottom-4 right-5 text-[40px] leading-none text-white">{priceLabel(g)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {lines.map((l, i) => {
              const x = byId(l.id);
              const on = i === Math.min(active, lines.length - 1);
              return (
                <fieldset key={l.key} onFocus={() => setActive(i)} onClick={() => setActive(i)} className={`relative border p-5 transition-colors sm:p-6 ${on ? 'border-blood/70 bg-ink-2' : 'border-white/10 bg-ink-2/60'}`}>
                  <legend className="cond px-2 text-[13px] font-bold uppercase tracking-[.2em] text-blood">Pozycja {i + 1}</legend>
                  {lines.length > 1 && (
                    <button type="button" onClick={e => { e.stopPropagation(); setLines(ls => ls.filter((_, k) => k !== i)); setActive(0); setReady(false); }} className="cond absolute right-4 top-3 text-[12px] font-bold uppercase tracking-[.14em] text-steel-dim hover:text-ember">Usuń</button>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {GARMENTS.map(m => (
                      <button key={m.id} type="button" onClick={() => upd(i, { id: m.id })} aria-pressed={m.id === l.id} title={m.name}
                        className={`relative grid aspect-square place-items-center border p-1.5 transition ${m.id === l.id ? 'border-blood bg-blood/10' : 'border-white/12 hover:border-white/40'}`}>
                        <img src={m.front} alt={m.name} className="h-full w-full object-contain" />
                        {m.price && <span className="mono absolute bottom-0.5 right-1 text-[10px] font-bold text-white">€{m.price}</span>}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="cond text-[18px] font-bold uppercase tracking-[.06em] text-white">{x.name}</span>
                    <span className="mono text-[14px] text-ember">{priceLabel(x)}</span>
                  </p>
                  {l.id === 'set' && (
                    <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Edycja">
                      {EDITIONS.map(e => (
                        <button key={e.id} type="button" role="radio" aria-checked={e.name === l.edition} onClick={() => upd(i, { edition: e.name })}
                          className={`cond flex items-center gap-2 border px-3 py-2 text-[12px] font-bold uppercase tracking-[.1em] transition ${e.name === l.edition ? 'border-white/60 text-white' : 'border-white/15 text-steel hover:border-white/40'}`}>
                          <span className="h-3 w-3 rounded-full" style={{ background: e.color }} />{e.name.replace(' Edition', '')}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-end gap-5">
                    <div>
                      <span className="eyebrow">Rozmiar</span>
                      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Rozmiar – pozycja ${i + 1}`}>
                        {x.sizes.map(s => (
                          <button key={s} type="button" role="radio" aria-checked={s === l.size} onClick={() => upd(i, { size: s })}
                            className={`mono h-11 min-w-11 border px-2.5 text-[14px] font-bold transition ${s === l.size ? 'border-blood bg-blood text-white' : 'border-white/15 text-steel hover:border-white/50'}`}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="eyebrow">Ilość</span>
                      <div className="mt-2 flex items-center border border-white/15" role="group" aria-label={`Ilość – pozycja ${i + 1}`}>
                        <button type="button" onClick={() => upd(i, { qty: Math.max(1, l.qty - 1) })} className="grid h-11 w-11 place-items-center text-xl text-steel hover:text-white" aria-label="Mniej">−</button>
                        <span className="mono w-8 text-center text-[17px] font-bold text-white" aria-live="polite">{l.qty}</span>
                        <button type="button" onClick={() => upd(i, { qty: Math.min(20, l.qty + 1) })} className="grid h-11 w-11 place-items-center text-xl text-steel hover:text-white" aria-label="Więcej">+</button>
                      </div>
                    </div>
                    {x.price && <span className="mono ml-auto text-[18px] font-bold text-white">€{x.price * l.qty}</span>}
                  </div>
                </fieldset>
              );
            })}
            <button type="button" onClick={() => { setLines(ls => [...ls, newLine('set')]); setActive(lines.length); setReady(false); }}
              className="cond flex items-center justify-center gap-2 border border-dashed border-white/25 py-4 text-[14px] font-bold uppercase tracking-[.16em] text-steel transition hover:border-blood hover:text-white">
              + Dodaj kolejną pozycję
            </button>

            {/* dane i suma */}
            <div className="grid gap-5 border border-white/10 bg-ink-2 p-5 sm:grid-cols-2 sm:p-6">
              <label htmlFor="wear-name" className="flex flex-col gap-2">
                <span className="eyebrow">Imię i nazwisko</span>
                <input id="wear-name" value={name} onChange={e => { setName(e.target.value); setErr(''); setReady(false); }} placeholder="np. Marta Nowak" autoComplete="name" aria-invalid={!!err}
                  className="h-12 border border-white/15 bg-black/40 px-4 text-[16px] text-white outline-none transition placeholder:text-steel-dim/60 focus:border-blood aria-[invalid=true]:border-ember" />
              </label>
              <label htmlFor="wear-phone" className="flex flex-col gap-2">
                <span className="eyebrow">Telefon (opcjonalnie)</span>
                <input id="wear-phone" type="tel" value={phone} onChange={e => { setPhone(e.target.value); setReady(false); }} placeholder="+31 6 …" autoComplete="tel"
                  className="mono h-12 border border-white/15 bg-black/40 px-4 text-[16px] text-white outline-none transition placeholder:text-steel-dim/60 focus:border-blood" />
              </label>
              <label htmlFor="wear-when" className="flex flex-col gap-2 sm:col-span-2">
                <span className="eyebrow">Kiedy odbierzesz? (opcjonalnie)</span>
                <input id="wear-when" value={when} onChange={e => { setWhen(e.target.value); setReady(false); }} placeholder="np. po treningu we wtorek"
                  className="h-12 border border-white/15 bg-black/40 px-4 text-[16px] text-white outline-none transition placeholder:text-steel-dim/60 focus:border-blood" />
              </label>
              {err && <p role="alert" className="border-l-2 border-blood bg-blood/10 px-4 py-3 text-[14px] text-white sm:col-span-2">{err}</p>}
              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5 sm:col-span-2">
                <div>
                  <span className="eyebrow block">Razem · {pieces} szt.</span>
                  <span className="display text-[48px] leading-none text-white">{total ? <RollingNumber value={total} format={n => `€${Math.round(n)}`} /> : '—'}</span>
                  {unpriced && <span className="mono mt-1 block text-[12px] text-steel-dim">+ pozycje z ceną na zapytanie</span>}
                </div>
                <MagneticButton type="submit">Przygotuj wiadomość</MagneticButton>
              </div>
              <p className="mono text-[12px] text-steel-dim sm:col-span-2">Płatność i odbiór: sala treningowa, Brugplein 2, Lelystad.</p>
            </div>

            {ready && (
              <div className="bt-swap border border-[#25d366]/40 bg-ink-2 p-5 sm:p-6" style={{ boxShadow: '0 40px 80px -50px rgba(37,211,102,.5)' }}>
                <p className="eyebrow">Gotowe – sprawdź i wyślij</p>
                <pre className="mt-4 whitespace-pre-wrap border border-white/10 bg-black/50 p-4 font-[inherit] text-[15px] leading-relaxed text-white">{msg}</pre>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a href={waLink(msg)} target="_blank" rel="noopener noreferrer" className="cond inline-flex items-center gap-3 bg-[#25d366] px-7 py-4 text-[15px] font-bold uppercase tracking-[.16em] text-[#0b2a17] transition-shadow hover:shadow-[0_14px_40px_-10px_rgba(37,211,102,.9)]">
                    Wyślij na WhatsApp
                  </a>
                  <span className="mono text-[12px] text-steel-dim">do trenera · {SITE.phone}</span>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
};

/* ================= STRONA ================= */
export const CollectionPage: React.FC<PageProps> = ({ go }) => {
  const [pre, setPre] = useState<{ id: string; edition?: string; n: number }>({ id: 'jersey', n: 0 });
  const toOrder = (id: string, edition?: string) => {
    setPre(p => ({ id, edition, n: p.n + 1 }));
    requestAnimationFrame(() => document.getElementById('zamow')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
  };
  return (
    <>
      <Hero onOrder={() => toOrder('jersey')} onBrowse={() => document.getElementById('kolekcja-lista')?.scrollIntoView({ behavior: 'smooth' })} />
      <div className="overflow-hidden border-b border-white/10 py-5">
        <VelocityMarquee items={['Bałagan Team Wear', 'Lelystad', 'Together Stronger', 'Discipline · Work · Results']} className="text-[clamp(40px,7vw,88px)]" />
      </div>
      <Showcase onOrder={toOrder} />
      <section id="kolekcja-lista" aria-labelledby="lista" className="py-24 sm:py-32" style={{ scrollMarginTop: 80 }}>
        <div className="wrap">
          <SectionTitle id="lista" eyebrow="Cała kolekcja" a="Sześć modeli," b="jedna drużyna" text="Najedź na kartę, żeby zobaczyć tył – albo dotknij przycisku na telefonie. Każdy model zamówisz w rozmiarach S–XXL." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {GARMENTS.map((g, i) => <Card key={g.id} g={g} i={i} onOrder={toOrder} />)}
          </div>
        </div>
      </section>
      <Editions onOrder={toOrder} />
      <Details />
      <Order pre={pre} />
      <NextPage label="Następna strona" title="Partnerzy" onGo={() => go('partnerzy')} />
    </>
  );
};
