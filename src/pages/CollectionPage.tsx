import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NextPage, SectionTitle } from '../components/sections/PageHeader';
import { ShaderStage } from '../components/fx/ShaderStage';
import { KineticText, MagneticButton, MagneticLink } from '../components/fx/Kinetic';
import { Reveal, TiltCard, VelocityMarquee } from '../components/fx/ScrollFx';
import { LineReveal } from '../components/fx/Premium';
import { Embers, Garment3D, Loupe, ScanReveal } from '../components/fx/Wear';
import { EDITIONS, GARMENTS, type Garment } from '../data/apparel';
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
          <LineReveal text="Koszulki, rashguard, bluzy, komplety i dres w barwach klubu. To, w czym trenujemy na sali, jeździmy na zawody i wychodzimy do ringu. Obróć każdy ciuch, zobacz tył i detale – i zamów swój rozmiar przez WhatsApp." className="mt-6 max-w-[54ch] text-[17px] leading-relaxed text-steel sm:text-[19px]" delay={250} step={12} />
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton onClick={onOrder}>Zamów swój rozmiar</MagneticButton>
            <MagneticButton variant="ghost" onClick={onBrowse}>Zobacz kolekcję</MagneticButton>
          </div>
          <dl className="mt-10 flex flex-wrap gap-px border border-white/10 bg-white/10">
            {[['Modele', String(GARMENTS.length)], ['Rozmiary', 'S – XXL'], ['Edycje kompletu', '4 kolory']].map(([k, v]) => (
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
                  <p className="mono mt-4 text-[12px] uppercase text-ember">{g.type} · {g.tag}</p>
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
              <span className="mono text-[13px] text-steel-dim">{g.sizes[0]} – {g.sizes[g.sizes.length - 1]}</span>
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
          <MagneticButton className="mt-8" onClick={() => onOrder('set', ed.name)}>Zamów {ed.name}</MagneticButton>
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

/* ================= ZAMÓWIENIE przez WhatsApp ================= */
const Order: React.FC<{ pre: { id: string; edition?: string; n: number } }> = ({ pre }) => {
  const [id, setId] = useState(pre.id);
  const [size, setSize] = useState('M');
  const [edition, setEdition] = useState(pre.edition ?? EDITIONS[0].name);
  const [qty, setQty] = useState(1);
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { setId(pre.id); if (pre.edition) setEdition(pre.edition); }, [pre]);
  const g = byId(id);
  const msg = `Cześć! Chcę zamówić z kolekcji Bałagan Team:\n👕 ${g.name} (${g.type})${id === 'set' ? `\n🎨 ${edition}` : ''}\n📏 Rozmiar: ${size}\n🔢 Ilość: ${qty}\n\n${name.trim() ? `Imię: ${name.trim()}\n` : ''}Proszę o cenę i termin odbioru na sali.`;
  return (
    <section id="zamow" aria-labelledby="zamow-title" className="border-t border-white/10 py-24 sm:py-32" style={{ scrollMarginTop: 80 }}>
      <div className="wrap grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <SectionTitle id="zamow-title" eyebrow="Zamówienie" a="Zamów" b="przez WhatsApp" />
          <p className="mt-6 max-w-[46ch] text-[17px] text-steel-dim">Wybierz model, rozmiar i ilość – ułożymy wiadomość do trenera. Cenę, dostępność i termin odbioru na sali potwierdzimy w odpowiedzi.</p>
          <div className="relative mt-8 grid aspect-square w-full max-w-[420px] place-items-center overflow-hidden border border-white/10" style={{ background: `radial-gradient(circle at 50% 60%, ${g.glow}, transparent 65%), #110c0c` }}>
            <div key={id} className="bt-swap absolute inset-[10%]">
              <Garment3D front={g.front} back={g.back} alt={g.name} auto drag depth={16} layers={5} filter={id === 'set' ? EDITIONS.find(e => e.name === edition)?.filter : undefined} className="h-full w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8 border border-white/10 bg-ink-2 p-6 sm:p-8">
          <fieldset>
            <legend className="eyebrow">Model</legend>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {GARMENTS.map(x => (
                <button key={x.id} type="button" onClick={() => setId(x.id)} aria-pressed={x.id === id} title={x.name}
                  className={`grid aspect-square place-items-center border p-1.5 transition ${x.id === id ? 'border-blood bg-blood/10' : 'border-white/12 hover:border-white/40'}`}>
                  <img src={x.front} alt={x.name} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
            <p className="cond mt-3 text-[18px] font-bold uppercase tracking-[.06em] text-white">{g.name}</p>
          </fieldset>
          {id === 'set' && (
            <fieldset>
              <legend className="eyebrow">Edycja</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {EDITIONS.map(x => (
                  <button key={x.id} type="button" onClick={() => setEdition(x.name)} aria-pressed={x.name === edition}
                    className={`cond flex items-center gap-2 border px-3 py-2 text-[13px] font-bold uppercase tracking-[.1em] transition ${x.name === edition ? 'border-white/60 text-white' : 'border-white/15 text-steel hover:border-white/40'}`}>
                    <span className="h-3 w-3 rounded-full" style={{ background: x.color }} />{x.name}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <fieldset>
            <legend className="eyebrow">Rozmiar</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {g.sizes.map(s => (
                <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={s === size}
                  className={`mono min-w-14 border px-3 py-2.5 text-[14px] font-bold transition ${s === size ? 'border-blood bg-blood text-white' : 'border-white/15 text-steel hover:border-white/50'}`}>{s}</button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
            <div>
              <span className="eyebrow">Ilość</span>
              <div className="mt-3 flex items-center border border-white/15" role="group" aria-label="Ilość">
                <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="grid h-12 w-12 place-items-center text-xl text-steel hover:text-white" aria-label="Mniej">−</button>
                <span className="mono w-8 text-center text-[17px] font-bold text-white" aria-live="polite">{qty}</span>
                <button type="button" onClick={() => setQty(q => Math.min(20, q + 1))} className="grid h-12 w-12 place-items-center text-xl text-steel hover:text-white" aria-label="Więcej">+</button>
              </div>
            </div>
            <label htmlFor="wear-name" className="flex flex-col gap-3">
              <span className="eyebrow">Imię (opcjonalnie)</span>
              <input id="wear-name" value={name} onChange={e => { setName(e.target.value); setErr(''); }} placeholder="np. Marta" autoComplete="given-name"
                className="h-12 border border-white/15 bg-black/40 px-4 text-[16px] text-white outline-none transition placeholder:text-steel-dim/60 focus:border-blood" />
            </label>
          </div>
          <pre className="whitespace-pre-wrap border border-white/10 bg-black/50 p-4 font-[inherit] text-[14px] leading-relaxed text-steel">{msg}</pre>
          {err && <p role="alert" className="text-ember">{err}</p>}
          <div className="flex flex-wrap items-center gap-4">
            <MagneticLink href={waLink(msg)} target="_blank" rel="noopener noreferrer">Wyślij zamówienie na WhatsApp</MagneticLink>
            <span className="mono text-[12px] text-steel-dim">{SITE.phone}</span>
          </div>
        </div>
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
