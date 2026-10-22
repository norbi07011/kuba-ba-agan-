import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ShaderStage } from '../fx/ShaderStage';
import { MagneticLink } from '../fx/Kinetic';
import { Reveal } from '../fx/ScrollFx';
import { MODELS, eur, octagonProductUrl, OCTAGON_SHOP_URL, PROMO } from '../../data/octagon';
import { prefersReducedMotion, useViewportWidth } from '../../lib/motion';
import { withViewTransition } from '../../lib/viewTransition';
import logo from '../../assets/media/logo.jpg';

/*
 * Sprzęt Octagon jako scena 3D:
 * - w środku godło Bałagan Team, wokół niego po elipsie krążą produkty Octagon (3D orbit),
 * - przeciągnięcie / strzałki obracają karuzelę, aktywny produkt staje z przodu,
 * - wybór koloru podmienia zdjęcie (View Transitions) i kolor światła sceny (WebGL + fala),
 * - klik w produkt z przodu albo „Kup” otwiera kartę tego koloru w sklepie Octagon Sport NL.
 */

const N = MODELS.length;
const STEP = (Math.PI * 2) / N;

export const Shop: React.FC = () => {
  const vw = useViewportWidth();
  const small = vw < 768;
  const stage = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLDivElement | null)[]>([]);
  const anim = useRef({ angle: 0, target: 0, dragging: false, startX: 0, startAngle: 0, moved: 0, raf: 0, touched: false });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [picked, setPicked] = useState<Record<string, string>>(() => Object.fromEntries(MODELS.map(m => [m.id, m.variants[0].id])));
  const m = MODELS[active];
  const vr = m.variants.find(x => x.id === picked[m.id]) ?? m.variants[0];

  const layout = useCallback(() => {
    const a = anim.current;
    const box = stage.current;
    if (!box) return;
    const W = box.clientWidth;
    const R = Math.min(W * (W < 640 ? 0.36 : 0.34), 400);
    items.current.forEach((el, i) => {
      if (!el) return;
      const th = i * STEP - a.angle;
      const x = Math.sin(th) * R;
      const z = Math.cos(th) * R;
      const y = Math.cos(th) * R * 0.22 + (W < 640 ? 24 : 34); // przód niżej (bliżej widza)
      const front = (z / R + 1) / 2;
      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      el.style.zIndex = String(z > 0 ? 30 + Math.round(front * 10) : 5 + Math.round(front * 10));
      el.style.opacity = String(0.35 + front * 0.65);
      el.style.filter = `blur(${((1 - front) * 3.5).toFixed(2)}px) brightness(${(0.45 + front * 0.55).toFixed(2)})`;
    });
    const nearest = ((Math.round(a.angle / STEP) % N) + N) % N;
    if (nearest !== activeRef.current) { activeRef.current = nearest; setActive(nearest); }
  }, []);

  const tick = useCallback(() => {
    const a = anim.current;
    if (!a.dragging) a.angle += (a.target - a.angle) * (prefersReducedMotion() ? 1 : 0.09);
    layout();
    if (a.dragging || Math.abs(a.target - a.angle) > 0.0005) a.raf = requestAnimationFrame(tick);
    else { a.angle = a.target; layout(); a.raf = 0; }
  }, [layout]);

  const kick = useCallback(() => { if (!anim.current.raf) anim.current.raf = requestAnimationFrame(tick); }, [tick]);
  const goTo = useCallback((i: number, user = true) => {
    const a = anim.current;
    if (user) a.touched = true;
    const cur = Math.round(a.target / STEP);
    let d = (((i - cur) % N) + N) % N;
    if (d > N / 2) d -= N;
    a.target = (cur + d) * STEP;
    kick();
  }, [kick]);

  useEffect(() => { layout(); const on = () => layout(); window.addEventListener('resize', on); return () => window.removeEventListener('resize', on); }, [layout, vw]);

  // samo krąży, dopóki użytkownik nie przejmie kontroli (tylko gdy scena widoczna)
  useEffect(() => {
    const el = stage.current;
    if (!el || prefersReducedMotion()) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.35 });
    io.observe(el);
    const t = window.setInterval(() => {
      if (visible && !anim.current.touched && !anim.current.dragging) goTo(activeRef.current + 1, false);
    }, 4200);
    return () => { io.disconnect(); window.clearInterval(t); };
  }, [goTo]);

  // przeciąganie myszą i palcem (poziomo obraca, pionowo przewija stronę)
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const a = anim.current;
    let pid = -1;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('[data-nodrag]')) return;
      pid = e.pointerId; a.dragging = true; a.touched = true; a.moved = 0;
      a.startX = e.clientX; a.startAngle = a.angle;
      kick();
    };
    const move = (e: PointerEvent) => {
      if (!a.dragging || e.pointerId !== pid) return;
      const dx = e.clientX - a.startX;
      a.moved = Math.max(a.moved, Math.abs(dx));
      if (a.moved > 6 && !el.hasPointerCapture(pid)) el.setPointerCapture(pid);
      a.angle = a.startAngle - dx / Math.max(180, el.clientWidth * 0.45);
      a.target = a.angle;
    };
    const up = (e: PointerEvent) => {
      if (!a.dragging || e.pointerId !== pid) return;
      a.dragging = false;
      a.target = Math.round(a.angle / STEP) * STEP;
      kick();
    };
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, [kick]);

  const pick = (variantId: string) => withViewTransition(() => setPicked(p => ({ ...p, [m.id]: variantId })));

  return (
    <section id="sprzet" aria-labelledby="sprzet-title" className="relative overflow-hidden py-20 sm:py-28">
      <div className="wrap">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Sprzęt, w którym trenujemy</p>
            <h2 id="sprzet-title" className="display mt-3 text-[clamp(48px,8vw,104px)]"><span className="chrome">Sprzęt</span> <span className="text-blood">Octagon</span></h2>
          </div>
          <p className="max-w-[40ch] text-steel-dim">Rękawice, ochraniacze, kaski i owijki Legion Octagon. Wybierz kolor i kliknij produkt – otworzy się w sklepie Octagon Sport NL.</p>
        </Reveal>
      </div>

      <div className="wrap mt-10 grid items-center gap-8 lg:grid-cols-[1.45fr_.85fr] lg:gap-6">
        <div
          ref={stage}
          role="group"
          aria-roledescription="karuzela"
          aria-label="Sprzęt Octagon"
          className="relative isolate h-[440px] w-full cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing sm:h-[580px]"
          style={{ perspective: small ? '900px' : '1400px' }}
        >
          <div aria-hidden className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(ellipse at 50% 55%, #2a0b0d, #0b0909 70%)' }}>
            <ShaderStage color={vr.glow} mode="stage" pulseKey={`${m.id}-${vr.id}`} className="absolute inset-0" />
          </div>
          {/* pierścień orbity na podłodze */}
          <div aria-hidden className="absolute left-1/2 top-[58%] h-[22%] w-[78%] -translate-x-1/2 rounded-[50%] border border-white/10" style={{ boxShadow: '0 0 40px rgba(227,19,28,.15), inset 0 0 40px rgba(227,19,28,.12)' }} />
          {/* godło Bałagan Team w środku orbity */}
          <div aria-hidden className="absolute left-1/2 top-[44%] z-20 -translate-x-1/2 -translate-y-1/2" style={{ width: small ? 170 : 240 }}>
            <div className="bt-float" style={{ ['--dur' as string]: '6s', ['--r0' as string]: '-1deg', ['--r1' as string]: '1deg' }}>
              <img src={logo} alt="" draggable={false} className="block aspect-square w-full object-cover" style={{ WebkitMaskImage: 'radial-gradient(circle at 50% 48%, #000 50%, transparent 70%)', maskImage: 'radial-gradient(circle at 50% 48%, #000 50%, transparent 70%)' }} />
            </div>
          </div>

          {MODELS.map((mod, i) => {
            const v = mod.variants.find(x => x.id === picked[mod.id]) ?? mod.variants[0];
            return (
              <div
                key={mod.id}
                ref={el => { items.current[i] = el; }}
                className="absolute left-1/2 top-1/2 will-change-transform"
                style={{ width: small ? 'min(36vw, 160px)' : 'min(16vw, 220px)' }}
              >
                <a
                  href={octagonProductUrl(v.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  draggable={false}
                  onClick={e => {
                    // przeciąganie to nie klik; produkt z tyłu najpierw obraca się do przodu
                    if (anim.current.moved >= 6 || i !== active) { e.preventDefault(); if (anim.current.moved < 6) goTo(i); }
                  }}
                  aria-label={i === active ? `${mod.type} ${mod.name}, ${v.name} – otwórz w sklepie Octagon Sport NL` : `Pokaż: ${mod.type} ${mod.name}`}
                  className="block w-full"
                >
                  <div className="bt-float" style={{ ['--dur' as string]: `${4.2 + i * 0.5}s`, ['--delay' as string]: `${-i * 0.9}s`, ['--r0' as string]: '-4deg', ['--r1' as string]: '4deg' }}>
                    <img
                      src={v.img}
                      alt=""
                      draggable={false}
                      className="block w-full select-none"
                      style={{
                        filter: 'drop-shadow(0 22px 24px rgba(0,0,0,.7)) drop-shadow(0 0 16px rgba(227,19,28,.3))',
                        ...(i === active ? { viewTransitionName: 'gear-active' } : {}),
                      } as React.CSSProperties}
                    />
                  </div>
                </a>
              </div>
            );
          })}

          <div className="absolute inset-x-0 bottom-4 z-50 flex items-center justify-center gap-3">
            <button type="button" data-nodrag onClick={() => goTo(active - 1)} aria-label="Poprzedni produkt" className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-blood hover:bg-blood">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <div className="flex gap-1.5" aria-hidden>
              {MODELS.map((_, i) => <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-blood' : 'w-1.5 bg-white/30'}`} />)}
            </div>
            <button type="button" data-nodrag onClick={() => goTo(active + 1)} aria-label="Następny produkt" className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:border-blood hover:bg-blood">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>

        {/* panel produktu */}
        <div aria-live="polite">
          <div key={m.id} className="bt-swap">
            <p className="eyebrow">{m.type}</p>
            <h3 className="display mt-2 text-[clamp(40px,5vw,64px)] leading-[1.06] text-white">{m.name}</h3>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="mono text-[28px] font-bold text-white">{eur(m.price)}</span>
              <span className="mono text-[15px] text-ember">{eur(m.price * (1 - PROMO.percent / 100))} z kodem {PROMO.code}</span>
            </p>
            <p className="mt-4 max-w-[42ch] text-steel-dim">{m.text}</p>
          </div>
          <fieldset className="mt-6">
            <legend className="eyebrow">Kolor: <span className="text-white">{vr.name}</span></legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {m.variants.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pick(c.id)}
                  aria-pressed={c.id === vr.id}
                  aria-label={c.name}
                  className={`h-11 w-11 rounded-full transition-transform duration-300 hover:scale-110 ${c.id === vr.id ? 'ring-2 ring-blood ring-offset-4 ring-offset-[#0b0909]' : 'ring-1 ring-white/20'}`}
                  style={{ background: `radial-gradient(circle at 35% 30%, ${c.swatch === '#1c1a1b' ? '#555' : '#fff8'}, ${c.swatch} 55%)` }}
                />
              ))}
            </div>
          </fieldset>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticLink href={octagonProductUrl(vr.slug)} target="_blank" rel="noopener noreferrer">
              Kup w Octagon Sport NL
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden><path d="M7 17L17 7M9 7h8v8" /></svg>
            </MagneticLink>
            <MagneticLink variant="ghost" href={OCTAGON_SHOP_URL} target="_blank" rel="noopener noreferrer">Cały sklep</MagneticLink>
          </div>
          <p className="cond mt-5 text-[13px] font-semibold uppercase tracking-[.14em] text-steel-dim">Zamówienie i dostawa przez Octagon Sport NL</p>
        </div>
      </div>
    </section>
  );
};
